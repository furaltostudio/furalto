import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const svgPath = path.join(root, "public", "favicon.svg");
const svg = fs.readFileSync(svgPath);

const png512 = await sharp(svg).resize(512, 512).png().toBuffer();
const png256 = await sharp(svg).resize(256, 256).png().toBuffer();
const png32 = await sharp(svg).resize(32, 32).png().toBuffer();

fs.writeFileSync(path.join(root, "public", "favicon.png"), png256);
fs.writeFileSync(path.join(root, "src", "app", "icon.png"), png256);
fs.writeFileSync(path.join(root, "src", "app", "apple-icon.png"), png512);

const ico = await pngToIco([png32, png256]);
fs.writeFileSync(path.join(root, "public", "favicon.ico"), ico);
fs.writeFileSync(path.join(root, "src", "app", "favicon.ico"), ico);

console.log("Built Furalto 'F' favicon", {
  png: fs.statSync(path.join(root, "public", "favicon.png")).size,
  ico: fs.statSync(path.join(root, "public", "favicon.ico")).size,
  svg: fs.statSync(svgPath).size,
});
