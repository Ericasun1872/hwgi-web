/**
 * JPEG/PNG에서 가장자리 검정·짙은 회색 레터박스를 잘라 냅니다.
 * 행/열의 평균 밝기가 낮으면 여백으로 판단합니다.
 */
export async function trimBlackLetterbox(
  src: string,
  options?: {
    threshold?: number;
    maxTrimRatio?: number;
    /** 행/열 평균 밝기가 이 값 이하면 여백 */
    avgThreshold?: number;
  },
): Promise<string> {
  const pixelThreshold = options?.threshold ?? 48;
  const avgThreshold = options?.avgThreshold ?? 42;
  const maxTrimRatio = options?.maxTrimRatio ?? 0.48;

  const dataUrl = src.startsWith("data:")
    ? src
    : `data:image/jpeg;base64,${src}`;

  const img = await loadImage(dataUrl);
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  if (w < 8 || h < 8) return dataUrl;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, w, h).data;
  } catch {
    return dataUrl;
  }

  const rowIsBar = (y: number) => {
    let sum = 0;
    let dark = 0;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const L = luma(data[i], data[i + 1], data[i + 2]);
      sum += L;
      if (L <= pixelThreshold) dark += 1;
    }
    const avg = sum / w;
    return avg <= avgThreshold || dark / w >= 0.85;
  };

  const colIsBar = (x: number) => {
    let sum = 0;
    let dark = 0;
    for (let y = 0; y < h; y++) {
      const i = (y * w + x) * 4;
      const L = luma(data[i], data[i + 1], data[i + 2]);
      sum += L;
      if (L <= pixelThreshold) dark += 1;
    }
    const avg = sum / h;
    return avg <= avgThreshold || dark / h >= 0.85;
  };

  let top = 0;
  while (top < h && rowIsBar(top)) top += 1;
  let bottom = h - 1;
  while (bottom > top && rowIsBar(bottom)) bottom -= 1;
  let left = 0;
  while (left < w && colIsBar(left)) left += 1;
  let right = w - 1;
  while (right > left && colIsBar(right)) right -= 1;

  // 경계에 남아 있는 얇은 검은 줄을 조금 더 안쪽으로
  const pad = Math.max(1, Math.round(Math.min(w, h) * 0.004));
  top = Math.min(h - 2, top + pad);
  bottom = Math.max(top + 1, bottom - pad);
  left = Math.min(w - 2, left + pad);
  right = Math.max(left + 1, right - pad);

  const maxTrimY = Math.floor(h * maxTrimRatio);
  const maxTrimX = Math.floor(w * maxTrimRatio);
  top = Math.min(top, maxTrimY);
  bottom = Math.max(bottom, h - 1 - maxTrimY);
  left = Math.min(left, maxTrimX);
  right = Math.max(right, w - 1 - maxTrimX);

  const cw = right - left + 1;
  const ch = bottom - top + 1;
  if (cw < 8 || ch < 8) return dataUrl;
  if (top === 0 && left === 0 && right === w - 1 && bottom === h - 1) {
    return dataUrl;
  }

  const out = document.createElement("canvas");
  out.width = cw;
  out.height = ch;
  const outCtx = out.getContext("2d");
  if (!outCtx) return dataUrl;
  outCtx.drawImage(canvas, left, top, cw, ch, 0, 0, cw, ch);
  return out.toDataURL("image/jpeg", 0.92);
}

function luma(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}
