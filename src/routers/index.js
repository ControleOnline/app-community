import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {getStateFromPath as defaultGetStateFromPath} from '@react-navigation/native'

//import CheckoutHomePage from '@controleonline/ui-crm/src/react/pages/home/index'
import CRMHomePage from '@controleonline/ui-crm/src/react/pages/home/index'
import ManagerHomePage from '@controleonline/ui-manager/src/react/pages/home/index'
import POSHomePage from '@controleonline/ui-orders/src/react/pages/home/index'
import PPCHomePage from '@controleonline/ui-ppc/src/react/pages/displays/displayPage'
import ShopHomePage from '@controleonline/ui-shop/src/react/pages/ShopLandingPage'

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
import shopRoutes from '@controleonline/ui-shop/src/react/router/routes'

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
  ...productsRoutes,
  ...shopRoutes
]

const homeByType = {
//  CHECKOUT: CheckoutHomePage,
  CRM: CRMHomePage,
  DELIVERY: POSHomePage,
  MANAGER: ManagerHomePage,
  SHOP: ShopHomePage,
  POS: POSHomePage,
  PPC: PPCHomePage,
}

const normalizedAppType = String(env.APP_TYPE || '').toUpperCase()

if (homeByType[normalizedAppType]) {
  allRoutes.push({
    name: 'HomePage',
    component: homeByType[normalizedAppType],
    options: {
      headerShown: false,
      title: 'Menu',
      showBottomToolBar: true,
      showBottomCart: false,
      showCompanyFilter: true,
    },
  })
}

const routeDefinitions = allRoutes.filter(
  route => route?.name && route?.component,
)

const WrappedComponent = (options, Component) => ({ navigation, route }) => (
  <DefaultLayout navigation={navigation} route={route} options={options}>
    <Component navigation={navigation} route={route} />
  </DefaultLayout>
)

export const linking = (() => {
  const screens = {}
  const seen = new Set()

  for (const route of routeDefinitions) {
    if (!route?.name) continue
    if (seen.has(route.name)) continue

    seen.add(route.name)
    screens[route.name] =
      route.name === 'HomePage'
        ? ''
        : route.path || route.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  }

  return {
    prefixes: ['/', 'http://localhost:19006'],
    config: { screens },
    getStateFromPath(path, options) {
      let normalizedPath = String(path || '').replace(/^\/?shop\/q=/, 'shop/search/')

      const legacyMatch =
        normalizedPath.match(/[?&]f=([^&]+)/i) ||
        normalizedPath.match(/^\/?(?:shop\/)?f=([^/?&]+)/i)

      if (legacyMatch?.[1]) {
        const flag = decodeURIComponent(legacyMatch[1]).toLowerCase()
        const legacyMap = {
          perfil: 'orders/my-profile',
          profile: 'orders/my-profile',
          carrinho: 'cart',
          cart: 'cart',
          pedidos: 'orders/my',
          pedido: 'orders/my',
          checkout: 'shop/checkout',
          pagamento: 'shop/checkout',
          cartoes: 'shop/cards',
          cartões: 'shop/cards',
        }

        if (legacyMap[flag]) {
          normalizedPath = legacyMap[flag]
        }
      }

      return defaultGetStateFromPath(normalizedPath, options)
    },
  }
})()

const getInitialRouteName = () => {
  const routeNames = routeDefinitions.map(route => route?.name).filter(Boolean)

  if (routeNames.includes('HomePage')) return 'HomePage'
  if (routeNames.includes('SignInPage')) return 'SignInPage'
  return routeNames[0]
}

export default function Routes() {
  return (
    <Stack.Navigator detachInactiveScreens initialRouteName={getInitialRouteName()}>
      {routeDefinitions.map((route, index) => (
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
