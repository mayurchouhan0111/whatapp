"use client";

import { Search, Package } from "lucide-react";

export default function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-5">
        <div className="size-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#E2E8F0]/40">
          <Package className="size-10 text-[#CBD5E1]" />
        </div>
        <div className="absolute -bottom-1 -right-1 size-8 bg-[#FAFAF9] rounded-full flex items-center justify-center border border-[#E2E8F0]/40 shadow-sm">
          <Search className="size-4 text-[#94A3B8]" />
        </div>
      </div>
      <h3 className="text-base font-bold text-[#0B0F19]">No matching items</h3>
      <p className="text-sm text-[#64748B] mt-1.5 max-w-xs leading-relaxed">
        We couldn&apos;t find any items matching &quot;{query}&quot;. Try adjusting your keywords or browse by category.
      </p>
    </div>
  );
}
