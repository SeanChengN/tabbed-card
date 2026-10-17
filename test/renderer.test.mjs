import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
const window=new Window();
for(const name of ['window','document','HTMLElement','customElements','Document','ShadowRoot','CSSStyleSheet','Event','CustomEvent','MutationObserver','Node','Element']) {
  globalThis[name]=name==='window'?window:window[name];
}
globalThis.requestAnimationFrame=window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame=window.cancelAnimationFrame.bind(window);
window.loadCardHelpers=async()=>({createCardElement:()=>document.createElement('div')});
await import('../dist/tabbed-card.js');

test('built card content is inert only in editor preview/edit mode and becomes interactive on exit',async()=>{
  const card=document.createElement('tabbed-card');card.hass={states:{}};
  card.setConfig({type:'custom:tabbed-card',tabs:[{attributes:{label:'Example'},card:{type:'markdown',content:'Example'}}]});
  document.body.append(card);
  for(let i=0;i<5;i++){await new Promise(resolve=>setTimeout(resolve,0));await card.updateComplete;}
  const section=()=>card.shadowRoot.querySelector('section');assert.ok(section());
  assert.equal(section().hasAttribute('inert'),false);
  card.preview=true;await card.updateComplete;assert.equal(section().hasAttribute('inert'),true);
  card.preview=false;card.editMode=true;await card.updateComplete;assert.equal(section().hasAttribute('inert'),true);
  card.editMode=false;await card.updateComplete;assert.equal(section().hasAttribute('inert'),false);
  card.remove();window.happyDOM.abort();
});
