import React,{memo,useEffect,useRef} from 'react';

// Let the browser own the native popup while it is open. React must not feed
// every preview value back into that popup or move its anchor during a drag.
export default memo(function NativeColorInput({value,onColor,label,disabled=false,touch=false}){
 const input=useRef(null),active=useRef(false),pending=useRef(null),frame=useRef(null),callback=useRef(onColor);
 callback.current=onColor;
 const normalized=/^#[a-f\d]{6}$/i.test(value)?value:'#ffffff';
 const initial=useRef(normalized);
 const cancelFrame=()=>{
  if(frame.current!==null){if(typeof cancelAnimationFrame==='function')cancelAnimationFrame(frame.current);else clearTimeout(frame.current);frame.current=null;}
 };
 const flush=()=>{
  cancelFrame();const next=pending.current;pending.current=null;
  if(next!==null)callback.current(next);
 };
 useEffect(()=>{if(!active.current && input.current)input.current.value=normalized;},[normalized]);
 useEffect(()=>()=>{cancelFrame();pending.current=null;},[]);
 const preview=event=>{
  pending.current=event.currentTarget.value;
  if(frame.current!==null)return;
  const schedule=typeof requestAnimationFrame==='function'?requestAnimationFrame:fn=>setTimeout(fn,16);
  frame.current=schedule(()=>{frame.current=null;const next=pending.current;pending.current=null;if(next!==null)callback.current(next);});
 };
 return <input ref={input} type="color" defaultValue={initial.current} disabled={disabled} aria-label={label} title="Seletor de cor"
  onFocus={()=>{active.current=true;}} onInput={preview} onBlur={()=>{active.current=false;flush();}}
  onKeyDown={event=>{if(event.key==='Escape')event.stopPropagation();}}
  style={{width:touch?44:26,height:touch?44:28,border:0,padding:0,background:'none',cursor:'pointer'}}/>;
});
