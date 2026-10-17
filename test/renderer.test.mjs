import test, {after} from 'node:test';
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
after(()=>window.happyDOM.abort());

async function mountCard(){
  const card=document.createElement('tabbed-card');card.hass={states:{}};
  card.setConfig({type:'custom:tabbed-card',tabs:[
    {attributes:{label:'Example'},card:{type:'markdown',content:'Example'}},
    {attributes:{label:'Other'},card:{type:'markdown',content:'Other'}},
  ]});
  document.body.append(card);
  for(let i=0;i<5;i++){await new Promise(resolve=>setTimeout(resolve,0));await card.updateComplete;}
  return card;
}

function popupControls(card,cardType='pop-up'){
  const popup=document.createElement('bubble-card');
  popup.config={type:'custom:bubble-card',card_type:cardType,cards:[]};
  const shadow=popup.attachShadow({mode:'open'});
  const edit=document.createElement('button'),add=document.createElement('button'),action=document.createElement('button');
  add.className='bubble-cards-add-button';
  const icon=document.createElement('span');add.append(icon);
  shadow.append(edit,add,action);
  card.shadowRoot.querySelector('article').firstElementChild.append(popup);
  return {popup,edit,add,icon,action};
}

test('preview and dashboard edit mode keep room expansion, controls and tab switching interactive',async()=>{
  const card=await mountCard();
  const button=document.createElement('button');let expanded=false;
  button.onclick=()=>{expanded=!expanded;};
  card.shadowRoot.querySelector('article').firstElementChild.append(button);
  for(const [preview,editMode] of [[false,false],[true,false],[false,true],[true,true]]){
    card.preview=preview;card.editMode=editMode;await card.updateComplete;
    assert.equal(card.shadowRoot.querySelector('section').hasAttribute('inert'),false);
    button.click();assert.equal(expanded,true);button.click();assert.equal(expanded,false);
    const tabs=card.shadowRoot.querySelector('mwc-tab-bar');
    tabs.dispatchEvent(new CustomEvent('MDCTabBar:activated',{detail:{index:1}}));await card.updateComplete;
    assert.equal(tabs.activeIndex,1);
    tabs.dispatchEvent(new CustomEvent('MDCTabBar:activated',{detail:{index:0}}));await card.updateComplete;
    assert.equal(tabs.activeIndex,0);
  }
  card.remove();
});

test('only Bubble popup editor launchers are blocked in previews, before their inner handlers run',async()=>{
  const card=await mountCard();const {popup,edit,add,icon,action}=popupControls(card);
  let opened=0,operated=0,notices=0;
  popup.shadowRoot.addEventListener('ll-edit-card',()=>opened++);
  popup.shadowRoot.addEventListener('ll-create-card',()=>opened++);
  add.onclick=()=>opened++;action.onclick=()=>operated++;
  card.addEventListener('hass-notification',()=>notices++);
  const launch=()=>{
    for(const type of ['ll-edit-card','ll-create-card'])edit.dispatchEvent(new CustomEvent(type,{bubbles:true,composed:true}));
    icon.click();action.click();
  };
  for(const [preview,editMode] of [[true,false],[false,true],[true,true]]){
    card.preview=preview;card.editMode=editMode;await card.updateComplete;launch();
  }
  assert.equal(opened,0);assert.equal(operated,3);assert.equal(notices,9);
  card.preview=false;card.editMode=false;await card.updateComplete;launch();
  assert.equal(opened,3);assert.equal(operated,4);assert.equal(notices,9);
  card.remove();
});

test('non-popup Bubble cards and unrelated card editor events retain their normal behavior',async()=>{
  const card=await mountCard();card.preview=true;await card.updateComplete;
  const {popup,edit,icon}=popupControls(card,'button');let events=0,clicks=0;
  popup.shadowRoot.addEventListener('ll-edit-card',()=>events++);
  popup.shadowRoot.addEventListener('click',()=>clicks++);
  edit.dispatchEvent(new CustomEvent('ll-edit-card',{bubbles:true,composed:true}));icon.click();
  assert.equal(events,1);assert.equal(clicks,1);
  popup.config={type:'custom:example-card',card_type:'pop-up',cards:[]};
  edit.dispatchEvent(new CustomEvent('ll-edit-card',{bubbles:true,composed:true}));icon.click();
  assert.equal(events,2);assert.equal(clicks,2);
  card.remove();
});
