export function debounce(func, delay = 200) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

export function getContrast(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return 1;
  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

export function hexToRgba(hex, alpha = 1) {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(0,0,0,${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function getLuminance(rgb) {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function darkenColor(hex, percent) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  let R = rgb.r,
    G = rgb.g,
    B = rgb.b;
  R = Math.floor((R * (100 - percent)) / 100);
  G = Math.floor((G * (100 - percent)) / 100);
  B = Math.floor((B * (100 - percent)) / 100);
  R = R < 0 ? 0 : R;
  G = G < 0 ? 0 : G;
  B = B < 0 ? 0 : B;
  const toHex = (c) => ('0' + c.toString(16)).slice(-2);
  return `#${toHex(R)}${toHex(G)}${toHex(B)}`;
}

export function colorToRgb(color) {
  if (color.startsWith('rgb')) {
    const parts = color.match(/\d+/g).map(Number);
    return { r: parts[0], g: parts[1], b: parts[2] };
  } else if (color.startsWith('#')) {
    return hexToRgb(color);
  }
  return { r: 255, g: 255, b: 255 };
}

export function rgbToHex(r, g, b) {
  const toHex = (c) => ('0' + c.toString(16)).slice(-2);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
