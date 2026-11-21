"use client";

import React from "react";
import CategoryJobsView from "@/components/CategoryJobsView";

export default function RemoteJobsPage() {
  return (
    <CategoryJobsView
      title="Remote & Work From Anywhere Jobs"
      subtitle="Verified work-from-home and distributed team openings in engineering, content, digital services, and customer operations."
      badge="Remote / WFH"
      defaultWorkMode="REMOTE"
    />
  );
}
