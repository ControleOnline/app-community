import React, {useCallback, useEffect} from 'react';
import {TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useStore} from '@store';
import {app_type} from '@appType';
import {resolveMenuRouteName} from '@controleonline/ui-layout/src/react/utils/menuNavigation';
import {
  buildAddProductsRouteParams,
  buildManagerPdvRouteParams,
  buildOrderDetailsRouteParams,
} from '@controleonline/ui-orders/src/react/utils/orderRoute';

export default function useCheckoutNavigation({
  checkoutOrderId,
  isPdvInteractionMode,
  isSingleItemMode,
  navigation,
}) {
  const {menus = []} = useStore('theme').getters;
  const canViewHistory = menus.some(group => (group.menus || []).some(
    item => resolveMenuRouteName(item.route) === 'OrderHistoryPage',
  ));
  const returnToSingleItemCatalog = useCallback(() => {
    if (!checkoutOrderId) {
      navigation.goBack?.();
      return;
    }

    const catalogRoute = buildAddProductsRouteParams(
      checkoutOrderId,
      buildManagerPdvRouteParams({singleItemMode: true}),
    );

    if (typeof navigation.popTo === 'function') {
      navigation.popTo('PdvPage', catalogRoute);
    } else if (typeof navigation.replace === 'function') {
      navigation.replace('PdvPage', catalogRoute);
    } else {
      navigation.navigate('PdvPage', catalogRoute);
    }
  }, [checkoutOrderId, navigation]);

  useEffect(() => {
    if (!isSingleItemMode) return undefined;

    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          accessibilityLabel="Voltar ao catalogo"
          onPress={returnToSingleItemCatalog}
          style={{paddingHorizontal: 12, paddingVertical: 8}}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      ),
    });

    return () => navigation.setOptions({headerLeft: undefined});
  }, [isSingleItemMode, navigation, returnToSingleItemCatalog]);

  const buildOrderDetailsNavigationParams = useCallback(
    orderItem =>
      buildOrderDetailsRouteParams(
        orderItem,
        isPdvInteractionMode
          ? buildManagerPdvRouteParams({showBottomCart: false})
          : {},
      ),
    [isPdvInteractionMode],
  );

  const resetToSelfServiceCatalog = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{name: 'AddProductScreen'}],
    });
  }, [navigation]);

  const resetToCounterDestination = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'OrderHistoryPage',
          params: {resumeCounterFlow: true},
        },
      ],
    });
  }, [navigation]);

  const resetToOrderHistory = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [app_type === 'POS' && isSingleItemMode && !canViewHistory
        ? {name:'HomePage',params:{singleItemCompleted:true}}
        : {name:'OrderHistoryPage'}],
    });
  }, [navigation, isSingleItemMode, canViewHistory]);

  return {
    buildOrderDetailsNavigationParams,
    resetToCounterDestination,
    resetToOrderHistory,
    resetToSelfServiceCatalog,
    returnToSingleItemCatalog,
  };
}
