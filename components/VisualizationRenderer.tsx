'use client';

import { useEffect, useRef } from 'react';

interface VisualizationRendererProps {
  svgHtml?: string;
}

export function VisualizationRenderer({ svgHtml }: VisualizationRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Add smooth fade-in animation
      containerRef.current.style.opacity = '0';
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.style.transition = 'opacity 0.6s ease-in';
          containerRef.current.style.opacity = '1';
        }
      });
    }
  }, [svgHtml]);

  // Fallback if no SVG provided
  if (!svgHtml || svgHtml.trim().length === 0) {
    return (
      <div
        className="flex justify-center items-center rounded-lg bg-gradient-to-br from-[#f5f2eb] via-[#f9f7f3] to-[#ede8df] p-8"
        style={{ minHeight: '420px' }}
      >
        <p className="text-muted-foreground/70 text-center">Visualization generating...</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex justify-center overflow-x-auto rounded-lg bg-gradient-to-br from-[#f5f2eb] via-[#f9f7f3] to-[#ede8df] p-8 shadow-sm border border-border"
      style={{
        minHeight: '420px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <style>{`
        svg {
          max-width: 100%;
          height: auto;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.08));
        }
        
        svg rect {
          transition: fill 0.3s ease, stroke-width 0.3s ease;
        }
        
        svg text {
          user-select: none;
        }
        
        @media (prefers-reduced-motion: no-preference) {
          svg rect.active {
            animation: pulse 0.6s ease-in-out;
          }
          
          @keyframes pulse {
            0%, 100% { fill: #4a9eff; }
            50% { fill: #6bb3ff; }
          }
        }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: svgHtml }} />
    </div>
  );
}
