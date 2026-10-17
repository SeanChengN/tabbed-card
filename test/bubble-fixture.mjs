import {fixture} from './fixture.mjs';
export function popupFixture() {
  const config=structuredClone(fixture);
  config.tabs[0].card.cards.push({
    type:'custom:bubble-card',card_type:'pop-up',hash:'#example-popup',name:'Example popup',
    styles:'.bubble-pop-up { border: none; }',future_popup_option:{keep:true},
    cards:[{type:'grid',columns:2,cards:[{type:'entity',entity:'sensor.example',name:'Example sensor'}]}],
  });
  return config;
}
