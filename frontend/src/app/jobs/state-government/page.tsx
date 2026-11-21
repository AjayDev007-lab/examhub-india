"use client";

import React from "react";
import CategoryJobsView from "@/components/CategoryJobsView";

export default function StateGovtJobsPage() {
  return (
    <CategoryJobsView
      title="State Government Recruitment"
      subtitle="State Public Service Commissions (PSCs), Police Recruitment, Revenue, Municipal, and District-level vacancies across 28 States & 8 UTs."
      badge="State Govt"
      defaultSector="STATE_GOVT"
    />
  );
}
