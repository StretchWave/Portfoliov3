"use client";

import { useState } from "react";
import { useDiscoveryJournal } from "@/features/portfolio/journal/discovery-journal-context";

interface InteractiveTerminalDemoProps {
  initialCommand?: string;
  availableCommands: Record<string, string>;
}

export function InteractiveTerminalDemo({
  initialCommand,
  availableCommands,
}: InteractiveTerminalDemoProps) {
  const { recordDiscovery } = useDiscoveryJournal();
  const [history, setHistory] = useState<Array<{ cmd: string; output: string }>>(() => {
    if (initialCommand && availableCommands[initialCommand]) {
      return [{ cmd: initialCommand, output: availableCommands[initialCommand] }];
    }
    const firstCmd = Object.keys(availableCommands)[0];
    return firstCmd ? [{ cmd: firstCmd, output: availableCommands[firstCmd] }] : [];
  });
  const [inputVal, setInputVal] = useState("");

  function executeCommand(cmdToRun: string) {
    const trimmed = cmdToRun.trim();
    if (!trimmed) return;
    recordDiscovery("demo-terminal");

    if (trimmed.toLowerCase() === "clear") {
      setHistory([]);
      setInputVal("");
      return;
    }

    const matchedKey = Object.keys(availableCommands).find(
      (k) => k.toLowerCase() === trimmed.toLowerCase()
    );

    let output = "";
    if (matchedKey) {
      output = availableCommands[matchedKey];
    } else {
      output = `Command not recognized: "${trimmed}". Available commands: ${Object.keys(availableCommands).join(", ")}, clear`;
    }

    setHistory((prev) => [...prev, { cmd: trimmed, output }]);
    setInputVal("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    executeCommand(inputVal);
  }

  return (
    <div className="demo-terminal">
      <div className="demo-terminal__bar">
        <div className="demo-terminal__dots">
          <span />
          <span />
          <span />
        </div>
        <span className="demo-terminal__title">simulated command console</span>
      </div>

      <div className="demo-terminal__body">
        {history.map((entry, idx) => (
          <div key={idx} className="demo-terminal__entry">
            <div className="demo-terminal__prompt">
              <span className="demo-terminal__prefix">user@atlas:~$</span>
              <span className="demo-terminal__cmd">{entry.cmd}</span>
            </div>
            <pre className="demo-terminal__output">{entry.output}</pre>
          </div>
        ))}

        <form onSubmit={handleSubmit} className="demo-terminal__form">
          <span className="demo-terminal__prefix">user@atlas:~$</span>
          <input
            type="text"
            className="demo-terminal__input"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type command or click quick action below..."
          />
        </form>
      </div>

      <div className="demo-terminal__quick-actions">
        <span className="demo-terminal__quick-label">Quick run:</span>
        {Object.keys(availableCommands).map((cmd) => (
          <button
            key={cmd}
            type="button"
            className="demo-chip"
            onClick={() => executeCommand(cmd)}
          >
            {cmd}
          </button>
        ))}
        <button
          type="button"
          className="demo-chip demo-chip--muted"
          onClick={() => executeCommand("clear")}
        >
          clear
        </button>
      </div>
    </div>
  );
}
