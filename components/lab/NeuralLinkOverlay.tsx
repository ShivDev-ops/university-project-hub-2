'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Node {
  id: string;
  x: number;
  y: number;
}

interface Link {
  fromId: string;
  toId: string;
}

interface NeuralLinkOverlayProps {
  links: Link[];
  nodes: Record<string, Node>;
  activeDrag?: { fromId: string; currentPos: { x: number; y: number } } | null;
  hoveredNodeId?: string | null;
}

const NeuralLinkOverlay: React.FC<NeuralLinkOverlayProps> = ({ links, nodes, activeDrag, hoveredNodeId }) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getPath = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const dx = end.x - start.x;
    const controlPoint1 = { x: start.x + dx * 0.5, y: start.y };
    const controlPoint2 = { x: start.x + dx * 0.5, y: end.y };
    return `M ${start.x} ${start.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${end.x} ${end.y}`;
  };

  if (isMobile) return null;

  const visibleLinks = useMemo(() => {
    if (!hoveredNodeId) return [];
    return links.filter(link => link.fromId === hoveredNodeId || link.toId === hoveredNodeId);
  }, [links, hoveredNodeId]);

  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full z-10">
      <defs>
        <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {visibleLinks.map((link, i) => {
        const start = nodes[link.fromId];
        const end = nodes[link.toId];
        if (!start || !end) return null;

        const path = getPath(start, end);

        return (
          <React.Fragment key={`${link.fromId}-${link.toId}`}>
            <path
              d={path}
              stroke="rgba(16, 185, 129, 0.2)"
              strokeWidth="2"
              fill="none"
              className="transition-opacity duration-300"
            />
            <motion.path
              d={path}
              stroke="url(#beamGradient)"
              strokeWidth="3"
              fill="none"
              initial={{ strokeDasharray: "0 1", strokeDashoffset: 1 }}
              animate={{ strokeDashoffset: [1, -1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ strokeDasharray: "100 100" }}
            />
          </React.Fragment>
        );
      })}

      {activeDrag && nodes[activeDrag.fromId] && (
        <path
          d={getPath(nodes[activeDrag.fromId], activeDrag.currentPos)}
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="5 5"
          fill="none"
        />
      )}
    </svg>
  );
};

export default NeuralLinkOverlay;
