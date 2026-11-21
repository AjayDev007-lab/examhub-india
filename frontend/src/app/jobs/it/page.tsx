"use client";

import React from "react";
import CategoryJobsView from "@/components/CategoryJobsView";

export default function ITJobsPage() {
  return (
    <CategoryJobsView
      title="IT, Software & Tech Engineering Roles"
      subtitle="Full Stack, Cloud, AI/ML, Data Engineering, Cyber Security, DevOps, and Product Engineering roles across top technology firms."
      badge="IT & Software"
      defaultCategory="IT"
    />
  );
}
