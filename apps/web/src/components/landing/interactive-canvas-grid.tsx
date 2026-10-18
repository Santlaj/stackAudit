"use client";

import * as React from "react";

interface InteractiveCanvasGridProps {
  className?: string;
  gridSize?: number;
}

export function InteractiveCanvasGrid({ className = "", gridSize = 44 }: InteractiveCanvasGridProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const mouseRef = React.useRef<{ x: number; y: number; active: boolean; targetX: number; targetY: number }>({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    active: false,
  });
  const ripplesRef = React.useRef<Array<{ x: number; y: number; radius: number; alpha: number }>>([]);
  const isVisibleRef = React.useRef<boolean>(true);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let lastClientX = -1000;
    let lastClientY = -1000;

    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    resize();
    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    window.addEventListener("resize", resize);

    // Scroll & Window-aware mouse calculation
    const updateMouseFromClient = (clientX: number, clientY: number) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();

      // Check if mouse is within this section's vertical and horizontal bounds
      const isInSection =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;

      if (isInSection) {
        mouseRef.current.targetX = clientX - rect.left;
        mouseRef.current.targetY = clientY - rect.top;
        mouseRef.current.active = true;
      } else {
        mouseRef.current.active = false;
      }
    };

    const handleWindowMouseMove = (e: MouseEvent) => {
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      updateMouseFromClient(e.clientX, e.clientY);
    };

    const handleScroll = () => {
      if (lastClientX !== -1000 && lastClientY !== -1000) {
        updateMouseFromClient(lastClientX, lastClientY);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const isInSection =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (isInSection) {
        ripplesRef.current.push({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          radius: 0,
          alpha: 1,
        });
      }
    };

    // Pause rendering when canvas is completely scrolled off-screen (for maximum performance)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const wasVisible = isVisibleRef.current;
          isVisibleRef.current = entry.isIntersecting;
          if (!wasVisible && entry.isIntersecting) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(render);
          }
        });
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    window.addEventListener("mousemove", handleWindowMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("click", handleClick);

    // Render loop
    const render = () => {
      if (!isVisibleRef.current) {
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      const mouse = mouseRef.current;
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.18;
        mouse.y += (mouse.targetY - mouse.y) * 0.18;
      } else {
        mouse.x += (-1000 - mouse.x) * 0.1;
        mouse.y += (-1000 - mouse.y) * 0.1;
      }

      // 1. Base Grid Lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.068)";

      ctx.beginPath();
      for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // 2. Interactive Spotlight Gradient around mouse
      if (mouse.active && mouse.x > -100 && mouse.y > -100) {
        const spotlightRadius = 320;
        const gradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          spotlightRadius
        );
        gradient.addColorStop(0, "rgba(16, 185, 129, 0.14)");
        gradient.addColorStop(0.5, "rgba(16, 185, 129, 0.045)");
        gradient.addColorStop(1, "rgba(16, 185, 129, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(
          Math.max(0, mouse.x - spotlightRadius),
          Math.max(0, mouse.y - spotlightRadius),
          spotlightRadius * 2,
          spotlightRadius * 2
        );

        // 3. Highlighted Grid Intersection Crosshairs (+)
        const startX = Math.max(0, Math.floor((mouse.x - spotlightRadius) / gridSize) * gridSize);
        const endX = Math.min(width, Math.ceil((mouse.x + spotlightRadius) / gridSize) * gridSize);
        const startY = Math.max(0, Math.floor((mouse.y - spotlightRadius) / gridSize) * gridSize);
        const endY = Math.min(height, Math.ceil((mouse.y + spotlightRadius) / gridSize) * gridSize);

        const crosshairSize = 5;
        for (let x = startX; x <= endX; x += gridSize) {
          for (let y = startY; y <= endY; y += gridSize) {
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < spotlightRadius) {
              const intensity = Math.pow(1 - dist / spotlightRadius, 2);

              // Crosshair arms (+)
              ctx.strokeStyle = `rgba(16, 185, 129, ${0.7 * intensity})`;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(x - crosshairSize, y);
              ctx.lineTo(x + crosshairSize, y);
              ctx.moveTo(x, y - crosshairSize);
              ctx.lineTo(x, y + crosshairSize);
              ctx.stroke();

              // Glowing intersection center dot
              ctx.fillStyle = `rgba(16, 185, 129, ${0.9 * intensity})`;
              ctx.beginPath();
              ctx.arc(x, y, 1.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // 4. Subtle Crosshair Laser Guide Lines along Cursor Axis
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(16, 185, 129, 0.22)";
        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        // Horizontal laser guide
        ctx.moveTo(Math.max(0, mouse.x - 220), mouse.y);
        ctx.lineTo(Math.min(width, mouse.x + 220), mouse.y);
        // Vertical laser guide
        ctx.moveTo(mouse.x, Math.max(0, mouse.y - 220));
        ctx.lineTo(mouse.x, Math.min(height, mouse.y + 220));
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash
      }

      // 5. Click Ripples
      if (ripplesRef.current.length > 0) {
        for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
          const ripple = ripplesRef.current[i];
          ripple.radius += 4.5;
          ripple.alpha *= 0.94;

          if (ripple.alpha < 0.02 || ripple.radius > 360) {
            ripplesRef.current.splice(i, 1);
            continue;
          }

          ctx.strokeStyle = `rgba(16, 185, 129, ${ripple.alpha * 0.4})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", handleClick);
    };
  }, [gridSize]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-0 ${className}`}
      aria-hidden="true"
    />
  );
}
