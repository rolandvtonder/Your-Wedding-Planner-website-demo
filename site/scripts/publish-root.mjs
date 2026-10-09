/**
 * Copies the production build to the repository root, so GitHub Pages can
 * serve it straight from the main branch (Settings → Pages → main / root).
 *
 *   npm run publish      (builds for the GitHub Pages sub-folder first)
 *
 * Then commit and push the changed files at the repo root.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(site, '..');
const dist = path.join(site, 'dist');

// Everything a previous publish put at the root — nothing else is touched.
// (The root media/ folder is the owner's raw material — never touched.)
const PUBLISHED = ['index.html', '.nojekyll', 'favicon.svg', 'assets', 'brand', 'layers', 'images'];
for (const name of PUBLISHED) fs.rmSync(path.join(repo, name), {recursive: true, force: true});

fs.cpSync(dist, repo, {recursive: true});
fs.writeFileSync(path.join(repo, '.nojekyll'), '');
console.log('Published', fs.readdirSync(dist).join(', '), '→ repo root');
