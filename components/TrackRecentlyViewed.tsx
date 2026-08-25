"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/store/recentlyViewed";

export default function TrackRecentlyViewed({ productId }: { productId: string }) {
  const add = useRecentlyViewed((s) => s.add);

  useEffect(() => {
    add(productId);
  }, [productId, add]);

  return null;
}
