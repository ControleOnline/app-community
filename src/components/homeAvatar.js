import React from 'react';
import {Platform} from 'react-native';
import {useStore} from '@store';
import UserAvatar from '@controleonline/ui-common/src/react/components/UserAvatar';
import {env} from '@env';
import homeImageHeaders, {resolveHomeImageUrl} from './homeImageHeaders';
import {resolveApiEntryPoint} from '@controleonline/ui-common/src/utils/apiEntryPoint';

export default function HomeAvatar(props) {
  const authStore = useStore('auth');
  const session = authStore.getters.user;
  const api = resolveApiEntryPoint(env.API_ENTRYPOINT);
  const imageUrl = resolveHomeImageUrl(props.imageUrl, api);
  const imageHeaders = Platform.OS === 'web' ? undefined : homeImageHeaders(imageUrl, {
    api, domain: env.DOMAIN, token: session?.api_key || session?.token,
  });
  return <UserAvatar {...props} imageUrl={imageUrl} useGravatar={false} imageHeaders={imageHeaders} />;
}
