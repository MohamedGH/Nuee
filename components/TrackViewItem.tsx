"use client";

import { useEffect } from "react";
import { trackViewItem } from "@/lib/analytics";

export default function TrackViewItem({
  id,
  name,
  category,
  priceCents,
}: {
  id: string;
  name: string;
  category: string;
  priceCents: number;
}) {
  useEffect(() => {
    trackViewItem({
      item_id: id,
      item_name: name,
      item_category: category,
      price: priceCents / 100,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return null;
}
