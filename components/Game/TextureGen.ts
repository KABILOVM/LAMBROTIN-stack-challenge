
import * as THREE from 'three';

const textureCache: Record<string, THREE.CanvasTexture> = {};

// Helper to draw a better lungs icon
const drawLungsLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
  ctx.save();
  ctx.translate(x, y);
  const scale = size / 100;
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  
  // Trachea (Center tube)
  ctx.beginPath();
  ctx.moveTo(-5, -45);
  ctx.lineTo(5, -45);
  ctx.lineTo(5, -20);
  ctx.quadraticCurveTo(5, -15, 10, -15); // Slight curve to right lung
  ctx.lineTo(10, -15);
  ctx.lineTo(10, -15); 
  ctx.lineTo(-10, -15);
  ctx.lineTo(-10, -15);
  ctx.quadraticCurveTo(-5, -15, -5, -20); // Slight curve from left lung
  ctx.lineTo(-5, -45);
  ctx.fill();
  
  // Better Lung Shape - Less "Grain" like
  
  // Left Lung
  ctx.beginPath();
  ctx.moveTo(-8, -20);
  // Top Lobe
  ctx.bezierCurveTo(-25, -35, -45, -25, -45, 5); 
  // Bottom Lobe
  ctx.bezierCurveTo(-45, 40, -25, 50, -10, 45);
  // Inner Mediastinum
  ctx.bezierCurveTo(-5, 30, -5, 0, -8, -20);
  ctx.fill();

  // Right Lung
  ctx.beginPath();
  ctx.moveTo(8, -20);
  // Top Lobe
  ctx.bezierCurveTo(25, -35, 45, -25, 45, 5);
  // Bottom Lobe
  ctx.bezierCurveTo(45, 40, 25, 50, 10, 45);
  // Inner Mediastinum
  ctx.bezierCurveTo(5, 30, 5, 0, 8, -20);
  ctx.fill();

  ctx.restore();
};

export const createTopTexture = (width: number, depth: number, color: string) => {
  const cacheKey = `top_${color}_${width.toFixed(1)}_${depth.toFixed(1)}`;
  if (textureCache[cacheKey]) return textureCache[cacheKey];

  const canvas = document.createElement('canvas');
  // OPTIMIZATION: Reduced from 512 to 256 for better performance on old GPUs
  const size = 256; 
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Background - Match block color exactly or slightly lighter
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);

    // Soft Inner Highlight instead of hard border
    const grad = ctx.createRadialGradient(size/2, size/2, size * 0.2, size/2, size/2, size * 0.6);
    grad.addColorStop(0, 'rgba(255,255,255,0.1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,size,size);

    // Bevel Border
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 8; // Scaled down for 256px
    ctx.strokeRect(0,0,size,size);

    // Draw Logo
    // We scale the logo based on the block's aspect ratio to ensure it fits
    const minDim = Math.min(width, depth);
    const drawSize = size * 0.5; // 50% of texture size
    drawLungsLogo(ctx, size / 2, size / 2, drawSize, 'rgba(255, 255, 255, 0.9)');
  }

  const texture = new THREE.CanvasTexture(canvas);
  textureCache[cacheKey] = texture;
  return texture;
};

export const createSideTexture = (width: number, height: number, color: string, text: string) => {
  // Round to reduce cache thrashing
  const w = Math.round(width * 10) / 10;
  const h = Math.round(height * 10) / 10;
  const cacheKey = `side_${color}_${text}_${w}_${h}`;
  
  if (textureCache[cacheKey]) return textureCache[cacheKey];

  const canvas = document.createElement('canvas');
  // OPTIMIZATION: Reduced texture size
  const texW = 256;
  const texH = 128; 
  canvas.width = texW;
  canvas.height = texH;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, texW, texH);

    // Slight gradient for 3D feel
    const grad = ctx.createLinearGradient(0, 0, 0, texH);
    grad.addColorStop(0, 'rgba(255,255,255,0.15)');
    grad.addColorStop(1, 'rgba(0,0,0,0.05)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, texW, texH);

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, texW, texH);

    // Text "ЛАМБРОТИН"
    // Only draw if the block is wide enough to reasonably fit text
    if (w > 0.8) { 
        const russianText = "ЛАМБРОТИН";
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 2;
        
        // Dynamic font sizing
        // Start large and scale down
        let fontSize = 50; // Scaled for smaller texture
        ctx.font = `900 ${fontSize}px "Inter"`;
        
        const padding = 30;
        const maxWidth = texW - padding;
        
        let textMetrics = ctx.measureText(russianText);
        
        // Scale down if too wide
        while (textMetrics.width > maxWidth && fontSize > 10) {
            fontSize -= 2;
            ctx.font = `900 ${fontSize}px "Inter"`;
            textMetrics = ctx.measureText(russianText);
        }

        ctx.fillText(russianText, texW/2, texH/2 + (fontSize * 0.1)); // slight vertical adjustment
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  // texture.anisotropy = 4; // OPTIMIZATION: Remove anisotropy for performance
  textureCache[cacheKey] = texture;
  return texture;
};

export const clearTextureCache = () => {
  Object.values(textureCache).forEach(t => t.dispose());
  for (const key in textureCache) delete textureCache[key];
};
