import test from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';
import {fixture} from './fixture.mjs';
import {tabLayout} from '../.test-build/tab-layout.js';
const window = new Window(); globalThis.window=window; globalThis.Event=window.Event;
const {selectForPreview,clearPreview,getSelection,previewMatches,findPreviewTarget}=await import('../.test-build/editor-preview.js');

test('absent or unknown width modes retain original geometry; modes are explicit and immutable',()=>{
  assert.deepEqual(tabLayout(undefined),{}); assert.deepEqual(tabLayout('unknown'),{});
  assert.equal(tabLayout('equal').flex,'1 1 0'); assert.equal(tabLayout('equal').width,'0');
  assert.equal(tabLayout('dynamic').flex,'0 0 auto');
  const style=tabLayout('equal');style.width='200px';assert.equal(tabLayout('equal').width,'0');
});

test('selection remains transient, matches only editor previews and clears on owner disconnect',()=>{
  const owner={}, other={}, path=['tabs',0,'card'];
  assert.equal(previewMatches(undefined,true,false),false);
  selectForPreview(owner,fixture,path);path.push('cards');
  assert.deepEqual(getSelection().path,['tabs',0,'card']);
  assert.equal(previewMatches(fixture,false,false),false);
  assert.equal(previewMatches(fixture,true,false),true);
  assert.equal(previewMatches({...fixture,tabs:[]},true,false),false);
  clearPreview(other);assert.ok(getSelection());clearPreview(owner);assert.equal(getSelection(),undefined);
});

test('outline targets a public hui-card config through shadow roots, with a safe tab fallback',()=>{
  const root=window.document.createElement('div');const shadow=root.attachShadow({mode:'open'});
  const child=window.document.createElement('hui-card'); child.config=fixture.tabs[0].card.cards[0];shadow.append(child);
  assert.equal(findPreviewTarget(root,child.config),child);
  assert.equal(findPreviewTarget(root,{type:'unknown'}),root);
});
