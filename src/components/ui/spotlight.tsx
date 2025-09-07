import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface SpotlightProps {
  target: string; // CSS selector for the element to highlight
  isActive: boolean;
  padding?: number;
  borderRadius?: number;
  onTargetClick?: () => void;
}

export function Spotlight({ 
  target, 
  isActive, 
  padding = 8, 
  borderRadius = 8,
  onTargetClick 
}: SpotlightProps) {
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [dimensions, setDimensions] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (!isActive) return;

    const element = document.querySelector(target);
    setTargetElement(element);

    if (!element) return;

    const updateDimensions = () => {
      const rect = element.getBoundingClientRect();
      setDimensions({
        x: rect.left - padding,
        y: rect.top - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
    };

    updateDimensions();

    // Update dimensions on scroll/resize
    const handleUpdate = () => updateDimensions();
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    // Add click listener to target element
    const handleTargetClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      onTargetClick?.();
    };

    if (onTargetClick) {
      element.addEventListener('click', handleTargetClick, true);
    }

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
      if (onTargetClick) {
        element.removeEventListener('click', handleTargetClick, true);
      }
    };
  }, [target, isActive, padding, onTargetClick]);

  if (!isActive || !targetElement) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Spotlight hole */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="absolute pointer-events-auto"
          style={{
            left: dimensions.x,
            top: dimensions.y,
            width: dimensions.width,
            height: dimensions.height,
            borderRadius: borderRadius,
            boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.6)`,
            background: 'transparent',
          }}
        />
        
        {/* Glowing border */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="absolute pointer-events-none border-2 border-primary shadow-lg"
          style={{
            left: dimensions.x,
            top: dimensions.y,
            width: dimensions.width,
            height: dimensions.height,
            borderRadius: borderRadius,
            boxShadow: '0 0 20px hsl(var(--primary) / 0.5)',
          }}
        />
        
        {/* Pulsing animation */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute pointer-events-none border border-primary/50"
          style={{
            left: dimensions.x - 2,
            top: dimensions.y - 2,
            width: dimensions.width + 4,
            height: dimensions.height + 4,
            borderRadius: borderRadius + 2,
          }}
        />
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}