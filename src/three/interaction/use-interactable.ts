"use client";

import { useEffect } from "react";

import { useInteraction } from "./interaction-provider";
import type { InteractableDefinition } from "./interaction-types";

/** Register scene objects without coupling them to the detection implementation. */
export function useInteractable(definition: InteractableDefinition): void {
  const { register } = useInteraction();

  useEffect(() => register(definition), [definition, register]);
}
