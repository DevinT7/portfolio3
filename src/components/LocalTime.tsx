"use client";

import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", hour: "numeric", minute: "2-digit" });

/** Current time in Austin. Blank until mounted so server and client markup match. */
export function LocalTime() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{now || " "}</span>;
}
