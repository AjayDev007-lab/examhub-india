"use client";

import React from "react";
import CategoryJobsView from "@/components/CategoryJobsView";

export default function TeachingJobsPage() {
  return (
    <CategoryJobsView
      title="Teaching, Faculty & Academic Jobs"
      subtitle="KVS, NVS, State Teacher Eligibility (TET/STET), Assistant Professor (UGC-NET), and Central University faculty recruitments."
      badge="Teaching & Faculty"
      defaultCategory="TEACHING"
    />
  );
}
