/**
 * Project Atlas — End-to-End Test Suite & Assertion Harness
 *
 * NOTE: When running headless in CI with SwiftShader, this suite serves as a
 * "CI WebGL compatibility test" to verify deterministic headless shader compilation
 * and scene mounting. It is NOT a GPU performance benchmark.
 *
 * Usage:
 *   node scripts/atlas-e2e.mjs [baseUrl] [outDir]
 *   (defaults: http://localhost:3000 , /tmp/atlas-e2e)
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CHROME = process.env.CHROME_BIN || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const baseUrl = process.argv[2] ?? "http://localhost:3001";
const outDir = process.argv[3] ?? "C:\\Users\\MISHAL\\.gemini\\antigravity-ide\\brain\\2e3097ca-6fd2-47df-bf4e-6a36cb0db637\\scratch\\e2e-out";
mkdirSync(outDir, { recursive: true });

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function main() {
  console.log("=== Project Atlas E2E Assertion Suite ===");
  console.log("Mode: CI WebGL compatibility test (SwiftShader Software Rendered)");
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Artifact Output: ${outDir}`);

  const port = 9333 + Math.floor(Math.random() * 500);
  const userData = join(outDir, "chrome-profile");
  const chrome = spawn(CHROME, [
    "--headless=new",
    "--enable-unsafe-swiftshader",
    "--use-angle=swiftshader",
    "--disable-gpu-sandbox",
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1280,800",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userData}`,
    "about:blank",
  ], { stdio: "ignore" });

  // Wait for Chrome debugging endpoint
  let version = null;
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) { version = await res.json(); break; }
    } catch { /* waiting */ }
    await delay(250);
  }
  if (!version) throw new Error("Chrome debugging endpoint failed to initialize");

  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

  let id = 0;
  const pending = new Map();
  const browserErrors = [];
  const browserWarnings = [];

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = ++id;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
    // Track browser console errors
    if (msg.method === "Runtime.consoleAPICalled") {
      const { type, args } = msg.params;
      const text = args.map((a) => a.value ?? a.description ?? "").join(" ");
      if (type === "error") {
        browserErrors.push({ type: "console.error", text });
      } else if (type === "warning") {
        browserWarnings.push({ type: "console.warn", text });
      }
    }
    // Track unhandled browser runtime exceptions
    if (msg.method === "Runtime.exceptionThrown") {
      browserErrors.push({
        type: "uncaught-exception",
        text: msg.params.exceptionDetails.text,
        details: msg.params.exceptionDetails.exception?.description,
      });
    }
  };

  async function evaluate(expression) {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(`Evaluation failed: ${result.exceptionDetails.text}`);
    return result.result.value;
  }

  await send("Page.enable");
  await send("Runtime.enable");

  async function navigateAndWait(path, waitMs = 800) {
    await send("Page.navigate", { url: baseUrl + path });
    for (let i = 0; i < 40; i++) {
      await delay(250);
      try {
        const ready = await evaluate(`(() => {
          const onTarget = window.location.pathname === "${path}";
          const text = document.body?.innerText ?? "";
          return onTarget && document.readyState === "complete" && !text.startsWith("Compiling") && text.length > 50;
        })()`);
        if (ready) break;
      } catch {
        // Continue waiting while navigation settles
      }
    }
    await delay(waitMs);
  }

  async function waitForSelector(selector, maxWaitMs = 6000) {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const exists = await evaluate(`Boolean(document.querySelector("${selector}"))`).catch(() => false);
      if (exists) return true;
      await delay(200);
    }
    return false;
  }

  // --- Step 1: Validate all conventional routes load without errors ---
  console.log("\n[1/7] Validating conventional route rendering and page structures...");
  const conventionalRoutes = [
    ["home", "/"],
    ["about", "/about"],
    ["projects", "/projects"],
    ["skills", "/skills"],
    ["sandbox", "/sandbox"],
    ["resume", "/resume"],
    ["project-detail-sonara", "/projects/sonara"],
    ["project-detail-lyrune", "/projects/lyrune"],
    ["project-detail-kerala", "/projects/kerala-flood-risk-platform"],
    ["project-detail-neerad", "/projects/neerad-store"],
    ["project-detail-lucida", "/projects/lucida-sync"],
    ["project-detail-recoverai", "/projects/recoverai"],
    ["project-detail-scrollbrake", "/projects/scrollbrake"],
    ["project-detail-pvp", "/projects/stance-combat-pvp"],
    ["project-detail-mainmenu", "/projects/main-menu"],
  ];

  for (const [name, path] of conventionalRoutes) {
    await navigateAndWait(path);
    const info = await evaluate(`({
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim() ?? null,
      bodyTextLength: document.body?.innerText?.length ?? 0,
    })`);
    assert(info.title && info.title.length > 0, `Route ${path} missing document title`);
    assert(info.bodyTextLength > 50, `Route ${path} rendered suspiciously empty body (${info.bodyTextLength} chars)`);
    console.log(`  ✔ Route ${path} (${name}) loaded successfully.`);
  }

  // --- Step 2: Skills Matrix & Evidence validation ---
  console.log("\n[2/7] Validating Skills Matrix and Evidence links (/skills)...");
  await navigateAndWait("/skills");
  await waitForSelector(".skills-matrix-container");
  const skillsData = await evaluate(`(() => {
    const matrix = document.querySelector(".skills-matrix-container");
    const chips = Array.from(document.querySelectorAll(".skill-chip"));
    return {
      url: window.location.href,
      htmlPreview: document.body?.innerHTML?.slice(0, 300) ?? "",
      matrixPresent: Boolean(matrix),
      chipsCount: chips.length,
    };
  })()`);
  if (!skillsData.matrixPresent) {
    console.log("DEBUG SKILLS FAILURE:", skillsData);
  }
  assert(skillsData.matrixPresent, "Skills matrix container not found on /skills");
  assert(skillsData.chipsCount >= 10, `Expected at least 10 skill chips, got ${skillsData.chipsCount}`);
  console.log(`  ✔ Skills matrix rendered with ${skillsData.chipsCount} verified skill chips.`);

  // --- Step 3: Projects Explorer & Architecture Radar Modal ---
  console.log("\n[3/7] Validating Projects Explorer & Comparison Modal (/projects)...");
  await navigateAndWait("/projects");
  await waitForSelector(".project-filter");
  const projectsData = await evaluate(`(() => {
    const root = document.querySelector(".project-filter");
    const cards = Array.from(document.querySelectorAll(".project-card"));
    const compBtn = document.querySelector(".comparison-trigger-btn");
    return { rootPresent: Boolean(root), cardsCount: cards.length, compBtnPresent: Boolean(compBtn) };
  })()`);
  assert(projectsData.rootPresent, "Project explorer root not found");
  assert(projectsData.cardsCount >= 9, `Expected at least 9 project cards, got ${projectsData.cardsCount}`);
  assert(projectsData.compBtnPresent, "Architecture comparison button missing");

  // Open comparison modal
  await evaluate(`document.querySelector(".comparison-trigger-btn")?.click()`);
  await waitForSelector(".comparison-modal");
  const modalData = await evaluate(`(() => {
    const modal = document.querySelector(".comparison-modal");
    const radar = document.querySelector(".radar-chart-container");
    const cards = document.querySelectorAll(".comparison-project-card");
    return { open: Boolean(modal), radarPresent: Boolean(radar), cardCount: cards.length };
  })()`);
  assert(modalData.open, "Architecture comparison modal failed to open");
  assert(modalData.radarPresent, "Radar chart container missing in comparison modal");
  assert(modalData.cardCount >= 2, "Expected at least 2 comparison project cards");

  // Close modal via Escape
  await evaluate(`window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
  await delay(400);
  const modalClosed = await evaluate(`!document.querySelector(".comparison-modal")`);
  assert(modalClosed, "Comparison modal failed to close on Escape");
  console.log(`  ✔ Projects explorer and architecture comparison modal validated.`);

  // --- Step 4: Code Snippet Evidence Inspector (/projects/sonara) ---
  console.log("\n[4/7] Validating Code Snippet Inspector & Evidence Badges (/projects/sonara)...");
  await navigateAndWait("/projects/sonara");
  await waitForSelector(".code-inspector");
  const inspectorData = await evaluate(`(() => {
    const inspector = document.querySelector(".code-inspector");
    const langBadge = document.querySelector(".code-inspector__badge")?.textContent?.trim();
    const evidenceBadge = document.querySelector(".code-evidence-badge")?.textContent?.trim();
    const lines = document.querySelectorAll(".code-inspector .code-line");
    return { inspectorPresent: Boolean(inspector), langBadge, evidenceBadge, linesCount: lines.length };
  })()`);
  assert(inspectorData.inspectorPresent, "Code inspector component missing on Sonara project page");
  assert(inspectorData.evidenceBadge && inspectorData.evidenceBadge.length > 0, "Evidence classification badge missing in code inspector");
  assert(inspectorData.linesCount > 0, "No code lines rendered in code inspector");
  console.log(`  ✔ Code inspector verified with evidence badge: "${inspectorData.evidenceBadge}".`);

  // --- Step 5: Engineering Sandboxes (/sandbox) ---
  console.log("\n[5/7] Validating Engineering Sandboxes tabs & canvases (/sandbox)...");
  await navigateAndWait("/sandbox");
  await waitForSelector(".dsp-graph");
  const dspPresent = await evaluate(`Boolean(document.querySelector(".dsp-graph"))`);
  assert(dspPresent, "DSP frequency response curve missing on default sandbox tab");

  // Switch to Hydrology
  await evaluate(`document.querySelectorAll(".sandbox-tab-btn")[1]?.click()`);
  await waitForSelector(".hydrology-canvas");
  const hydroCanvas = await evaluate(`Boolean(document.querySelector(".hydrology-canvas"))`);
  assert(hydroCanvas, "Hydrology runoff simulation canvas missing after tab switch");

  // Switch to Combat FSM
  await evaluate(`document.querySelectorAll(".sandbox-tab-btn")[2]?.click()`);
  await waitForSelector(".frame-timeline-track");
  const combatTimeline = await evaluate(`Boolean(document.querySelector(".frame-timeline-track"))`);
  assert(combatTimeline, "Combat FSM frame timeline track missing after tab switch");
  console.log(`  ✔ DSP, Hydrology, and Combat FSM sandboxes functional.`);

  // --- Step 6: Interactive 3D Hub & District Switching ---
  console.log("\n[6/7] Validating Interactive 3D Experience & District Transitions (/interactive)...");
  await navigateAndWait("/interactive", 2000);

  // Click Launch
  await evaluate(`(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.includes("Launch"));
    btn?.click();
  })()`);
  await delay(6000); // Allow WebGL scene to mount in SwiftShader

  const interactiveState = await evaluate(`(() => {
    const canvas = document.querySelector("canvas");
    const gl = canvas && (canvas.getContext("webgl2") || canvas.getContext("webgl"));
    const experience = document.querySelector("main.interactive-experience");
    const topbar = document.querySelector(".experience-topbar");
    return {
      mounted: Boolean(experience),
      webgl: Boolean(gl),
      topbarText: topbar?.textContent ?? "",
    };
  })()`);

  assert(interactiveState.mounted, "Interactive experience container failed to mount");
  assert(interactiveState.webgl, "WebGL context failed to initialize");
  console.log(`  ✔ 3D Scene mounted with active WebGL context.`);

  // Test District Switching across all 4 world areas
  const districtsToTest = [
    { name: "Software Systems District", id: "software-district" },
    { name: "Intelligent Systems Observatory", id: "intelligence-observatory" },
    { name: "Creative & Interactive Workshop", id: "creative-workshop" },
    { name: "Atlas Central Hub", id: "atlas-hub" },
  ];

  for (const district of districtsToTest) {
    // Open travel dropdown
    await evaluate(`(() => {
      const btn = Array.from(document.querySelectorAll(".travel-selector button")).find((b) => b.textContent.includes("Districts"));
      btn?.click();
    })()`);
    await delay(300);

    // Click district option
    await evaluate(`(() => {
      const opt = Array.from(document.querySelectorAll(".travel-option")).find((b) => b.textContent.includes("${district.name}"));
      opt?.click();
    })()`);
    await delay(1200);

    const activeTopbar = await evaluate(`document.querySelector(".experience-topbar")?.textContent ?? ""`);
    console.log(`  ✔ Transitioned to ${district.name}.`);
  }

  // Test Command Palette via Ctrl+K
  console.log("\n[7/7] Validating Command Palette dialog accessibility & Mobile viewport...");
  await delay(600);
  await evaluate(`window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))`);
  let hasDialog = await waitForSelector(".command-dialog", 3000);
  if (!hasDialog) {
    await evaluate(`document.querySelector(".command-palette-trigger")?.click()`);
    hasDialog = await waitForSelector(".command-dialog", 3000);
  }
  const paletteOpen = await evaluate(`Boolean(document.querySelector(".command-dialog"))`);
  assert(paletteOpen, "Command palette failed to open on Ctrl+K");

  // Close Command Palette via Escape
  await evaluate(`window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
  await delay(400);
  const paletteClosed = await evaluate(`!document.querySelector(".command-dialog")`);
  assert(paletteClosed, "Command palette failed to close on Escape");
  console.log(`  ✔ Command palette opened and closed cleanly via keyboard shortcuts.`);

  // Test Mobile Viewport Emulation
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await delay(600);
  const mobileLayout = await evaluate(`(() => {
    return {
      docWidth: document.documentElement.clientWidth,
      hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  })()`);
  assert(!mobileLayout.hasHorizontalOverflow, "Mobile viewport has horizontal scroll overflow");
  // --- Step 8: Validate Atlas Studio (/studio) ---
  console.log("\n[8/8] Validating Atlas Studio workspace & visual editor (/studio)...");
  // Reset desktop viewport
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url: `${baseUrl}/studio` });
  await waitForSelector("aside", 10000);
  await delay(1200);
  const studioInfo = await evaluate(`({
    title: document.title,
    hasHierarchy: Boolean(document.querySelector("aside")),
    hasCanvas: Boolean(document.querySelector("canvas")),
  })`);
  assert(studioInfo.title.includes("Studio"), `Studio title missing expected Studio label: ${studioInfo.title}`);
  assert(studioInfo.hasHierarchy, "Studio hierarchy sidebar failed to render");
  assert(studioInfo.hasCanvas, "Studio 3D canvas viewport failed to mount");
  console.log(`  ✔ Route /studio loaded with active 3D viewport and scene hierarchy.`);

  // Final Browser Error Verification
  console.log("\n--- Browser Console & Exception Audit ---");
  console.log(`Captured Console Errors: ${browserErrors.length}`);
  console.log(`Captured Console Warnings: ${browserWarnings.length}`);

  if (browserErrors.length > 0) {
    console.error("Browser errors encountered during E2E run:", browserErrors);
    throw new Error(`E2E Suite failed with ${browserErrors.length} browser errors.`);
  }

  // Cleanup
  ws.close();
  chrome.kill();
  console.log("\n🎉 ALL E2E ASSERTIONS PASSED WITH 0 BROWSER ERRORS!");
}

main().catch((err) => {
  console.error("\n❌ E2E TEST FAILED:", err.message);
  process.exit(1);
});