import React from 'react';
import {View} from 'react-native';
import SignIn from '@controleonline/ui-login/src/react/pages/sign-in';
import {useManagerPreview} from './ManagerPreviewProvider';
import {PublicAvatar, GuidePreferences} from '@experimental-avatar';

export default function ManagerSignIn(props) {
  const runtime = useManagerPreview();
  const {colors, guideInvitation, dismissGuideInvitation, avatarSize, avatarSide} = runtime;
  return <View style={{flex:1}}>
    <SignIn {...props} introMessage="Eu sou" createAccountLabel="Nova conta" identifierLabel="Usuário" identifierRequiredMessage="Usuário é obrigatório" identifierIcon="user" />
    {runtime.avatarEnabled && <PublicAvatar applicationLabel="On Manager" colors={colors} avatarSize={avatarSize} avatarSide={avatarSide}
      invitation={guideInvitation} onDismissInvitation={dismissGuideInvitation} preferences={<GuidePreferences runtime={runtime} />}
      step={{title:'Olá, sou o Sheng-Long',message:'Entre com seu usuário e senha. Se precisar recuperar o acesso, use “Esqueci minha senha” no formulário.',destination:null}} />}
  </View>;
}
