'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const files = ['index.html', 'styles.css', 'math.js', 'progress.js', 'chapters.js', 'game.js'];
for (const file of files) {
  if (!fs.existsSync(file)) throw new Error('Missing source: ' + file);
  if (file.endsWith('.js')) new vm.Script(fs.readFileSync(file, 'utf8'), { filename: file });
}
const images = [
  'assets/ranch.webp', 'assets/grandma.webp', 'assets/porch.webp',
  'assets/chapter-barn-workshop.webp', 'assets/chapter-creek-crossing.webp',
  'assets/chapter-barn-workshop.png', 'assets/chapter-creek-crossing.png'
];
for (const file of images) {
  if (!fs.existsSync(file) || fs.statSync(file).size < 1000) throw new Error('Missing artwork: ' + file);
}
fs.mkdirSync('dist/assets', { recursive: true });
for (const file of files.concat(images)) {
  fs.copyFileSync(file, path.join('dist', file));
}
console.log('Built static game: source parsed, chapter artwork verified, dist ready.');
