/**
 * Renders the hero's vector layers (src/art/scene.tsx) to WebP, once.
 *
 *   npm run layers
 *
 * d/ — the full 1600×1000 stage at 1920×1200, for landscape screens.
 * m/ — the centre band (x 480–1120, all 1000 high) at 896×1400, for
 *      phones; it holds everything a portrait crop of the stage can show.
 * Both cuts are framed with `object-cover` + centre, so every layer stays
 * registered with the others at any viewport.
 */
import {build} from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'public', 'layers');

const entry = `
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import * as S from './src/art/scene';
const r = (c, p) => renderToStaticMarkup(createElement(c, p));
export const layers = {sky: r(S.SkyArt), sun: r(S.SunArt), hills: r(S.HillsArt), arch: r(S.ArchArt), ground: r(S.GroundArt)};
export const clusters = {left: r(S.ClusterArt, {seed: 5}), right: r(S.ClusterArt, {seed: 9})};
`;

const result = await build({
  stdin: {contents: entry, resolveDir: root, loader: 'tsx'},
  bundle: true,
  platform: 'node',
  format: 'esm',
  jsx: 'automatic',
  packages: 'external',
  write: false,
  logLevel: 'error',
});
// Written inside the project so the external packages resolve from node_modules.
const tmpDir = path.join(root, 'node_modules', '.cache', 'layers');
fs.mkdirSync(tmpDir, {recursive: true});
const tmp = path.join(tmpDir, 'scene.mjs');
fs.writeFileSync(tmp, result.outputFiles[0].text);
const {layers, clusters} = await import(pathToFileURL(tmp).href);

/** Swap the root <svg> tag for one with an explicit size and viewBox. */
const sized = (svg, viewBox, w, h) => svg.replace(/^<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice">`);

const CUTS = {
  d: {viewBox: '0 0 1600 1000', w: 1920, h: 1200},
  m: {viewBox: '480 0 640 1000', w: 896, h: 1400},
};

for (const [cut, {viewBox, w, h}] of Object.entries(CUTS)) {
  fs.mkdirSync(path.join(out, cut), {recursive: true});
  for (const [name, svg] of Object.entries(layers)) {
    const file = path.join(out, cut, `${name}.webp`);
    // The sky is opaque and smooth; everything else needs crisp alpha edges.
    await sharp(Buffer.from(sized(svg, viewBox, w, h)), {density: 72})
      .webp(name === 'sky' ? {quality: 82} : {quality: 86, alphaQuality: 90})
      .toFile(file);
    console.log(`${cut}/${name}.webp`, Math.round(fs.statSync(file).size / 1024), 'KB');
  }
}

for (const [side, svg] of Object.entries(clusters)) {
  const file = path.join(out, `cluster-${side}.webp`);
  await sharp(Buffer.from(sized(svg, '-20 -20 300 300', 640, 640)), {density: 72})
    .webp({quality: 86, alphaQuality: 90})
    .toFile(file);
  console.log(`cluster-${side}.webp`, Math.round(fs.statSync(file).size / 1024), 'KB');
}
