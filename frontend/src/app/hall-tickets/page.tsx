"use client";

import React, { Suspense } from "react";
import HallTicketsContent from "./HallTicketsContent";

export default function HallTicketsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading Hall Ticket Retrieval...</div>}>
      <HallTicketsContent />
    </Suspense>
  );
}
