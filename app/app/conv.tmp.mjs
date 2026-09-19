import sharp from "sharp";
import { statSync } from "node:fs";
const SRC = "../artifacts/category-backgrounds";
const OUT = "public/images/heroes";
const MAP = { franchise: "fra-v1.webp", fuel: "oil-v1.webp", grocery: "gro-v1.webp" };
const TARGET = 180 * 1024;
for (const [src, out] of Object.entries(MAP)) {
  let q = 82, bytes = Infinity, path = `${OUT}/${out}`;
  // 기존 배경(apt-v2.webp 93KB, 1536×1024)과 같은 규격에 맞춘다. 180KB를 넘으면 품질을 낮춘다.
  while (q >= 55) {
    await sharp(`${SRC}/${src}-v1.png`).webp({ quality: q, effort: 6 }).toFile(path);
    bytes = statSync(path).size;
    if (bytes <= TARGET) break;
    q -= 6;
  }
  const m = await sharp(path).metadata();
  console.log(`${src} → ${out}  q=${q}  ${(bytes/1024).toFixed(0)}KB  ${m.width}x${m.height}`);
}
