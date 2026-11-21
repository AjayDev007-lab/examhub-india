"use client";

import React from "react";
import CategoryJobsView from "@/components/CategoryJobsView";

export default function BankingJobsPage() {
  return (
    <CategoryJobsView
      title="Banking & Financial Sector Recruitment"
      subtitle="SBI, IBPS (PO, Clerk, SO, RRB), RBI Grade B, NABARD, SEBI, and Public Sector Financial Institution career notifications."
      badge="Banking & Finance"
      defaultCategory="BANKING"
    />
  );
}
