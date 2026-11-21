"use client";

import React from "react";
import CategoryJobsView from "@/components/CategoryJobsView";

export default function ApprenticeshipsPage() {
  return (
    <CategoryJobsView
      title="Apprenticeship Programs (NATS / NAPS)"
      subtitle="Trade, Graduate, and Technician Apprenticeship openings under Central PSUs, Railways, Ordnance Factories, and Heavy Industries."
      badge="Apprenticeships"
      defaultCategory="APPRENTICESHIP"
    />
  );
}
