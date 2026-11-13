import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import DefaultFile from '@controleonline/ui-default/src/react/components/files/DefaultFile';
import {createStyles, resolveSignInTheme} from '@controleonline/ui-login/src/react/pages/sign-in/index.styles';
import {resolveCompanyGoogleOauthClientId} from '@controleonline/ui-common/src/utils/oauth';
import {resolveCompanyDiscordOauthClientId} from '@controleonline/ui-login/src/react/utils/discordOauth';
import {getRuntimeFooterText, getRuntimeFooterTextLines} from '@controleonline/ui-common/src/react/utils/runtimeFooter';
import {managerPreviewEnabled} from '../manager-preview/model';
import {managerSignInPresentation} from '../manager-preview/managerSignInPresentation';
import {env} from '@env';
import {useThemeRuntime} from '../../styles/themeRuntime';
import {resolveManagerTheme} from '../../styles/managerTheme';
import {resolveLoginFieldColors} from '../../styles/loginFieldColors';
import {loginPreviewMedia, loginPreviewReferences} from './loginPreviewModel';
import {themeEditorText as t} from './themeToolPresentation';

const authText = (key, fallback) => globalThis.t?.t?.('auth', 'label', key) || t(fallback);

// Presentation only: use the actual sign-in styles/files, with no auth, navigation or input handlers.
export default function LoginThemePreview({company, mobile}) {
  const runtime = useThemeRuntime();
  const values = resolveManagerTheme(runtime.preview || runtime.raw, runtime.mode);
  const theme = resolveSignInTheme(loginPreviewReferences(values));
  const styles = createStyles(theme);
  const presentation = managerPreviewEnabled ? managerSignInPresentation : {};
  const footerLines = getRuntimeFooterTextLines(getRuntimeFooterText(company) || env.DOMAIN);
  const footerKey = JSON.stringify(footerLines);
  const [footerIndex, setFooterIndex] = useState(0);
  useEffect(() => {
    setFooterIndex(0);
    if (footerLines.length < 2) return;
    const timer = setInterval(() => setFooterIndex(index => (index + 1) % footerLines.length), 4000);
    return () => clearInterval(timer);
  }, [footerKey]);
  const fields = resolveLoginFieldColors(theme);
  const fieldBindings = [
    ['backgroundColor', fields.backgroundColor], ['color', fields.textColor],
    ['placeholderTextColor', fields.placeholderColor], ['borderColor', theme.inputFilledBorder], ['color', theme.inputIcon],
  ].flatMap(([property,value]) => {
    const token = /var\(--co-theme-([\w-]+)\)/.exec(value || '')?.[1];
    return token ? [{property, token}] : [];
  });
  const logo = loginPreviewMedia(company, 'logo');
  const background = loginPreviewMedia(company, 'background');
  const mediaProps = media => ({coLoginMedia: JSON.stringify({type: media.type, companyId: media.companyId})});
  return <div data-testid="login-theme-preview" role="region" aria-label={t('Prévia do login')}
    style={{position: 'fixed', inset: 0, right: mobile ? 0 : 580, overflow: 'auto', zIndex: 2147482990,
      background: theme.pageBackground}}>
    {/* Hide the operational footer/dock only while this visual preview is mounted. */}
    <style>{'[data-testid="runtime-info-footer"], [data-testid="bottom-navigation"] { visibility: hidden !important; }'}</style>
    <View style={[styles.container, {minHeight: '100%', overflow: 'hidden'}]}>
      {background.file && <View dataSet={mediaProps(background)} style={{position: 'absolute', inset: 0}}>
        <DefaultFile file={background.file} company={company} style={styles.backgroundImage} resizeMode="cover" />
      </View>}
      <View style={styles.backgroundOverlay} pointerEvents="none" />
      <View style={[styles.content, {paddingTop: 32, paddingBottom: mobile ? 240 : 32, justifyContent: 'center'}]}>
        <View style={styles.centerBlock}>
          <View style={styles.header}>
            {logo.file && <View dataSet={mediaProps(logo)} style={[styles.logoContainer, presentation.introMessage === null && {marginBottom: 0}]}>
              <DefaultFile file={logo.file} company={company} style={styles.logo} resizeMode="contain" />
            </View>}
            {presentation.introMessage !== null && <Text style={styles.subtitle}>{authText('Entre com suas credenciais para acessar', 'Entre com suas credenciais para acessar')}</Text>}
          </View>
          <View style={styles.form}>
            {[[presentation.identifierIcon || 'mail', presentation.identifierLabel || authText('Email', 'Email')], ['lock', authText('Senha', 'Senha')]].map(([icon, label]) =>
              <View key={icon} dataSet={{coThemeStates: JSON.stringify({normal: fieldBindings})}}
                style={[styles.inputContainer, {backgroundColor: fields.backgroundColor}]}>
                <Icon name={icon} size={20} color={theme.inputIcon} style={styles.inputIcon} />
                <Text style={[styles.input, {color: fields.placeholderColor}]}>{label}</Text>
                {icon === 'lock' && <Icon name="eye-off" size={20} color={theme.inputIcon} />}
              </View>)}
            <View style={styles.loginButton}><Text style={styles.loginButtonText}>{authText('Entrar', 'Entrar')}</Text></View>
            {(resolveCompanyGoogleOauthClientId(company) || resolveCompanyDiscordOauthClientId(company)) && <>
              <View style={styles.oauthDivider}>
                <View style={styles.oauthDividerLine} /><Text style={styles.oauthDividerText}>{t('ou')}</Text><View style={styles.oauthDividerLine} />
              </View>
              {[[resolveCompanyGoogleOauthClientId(company), 'Entrar com Google', 'G'], [resolveCompanyDiscordOauthClientId(company), 'Entrar com Discord', 'D']]
                .filter(([enabled]) => enabled).map(([,label,badge], index) => <View key={label} style={[styles.googleButton, index > 0 && styles.oauthButtonSpacing]}>
                  <View style={styles.googleButtonBadge}><Text style={styles.googleButtonBadgeText}>{badge}</Text></View>
                  <Text style={styles.googleButtonText}>{t(label)}</Text>
                </View>)}
            </>}
            <View style={styles.createAccountButton}><Text style={styles.createAccountText}>{presentation.createAccountLabel || authText('createAccount', 'Criar conta')}</Text></View>
            <View style={styles.forgotPasswordButton}><Text style={styles.forgotPasswordText}>{authText('forgotPassword', 'Esqueci minha senha')}</Text></View>
          </View>
        </View>
      </View>
      <View testID="login-preview-footer" style={{paddingHorizontal: 12, paddingVertical: 6, backgroundColor: theme.footerBackground, borderTopWidth: 0, borderTopColor: theme.footerBorder}}>
        <Text numberOfLines={1} style={{fontSize: 11, lineHeight: 14, textAlign: 'center', color: theme.footerText}}>{footerLines[footerIndex] || footerLines[0]}</Text>
      </View>
    </View>
  </div>;
}
