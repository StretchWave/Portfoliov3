"use client";

import { useEffect } from "react";
import { useDiscoveryJournal } from "./discovery-journal-context";

export function DiscoveryTracker({ milestoneId }: { milestoneId: string }) {
  const { recordDiscovery } = useDiscoveryJournal();

  useEffect(() => {
    recordDiscovery(milestoneId);
  }, [milestoneId, recordDiscovery]);

  return null;
}
