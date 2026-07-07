"use client";

import { useStore } from "./store-context";
import { getCategoryEmoji, getCategoryColor } from "./category-icons";

export default function CategoryCards() {
  const { categories, handleCategorySelect } = useStore();

  const cats = categories.filter((c) => c !== "All");

  if (cats.length === 0) return null;

  function scrollToSection(cat: string) {
    handleCategorySelect(cat);
    setTimeout(() => {
      document.getElementById(`section-${cat}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  return (
    <section className="bg-white border-b border-[#E2E8F0]/20">
      <div className="w-[95%] max-w-[1600px] mx-auto px-4 py-5 sm:py-6">
        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1 sm:grid sm:grid-cols-[repeat(auto-fill,minmax(96px,1fr))] sm:overflow-visible sm:pb-0">
          {cats.map((cat) => {
            const color = getCategoryColor(cat);
            return (
              <button
                key={cat}
                onClick={() => scrollToSection(cat)}
                className="flex flex-col items-center gap-2 min-w-[84px] sm:min-w-0 p-3.5 sm:p-4 rounded-2xl border border-[#E2E8F0]/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer shrink-0"
                style={{ backgroundColor: color }}
              >
                <span className="text-2xl sm:text-3xl leading-none drop-shadow-sm">{getCategoryEmoji(cat)}</span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#0B0F19] text-center leading-tight">
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
