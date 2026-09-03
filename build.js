'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const files = ['index.html', 'styles.css', 'math.js', 'progress.js', 'game.js'];
for (const file of files) {
  if (!fs.existsSync(file)) throw new Error('Missing source: ' + file);
  if (file.endsWith('.js')) new vm.Script(fs.readFileSync(file, 'utf8'), { filename: file });
}
for (const file of ['assets/ranch.webp', 'assets/grandma.webp', 'assets/porch.webp']) {
  if (!fs.existsSync(file) || fs.statSync(file).size < 1000) throw new Error('Missing artwork: ' + file);
}
fs.mkdirSync('dist/assets', { recursive: true });
for (const file of files.concat(['assets/ranch.webp', 'assets/grandma.webp', 'assets/porch.webp'])) {
  fs.copyFileSync(file, path.join('dist', file));
}
console.log('Built static game: source parsed, three artwork assets verified, dist ready.');
