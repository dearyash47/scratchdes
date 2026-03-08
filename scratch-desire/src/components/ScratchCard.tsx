import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';

interface ScratchCardProps {
  revealImage: string;
  onComplete?: () => void;
  onProgress?: (percentage: number) => void;
  brushSize?: number;
  threshold?: number;
}

const ScratchCard: React.FC<ScratchCardProps> = ({
  revealImage,
  onComplete,
  onProgress,
  brushSize = 30,
  threshold = 50,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Preload the specific reveal image
  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.src = revealImage;
    img.onload = () => setImageLoaded(true);
  }, [revealImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let hasInitialized = false;

    const initCanvas = (width: number, height: number) => {
      if (hasInitialized) return;
      
      canvas.width = width;
      canvas.height = height;

      // Fill the entire canvas rectangle
      ctx.fillStyle = '#C4B5FD'; // violet-300
      ctx.fillRect(0, 0, width, height);
      
      // Add texture
      ctx.globalAlpha = 0.15;
      for (let i = 0; i < 2000; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#4c1d95';
        ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
      }
      ctx.globalAlpha = 1.0;
      hasInitialized = true;
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          initCanvas(width, height);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: (e as MouseEvent).clientX - rect.left,
      y: (e as MouseEvent).clientY - rect.top,
    };
  };

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Vibration feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();

    checkReveal();
  };

  const checkReveal = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentPixels++;
    }

    const currentPercentage = (transparentPixels / (pixels.length / 4)) * 100;
    setPercentage(currentPercentage);
    if (onProgress) onProgress(currentPercentage);

    if (!isRevealed && currentPercentage > threshold) {
      setIsRevealed(true);
      if (onComplete) onComplete();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7c3aed', '#db2777', '#ffffff']
      });
    }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getPos(e);
    scratch(pos.x, pos.y);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    scratch(pos.x, pos.y);
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl border-4 border-white/20 bg-purple-900/20"
      style={{ touchAction: 'none' }}
    >
      {/* Loading State */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-40 bg-purple-900/40 backdrop-blur-sm">
          <RefreshCw className="w-10 h-10 text-white animate-spin opacity-50" />
        </div>
      )}

      {/* Revealed Content */}
      <div className="absolute inset-0 bg-white flex items-center justify-center">
        <img 
          src={revealImage} 
          alt="Revealed Pose" 
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          referrerPolicy="no-referrer"
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Scratch Layer */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        className={`absolute inset-0 cursor-crosshair transition-opacity duration-1000 ${isRevealed ? 'opacity-0' : 'opacity-100'} ${!imageLoaded ? 'pointer-events-none' : ''}`}
      />
    </div>
  );
};

export default ScratchCard;
