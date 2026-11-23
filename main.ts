// WORLD NEWS — Monday, 23 November 2026.
// A 1024x1024 newspaper front page drawn from scratch: own 5x7 bitmap font,
// own rasteriser, own PNG encoder (node:zlib). Node 22 stdlib only.
// Reads nothing from disk. Writes only <MAKEFUN_OUTPUT_DIR>/entry.png.
// Fully deterministic: the same bytes on every run.

import * as fs from "node:fs";
import * as zlib from "node:zlib";

const W = 1024;
const H = 1024;

// ---------------------------------------------------------------- font: 5x7
// Each glyph is 7 rows of 5 bits, written as strings for readability.
const FONT: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  a: ["00000", "00000", "01110", "00001", "01111", "10001", "01111"],
  b: ["10000", "10000", "11110", "10001", "10001", "10001", "11110"],
  c: ["00000", "00000", "01110", "10001", "10000", "10001", "01110"],
  d: ["00001", "00001", "01111", "10001", "10001", "10001", "01111"],
  e: ["00000", "00000", "01110", "10001", "11111", "10000", "01110"],
  f: ["00110", "01001", "01000", "11110", "01000", "01000", "01000"],
  g: ["00000", "01111", "10001", "10001", "01111", "00001", "01110"],
  h: ["10000", "10000", "11110", "10001", "10001", "10001", "10001"],
  i: ["00100", "00000", "01100", "00100", "00100", "00100", "01110"],
  j: ["00010", "00000", "00110", "00010", "00010", "10010", "01100"],
  k: ["10000", "10000", "10010", "10100", "11000", "10100", "10010"],
  l: ["01100", "00100", "00100", "00100", "00100", "00100", "01110"],
  m: ["00000", "00000", "11010", "10101", "10101", "10101", "10101"],
  n: ["00000", "00000", "11110", "10001", "10001", "10001", "10001"],
  o: ["00000", "00000", "01110", "10001", "10001", "10001", "01110"],
  p: ["00000", "11110", "10001", "10001", "11110", "10000", "10000"],
  q: ["00000", "00000", "01111", "10001", "10001", "01111", "00001"],
  r: ["00000", "00000", "10110", "11001", "10000", "10000", "10000"],
  s: ["00000", "00000", "01111", "10000", "01110", "00001", "11110"],
  t: ["01000", "01000", "11100", "01000", "01000", "01001", "00110"],
  u: ["00000", "00000", "10001", "10001", "10001", "10011", "01101"],
  v: ["00000", "00000", "10001", "10001", "10001", "01010", "00100"],
  w: ["00000", "00000", "10001", "10101", "10101", "10101", "01010"],
  x: ["00000", "00000", "10001", "01010", "00100", "01010", "10001"],
  y: ["00000", "00000", "10001", "10001", "01111", "00001", "01110"],
  z: ["00000", "00000", "11111", "00010", "00100", "01000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  ";": ["00000", "01100", "01100", "00000", "01100", "00100", "01000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  "+": ["00000", "00100", "00100", "01110", "00100", "00100", "00000"],
};

const BLANK = ["00000", "00000", "00000", "00000", "00000", "00000", "00000"];

// ---------------------------------------------------------------- canvas
type RGB = [number, number, number];
const PAPER: RGB = [248, 244, 233];
const INK: RGB = [22, 22, 22];
const RED: RGB = [176, 32, 32];
const BLUE: RGB = [28, 78, 138];
const GREEN: RGB = [38, 118, 58];
const GREY: RGB = [112, 112, 108];
const ORANGE: RGB = [214, 96, 24];
const LIGHTBLUE: RGB = [146, 190, 220];
const SAND: RGB = [232, 222, 196];

const px = new Uint8Array(W * H * 3);
for (let i = 0; i < W * H; i++) {
  px[i * 3] = PAPER[0];
  px[i * 3 + 1] = PAPER[1];
  px[i * 3 + 2] = PAPER[2];
}

function setPixel(x: number, y: number, c: RGB): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0];
  px[i + 1] = c[1];
  px[i + 2] = c[2];
}

function fillRect(x: number, y: number, w: number, h: number, c: RGB): void {
  for (let j = y; j < y + h; j++)
    for (let i = x; i < x + w; i++) setPixel(i, j, c);
}

function hline(x0: number, x1: number, y: number, t: number, c: RGB): void {
  fillRect(x0, y, x1 - x0, t, c);
}

function vline(x: number, y0: number, y1: number, t: number, c: RGB): void {
  fillRect(x, y0, t, y1 - y0, c);
}

function drawLine(x0: number, y0: number, x1: number, y1: number, c: RGB): void {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0;
  let y = y0;
  for (;;) {
    setPixel(x, y, c);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

function fillCircle(cx: number, cy: number, r: number, c: RGB): void {
  for (let y = -r; y <= r; y++)
    for (let x = -r; x <= r; x++)
      if (x * x + y * y <= r * r) setPixel(cx + x, cy + y, c);
}

function drawCircle(cx: number, cy: number, r: number, c: RGB): void {
  for (let a = 0; a < 360; a++) {
    const t = (a * Math.PI) / 180;
    setPixel(Math.round(cx + r * Math.cos(t)), Math.round(cy + r * Math.sin(t)), c);
  }
}

// Scanline polygon fill (points: [x, y][]).
function fillPoly(pts: [number, number][], c: RGB): void {
  let minY = H;
  let maxY = 0;
  for (const [, y] of pts) {
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  for (let y = minY; y <= maxY; y++) {
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[(i + 1) % pts.length];
      if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) {
        xs.push(Math.round(x0 + ((y - y0) * (x1 - x0)) / (y1 - y0)));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2)
      for (let x = xs[k]; x <= xs[k + 1]; x++) setPixel(x, y, c);
  }
}

// ---------------------------------------------------------------- text
function drawGlyph(ch: string, x: number, y: number, s: number, c: RGB): void {
  const g = FONT[ch] ?? BLANK;
  for (let r = 0; r < 7; r++)
    for (let col = 0; col < 5; col++)
      if (g[r][col] === "1") fillRect(x + col * s, y + r * s, s, s, c);
}

function textWidth(s: string, scale: number): number {
  if (s.length === 0) return 0;
  return s.length * 6 * scale - scale;
}

function drawText(s: string, x: number, y: number, scale: number, c: RGB): number {
  let cx = x;
  for (const ch of s) {
    drawGlyph(ch, cx, y, scale, c);
    cx += 6 * scale;
  }
  return cx - x;
}

function drawTextCentered(s: string, cx: number, y: number, scale: number, c: RGB): void {
  drawText(s, cx - Math.floor(textWidth(s, scale) / 2), y, scale, c);
}

// Word-wrap to lines that fit maxWidth pixels at the given scale.
function wrapText(s: string, maxWidth: number, scale: number): string[] {
  const words = s.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const trial = cur === "" ? w : cur + " " + w;
    if (textWidth(trial, scale) <= maxWidth) {
      cur = trial;
    } else {
      if (cur !== "") lines.push(cur);
      cur = w;
    }
  }
  if (cur !== "") lines.push(cur);
  return lines;
}

// ---------------------------------------------------------------- PNG encoder
const CRC_TABLE: number[] = (() => {
  const t: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t.push(c >>> 0);
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}

function encodePng(): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter: none
    raw.set(px.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------- illustrations
// Small drawn scenes, one per story. All coordinates are local to a box
// (x, y, w, h) and drawn with plain shapes — no photos, no external art.

// Lead: a warming globe — blue Earth with green land, a red sun behind it,
// and two factory chimneys blowing grey smoke.
function drawLeadArt(x: number, y: number, w: number, h: number): void {
  fillRect(x, y, w, h, SAND);
  // red sun
  fillCircle(x + w - 52, y + 46, 30, RED);
  // smoke puffs
  fillCircle(x + 52, y + 26, 12, GREY);
  fillCircle(x + 74, y + 16, 15, GREY);
  fillCircle(x + 100, y + 26, 11, GREY);
  // chimneys
  fillRect(x + 36, y + 44, 18, h - 44, INK);
  fillRect(x + 62, y + 58, 18, h - 58, INK);
  fillRect(x + 88, y + 70, 18, h - 70, INK);
  // globe
  const cx = x + w - 108;
  const cy = y + h - 78;
  const r = 62;
  fillCircle(cx, cy, r, BLUE);
  fillCircle(cx, cy, r - 4, LIGHTBLUE);
  // land masses (green blobs)
  fillCircle(cx - 22, cy - 18, 16, GREEN);
  fillCircle(cx + 6, cy - 26, 12, GREEN);
  fillCircle(cx + 24, cy + 8, 14, GREEN);
  fillCircle(cx - 8, cy + 24, 11, GREEN);
  drawCircle(cx, cy, r, INK);
  // thermometer rising — removed: it crowded the chimneys
  // ground line
  hline(x, x + w, y + h - 2, 3, INK);
}

// Gulf: a missile streaking over waves.
function drawGulfArt(x: number, y: number, w: number, h: number): void {
  fillRect(x, y, w, h, LIGHTBLUE);
  // sun
  fillCircle(x + w - 22, y + 18, 12, ORANGE);
  // missile body
  fillPoly(
    [
      [x + 14, y + 30],
      [x + 52, y + 18],
      [x + 46, y + 34],
      [x + 20, y + 44],
    ],
    INK,
  );
  // fins
  fillPoly(
    [
      [x + 18, y + 42],
      [x + 30, y + 50],
      [x + 24, y + 38],
    ],
    RED,
  );
  // exhaust
  fillPoly(
    [
      [x + 12, y + 32],
      [x + 2, y + 28],
      [x + 2, y + 42],
    ],
    ORANGE,
  );
  // waves
  for (let i = 0; i < 3; i++) {
    const wy = y + h - 26 + i * 8;
    for (let wx = x + 4; wx < x + w - 4; wx += 16) {
      drawLine(wx, wy, wx + 8, wy - 4, BLUE);
      drawLine(wx + 8, wy - 4, wx + 16, wy, BLUE);
    }
  }
}

// Kyiv: a damaged tower block and a small drone above it.
function drawKyivArt(x: number, y: number, w: number, h: number): void {
  fillRect(x, y, w, h, SAND);
  // tower block, top corner broken off
  fillPoly(
    [
      [x + 18, y + 20],
      [x + 58, y + 20],
      [x + 58, y + 34],
      [x + 46, y + 44],
      [x + 46, y + h - 8],
      [x + 18, y + h - 8],
    ],
    GREY,
  );
  // windows
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 2; c++)
      fillRect(x + 24 + c * 10, y + 52 + r * 12, 6, 7, INK);
  // rubble
  fillPoly(
    [
      [x + 44, y + h - 8],
      [x + 62, y + h - 8],
      [x + 56, y + h - 22],
    ],
    INK,
  );
  // drone: body + 4 rotors
  fillRect(x + w - 34, y + 14, 16, 8, INK);
  drawLine(x + w - 38, y + 10, x + w - 24, y + 10, INK);
  drawLine(x + w - 24, y + 10, x + w - 10, y + 10, INK);
  fillCircle(x + w - 38, y + 10, 3, RED);
  fillCircle(x + w - 10, y + 10, 3, RED);
  // smoke from the break
  fillCircle(x + 54, y + 30, 6, GREY);
  fillCircle(x + 62, y + 22, 8, GREY);
}

// Indonesia: a factory with a flame.
function drawFactoryArt(x: number, y: number, w: number, h: number): void {
  fillRect(x, y, w, h, SAND);
  // flame
  fillPoly(
    [
      [x + 20, y + 34],
      [x + 30, y + 8],
      [x + 38, y + 26],
      [x + 46, y + 12],
      [x + 52, y + 34],
    ],
    ORANGE,
  );
  fillPoly(
    [
      [x + 26, y + 34],
      [x + 34, y + 20],
      [x + 42, y + 34],
    ],
    RED,
  );
  // factory body with sawtooth roof
  fillPoly(
    [
      [x + 10, y + h - 8],
      [x + 10, y + 44],
      [x + 24, y + 34],
      [x + 38, y + 44],
      [x + 52, y + 34],
      [x + 66, y + 44],
      [x + 66, y + h - 8],
    ],
    INK,
  );
  // door + window
  fillRect(x + 30, y + h - 26, 12, 18, PAPER);
  fillRect(x + 50, y + 50, 8, 8, PAPER);
  // chimney
  fillRect(x + 70, y + 22, 10, h - 30, INK);
  fillCircle(x + 75, y + 16, 7, GREY);
}

// Mexico: a sheriff's star badge.
function drawBadgeArt(x: number, y: number, w: number, h: number): void {
  fillRect(x, y, w, h, SAND);
  const cx = x + Math.floor(w / 2);
  const cy = y + Math.floor(h / 2) + 2;
  const R = 34;
  const r = 14;
  const pts: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? R : r;
    pts.push([cx + Math.round(rad * Math.cos(ang)), cy + Math.round(rad * Math.sin(ang))]);
  }
  fillPoly(pts, ORANGE);
  fillCircle(cx, cy, 12, RED);
  drawText("11", cx - 11, cy - 7, 2, PAPER);
}

// Delta: a jet seen from above, nose up.
function drawPlaneArt(x: number, y: number, w: number, h: number): void {
  fillRect(x, y, w, h, LIGHTBLUE);
  // fuselage
  fillPoly(
    [
      [x + 12, y + h - 14],
      [x + 30, y + 12],
      [x + 40, y + 12],
      [x + 58, y + h - 14],
    ],
    INK,
  );
  // wings
  fillPoly(
    [
      [x + 22, y + 44],
      [x + 52, y + 44],
      [x + 62, y + 56],
      [x + 14, y + 56],
    ],
    INK,
  );
  // tail
  fillPoly(
    [
      [x + 14, y + h - 16],
      [x + 30, y + h - 26],
      [x + 40, y + h - 26],
      [x + 56, y + h - 16],
    ],
    RED,
  );
  // dotted flight path
  for (let i = 0; i < 5; i++) fillRect(x + 66 + i * 4, y + 10 + i * 6, 2, 2, BLUE);
}

// ---------------------------------------------------------------- layout
const MARGIN = 32;
const COLW = 464;
const RIGHT_X = 528;

function drawStory(
  x: number,
  y: number,
  kicker: string,
  headline: string,
  body: string,
  art: (x: number, y: number, w: number, h: number) => void,
): void {
  const textW = COLW - 100;
  drawText(kicker, x, y + 2, 2, RED);
  const headLines = wrapText(headline, textW, 3);
  let hy = y + 22;
  for (const ln of headLines) {
    drawText(ln, x, hy, 3, INK);
    hy += 24;
  }
  const bodyLines = wrapText(body, textW, 2);
  let by = y + 74;
  for (const ln of bodyLines) {
    drawText(ln, x, by, 2, INK);
    by += 18;
  }
  art(x + COLW - 92, y + 2, 88, 88);
}

function drawPage(): void {
  // Masthead
  drawTextCentered("WORLD NEWS", 512, 22, 8, INK);
  hline(MARGIN, W - MARGIN, 90, 3, INK);
  drawTextCentered("MONDAY, 23 NOVEMBER 2026", 512, 100, 2, INK);
  hline(MARGIN, W - MARGIN, 122, 3, INK);

  // Lead story: COP31
  drawText("CLIMATE - COP31, TURKIYE", MARGIN, 140, 2, RED);
  drawText("COP31 ENDS WITH NO DEAL", MARGIN, 164, 4, INK);
  drawText("DRAFT OMITS FOSSIL FUELS", MARGIN, 196, 4, INK);
  const lead1 =
    "Negotiators in Turkiye left the COP31 climate summit without an overarching agreement, after the final draft made no mention of fossil fuels, the cause of global warming.";
  const lead2 =
    "Delegates had argued for days over whether the text should name fossil fuels at all.";
  const lead3 = "The talks are set to continue, with countries split over the wording.";
  let ly = 244;
  for (const para of [lead1, lead2, lead3]) {
    for (const ln of wrapText(para, 560, 2)) {
      drawText(ln, MARGIN, ly, 2, INK);
      ly += 19;
    }
    ly += 8;
  }
  drawLeadArt(624, 242, 336, 196);
  hline(MARGIN, W - MARGIN, 452, 3, INK);

  // Stories grid
  drawStory(
    MARGIN,
    466,
    "MIDDLE EAST",
    "MISSILES OVER THE GULF",
    "Iran fired missiles at a US base in Bahrain, and Houthi forces attacked Saudi Arabia, as the Gulf conflict grew.",
    drawGulfArt,
  );
  drawStory(
    RIGHT_X,
    466,
    "UKRAINE",
    "14 MISSING AFTER KYIV DRONE STRIKE",
    "A Russian drone hit a home in the Kyiv region, leaving at least 14 people missing, President Zelenskiy said.",
    drawKyivArt,
  );
  hline(MARGIN, W - MARGIN, 620, 1, GREY);
  vline(512, 466, 936, 1, GREY);
  drawStory(
    MARGIN,
    630,
    "INDONESIA",
    "FACTORY FIRE IN INDONESIA",
    "Bodies were recovered and dozens of workers were missing after a fire swept through a factory in Indonesia.",
    drawFactoryArt,
  );
  drawStory(
    RIGHT_X,
    630,
    "MEXICO",
    "EL CHAPO ISIDRO CAUGHT",
    "Mexican forces captured FBI most-wanted cartel boss El Chapo Isidro after firefights in Sinaloa killed 11.",
    drawBadgeArt,
  );
  hline(MARGIN, W - MARGIN, 784, 1, GREY);
  drawStory(
    MARGIN,
    794,
    "UNITED STATES",
    "DELTA FLIGHTS DELAYED",
    "A computer fault delayed hundreds of Delta flights across the US as the Thanksgiving travel rush began.",
    drawPlaneArt,
  );

  // Also today
  const ax = RIGHT_X;
  const ay = 794;
  drawText("ALSO TODAY", ax, ay + 2, 2, RED);
  const also = [
    "- South Korea's education minister quit over an AI exam-cheating scandal.",
    "- India posted a record 720 for 9 declared in the Wellington Test.",
    "- UN talks on lethal AI weapons will continue.",
  ];
  let ayy = ay + 26;
  for (const item of also) {
    for (const ln of wrapText(item, COLW, 2)) {
      drawText(ln, ax, ayy, 2, INK);
      ayy += 19;
    }
    ayy += 6;
  }

  // Footer
  hline(MARGIN, W - MARGIN, 944, 3, INK);
  drawTextCentered("WORLD NEWS - MONDAY, 23 NOVEMBER 2026", 512, 956, 2, INK);
  drawTextCentered("All stories reported on 23 November 2026.", 512, 978, 2, GREY);
}

// ---------------------------------------------------------------- main
function main(): void {
  drawPage();
  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  fs.mkdirSync(outDir, { recursive: true });
  const png = encodePng();
  const outPath = outDir + "/entry.png";
  fs.writeFileSync(outPath, png);
  console.log("wrote " + outPath + " (" + png.length + " bytes, " + W + "x" + H + ")");
}

main();
