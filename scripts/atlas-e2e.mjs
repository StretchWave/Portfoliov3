/**
 * Atlas E2E smoke test (dev-only, no dependencies).
 *
 * Drives headless Chrome through the interactive launch flow against a running
 * dev server and captures screenshots + DOM evidence. Useful for validating
 * the 3D environment renders without the interactive preview UI.
 *
 * Usage:
 *   node scripts/atlas-e2e.mjs [baseUrl] [outDir]
 *   (defaults: http://localhost:3001 , /tmp/atlas-e2e)
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const CHROME = process.env.CHROME_BIN || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const baseUrl = process.argv[2] ?? "http://localhost:3001";
const outDir = process.argv[3] ?? "/tmp/atlas-e2e";
mkdirSync(outDir, { recursive: true });

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
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

  // Wait for the debugging endpoint.
  let version = null;
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) { version = await res.json(); break; }
    } catch { /* not up yet */ }
    await delay(250);
  }
  if (!version) throw new Error("Chrome debugging endpoint did not come up");

  // Open a fresh tab.
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });

  let id = 0;
  const pending = new Map();
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
  };

  async function evaluate(expression) {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(`Evaluation failed: ${result.exceptionDetails.text}`);
    return result.result.value;
  }

  await send("Page.enable");
  await send("Runtime.enable");

  // --- Conventional page smoke checks -------------------------------------
  const conventional = [
    ["home", "/"],
    ["about", "/about"],
    ["projects", "/projects"],
    ["skills", "/skills"],
    ["project-detail", "/projects/lyrune"],
    ["project-detail-sonara", "/projects/sonara"],
    ["project-detail-kerala", "/projects/kerala-flood-risk-platform"],
    ["project-detail-neerad", "/projects/neerad-store"],
    ["project-detail-lucida", "/projects/lucida-sync"],
    ["project-detail-recoverai", "/projects/recoverai"],
    ["project-detail-scrollbrake", "/projects/scrollbrake"],
    ["project-detail-pvp", "/projects/stance-combat-pvp"],
    ["project-detail-mainmenu", "/projects/main-menu"],
    ["interactive-entry", "/interactive"],
  ];
  const summary = [];
  for (const [name, path] of conventional) {
    await send("Page.navigate", { url: baseUrl + path });
    await delay(2200);
    const info = await evaluate(`({
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim().slice(0, 80) ?? null,
      threeImports: document.documentElement.innerHTML.includes("three") ? "maybe" : "none",
      bodyText: document.body.innerText.slice(0, 80).replace(/\\n/g, " | "),
    })`);
    summary.push({ name, ...info });
  }

  // --- Interactive launch flow --------------------------------------------
  await send("Page.navigate", { url: baseUrl + "/interactive" });
  await delay(2000);

  const before = await evaluate(`(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.includes("Launch"));
    if (!btn) return null;
    btn.click();
    return { text: btn.textContent.trim() };
  })()`);
  await delay(6000);

  const after = await evaluate(`(() => {
    const canvas = document.querySelector("canvas");
    const gl = canvas && (canvas.getContext("webgl2") || canvas.getContext("webgl"));
    return {
      experienceMounted: Boolean(document.querySelector("main.interactive-experience")),
      topbar: document.querySelector(".experience-topbar")?.textContent ?? null,
      hud: document.querySelector(".interaction-hud")?.textContent ?? null,
      labels: Array.from(document.querySelectorAll(".exhibit-label strong")).map((e) => e.textContent),
      canvasSize: canvas ? [canvas.width, canvas.height] : null,
      webgl: Boolean(gl),
      contextLost: gl ? gl.isContextLost() : null,
    };
  })()`);

  const shot = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(outDir, "hub.png"), Buffer.from(shot.data, "base64"));

  // Screenshot A: baseline render.
  const shotA = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(outDir, "hub-before-walk.png"), Buffer.from(shotA.data, "base64"));

  // Walk toward the Lyrune exhibit, verify focus + panel + close.
  const walkLog = [];
  async function step(key, ms, label) {
    await evaluate(`new Promise((resolve) => {
      const press = (k, down) => window.dispatchEvent(new KeyboardEvent(down ? "keydown" : "keyup", { key: k, bubbles: true }));
      press("${key}", true);
      setTimeout(() => { press("${key}", false); resolve(null); }, ${ms});
    })`);
    await delay(400);
    const hud = await evaluate(`document.querySelector(".interaction-hud")?.textContent ?? null`);
    walkLog.push({ label, hud });
    if (hud === null) {
      walkLog.push({ label: "page-state", state: await evaluate(`({ main: document.querySelector("main")?.className ?? null, body: document.body.innerText.slice(0, 160).replace(/\\n/g, " | ") })`) });
    }
    return hud?.includes("Inspect") ?? false;
  }

  // Measure the frame rate to compute real movement speed: each frame moves
  // min(delta, 0.05) * 4.2 units, so speed = fps * 0.05 * 4.2 while fps is
  // low, capped at 4.2 u/s at 60fps.
  const fps = await evaluate(`new Promise((resolve) => {
    let frames = 0;
    const start = performance.now();
    function tick() {
      frames++;
      if (performance.now() - start < 1000) requestAnimationFrame(tick);
      else resolve(frames / ((performance.now() - start) / 1000));
    }
    requestAnimationFrame(tick);
  })`);
  const speed = Math.min(4.2, fps * 0.05 * 4.2);

  // Walk from spawn (0, 1.7, 7.5) to the Lyrune exhibit at (-4.2, 0, -2.6),
  // then fine-tune toward the Kerala exhibit (+4.2, 0, -2.6) if still unfocused.
  let focused = false;
  const camLog = [];
  async function walkStep(key, meters) {
    const ms = Math.round((meters / speed) * 1000);
    focused = await step(key, ms, `${key} ${meters.toFixed(1)}m`);
    camLog.push({ key, meters, ms });
  }
  await walkStep("w", 10.1);
  if (!focused) await walkStep("a", 4.2);
  if (!focused) await walkStep("w", 0.4);
  if (!focused) { await walkStep("s", 1.2); await walkStep("d", 8.4); if (!focused) await walkStep("w", 0.3); }

  // Screenshot B: did the camera move (frame differs) and does the scene render?
  const shotB = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(outDir, "hub-after-walk.png"), Buffer.from(shotB.data, "base64"));

  const focusedHud = await evaluate(`document.querySelector(".interaction-hud")?.textContent ?? null`);

  const pressedE = await evaluate(`(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "e", bubbles: true }));
    return "dispatched";
  })()`);
  await delay(800);
  const panel = await evaluate(`(() => {
    const p = document.querySelector(".project-panel");
    return {
      open: Boolean(p),
      title: p?.querySelector("h2")?.textContent ?? null,
      links: Array.from(p?.querySelectorAll("a") ?? []).map((a) => ({ text: a.textContent.trim(), href: a.getAttribute("href") })),
    };
  })()`);

  if (panel.open) {
    await evaluate(`window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
    await delay(600);
  }
  const panelStillOpen = await evaluate(`Boolean(document.querySelector(".project-panel"))`);
  const shotAfter = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(outDir, "panel.png"), Buffer.from(shotAfter.data, "base64"));

  ws.close();
  chrome.kill();

  console.log(JSON.stringify({ before, after, fps, speed, walkLog, camLog, focusedHud, pressedE, panel, panelStillOpen, summary }, null, 2));
}

main().catch((error) => {
  console.error("E2E failed:", error.message);
  process.exit(1);
});