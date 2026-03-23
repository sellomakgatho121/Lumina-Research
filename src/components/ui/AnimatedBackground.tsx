import React, { useRef, useEffect } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    alpha: number;
}

import { useAI } from '../../contexts/AIContext';

const AnimatedBackground: React.FC = () => {
    const { isThinking } = useAI();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationFrameRef = useRef<number>(undefined);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Initialize particles
        const particleCount = 80;
        particlesRef.current = Array.from({ length: particleCount }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2 + 1,
            alpha: Math.random() * 0.5 + 0.3,
        }));

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw grid lines (subtle)
            ctx.strokeStyle = isThinking ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)';
            ctx.lineWidth = 1;
            const gridSize = 50;

            for (let i = 0; i < canvas.width; i += gridSize) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.stroke();
            }

            for (let i = 0; i < canvas.height; i += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }

            // Update and draw particles
            particlesRef.current.forEach((particle, i) => {
                // Update position (faster when thinking)
                const speedMult = isThinking ? 4 : 1;
                particle.x += particle.vx * speedMult;
                particle.y += particle.vy * speedMult;

                // Bounce off edges
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

                // Draw particle
                const alphaMult = isThinking ? 1.5 : 1;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(147, 197, 253, ${Math.min(1, particle.alpha * alphaMult)})`;
                ctx.fill();

                // Draw connections
                particlesRef.current.slice(i + 1).forEach((otherParticle) => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        const alpha = (1 - distance / 150) * (isThinking ? 0.3 : 0.15);
                        ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                });
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isThinking]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
            style={{ opacity: isThinking ? 0.8 : 0.4 }}
        />
    );
};

export default AnimatedBackground;
