/* global beforeEach, afterEach, it, expect */
import {isConfiguredWebThemeColor, invalidateWebThemeColors} from '../../styles/webThemeColorCache';
let pending = [];
let values;
let reads;
beforeEach(() => {
  pending=[];values={'--primary':'#28b34b','--card':'#ffffff'};reads=0;
  global.document={documentElement:{style:{get length(){return Object.keys(values).length;},item:i=>Object.keys(values)[i],getPropertyValue:k=>{reads++;return values[k];},get cssText(){throw Error('Must not serialize the palette per color');}}}};
  global.MutationObserver=class {observe(){} disconnect(){} takeRecords(){const result=pending;pending=[];return result;}};
});
afterEach(()=>{delete global.document;delete global.MutationObserver;});
it('reads the palette once for repeated rendered colors',()=>{
 for(let i=0;i<1000;i++)expect(isConfiguredWebThemeColor('#ffffff')).toBe(true);
 expect(reads).toBe(2);
});
it('honors synchronous theme and company changes',()=>{
 expect(isConfiguredWebThemeColor('#ffffff')).toBe(true);
 values['--card']='#112233';pending.push({type:'attributes'});
 expect(isConfiguredWebThemeColor('#112233')).toBe(true);
 expect(isConfiguredWebThemeColor('#ffffff')).toBe(false);
 values['--card']='#334455';invalidateWebThemeColors();
 expect(isConfiguredWebThemeColor('#334455')).toBe(true);
});
it('does not treat an unmapped color as a theme token',()=>{
 expect(isConfiguredWebThemeColor('#abcdef')).toBe(false);
 expect(isConfiguredWebThemeColor(123)).toBe(false);
});
