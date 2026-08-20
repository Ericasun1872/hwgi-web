import sharp from "sharp";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const src = "public/brand-icon-source.png";
// Trim white margins, then pad slightly so the navy circle fills the square.
const trimmed = await sharp(src)
  .trim({ threshold: 12 })
  .png()
  .toBuffer();
const meta = await sharp(trimmed).metadata();
console.log("trimmed", meta.width, meta.height);

async function square(size) {
  return sharp(trimmed)
    .resize(size, size, { fit: "contain", background: { r: 10, g: 42, b: 74, alpha: 1 } })
    .png()
    .toBuffer();
}

const icon512 = await square(512);
const apple180 = await square(180);
fs.writeFileSync("src/app/icon.png", icon512);
fs.writeFileSync("public/icon.png", icon512);
fs.writeFileSync("src/app/apple-icon.png", apple180);
fs.writeFileSync("public/apple-icon.png", apple180);

const p16 = await square(16);
const p32 = await square(32);
const p48 = await square(48);
let toIco;
try { toIco = (await import("to-ico")).default; } catch { toIco = require("to-ico"); }
const ico = await toIco([p16, p32, p48]);
fs.writeFileSync("src/app/favicon.ico", ico);
fs.writeFileSync("public/favicon.ico", ico);
console.log("done", ico.length);
