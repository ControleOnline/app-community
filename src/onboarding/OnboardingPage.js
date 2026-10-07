import React, {useCallback, useEffect, useMemo} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useStore} from '@store';
import {env} from '@env';
import {app_type_base} from '@appType';
import {api} from '@controleonline/ui-common/src/api';
import {resolveThemePalette} from '../styles/branding';
import {onboardingAccess} from './model';
import {useOnboarding} from './useOnboarding';
import OnboardingContent from './OnboardingContent';

const readApi = (endpoint, options) => api.fetch(endpoint, options);

export default function OnboardingPage({navigation}) {
  const {currentCompany} = useStore('people').getters;
  const {user} = useStore('auth').getters;
  const {colors} = useStore('theme').getters;
  const company = currentCompany || {};
  const access = onboardingAccess(company, user);
  const apiUrl = env?.API_ENTRYPOINT || '';
  const domain = env?.DOMAIN || '';
  const userId = user?.id ?? user?.people?.id ?? user?.people ?? user?.username;
  const context = useMemo(() => ({api: apiUrl, domain, appType: app_type_base, companyId: company.id, userId}), [apiUrl, domain, company.id, userId]);
  const controller = useOnboarding({context, access, storage: AsyncStorage, fetch: readApi});
  const palette = useMemo(() => resolveThemePalette(colors || {}), [colors]);
  const refresh = controller.refresh;
  const ready = controller.ready;

  useEffect(() => {
    if (ready && access === 'manage') refresh();
  }, [ready, access, refresh]);
  // Re-read only setup resources when returning from an existing module.
  const onFocus = useCallback(() => {if (ready) refresh();}, [ready, refresh]);
  useEffect(() => navigation?.addListener?.('focus', onFocus), [navigation, onFocus]);

  return React.createElement(OnboardingContent, {access, company, controller, navigation, palette});
}
