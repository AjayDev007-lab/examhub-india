"use client";

import React from "react";
import CategoryJobsView from "@/components/CategoryJobsView";

export default function PrivateJobsPage() {
  return (
    <CategoryJobsView
      title="Private Sector & Corporate Opportunities"
      subtitle="Leading enterprise, MNC, banking, engineering, and manufacturing career openings for graduates and experienced professionals."
      badge="Private Sector"
      defaultSector="PRIVATE"
    />
  );
}
