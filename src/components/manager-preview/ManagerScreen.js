import React, {useMemo, useState} from 'react';
import {NavigationContext} from '@react-navigation/native';

// Package pages may update native header actions after loading their data.
// Keep their callbacks in the management shell instead of recreating the old strip.
export default function ManagerScreen({navigation, route, options, enabled, Layout, Component}) {
  const [overrides, setOverrides] = useState({});
  const screenNavigation = useMemo(() => !enabled ? navigation : {
    ...navigation,
    setOptions(next) {
      setOverrides(previous => Object.keys(next).every(key => Object.is(previous[key], next[key]))
        ? previous : {...previous, ...next});
      navigation.setOptions({...next, headerShown: false});
    },
  }, [enabled, navigation]);
  const page = useMemo(() => <Component navigation={screenNavigation} route={route} />, [Component, screenNavigation, route]);
  const content = <Layout navigation={screenNavigation} route={route} options={enabled ? {...options, ...overrides} : options}>
    {page}
  </Layout>;
  return enabled ? <NavigationContext.Provider value={screenNavigation}>{content}</NavigationContext.Provider> : content;
}
