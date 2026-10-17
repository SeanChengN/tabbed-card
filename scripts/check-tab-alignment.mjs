// Real Chromium geometry check. HA icons are modeled using its inline host and
// inline-flex SVG host; the production MWC tab and compiled card are unmodified.
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const require=createRequire(process.env.TABBED_BROWSER_PACKAGE || import.meta.url);
const {chromium}=require('playwright');
const base=process.env.TABBED_FIXTURE_URL || 'http://127.0.0.1:5174';
const bundle=process.env.TABBED_ALIGNMENT_BUNDLE || '/dist/tabbed-card.js';
const browser=await chromium.launch({headless:true});
const results=[];
try {
  const page=await browser.newPage();
  await page.route(`${base}/__tab-alignment-fixture`,route=>route.fulfill({contentType:'text/html',body:'<!doctype html>'}));
  await page.goto(`${base}/__tab-alignment-fixture`);
  page.on('pageerror',error=>console.error(error.message));
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>
    body{margin:12px;background:#202130;color:#deddef;font:14px system-ui;--primary-text-color:#deddef;--rgb-primary-text-color:222,221,239}
  </style><script type="module">
    class SvgIcon extends HTMLElement {
      constructor(){super();this.attachShadow({mode:'open'}).innerHTML=
        '<style>:host{display:inline-flex;align-items:center;justify-content:center;position:relative;vertical-align:middle;width:var(--mdc-icon-size,24px);height:var(--mdc-icon-size,24px)}svg{display:block;width:100%;height:100%;fill:currentColor}</style><svg viewBox="0 0 24 24"><path d="M12 3 2 12h3v9h14v-9h3L12 3m0 5 5 5v6H7v-6l5-5Z"/></svg>';
      }
    }
    customElements.define('ha-svg-icon',SvgIcon);
    class Icon extends HTMLElement {
      constructor(){super();this.attachShadow({mode:'open'}).innerHTML='<style>:host{fill:currentColor}</style><ha-svg-icon></ha-svg-icon>';}
    }
    customElements.define('ha-icon',Icon);
    window.loadCardHelpers=async()=>({createCardElement:()=>document.createElement('div')});
    await import('${base}${bundle}');
    const card=document.createElement('tabbed-card');card.hass={states:{}};
    document.body.append(card);window.fixtureCard=card;
  </script>`);
  await page.waitForFunction(()=>window.fixtureCard,{},{timeout:10000});
  for(const width of [360,430,1280]) for(const mode of [undefined,'equal','dynamic']) for(const stacked of [false,true]) {
    await page.setViewportSize({width,height:700});
    await page.evaluate(async({mode,stacked})=>{
      window.fixtureCard.setConfig({type:'custom:tabbed-card',options:mode?{tabWidthMode:mode}:{},tabs:[
        {attributes:{label:'三楼',icon:'mdi:home-floor-3',stacked},card:{type:'markdown'}},
        {attributes:{label:'其他楼层',icon:'mdi:home-floor-1',stacked},card:{type:'markdown'}},
        {attributes:{label:'负载'},card:{type:'markdown'}},
        {attributes:{icon:'mdi:flash'},card:{type:'markdown'}},
      ]});
      for(let i=0;i<5;i++){await new Promise(resolve=>requestAnimationFrame(resolve));await window.fixtureCard.updateComplete;}
    },{mode,stacked});
    const measurements=await page.evaluate(()=>[...window.fixtureCard.shadowRoot.querySelectorAll('mwc-tab')].slice(0,2).map(tab=>{
      const icon=tab.querySelector('ha-icon').shadowRoot.querySelector('ha-svg-icon').getBoundingClientRect();
      const label=tab.shadowRoot.querySelector('.mdc-tab__text-label').getBoundingClientRect();
      return {delta:Math.abs(icon.y+icon.height/2-label.y-label.height/2),xDelta:Math.abs(icon.x+icon.width/2-label.x-label.width/2),width:icon.width,height:icon.height,gap:label.y-icon.bottom};
    }));
    for(const m of measurements){
      assert.equal(m.width,24);assert.equal(m.height,24);
      assert.ok(stacked?m.xDelta<0.5&&m.gap>=0:m.delta<0.5,JSON.stringify({width,mode,stacked,...m}));
    }
    results.push({width,mode:mode||'original',stacked,measurements});
    if(mode==='equal'&&!stacked)await page.screenshot({path:`artifacts/tab-alignment-${width}.png`});
  }
  await fs.writeFile('artifacts/tab-alignment-results.json',JSON.stringify(results,null,2)+'\n','utf8');
  console.log(`PASS: ${results.length} real Chromium width/mode/stacked combinations; 24px icon boxes, centered horizontal labels and stacked icons.`);
} finally {await browser.close();}
