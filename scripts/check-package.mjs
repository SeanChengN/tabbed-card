import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const hacs=JSON.parse(await fs.readFile('hacs.json','utf8'));
assert.equal(typeof hacs.name,'string');
assert.equal(hacs.render_readme,true);
const bundle=await fs.readFile('dist/tabbed-card.js','utf8');
assert.ok(bundle.includes('tabbed-card-editor'));
assert.ok(bundle.includes('tabbed-card'));
assert.ok(bundle.length>1000);
for(const pattern of [/192\.168\.\d+\.\d+/, /10\.\d+\.\d+\.\d+/, /172\.(1[6-9]|2\d|3[01])\.\d+\.\d+/, /eyJhbGciOi/]) {
  assert.ok(!pattern.test(bundle),'Private deployment data must not be in a distributable.');
}
console.log('PASS: HACS metadata, single bundle entry, registered card/editor and private-data scan.');
