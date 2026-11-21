"use client";

import React from "react";
import CategoryJobsView from "@/components/CategoryJobsView";

export default function InternshipsPage() {
  return (
    <CategoryJobsView
      title="Internship & Trainee Opportunities"
      subtitle="Paid summer/winter internships, government research trainee slots, and startup corporate programs for college students."
      badge="Internships"
      defaultCategory="INTERNSHIP"
    />
  );
}
