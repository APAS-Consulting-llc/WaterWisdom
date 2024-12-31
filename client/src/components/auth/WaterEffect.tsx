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

      // Add new ripple point
      pointsRef.current.push({
        x,
        y,
        radius: 0,
        strength: 1,
        life: 1
      });
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleMove);
    canvas.addEventListener('click', handleMove);

    return () => {
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('click', handleMove);
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

      // Update and draw ripples
      pointsRef.current = pointsRef.current.filter(point => {
        point.radius += 5;
        point.life -= 0.02;
        point.strength *= 0.95;

        if (point.life <= 0) return false;

        // Draw ripple
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, point.radius
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
        gradient.addColorStop(0.7, `rgba(77, 155, 230, ${0.2 * point.life * point.strength})`);
        gradient.addColorStop(1, `rgba(77, 155, 230, 0)`);

        ctx.beginPath();
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        return true;
      });

      // Draw cursor trail
      const x = springX.get();
      const y = springY.get();
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 100);
      gradient.addColorStop(0, 'rgba(77, 155, 230, 0.2)');
      gradient.addColorStop(1, 'rgba(77, 155, 230, 0)');
      ctx.beginPath();
      ctx.arc(x, y, 100, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
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
