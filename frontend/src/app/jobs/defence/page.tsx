"use client";

import React from "react";
import CategoryJobsView from "@/components/CategoryJobsView";

export default function DefenceJobsPage() {
  return (
    <CategoryJobsView
      title="Defence & Paramilitary Recruitment"
      subtitle="Indian Army, Indian Navy, Indian Air Force (AFCAT, NDA, CDS), Coast Guard, CAPF (CRPF, BSF, CISF, ITBP, SSB)."
      badge="Defence Forces"
      defaultCategory="DEFENCE"
    />
  );
}
