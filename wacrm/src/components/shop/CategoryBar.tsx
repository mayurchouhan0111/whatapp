"use client";

import { useStore } from "./store-context";
import { getCategoryEmoji } from "./category-icons";

export default function CategoryBar() {
  const { categories, selectedCategory, handleCategorySelect } = useStore();

  return (
    <div className="flex gap-2 overflow-x-auto py-4 shrink-0 hide-scrollbar bg-white border-b border-[#E2E8F0]/40">
      <div className="flex gap-2 w-[95%] max-w-[1600px] mx-auto px-4">
        {categories.map((cat) => {
          const isAll = cat === "All";
          const emoji = isAll ? "🏷️" : getCategoryEmoji(cat);
          return (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#25D366] text-white shadow-lg shadow-[#25D366]/25 scale-105"
                  : "bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#25D366]/40 hover:text-[#128C7E] hover:shadow-sm"
              }`}
            >
              {emoji && <span className="text-sm">{emoji}</span>}
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
