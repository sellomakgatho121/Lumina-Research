import { useRef, useEffect, useState } from 'react';

interface OrbParticle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  opacity: number;
  layer: number;
}

const Hero3D = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);
    setIsLoaded(true);

    // Create orbital particles
    const particles: OrbParticle[] = Array.from({ length: 200 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 60 + Math.random() * 120,
      speed: (Math.random() - 0.5) * 0.015,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      layer: Math.floor(Math.random() * 3),
    }));

    // Create stars
    const stars = Array.from({ length: 300 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.5 + 0.5,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.01,
    }));

    let time = 0;

    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      time += 0.016;

      const cx = w / 2;
      const cy = h / 2;

      // Draw stars
      stars.forEach((star) => {
        star.twinkle += star.speed;
        const alpha = 0.3 + Math.sin(star.twinkle) * 0.3;
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
        ctx.fill();
      });

      // Draw grid (perspective-style)
      ctx.strokeStyle = 'rgba(30, 58, 138, 0.15)';
      ctx.lineWidth = 0.5;
      const gridLines = 15;
      for (let i = -gridLines; i <= gridLines; i++) {
        const offset = i * 40;
        const perspectiveScale = 1 + Math.abs(i) * 0.02;
        ctx.beginPath();
        ctx.moveTo(cx + offset * perspectiveScale, 0);
        ctx.lineTo(cx + offset * perspectiveScale * 0.3, h);
        ctx.stroke();
      }
      for (let i = 0; i < 20; i++) {
        const y = (i / 20) * h;
        const spread = 1 - (i / 20) * 0.6;
        ctx.beginPath();
        ctx.moveTo(cx - 300 * spread, y);
        ctx.lineTo(cx + 300 * spread, y);
        ctx.stroke();
      }

      // Draw central glow orb
      const orbRadius = 100 + Math.sin(time * 0.5) * 15;

      // Outer glow
      const outerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius * 2.5);
      outerGlow.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
      outerGlow.addColorStop(0.5, 'rgba(139, 92, 246, 0.05)');
      outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = outerGlow;
      ctx.fillRect(0, 0, w, h);

      // Inner orb
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius);
      gradient.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
      gradient.addColorStop(0.4, 'rgba(99, 102, 241, 0.3)');
      gradient.addColorStop(0.7, 'rgba(139, 92, 246, 0.15)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Bright core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius * 0.4);
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      coreGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Draw orbital particles
      const colors = [
        [56, 189, 248],   // blue
        [139, 92, 246],   // purple
        [99, 102, 241],   // indigo
      ];

      particles.forEach((p) => {
        p.angle += p.speed;
        const wobble = Math.sin(time * 2 + p.angle * 3) * 10;
        const x = cx + Math.cos(p.angle) * (p.radius + wobble);
        const y = cy + Math.sin(p.angle) * (p.radius * 0.6 + wobble * 0.5);
        const color = colors[p.layer];
        const alpha = p.opacity * (0.5 + Math.sin(time + p.angle) * 0.3);

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
        ctx.fill();

        // Particle trails
        if (p.size > 2) {
          ctx.beginPath();
          const trailAngle = p.angle - p.speed * 8;
          const tx = cx + Math.cos(trailAngle) * p.radius;
          const ty = cy + Math.sin(trailAngle) * (p.radius * 0.6);
          ctx.moveTo(x, y);
          ctx.lineTo(tx, ty);
          ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * 0.3})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });

      // Draw orbital rings
      for (let ring = 0; ring < 3; ring++) {
        const ringRadius = 80 + ring * 50;
        const ringAlpha = 0.08 + Math.sin(time + ring) * 0.03;
        ctx.beginPath();
        ctx.ellipse(cx, cy, ringRadius, ringRadius * 0.6, time * 0.1 + ring * 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${ringAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease-in' }}
      />
    </div>
  );
};

export default Hero3D;
