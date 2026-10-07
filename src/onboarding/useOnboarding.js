import {useCallback, useEffect, useRef, useState} from 'react';
import {contextKey, createDraft, readDraft, writeDraft} from './model';
import {readSetup} from './readSetup';

export function useOnboarding({context, access, storage, fetch}) {
  const key = access === 'denied' ? null : contextKey(context);
  const currentKey = useRef(key);
  currentKey.current = key;
  const request = useRef(0);
  const writes = useRef(Promise.resolve());
  const [local, setLocal] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [busy, setBusy] = useState(null);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    let active = true;
    request.current += 1;
    setSnapshot(null);
    setBusy(null);
    setSaveError(null);
    if (!key) {setLocal(null); return () => {active = false;};}
    const load = access === 'manage'
      ? writes.current.then(() => readDraft(storage, context))
      : Promise.resolve(createDraft());
    load.then(draft => {if (active) setLocal({key, draft, revision: 0});});
    return () => {active = false; request.current += 1;};
  }, [key, access, storage]); // The key contains every persisted context dimension.

  useEffect(() => {
    if (!local || local.key !== key || !local.revision || access !== 'manage') return;
    const captured = local;
    writes.current = writes.current.then(() => writeDraft(storage, context, captured.draft)).then(saved => {
      if (currentKey.current === captured.key) setSaveError(saved ? null : captured.key);
    });
  }, [local, key, access, storage]);

  const update = useCallback(patch => {
    if (!key || access === 'denied') return;
    setLocal(current => {
      if (current?.key !== key) return current;
      const changes = access === 'manage' ? patch : (patch.step !== undefined ? {step: patch.step} : {});
      return {...current, draft: {...current.draft, ...changes}, revision: current.revision + 1};
    });
  }, [key, access]);

  const refresh = useCallback(async () => {
    if (!key || access !== 'manage') return;
    const version = ++request.current;
    setBusy(key);
    const value = await readSetup(fetch, context.companyId);
    if (currentKey.current === key && request.current === version) {
      setSnapshot({key, value});
      setBusy(null);
    }
  }, [key, access, fetch]);

  useEffect(() => () => {currentKey.current = null; request.current += 1;}, []);

  return {
    draft: local?.key === key ? local.draft : createDraft(),
    ready: Boolean(key && local?.key === key),
    runtime: snapshot?.key === key ? snapshot.value : null,
    loading: busy === key && Boolean(key),
    saveFailed: saveError === key && Boolean(key),
    update, refresh,
  };
}
