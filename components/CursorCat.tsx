"use client";

import { useEffect, useState } from "react";
// @ts-expect-error - react-cursor-cat does not have TypeScript definitions
import Oneko from "react-cursor-cat";

export function CursorCat() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Find the injected Oneko element and add a class to it so we can fix the white background
    const interval = setInterval(() => {
      // Oneko.js injects a div with specific inline styles
      const divs = Array.from(document.querySelectorAll("div"));
      const nekoEl = divs.find(
        (el) => el.style.width === "32px" && el.style.height === "32px" && el.style.position === "fixed"
      );
      
      if (nekoEl) {
        nekoEl.classList.add("cursor-pet-element");
        clearInterval(interval);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  if (!isClient) return null;

  return <Oneko />;
}
