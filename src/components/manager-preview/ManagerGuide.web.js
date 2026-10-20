import React, {useCallback, useState} from 'react';
import {AvatarView as ManagerGuideView, GuidePreferences} from '@experimental-avatar';
import JourneyPanel from './JourneyPanel.web';
import {useManagerPreview} from './ManagerPreviewProvider';
import {resolveGuideStep} from './guideModel';

export default function ManagerGuide({navigation, route, items}) {
  const runtime = useManagerPreview();
  const {colors, guideOpen, setGuideOpen, recordGuideEvent, experience, guideInvitation, dismissGuideInvitation, avatarSize, avatarSide} = runtime;
  const [rendererMode, setRendererMode] = useState('loading');
  const onRendererMode = useCallback(mode => setRendererMode(mode), []);
  const step = resolveGuideStep(route.name, items);
  const close = () => {setGuideOpen(false); recordGuideEvent({type: 'dismiss', route: route.name});};
  if (!runtime.avatarEnabled) return null;
  return <ManagerGuideView applicationLabel="On Manager" preferences={<GuidePreferences runtime={runtime} />} avatarSize={avatarSize} avatarSide={avatarSide}
    invitation={guideInvitation} onDismissInvitation={dismissGuideInvitation} open={guideOpen} step={step} colors={colors} onRendererMode={onRendererMode}
    journey={experience && <><small style={{color: colors.textMuted}}>{rendererMode === 'webgpu' ? 'Sheng-Long · 3D WebGPU' : 'Sheng-Long · alternativa vetorial'}</small><JourneyPanel experience={experience} /></>}
    onOpen={() => {setGuideOpen(true); recordGuideEvent({type: 'open', route: route.name});}}
    onClose={close} onFollow={() => {
      if (!step.destination) return;
      setGuideOpen(false);
      recordGuideEvent({type: 'navigate', route: route.name, target: step.destination.name});
      experience?.begin(step.destination.name, 'guide');
      navigation.navigate(step.destination.name, step.destination.params);
    }} />;
}
