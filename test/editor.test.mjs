import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {fixture} from './fixture.mjs';
import {popupFixture} from './bubble-fixture.mjs';
const window = new Window();
for (const name of ['window', 'document', 'HTMLElement', 'customElements', 'CustomEvent', 'Event']) {
  globalThis[name] = name === 'window' ? window : window[name];
}
class ChildEditor extends HTMLElement {
  set value(value) { this._value = value; queueMicrotask(() => this.dispatchEvent(new CustomEvent('config-changed', {detail:{config:this._value}}))); }
  get value() { return this._value; }
  toggleMode() { this.yaml = !this.yaml; }
}
class Picker extends HTMLElement {}
class YamlEditor extends HTMLElement {}
customElements.define('hui-card-element-editor', ChildEditor);
customElements.define('hui-card-picker', Picker);
customElements.define('ha-yaml-editor', YamlEditor);
let delay;
window.loadCardHelpers = async () => {
  if (delay) await delay;
  return {createCardElement: () => ({constructor: {getConfigElement: async () => document.createElement('div')}})};
};
await import('../.test-build/tabbed-card-editor.js');
const tick = () => new Promise(resolve => setImmediate(resolve));
function create() {
  const editor = document.createElement('tabbed-card-editor');
  editor.hass = {states: {}}; document.body.append(editor); editor.setConfig(fixture);
  return editor;
}
function click(editor, label) {
  const button = [...editor.shadowRoot.querySelectorAll('button')].find(b => b.textContent === label);
  assert.ok(button, label); button.click();
}
const leafPath = ['tabs', 0, 'card', 'cards', 1, 'cards', 0, 'cards', 0];

test('opening, navigating, closing and reopening emits no changes', () => {
  const editor = create(); const events = [];
  editor.addEventListener('config-changed', e => events.push(e.detail));
  editor.setConfig(fixture); click(editor, 'Edit · Rooms'); click(editor, '← Back');
  editor.remove(); document.body.append(editor); editor.setConfig(fixture);
  assert.deepEqual(editor._config, fixture); assert.equal(events.length, 0); editor.remove();
});

test('Bubble popup edits stay inside the tab tree without mounting the global-dialog editor', async () => {
  const initial=popupFixture(),editor=create(),changes=[];
  const path=['tabs',0,'card','cards',2];
  editor.setConfig(initial);editor.addEventListener('config-changed',e=>changes.push(e.detail.config));
  click(editor,'Edit · Rooms');click(editor,'Edit · 3. Example popup');await tick();
  assert.equal(editor._native,undefined,'Never mount the Bubble editor that reopens the HA global dialog');
  assert.equal(changes.length,0);
  const name=editor.shadowRoot.querySelector('[aria-label="Popup name"]');
  name.value='Renamed popup';name.dispatchEvent(new Event('change'));
  editor.setConfig(changes.at(-1));
  click(editor,'Edit · 1. grid');click(editor,'Edit · 1. Example sensor');await tick();
  const native=editor._native;assert.equal(native.value.type,'entity');
  native.dispatchEvent(new CustomEvent('config-changed',{bubbles:true,composed:true,detail:{config:{...native.value,name:'Changed sensor'}}}));
  const saved=changes.at(-1);assert.equal(saved.type,'custom:tabbed-card');assert.equal(saved.tabs.length,2);
  assert.deepEqual(saved.tabs[1],initial.tabs[1]);assert.deepEqual(saved.tabs[0].card.cards[0],initial.tabs[0].card.cards[0]);
  const popup=saved.tabs[0].card.cards[2];assert.equal(popup.name,'Renamed popup');
  assert.equal(popup.cards[0].cards[0].name,'Changed sensor');assert.deepEqual(popup.future_popup_option,{keep:true});
  assert.equal(popup.hash,'#example-popup');assert.equal(popup.styles,initial.tabs[0].card.cards[2].styles);
  editor.remove();const reopened=create();reopened.setConfig(saved);assert.deepEqual(reopened._config,saved);reopened.remove();
});

test('Bubble popup YAML and card collection operations retain both tabs and extensions', async () => {
  const initial=popupFixture(),editor=create();editor.setConfig(initial);
  editor._navigate(['tabs',0,'card','cards',2],'Popup');
  for (const name of ['1. grid Copy','2. grid Up','2. grid Delete']) {
    const button=editor.shadowRoot.querySelector(`[aria-label="${name}"]`);assert.ok(button,name);button.click();
  }
  assert.equal(editor._config.tabs[0].card.cards[2].cards.length,1);
  click(editor,'Add child card');await tick();
  editor._picker.dispatchEvent(new CustomEvent('config-changed',{detail:{config:{type:'markdown',content:'Added locally'}}}));
  click(editor,'Edit container YAML');await tick();assert.equal(editor._native.tagName,'HA-YAML-EDITOR');
  assert.equal(editor.shadowRoot.querySelector('hui-card-element-editor'),null);
  const popup={...editor._native.defaultValue,show_header:false};
  editor._native.dispatchEvent(new CustomEvent('value-changed',{bubbles:true,composed:true,detail:{value:popup,isValid:true}}));
  click(editor,'Back to container form');assert.equal(editor._native,undefined);
  assert.equal(editor._config.tabs.length,2);assert.deepEqual(editor._config.tabs[1],initial.tabs[1]);
  assert.equal(editor._config.tabs[0].card.cards[2].show_header,false);
  assert.equal(editor._config.tabs[0].card.cards[2].cards[1].content,'Added locally');
  assert.deepEqual(editor._config.tabs[0].card.cards[2].future_popup_option,{keep:true});editor.remove();
});

test('invalid popup YAML stays local without replacing the last valid root configuration', async () => {
  const editor=create(),initial=popupFixture(),changes=[];editor.setConfig(initial);
  editor.addEventListener('config-changed',e=>changes.push(e.detail));
  editor._navigate(['tabs',0,'card','cards',2],'Popup');click(editor,'Edit container YAML');await tick();
  const yaml=editor._native;
  yaml.dispatchEvent(new CustomEvent('value-changed',{detail:{value:null,isValid:false,errorMsg:'Invalid YAML'}}));
  assert.deepEqual(editor._config,initial);assert.equal(changes.length,0);assert.equal(yaml.isValid,false);
  yaml.dispatchEvent(new CustomEvent('value-changed',{detail:{value:yaml.defaultValue,isValid:true}}));
  assert.equal(yaml.isValid,true);assert.deepEqual(changes.at(-1).config,initial);editor.remove();
});

test('Bubble buttons keep their native editor; only popup containers take the safe navigation path', async () => {
  const config=structuredClone(fixture);config.tabs[1].card={type:'custom:bubble-card',card_type:'button',entity:'light.example'};
  const editor=create();editor.setConfig(config);click(editor,'Edit · Other');await tick();
  assert.equal(editor._native.value.card_type,'button');editor.remove();
});

test('native child events emit the full root; YAML toggles and echo preserve the native editor', async () => {
  const editor = create(); const changes = [];
  editor.addEventListener('config-changed', e => changes.push(e.detail.config));
  editor._navigate(leafPath, 'Lamp'); await tick();
  const native = editor.shadowRoot.querySelector('hui-card-element-editor'); assert.ok(native);
  native.dispatchEvent(new CustomEvent('config-changed', {bubbles:true,composed:true,detail:{config:{...native.value,name:'New'}}}));
  assert.equal(changes.length, 1); assert.equal(changes[0].type, 'custom:tabbed-card');
  assert.deepEqual(changes[0].tabs[1], fixture.tabs[1]);
  assert.deepEqual(changes[0].tabs[0].card.cards[0], fixture.tabs[0].card.cards[0]);
  editor.setConfig(changes[0]); assert.equal(editor._native, native);
  click(editor, 'Toggle child form / YAML'); assert.equal(native.yaml, true);
  const reopened = create(); reopened.setConfig(changes[0]); assert.deepEqual(reopened._config, changes[0]);
  editor.remove(); reopened.remove();
});

test('stale asynchronous child creation and old child events cannot write into another card', async () => {
  const editor = create(); const events=[]; editor.addEventListener('config-changed',e=>events.push(e.detail));
  let release; delay = new Promise(resolve => release = resolve);
  editor._navigate(leafPath, 'Lamp'); click(editor, '← Back'); release(); delay = undefined; await tick();
  assert.equal(editor.shadowRoot.querySelector('hui-card-element-editor'), null);
  editor._navigate(leafPath, 'Lamp'); await tick(); const old = editor._native;
  editor._navigate(['tabs',1,'card'], 'Other'); await tick();
  old.dispatchEvent(new CustomEvent('config-changed',{detail:{config:{type:'markdown',content:'stale'}}}));
  assert.equal(events.length,0); assert.deepEqual(editor._config,fixture); editor.remove();
});

test('pickers, tab operations, optional parent fields and invalid numeric input are safe', async () => {
  const editor = create(); let config;
  editor.addEventListener('config-changed', e => config = e.detail.config);
  click(editor, 'Add tab'); assert.equal(config.tabs.length, 3);
  editor.shadowRoot.querySelector('[aria-label="New tab Delete"]').click(); assert.equal(config.tabs.length, 2);
  editor._navigate(['tabs',0,'card'], 'Rooms'); click(editor,'Add child card'); await tick();
  editor._picker.dispatchEvent(new CustomEvent('config-changed',{detail:{config:{type:'markdown',content:'Synthetic'}}}));
  assert.equal(config.tabs[0].card.cards.at(-1).content,'Synthetic');
  assert.deepEqual(config.tabs[1],fixture.tabs[1]);
  editor.setConfig(fixture); editor._path=[]; editor._trail=[]; editor._render();
  const input=editor.shadowRoot.querySelector('input[type=number]'); input.value='-1';
  const previous=structuredClone(editor._config); input.dispatchEvent(new Event('change'));
  assert.deepEqual(editor._config,previous); editor.remove();
});

test('HA initialization, invalid YAML and container YAML round trips preserve the root', async () => {
  const editor=create();const changes=[];editor.addEventListener('config-changed',e=>changes.push(e.detail.config));
  click(editor,'Edit container YAML');await tick();
  assert.equal(editor._native.GUImode,false);assert.equal(changes.length,0);
  editor._native.dispatchEvent(new CustomEvent('config-changed',{detail:{config:{type:'invalid'},error:'Invalid YAML'}}));
  assert.equal(changes.length,0);
  const changed=structuredClone(fixture);changed.styles['--example']='preserved';
  editor._native.dispatchEvent(new CustomEvent('config-changed',{detail:{config:changed}}));
  assert.deepEqual(changes,[changed]);click(editor,'Back to container form');
  assert.deepEqual(editor._config,changed);editor.remove();
});

test('width reset retains newly changed defaults and unknown options', () => {
  const editor=create();const input=editor.shadowRoot.querySelector('input[type=number]');input.value='0';input.dispatchEvent(new Event('change'));
  const select=editor.shadowRoot.querySelector('select');select.value='equal';select.dispatchEvent(new Event('change'));
  select.value='';select.dispatchEvent(new Event('change'));
  assert.equal(editor._config.options.defaultTabIndex,0);
  assert.deepEqual(editor._config.options.futureOption,fixture.options.futureOption);
  assert.equal(editor._config.options.tabWidthMode,undefined);editor.remove();
});
