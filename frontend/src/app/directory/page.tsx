"use client";

import React, { Suspense } from "react";
import DirectoryContent from "./DirectoryContent";

export default function DirectoryPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading All-India Directory...</div>}>
      <DirectoryContent />
    </Suspense>
  );
}
