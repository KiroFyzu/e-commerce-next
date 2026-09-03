"use client";

import { useState } from "react";
import { PackageIcon } from "@/components/icons";

export function Thumb({
  src,
  alt,
  className = "h-12 w-12",
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className={`flex shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-300 ${className}`}>
        <PackageIcon className="h-5 w-5" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      className={`shrink-0 rounded-lg object-cover ${className}`}
    />
  );
}
