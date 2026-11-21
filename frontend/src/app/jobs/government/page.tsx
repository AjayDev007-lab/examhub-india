"use client";

import React from "react";
import CategoryJobsView from "@/components/CategoryJobsView";

export default function CentralGovtJobsPage() {
  return (
    <CategoryJobsView
      title="Central Government Jobs (Sarkari Naukri)"
      subtitle="Verified UPSC, SSC, Ministries, Central PSUs, and Autonomous Bodies recruitment notifications across India."
      badge="Central Govt"
      defaultSector="CENTRAL_GOVT"
    />
  );
}
