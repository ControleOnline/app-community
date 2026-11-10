import React from 'react';
import RuntimeBottomNavigationBar from '@controleonline/ui-common/src/react/components/RuntimeBottomNavigationBar';

// Runtime menus remain authoritative; only discard routes absent from this app.
export default function ManagerBottomNavigation({navigation, route, colors}) {
  const barColors = {
    ...colors,
    navigationBackground: colors.shortcutBarBackground ?? colors.navigationBackground,
    navigationBorder: colors.shortcutBarBorder ?? colors.navigationBorder,
    navigationIcon: colors.shortcutBarIcon ?? colors.navigationIcon,
    navigationText: colors.shortcutBarText ?? colors.navigationText,
    navigationActiveBackground: colors.shortcutBarActiveBackground ?? colors.navigationActiveBackground,
    navigationActiveIcon: colors.shortcutBarActiveIcon ?? colors.navigationActiveIcon,
    navigationActiveText: colors.shortcutBarActiveText ?? colors.navigationActiveText,
    navigationActiveBorder: colors.shortcutBarActiveBorder ?? colors.navigationActiveBorder,
    navigationDisabledBackground: colors.shortcutBarDisabledBackground ?? colors.navigationDisabledBackground,
    navigationDisabledBorder: colors.shortcutBarDisabledBorder ?? colors.navigationDisabledBorder,
    navigationDisabledIcon: colors.shortcutBarDisabledIcon ?? colors.navigationDisabledIcon,
    navigationDisabledText: colors.shortcutBarDisabledText ?? colors.navigationDisabledText,
    navigationShadow: colors.shortcutBarShadow ?? colors.navigationShadow,
  };
  return <RuntimeBottomNavigationBar navigation={navigation} colors={barColors}
    activeRouteName={route.name} presetKey="managerToolbar" appearance="soft" placement="inline"
    itemFilter={item => navigation.getState().routeNames.includes(item.route)} />;
}
