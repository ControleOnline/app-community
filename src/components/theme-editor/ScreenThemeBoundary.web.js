import React,{useMemo} from 'react';
import {useThemeRuntime} from '../../styles/themeRuntime';
import {screenThemePresentation} from '../../styles/screenTheme';
export default function ScreenThemeBoundary({screen,children,style}){
  const runtime=useThemeRuntime();
  const {css, scrollbars}=useMemo(()=>screenThemePresentation(runtime.preview || runtime.raw,runtime.mode,screen?.id),[runtime.preview,runtime.raw,runtime.mode,screen?.id]);
  return <div data-co-scrollbars={scrollbars} data-co-theme-screen={screen?.id} data-co-theme-screen-label={screen?.label}
    style={{display:'flex',flexDirection:'column',flex:1,minHeight:0,minWidth:0,...style,...css}}>{children}</div>;
}
