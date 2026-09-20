"use client";

import { useRouter } from "next/navigation";
import { trackFilter } from "@/lib/analytics";

const OPTIONS = [
  { value: "nouveautes", label: "Nouveautés" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
];

export default function SortSelect({
  currentSort,
  basePath,
}: {
  currentSort: string;
  basePath: string;
}) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    trackFilter({ sort: value });
    const separator = basePath.includes("?") ? "&" : "?";
    router.push(value === "nouveautes" ? basePath : `${basePath}${separator}sort=${value}`);
  }

  return (
    <select
      value={currentSort}
      onChange={handleChange}
      aria-label="Trier par"
      className="focus-ring font-mono text-xs tracking-tag uppercase border border-line px-3 py-2 bg-bone"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
