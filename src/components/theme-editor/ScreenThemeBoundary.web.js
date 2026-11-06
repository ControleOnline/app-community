import React,{useMemo} from 'react';
import {useThemeRuntime} from '../../styles/themeRuntime';
import {screenThemeCss} from '../../styles/screenTheme';
export default function ScreenThemeBoundary({screen,children,style}){
  const runtime=useThemeRuntime();
  const css=useMemo(()=>screenThemeCss(runtime.preview || runtime.raw,runtime.mode,screen?.id),[runtime.preview,runtime.raw,runtime.mode,screen?.id]);
  return <div data-co-theme-screen={screen?.id} data-co-theme-screen-label={screen?.label}
    style={{display:'flex',flexDirection:'column',flex:1,minHeight:0,minWidth:0,...style,...css}}>{children}</div>;
}
