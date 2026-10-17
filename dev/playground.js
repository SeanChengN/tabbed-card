import {fixture} from '../test/fixture.mjs';

class DemoCard extends HTMLElement {
  static async getConfigElement(){return document.createElement('div');}
  constructor(){super();this.attachShadow({mode:'open'});}
  setConfig(config){this.config=config;this.render();}
  render(){
    this.shadowRoot.innerHTML=`<style>:host{display:block}section{padding:12px;border-radius:9px;margin-top:8px;border:1px solid var(--divider-color);background:var(--card-background-color)}h3{font:600 15px system-ui;margin:0 0 8px}p{font:13px system-ui;margin:0;color:var(--secondary-text-color)}.plan{display:grid;grid-template-columns:2fr 1fr;gap:5px;height:100px}.plan span{display:grid;place-items:center;background:#6d5a3f;border:5px solid #303843;border-radius:5px;color:#fff}</style>`;
    const section=document.createElement('section');const heading=document.createElement('h3');
    heading.textContent=this.config.subtitle||this.config.title||this.config.name||this.config.type;section.append(heading);
    if(this.config.type==='picture-elements'){
      const plan=document.createElement('div');plan.className='plan';
      for(const label of ['Synthetic room','Bath']){const area=document.createElement('span');area.textContent=label;plan.append(area);}section.append(plan);
    }
    if(this.config.entity){const text=document.createElement('p');text.textContent=this.config.entity;section.append(text);}
    for(const child of [this.config['title-card'],this.config.card,...(this.config.cards||[])].filter(Boolean)){
      const wrapper=document.createElement('hui-card');wrapper.config=child;const card=document.createElement('demo-card');card.setConfig(child);wrapper.append(card);section.append(wrapper);
    }
    this.shadowRoot.append(section);
  }
}
customElements.define('demo-card',DemoCard);

class StubEditor extends HTMLElement {
  constructor(){super();this.attachShadow({mode:'open'});this.yaml=false;}
  set GUImode(value){this.yaml=!value;}
  set value(value){this.config=structuredClone(value);this.render();queueMicrotask(()=>this.emit());}
  toggleMode(){this.yaml=!this.yaml;this.render();}
  render(){
    this.shadowRoot.innerHTML=`<style>:host{display:grid;gap:10px;padding-top:12px}label{display:grid;gap:6px}input,textarea{font:inherit;padding:9px;border:1px solid var(--divider-color);border-radius:7px;color:var(--primary-text-color);background:var(--secondary-background-color);min-width:0}textarea{height:220px}p{color:var(--secondary-text-color);font-size:12px}</style>`;
    const note=document.createElement('p');note.textContent='Synthetic child editor · real HA supplies the actual form/YAML editor.';this.shadowRoot.append(note);
    if(this.yaml){const label=document.createElement('label');label.textContent='Code (JSON subset of YAML)';const input=document.createElement('textarea');input.setAttribute('aria-label','Child code');input.value=JSON.stringify(this.config,null,2);input.onchange=()=>{try{this.config=JSON.parse(input.value);this.emit();input.setCustomValidity('');}catch{input.setCustomValidity('Invalid JSON');input.reportValidity();}};label.append(input);this.shadowRoot.append(label);return;}
    for(const key of ['name','entity','title','subtitle']){const label=document.createElement('label');label.textContent=key;const input=document.createElement('input');input.setAttribute('aria-label','Child '+key);input.value=this.config[key]||'';input.onchange=()=>{this.config={...this.config,[key]:input.value};this.emit();};label.append(input);this.shadowRoot.append(label);}
  }
  emit(){this.dispatchEvent(new CustomEvent('config-changed',{bubbles:true,composed:true,detail:{config:structuredClone(this.config)}}));}
}
customElements.define('hui-card-element-editor',StubEditor);
class StubPicker extends HTMLElement {
  connectedCallback(){const button=document.createElement('button');button.textContent='Add synthetic entity card';button.onclick=()=>this.dispatchEvent(new CustomEvent('config-changed',{bubbles:true,composed:true,detail:{config:{type:'entity',entity:'sensor.example',name:'Example'}}}));this.replaceChildren(button);}
}
customElements.define('hui-card-picker',StubPicker);
window.loadCardHelpers=async()=>({createCardElement(config){const card=document.createElement('demo-card');card.setConfig(config);return card;}});
await import('../dist/tabbed-card.js');
let current=structuredClone(fixture),saved=structuredClone(fixture);
const hass={states:{'light.example':{state:'off'},'sensor.example':{state:'21'}},localize:key=>key};
const preview=document.createElement('tabbed-card');preview.hass=hass;preview.preview=true;
const normal=document.createElement('tabbed-card');normal.hass=hass;
document.querySelector('#preview').append(preview);document.querySelector('#normal').append(normal);
let editor;
function draw(){preview.setConfig(structuredClone(current));normal.setConfig(structuredClone(current));document.querySelector('#config').textContent=JSON.stringify(current,null,2);}
function open(){editor?.remove();editor=document.createElement('tabbed-card-editor');editor.hass=hass;document.querySelector('#editor').append(editor);editor.setConfig(current);editor.addEventListener('config-changed',event=>{current=structuredClone(event.detail.config);draw();editor.setConfig(current);});draw();}
open();
const status=text=>document.querySelector('#status').textContent=text;
document.querySelector('#save').onclick=()=>{saved=structuredClone(current);status('Draft saved locally · no HA changes');};
document.querySelector('#reopen').onclick=()=>{current=structuredClone(saved);open();status('Saved draft reopened · configuration retained');};
document.querySelector('#theme').onclick=()=>document.body.classList.toggle('light');
document.querySelector('#reset').onclick=()=>{current=structuredClone(fixture);open();status('Fixture reset');};
document.querySelector('#long').onclick=()=>{current={...structuredClone(fixture),tabs:Array.from({length:10},(_,i)=>({attributes:{label:`Example room ${i+1}`},card:{type:'entity',entity:'sensor.example'}}))};open();status('Long tab list loaded');};
