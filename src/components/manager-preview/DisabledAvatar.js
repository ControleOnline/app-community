// No imports, effects, timers, storage, renderer or external experiment dependency.
const noop = () => {};
const runtime = Object.freeze({avatarEnabled: false, guideOpen: false, setGuideOpen: noop,
  guideEvents: Object.freeze([]), recordGuideEvent: noop, guideInvitation: false,
  dismissGuideInvitation: noop});
export const useAvatarRuntime = () => runtime;
export const AvatarView = () => null;
export const PublicAvatar = () => null;
export const GuidePreferences = () => null;
