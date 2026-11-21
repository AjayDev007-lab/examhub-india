"use client";

import React from "react";
import CategoryJobsView from "@/components/CategoryJobsView";

export default function RailwayJobsPage() {
  return (
    <CategoryJobsView
      title="Indian Railways Recruitment (RRB / RRC)"
      subtitle="Official notices for Assistant Loco Pilot (ALP), NTPC, Group D, Junior Engineer, and Paramedical positions in 21 RRBs."
      badge="Railway Recruitment"
      defaultCategory="RAILWAY"
    />
  );
}
