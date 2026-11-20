"use client";

import React, { Suspense } from "react";
import ResultsContent from "./ResultsContent";

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading Results Checker...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
