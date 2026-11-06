import React from 'react';
import {View} from 'react-native';
// The visual editor and per-screen CSS scopes are a browser capability.
export default function ScreenThemeBoundary({children,style}){return <View style={[{flex:1,minHeight:0,minWidth:0},style]}>{children}</View>;}
