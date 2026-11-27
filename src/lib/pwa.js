/**
 * La pantalla de arranque del iPhone (`apple-touch-startup-image`): lo que iOS muestra
 * mientras abre la app instalada. Sin ella la pantalla queda NEGRA hasta que llega la
 * página (pasaba en clan-mafia, igual que en BetHouse el 2026-11-26). Android arma esa
 * pantalla solo con el ícono y el nombre del manifest, por eso no necesita esto.
 *
 * iOS solo usa la imagen si coincide EXACTO con la pantalla (ancho, alto y densidad), así
 * que va una fila por modelo. Para un iPhone nuevo se agrega su fila: ancho y alto en
 * puntos y su densidad (los de Apple; el PNG es ancho×densidad por alto×densidad).
 */

/** El fondo del sitio: la pantalla de arranque y la barra de la app. */
export const PWA_BACKGROUND = "#090a0f";
export const PWA_GOLD = "#ffc24e";
export const PWA_MUTED = "#8690a6";

export const IOS_SPLASH_SCREENS = [
  { width: 440, height: 956, ratio: 3 }, // 16 Pro Max, 17 Pro Max
  { width: 430, height: 932, ratio: 3 }, // 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus
  { width: 420, height: 912, ratio: 3 }, // Air
  { width: 428, height: 926, ratio: 3 }, // 12 Pro Max, 13 Pro Max, 14 Plus
  { width: 414, height: 896, ratio: 3 }, // XS Max, 11 Pro Max
  { width: 414, height: 896, ratio: 2 }, // XR, 11
  { width: 402, height: 874, ratio: 3 }, // 16 Pro, 17, 17 Pro
  { width: 393, height: 852, ratio: 3 }, // 14 Pro, 15, 15 Pro, 16
  { width: 390, height: 844, ratio: 3 }, // 12, 12 Pro, 13, 13 Pro, 14, 16e
  { width: 375, height: 812, ratio: 3 }, // X, XS, 11 Pro, 12 mini, 13 mini
  { width: 414, height: 736, ratio: 3 }, // 6 Plus, 7 Plus, 8 Plus
  { width: 375, height: 667, ratio: 2 }, // 6, 7, 8, SE 2 y 3
  { width: 320, height: 568, ratio: 2 }, // SE 1
];

/** El nombre de la imagen: su tamaño en píxeles, `1290x2796`. */
export function splashSize(s) {
  return `${s.width * s.ratio}x${s.height * s.ratio}`;
}

export function splashMedia(s) {
  return `screen and (device-width: ${s.width}px) and (device-height: ${s.height}px) and (-webkit-device-pixel-ratio: ${s.ratio}) and (orientation: portrait)`;
}
