
import * as THREE from 'three';

const textureCache: Record<string, THREE.CanvasTexture> = {};
const MAX_CACHE_SIZE = 50;

const LOGO_PATH_DATA = "M400 0C420.678 0 437.504 16.8256 437.504 37.5039V199.116C437.504 227.542 439.651 242.909 481.911 244.089C486.115 153.416 506.177 56.9141 586.956 56.9141C702.501 56.9147 799.992 363.723 799.992 556.414C800.043 562.452 800.747 705.77 761.503 745.335C754.348 752.541 746.194 756.202 737.26 756.202C713.637 756.202 701.893 747.179 685.631 734.692C665.234 719.044 637.298 697.591 566.43 677.156C446.252 642.507 458.751 530.084 471.986 411.038C475.347 380.782 478.796 349.735 480.229 319.07C446.442 318.034 419.432 309.567 399.98 293.849C380.535 309.566 353.572 318.034 319.787 319.07C321.219 349.736 324.667 380.787 328.038 411.038C341.273 530.084 353.759 642.507 233.594 677.156C162.714 697.591 134.784 719.044 114.381 734.705C98.1184 747.179 86.3741 756.202 62.7518 756.202C53.8111 756.202 45.6579 752.541 38.5028 745.335C-0.748344 705.77 -0.0381168 562.442 0.0066831 556.362C0.0068066 363.716 97.5039 56.9144 213.056 56.9141C293.823 56.9141 313.897 153.416 318.104 244.089C360.349 242.903 362.496 227.536 362.496 199.116V37.5039C362.496 16.8256 379.322 3.31089e-05 400 0Z";
const logoPath = typeof Path2D !== 'undefined' ? new Path2D(LOGO_PATH_DATA) : null;

const disposeOldestTexture = () => {
    const keys = Object.keys(textureCache);
    if (keys.length > MAX_CACHE_SIZE) {
        const oldestKey = keys[0];
        textureCache[oldestKey].dispose();
        delete textureCache[oldestKey];
    }
};

const drawBrandLogo = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
  if (!logoPath) return;
  
  ctx.save();
  ctx.translate(x, y);
  const originalWidth = 800;
  const originalHeight = 757;
  const scale = size / originalHeight;
  ctx.scale(scale, scale);
  ctx.translate(-originalWidth / 2, -originalHeight / 2);
  
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(255,255,255,0.6)';
  ctx.shadowBlur = 8;
  ctx.fill(logoPath);
  
  ctx.restore();
};

const fitText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, initialSize: number) => {
    let size = initialSize;
    ctx.font = `900 ${size}px "Inter"`;
    while (ctx.measureText(text).width > maxWidth && size > 14) {
        size -= 2;
        ctx.font = `900 ${size}px "Inter"`;
    }
    return size;
};

export const createTopTexture = (width: number, depth: number, color: string) => {
  const w = Math.round(width * 2) / 2;
  const d = Math.round(depth * 2) / 2;
  const cacheKey = `top_${color}_${w}_${d}`;
  if (textureCache[cacheKey]) return textureCache[cacheKey];

  const canvas = document.createElement('canvas');
  const size = 256; 
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { alpha: false });

  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);

    // Смягченный центральный градиент
    const grad = ctx.createRadialGradient(size/2, size/2, size * 0.05, size/2, size/2, size * 0.85);
    grad.addColorStop(0, 'rgba(255,255,255,0.15)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.02)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Мягкая внутренняя обводка вместо жесткого контура
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, size - 12, size - 12);

    const drawSize = size * 0.52;
    drawBrandLogo(ctx, size / 2, size / 2, drawSize, '#FFFFFF');
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  
  if ((texture as any).colorSpace !== undefined) {
    (texture as any).colorSpace = 'srgb';
  }
  
  disposeOldestTexture();
  textureCache[cacheKey] = texture;
  return texture;
};

export const createSideTexture = (width: number, height: number, color: string, text: string) => {
  const w = Math.round(width * 2) / 2;
  const cacheKey = `side_${color}_${text}_${w}`;
  
  if (textureCache[cacheKey]) return textureCache[cacheKey];

  const canvas = document.createElement('canvas');
  const texW = 512; 
  const texH = 128; 
  canvas.width = texW;
  canvas.height = texH;
  const ctx = canvas.getContext('2d', { alpha: false });

  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, texW, texH);

    // Очень мягкий вертикальный градиент
    const grad = ctx.createLinearGradient(0, 0, 0, texH);
    grad.addColorStop(0, 'rgba(255,255,255,0.1)');
    grad.addColorStop(0.6, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, texW, texH);

    // Смягченная верхняя фаска
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(0, 0, texW, 3);

    if (w > 0.4) { 
        const russianText = text || "ЛАМБРОТИН";
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const padding = 70;
        const fontSize = fitText(ctx, russianText, texW - padding, 68);
        
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(russianText, texW/2, texH/2 + 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  
  if ((texture as any).colorSpace !== undefined) {
    (texture as any).colorSpace = 'srgb';
  }
  
  disposeOldestTexture();
  textureCache[cacheKey] = texture;
  return texture;
};

export const clearTextureCache = () => {
  Object.values(textureCache).forEach(t => t.dispose());
  for (const key in textureCache) delete textureCache[key];
};
