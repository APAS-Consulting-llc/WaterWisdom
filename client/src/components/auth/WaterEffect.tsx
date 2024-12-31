import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface Point {
  x: number;
  y: number;
  radius: number;
  strength: number;
  life: number;
}

export default function WaterEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const pointsRef = useRef<Point[]>([]);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 25, stiffness: 700 });
  const springY = useSpring(mouseY, { damping: 25, stiffness: 700 });

  // Initialize canvas and context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle mouse/touch movement
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = 'touches' in e 
        ? e.touches[0].clientX - rect.left 
        : e.clientX - rect.left;
      const y = 'touches' in e 
        ? e.touches[0].clientY - rect.top 
        : e.clientY - rect.top;

      mouseX.set(x);
      mouseY.set(y);

      // Add new ripple point with increased initial strength
      pointsRef.current.push({
        x,
        y,
        radius: 0,
        strength: 1.5, // Increased from 1 to 1.5
        life: 1
      });
    };

    // Handle click with stronger effect
    const handleClick = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = 'touches' in e 
        ? e.touches[0].clientX - rect.left 
        : e.clientX - rect.left;
      const y = 'touches' in e 
        ? e.touches[0].clientY - rect.top 
        : e.clientY - rect.top;

      // Add multiple ripple points for a stronger splash effect
      for (let i = 0; i < 3; i++) {
        pointsRef.current.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          radius: Math.random() * 10,
          strength: 2, // Stronger effect for clicks
          life: 1
        });
      }
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleMove);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleClick);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (time: number) => {
      if (!previousTimeRef.current) {
        previousTimeRef.current = time;
      }
      const deltaTime = time - previousTimeRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw ripples with enhanced visual effect
      pointsRef.current = pointsRef.current.filter(point => {
        point.radius += 5;
        point.life -= 0.02;
        point.strength *= 0.95;

        if (point.life <= 0) return false;

        // Enhanced ripple effect with more prominent glow
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, point.radius
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.1 * point.life * point.strength})`);
        gradient.addColorStop(0.4, `rgba(77, 155, 230, ${0.3 * point.life * point.strength})`);
        gradient.addColorStop(0.7, `rgba(77, 155, 230, ${0.2 * point.life * point.strength})`);
        gradient.addColorStop(1, `rgba(77, 155, 230, 0)`);

        ctx.beginPath();
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        return true;
      });

      // Draw enhanced cursor trail with larger, more visible effect
      const x = springX.get();
      const y = springY.get();

      // Main cursor glow
      const cursorGradient = ctx.createRadialGradient(x, y, 0, x, y, 150);
      cursorGradient.addColorStop(0, 'rgba(77, 155, 230, 0.3)');
      cursorGradient.addColorStop(0.3, 'rgba(77, 155, 230, 0.2)');
      cursorGradient.addColorStop(0.7, 'rgba(77, 155, 230, 0.1)');
      cursorGradient.addColorStop(1, 'rgba(77, 155, 230, 0)');

      ctx.beginPath();
      ctx.arc(x, y, 150, 0, Math.PI * 2);
      ctx.fillStyle = cursorGradient;
      ctx.fill();

      // Inner cursor highlight
      const innerGradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
      innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      innerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fillStyle = innerGradient;
      ctx.fill();

      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto z-0"
      style={{ 
        background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.1))'
      }}
    />
  );
}