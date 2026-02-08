import React, { useEffect, useRef } from "react";

export const CursorGlow: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current) {
        ref.current.style.left = e.clientX + "px";
        ref.current.style.top = e.clientY + "px";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        width: 420,
        height: 420,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(251,146,60,0.06) 0%, rgba(253,230,138,0.03) 35%, transparent 70%)",
        pointerEvents: "none",
        transform: "translate(-50%, -50%)",
        zIndex: 0,
        transition: "left 0.25s ease-out, top 0.25s ease-out",
      }}
    />
  );
};
