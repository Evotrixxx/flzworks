"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { autopiacPath } from "@/lib/routes";

export function FavoriteButton({
  listingId,
  initialFavorite,
  isAuthenticated,
  labels,
  compact = false,
}: {
  listingId: string;
  initialFavorite: boolean;
  isAuthenticated: boolean;
  labels: {
    favorite: string;
    favorited: string;
    needLogin: string;
  };
  compact?: boolean;
}) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [pending, setPending] = useState(false);

  async function toggleFavorite() {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(autopiacPath())}`);
      return;
    }

    setPending(true);

    const response = await fetch("/api/favorites", {
      method: favorite ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });

    if (response.ok) {
      setFavorite(!favorite);
      router.refresh();
    }

    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={toggleFavorite}
      disabled={pending}
      title={!isAuthenticated ? labels.needLogin : undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition disabled:opacity-60 ${
        compact ? "h-9 px-3" : "h-10 px-4"
      } ${
        favorite
          ? "border border-rose-200/70 bg-rose-100/70 text-rose-700 shadow-sm backdrop-blur hover:bg-rose-100"
          : "liquid-button-secondary text-slate-700 hover:text-rose-700"
      }`}
    >
      <Heart className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} aria-hidden="true" />
      {!compact && <span>{favorite ? labels.favorited : labels.favorite}</span>}
    </button>
  );
}
