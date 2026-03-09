import React, { useRef, useEffect, useCallback } from 'react';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const GlowCard: React.FC<GlowCardProps> = ({ children, className = '', style, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const rafRef = useRef<number>(0);
  const isHoveredRef = useRef(false);

  const animate = useCallback(() => {
    if (!isHoveredRef.current) return;
    angleRef.current = (angleRef.current + 2) % 360;
    const el = cardRef.current;
    if (el) {
      const a = angleRef.current;
      const spark = `conic-gradient(from ${a}deg, transparent 0%, transparent 75%, #f59e0b 82%, #fbbf24 88%, #fff 90%, #fbbf24 92%, #f59e0b 98%, transparent 100%)`;
      const glow = `conic-gradient(from ${a}deg, transparent 0%, transparent 70%, rgba(245,158,11,0.4) 85%, rgba(251,191,36,0.6) 90%, rgba(245,158,11,0.4) 95%, transparent 100%)`;
      el.style.setProperty('--spark-bg', spark);
      el.style.setProperty('--glow-bg', glow);
    }
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  const handleMouseEnter = useCallback(() => {
    isHoveredRef.current = true;
    const el = cardRef.current;
    if (el) {
      el.style.setProperty('--spark-opacity', '1');
    }
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const handleMouseLeave = useCallback(() => {
    isHoveredRef.current = false;
    cancelAnimationFrame(rafRef.current);
    const el = cardRef.current;
    if (el) {
      el.style.setProperty('--spark-opacity', '0');
    }
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      ref={cardRef}
      className={`spark-card ${className}`}
      style={style}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export default GlowCard;
