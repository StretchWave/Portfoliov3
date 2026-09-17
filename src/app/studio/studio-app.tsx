"use client";

import { useCallback } from "react";
import { InteractionProvider } from "@/three/interaction/interaction-provider";
import type { InteractionEvent } from "@/three/interaction/interaction-types";
import { WorldAreaProvider } from "@/three/world/area-context";
import { StudioLayout } from "./components/studio-layout";
import { EditorProvider } from "./state/editor-context";

export function StudioApp() {
  const handleInteraction = useCallback((event: InteractionEvent) => {
    console.info("[Studio] Interaction dispatched:", event);
  }, []);

  return (
    <WorldAreaProvider>
      <InteractionProvider onInteraction={handleInteraction}>
        <EditorProvider>
          <StudioLayout />
        </EditorProvider>
      </InteractionProvider>
    </WorldAreaProvider>
  );
}
export default StudioApp;
