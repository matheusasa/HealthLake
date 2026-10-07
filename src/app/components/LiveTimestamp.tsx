"use client";

import { useState, useEffect } from "react";

export function LiveTimestamp() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-xs text-slate-400">
      Atualizado: {time.toLocaleTimeString("pt-BR")}
    </span>
  );
}