import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const {version}=JSON.parse(await fs.readFile('package.json','utf8'));
if(execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim()) {
  throw new Error('Commit the reviewed candidate sources before packaging.');
}
const directory=`artifacts/v${version}`;
await fs.mkdir(directory,{recursive:true});
const bundle=await fs.readFile('dist/tabbed-card.js');
await fs.writeFile(`${directory}/tabbed-card.js`,bundle);
await fs.copyFile('LICENSE',`${directory}/LICENSE`);
await fs.copyFile('docs/MAINTENANCE.md',`${directory}/INSTALL.md`);
const sha256=crypto.createHash('sha256').update(bundle).digest('hex');
await fs.writeFile(`${directory}/tabbed-card.js.sha256`,`${sha256}  tabbed-card.js\n`,'utf8');
await fs.writeFile(`${directory}/candidate.json`,JSON.stringify({
  version,sha256,commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  upstreamBaseline:'41ce3d7ee4443b4d1d88d941ebd4cdc66f8375d5',
  acceptance:'pending independent candidate acceptance',productionDeployment:false,
},null,2)+'\n','utf8');
console.log(`Prepared ${directory}; SHA256 ${sha256}. No release was published.`);
