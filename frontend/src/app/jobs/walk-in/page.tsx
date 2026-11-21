"use client";

import React from "react";
import CategoryJobsView from "@/components/CategoryJobsView";

export default function WalkInJobsPage() {
  return (
    <CategoryJobsView
      title="Walk-In Interviews & Direct Selection"
      subtitle="Urgent hiring drives, hospital/medical officer selections, and direct corporate recruitment interviews across major cities."
      badge="Walk-In Drives"
      defaultCategory="WALK_IN"
    />
  );
}
