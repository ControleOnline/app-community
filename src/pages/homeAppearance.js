export const homepageAppearanceForApp = appType =>
  ['ADMIN', 'MANAGER'].includes(appType) ? 'soft' : undefined;

export const usesSoftHomepage = (routeName, appType, appearance) =>
  routeName === 'HomePage' && homepageAppearanceForApp(appType) === 'soft' && appearance === 'soft';
