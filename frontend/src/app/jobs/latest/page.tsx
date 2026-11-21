"use client";

import React from "react";
import CategoryJobsView from "@/components/CategoryJobsView";

export default function LatestJobsPage() {
  return (
    <CategoryJobsView
      title="Latest Job Notifications"
      subtitle="Newly published Central, State, Railway, Banking, and IT recruitment notices published in the last 14 days"
      badge="Latest Updates"
      onlyLatest={true}
    />
  );
}
