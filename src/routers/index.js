import { createNativeStackNavigator } from '@react-navigation/native-stack'

import CRMHomePage from '@controleonline/ui-crm/src/react/pages/home/index'
import ManagerHomePage from '@controleonline/ui-manager/src/react/pages/home/index'
import POSHomePage from '@controleonline/ui-orders/src/react/pages/home/index'
import PPCHomePage from '@controleonline/ui-ppc/src/react/pages/displays/displayPage'
import ShopHomePage from '@controleonline/ui-shop/src/react/pages/home/index'

import DefaultLayout from '@controleonline/ui-layout/src/react/layouts/DefaultLayout'

import commonRoutes from '@controleonline/ui-common/src/react/router/routes'
import contractsRoutes from '@controleonline/ui-contracts/src/react/router/routes'
import crmRoutes from '@controleonline/ui-crm/src/react/router/routes'
import customersRoutes from '@controleonline/ui-customers/src/react/router/routes'
import loginRoutes from '@controleonline/ui-login/src/react/router/routes'
import managerRoutes from '@controleonline/ui-manager/src/react/router/routes'
import ordersRoutes from '@controleonline/ui-orders/src/react/router/routes'
import peopleRoutes from '@controleonline/ui-people/src/react/router/routes'
import productsRoutes from '@controleonline/ui-products/src/react/router/routes'

import { env } from '@env'

const Stack = createNativeStackNavigator()

export const allRoutes = [
  ...commonRoutes,
  ...contractsRoutes,
  ...crmRoutes,
  ...customersRoutes,
  ...loginRoutes,
  ...managerRoutes,
  ...ordersRoutes,
  ...peopleRoutes,
  ...productsRoutes
]

const homeByType = {
  CRM: CRMHomePage,
  MANAGER: ManagerHomePage,
  MENU: ShopHomePage,
  POS: POSHomePage,
  PPC: PPCHomePage,
}

if (homeByType[env.APP_TYPE]) {
  allRoutes.push({
    name: 'HomePage',
    component: homeByType[env.APP_TYPE],
    options: { headerShown: false, title: 'Menu', showToolBar: true, showCompanyFilter: true },
  })
}

const WrappedComponent = (options, Component) => ({ navigation, route }) => (
  <DefaultLayout navigation={navigation} route={route} options={options}>
    <Component navigation={navigation} route={route} />
  </DefaultLayout>
)

export const linking = (() => {
  const screens = {}
  const seen = new Set()

  for (const route of allRoutes) {
    if (!route?.name) continue
    if (seen.has(route.name)) continue

    seen.add(route.name)
    screens[route.name] =
      route.name === 'HomePage'
        ? ''
        : route.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  }

  return {
    prefixes: ['/', 'http://localhost:19006'],
    config: { screens },
  }
})()

export default function Routes() {
  return (
    <Stack.Navigator detachInactiveScreens>
      {allRoutes.map((route, index) => (
        <Stack.Screen
          key={index}
          name={route.name}
          component={WrappedComponent(route.options, route.component)}
          options={route.options}
          initialParams={route.initialParams}
        />
      ))}
    </Stack.Navigator>
  )
}
