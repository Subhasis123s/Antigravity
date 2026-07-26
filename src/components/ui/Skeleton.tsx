"use client";

import React from "react";
import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-xl bg-surface-subtle/80 border border-white/5",
        className
      )}
    />
  );
};
