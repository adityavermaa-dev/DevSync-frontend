import React, { useEffect, useRef } from 'react';

export const HeroNetworkAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let width, height, nodeCount;
    const nodes = [];
    let mouse = { x: null, y: null, radius: 150 };
    
    let animationFrameId;
    let formationIntervalId;
    let isFormingTeam = false;
    let teamCenter = { x: 0, y: 0 };

    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      
      if (width > 1024) nodeCount = 200;
      else if (width > 768) nodeCount = 120;
      else nodeCount = 70;

      initNodes();
    };

    window.addEventListener('resize', resize);

    const initNodes = () => {
      nodes.length = 0;
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          baseRadius: Math.random() * 1.5 + 0.5,
          radius: Math.random() * 1.5 + 0.5,
          color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.1})`
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      nodes.forEach(node => {
        // Move
        if (!isFormingTeam) {
            node.x += node.vx;
            node.y += node.vy;
            node.radius = node.baseRadius;
        } else {
            // Move towards team center slowly if close enough
            const dx = teamCenter.x - node.x;
            const dy = teamCenter.y - node.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 250) {
                node.x += dx * 0.015;
                node.y += dy * 0.015;
                node.radius = node.baseRadius * 1.5;
            } else {
                node.x += node.vx;
                node.y += node.vy;
                node.radius = node.baseRadius;
            }
        }

        // Bounce
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Mouse interaction
        if (mouse.x && mouse.y && !isFormingTeam) {
            const dx = mouse.x - node.x;
            const dy = mouse.y - node.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            if (distance < mouse.radius) {
                // Attract slightly
                node.x += dx * 0.02;
                node.y += dy * 0.02;
            }
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx*dx + dy*dy);

          if (distance < 120) {
            ctx.beginPath();
            let alpha = 0.15 - distance / 120 * 0.15;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            
            if (isFormingTeam) {
                const distToCenter = Math.sqrt(Math.pow(nodes[i].x - teamCenter.x, 2) + Math.pow(nodes[i].y - teamCenter.y, 2));
                if (distToCenter < 100) {
                    // Bright connection for team forming
                    ctx.strokeStyle = `rgba(59, 130, 246, ${0.4 - distance / 120 * 0.4})`; // Blue glow
                }
            }
            
            ctx.lineWidth = 0.5;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw Team Formed text
      if (isFormingTeam) {
        ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        
        // simple pulse effect
        const pulse = Math.sin(Date.now() / 200) * 0.1 + 0.9;
        ctx.globalAlpha = pulse;
        
        // draw badge background
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; // Primary color bg
        const textWidth = ctx.measureText('Team Formed').width;
        ctx.roundRect ? ctx.roundRect(teamCenter.x - textWidth/2 - 12, teamCenter.y - 60, textWidth + 24, 28, 14) : ctx.rect(teamCenter.x - textWidth/2 - 12, teamCenter.y - 60, textWidth + 24, 28);
        ctx.fill();
        
        // draw text
        ctx.fillStyle = `rgba(255, 255, 255, 1)`;
        ctx.fillText('Team Formed', teamCenter.x, teamCenter.y - 40);
        ctx.globalAlpha = 1.0;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
        mouse.x = null;
        mouse.y = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    resize();
    draw();

    // Formation logic
    formationIntervalId = setInterval(() => {
        isFormingTeam = true;
        teamCenter = {
            x: width * 0.3 + Math.random() * (width * 0.4),
            y: height * 0.3 + Math.random() * (height * 0.4)
        };
        
        setTimeout(() => {
            isFormingTeam = false;
        }, 3500); // Form for 3.5 seconds, then disperse
    }, 8000); // Every 8 seconds

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
      clearInterval(formationIntervalId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-auto bg-[var(--surface-primary)]"
    />
  );
};
