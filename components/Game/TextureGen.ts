
import * as THREE from 'three';

const textureCache: Record<string, THREE.CanvasTexture> = {};

/**
 * Draws a lung logo matching the provided silhouette image
 */
const drawLungsLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
  ctx.save();
  ctx.translate(x, y);
  const scale = size / 100;
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  
  // Trachea (Center stem)
  ctx.beginPath();
  // Main vertical pipe
  ctx.fillRect(-4, -48, 8, 30);
  
  // Branching connections to lobes
  ctx.beginPath();
  ctx.moveTo(-4, -22);
  ctx.quadraticCurveTo(-15, -22, -15, -15);
  ctx.lineTo(-10, -15);
  ctx.quadraticCurveTo(-10, -18, -4, -18);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(4, -22);
  ctx.quadraticCurveTo(15, -22, 15, -15);
  ctx.lineTo(10, -15);
  ctx.quadraticCurveTo(10, -18, 4, -18);
  ctx.fill();
  
  // Left Lung Lobe (Organic drop shape)
  ctx.beginPath();
  ctx.moveTo(-6, -18);
  ctx.bezierCurveTo(-45, -28, -55, 10, -55, 28); // Outer side
  ctx.bezierCurveTo(-55, 52, -35, 58, -12, 50); // Bottom
  ctx.bezierCurveTo(-5, 40, -5, 0, -6, -18);    // Inner side
  ctx.fill();

  // Right Lung Lobe (Mirrored)
  ctx.beginPath();
  ctx.moveTo(6, -18);
  ctx.bezierCurveTo(45, -28, 55, 10, 55, 28);   // Outer side
  ctx.bezierCurveTo(55, 52, 35, 58, 12, 50);   // Bottom
  ctx.bezierCurveTo(5, 40, 5, 0, 6, -18);      // Inner side
  ctx.fill();

  ctx.restore();
};

export const createTopTexture = (width: number, depth: number, color: string) => {
  const cacheKey = `top_${color}_${width.toFixed(1)}_${depth.toFixed(1)}`;
  if (textureCache[cacheKey]) return textureCache[cacheKey];

  const canvas = document.createElement('canvas');
  const size = 256; 
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);

    const grad = ctx.createRadialGradient(size/2, size/2, size * 0.2, size/2, size/2, size * 0.6);
    grad.addColorStop(0, 'rgba(255,255,255,0.1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,size,size);

    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 8;
    ctx.strokeRect(0,0,size,size);

    const drawSize = size * 0.5;
    drawLungsLogo(ctx, size / 2, size / 2, drawSize, 'rgba(255, 255, 255, 0.9)');
  }

  const texture = new THREE.CanvasTexture(canvas);
  if ((texture as any).colorSpace !== undefined) {
    (texture as any).colorSpace = 'srgb';
  } else {
    (texture as any).encoding = 3001; 
  }
  textureCache[cacheKey] = texture;
  return texture;
};

export const createSideTexture = (width: number, height: number, color: string, text: string) => {
  const w = Math.round(width * 10) / 10;
  const h = Math.round(height * 10) / 10;
  const cacheKey = `side_${color}_${text}_${w}_${h}`;
  
  if (textureCache[cacheKey]) return textureCache[cacheKey];

  const canvas = document.createElement('canvas');
  const texW = 256;
  const texH = 128; 
  canvas.width = texW;
  canvas.height = texH;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, texW, texH);

    const grad = ctx.createLinearGradient(0, 0, 0, texH);
    grad.addColorStop(0, 'rgba(255,255,255,0.15)');
    grad.addColorStop(1, 'rgba(0,0,0,0.05)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, texW, texH);

    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, texW, texH);

    if (w > 0.8) { 
        const russianText = "ЛАМБРОТИН";
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 2;
        
        let fontSize = 50; 
        ctx.font = `900 ${fontSize}px "Inter"`;
        
        const padding = 30;
        const maxWidth = texW - padding;
        
        let textMetrics = ctx.measureText(russianText);
        while (textMetrics.width > maxWidth && fontSize > 10) {
            fontSize -= 2;
            ctx.font = `900 ${fontSize}px "Inter"`;
            textMetrics = ctx.measureText(russianText);
        }

        ctx.fillText(russianText, texW/2, texH/2 + (fontSize * 0.1));
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  if ((texture as any).colorSpace !== undefined) {
    (texture as any).colorSpace = 'srgb';
  } else {
    (texture as any).encoding = 3001; 
  }
  textureCache[cacheKey] = texture;
  return texture;
};

export const clearTextureCache = () => {
  Object.values(textureCache).forEach(t => t.dispose());
  for (const key in textureCache) delete textureCache[key];
};
