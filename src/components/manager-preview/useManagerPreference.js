import {useEffect, useRef, useState} from 'react';
import {Platform} from 'react-native';

function storage() {
  if (Platform.OS === 'web') return globalThis.localStorage;
  const module = require('@react-native-async-storage/async-storage');
  return module.default || module;
}

export default function useManagerPreference(key, {
  defaultValue = false, storedTrue = 'enabled', storedFalse = 'disabled', loadError, saveError,
} = {}) {
  const [state, setState] = useState(null);
  const pending = useRef(new Set());
  const current = useRef(key);
  current.current = key;

  useEffect(() => {
    if (!key) return;
    let active = true;
    Promise.resolve().then(() => storage().getItem(key)).then(
      value => {if (active) setState({key, value: value === storedTrue || (value !== storedFalse && defaultValue)});},
      () => {if (active) setState({key, value: defaultValue, error: loadError});},
    );
    return () => {active = false;};
  }, [key, defaultValue, storedTrue, storedFalse, loadError]);

  const ready = Boolean(key && state?.key === key);
  const setValue = async value => {
    if (!ready || pending.current.has(key)) return false;
    pending.current.add(key);
    try {
      await storage().setItem(key, value ? storedTrue : storedFalse);
      if (current.current !== key) return false;
      setState({key, value});
      return true;
    } catch {
      if (current.current === key) {
        setState({key, value: state.value, error: saveError});
      }
      return false;
    } finally {
      pending.current.delete(key);
    }
  };
  return {key, ready, value: ready ? state.value : defaultValue, error: ready ? state.error : '', setValue};
}
