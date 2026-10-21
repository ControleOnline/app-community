import React from 'react';
import RuntimeBottomNavigationBar from '@controleonline/ui-common/src/react/components/RuntimeBottomNavigationBar';

// Runtime menus remain authoritative; only discard routes absent from this app.
export default function ManagerBottomNavigation({navigation, route, colors}) {
  return <RuntimeBottomNavigationBar navigation={navigation} colors={colors}
    activeRouteName={route.name} presetKey="managerToolbar" appearance="soft" placement="inline"
    itemFilter={item => navigation.getState().routeNames.includes(item.route)} />;
}
