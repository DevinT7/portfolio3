"use client";

import { useEffect } from "react";

export function OpenPanel({ id }: { id: string }) {
  useEffect(() => {
    location.replace(`/#${id}`);
  }, [id]);
  return (
    <p className="label p-8">
      <a href={`/#${id}`}>Continue →</a>
    </p>
  );
}
