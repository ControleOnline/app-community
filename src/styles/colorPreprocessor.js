import React from 'react';
import {Platform, StyleSheet, processColor} from 'react-native';
import {colors as runtimeColors} from './colors';

if (!global.__coThemeColorPatched) {
  global.__coThemeColorPatched = true;

  try {
    const cssVarByToken = {
      primary: '--primary',
      secondary: '--secondary',
      background: '--background',
      text: '--text',
      textSecondary: '--text-secondary',
      border: '--border',
      error: '--negative',
      success: '--positive',
      warning: '--warning',
      info: '--info',
    };

    const colorTokenMap = {
      '#28b34b': 'primary',
      '#007bff': 'primary',
      '#007aff': 'primary',
      '#2529a1': 'primary',
      '#6366f1': 'primary',
      '#1b5587': 'primary',
      '#3498db': 'primary',
      '#3b82f6': 'primary',

      '#6c757d': 'textSecondary',
      '#64748b': 'textSecondary',
      '#7f8c8d': 'textSecondary',
      '#94a3b8': 'textSecondary',
      '#95a5a6': 'textSecondary',
      '#666666': 'textSecondary',
      '#666': 'textSecondary',

      '#0f172a': 'text',
      '#212529': 'text',
      '#1a1a1a': 'text',
      '#334155': 'text',
      '#1e293b': 'text',

      '#f8fafc': 'background',
      '#f8f9fa': 'background',
      '#eef2ff': 'background',
      '#e7f3ff': 'background',
      '#f8f9ff': 'background',
      '#d1fae5': 'background',

      '#f1f5f9': 'border',
      '#f1f3f4': 'border',
      '#e9ecef': 'border',
      '#dee2e6': 'border',
      '#e2e8f0': 'border',
      '#cbd5e1': 'border',
      '#bdc3c7': 'border',
      '#cccccc': 'border',
      '#ccc': 'border',

      // consolidado // 05/07/2026
      '#10b981': 'success', // usar essa cor

      // consolidado // 05/07/2026
      '#e67e22': 'warning', // usar essa cor

      // consolidado // 05/07/2026
      '#c10015': 'error', // usar essa cor

    };

    const styleColorProps = [
      'color',
      'backgroundColor',
      'borderColor',
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
      'shadowColor',
      'textDecorationColor',
      'textShadowColor',
      'tintColor',
    ];

    const nativeColorTokenMap = {};
    if (Platform.OS !== 'web' && typeof processColor === 'function') {
      Object.keys(colorTokenMap).forEach(colorKey => {
        try {
          const processed = processColor(colorKey);
          if (typeof processed === 'number') {
            const unsigned = processed >>> 0;
            const signed = unsigned | 0;
            nativeColorTokenMap[unsigned] = colorTokenMap[colorKey];
            nativeColorTokenMap[signed] = colorTokenMap[colorKey];
          }
        } catch (e) {
          // ignore unmapped colors
        }
      });
    }

    const directColorProps = [
      'color',
      'placeholderTextColor',
      'selectionColor',
      'underlineColor',
      'activeUnderlineColor',
      'outlineColor',
      'activeOutlineColor',
      'cursorColor',
      'iconColor',
      'rippleColor',
    ];

    const normalizeColor = value => {
      if (typeof value !== 'string') {
        return null;
      }
      return value.trim().toLowerCase();
    };

    const resolveMappedColor = value => {
      let token = null;

      if (typeof value === 'number' && Platform.OS !== 'web') {
        const unsigned = value >>> 0;
        const signed = unsigned | 0;
        token =
          nativeColorTokenMap[value] ||
          nativeColorTokenMap[unsigned] ||
          nativeColorTokenMap[signed] ||
          null;
      } else {
        const normalized = normalizeColor(value);
        if (!normalized) {
          return value;
        }
        token = colorTokenMap[normalized] || null;
      }

      if (!token) {
        return value;
      }

      const runtimeColor = runtimeColors[token];
      if (!runtimeColor) {
        return value;
      }

      if (Platform.OS === 'web') {
        const cssVar = cssVarByToken[token];
        if (!cssVar) {
          return runtimeColor;
        }
        return `var(${cssVar}, ${runtimeColor})`;
      }

      return runtimeColor;
    };

    const mapStyleObject = styleObject => {
      if (!styleObject || typeof styleObject !== 'object') {
        return styleObject;
      }

      let mapped = styleObject;
      let changed = false;

      styleColorProps.forEach(prop => {
        if (
          typeof styleObject[prop] === 'string' ||
          typeof styleObject[prop] === 'number'
        ) {
          const resolved = resolveMappedColor(styleObject[prop]);
          if (resolved !== styleObject[prop]) {
            if (!changed) {
              mapped = {...styleObject};
              changed = true;
            }
            mapped[prop] = resolved;
          }
        }
      });

      return mapped;
    };

    const mapStyleValue = styleValue => {
      if (styleValue == null) {
        return styleValue;
      }

      if (typeof styleValue === 'function') {
        return state => mapStyleValue(styleValue(state));
      }

      if (Array.isArray(styleValue)) {
        let changed = false;
        const mappedArray = styleValue.map(item => {
          const mapped = mapStyleValue(item);
          if (mapped !== item) {
            changed = true;
          }
          return mapped;
        });
        return changed ? mappedArray : styleValue;
      }

      if (typeof styleValue === 'number') {
        return mapStyleObject(StyleSheet.flatten(styleValue));
      }

      if (typeof styleValue === 'object') {
        return mapStyleObject(styleValue);
      }

      return styleValue;
    };

    const mapPropsColors = props => {
      if (!props || typeof props !== 'object') {
        return props;
      }

      let nextProps = props;
      let changed = false;

      const mappedStyle = mapStyleValue(props.style);
      if (mappedStyle !== props.style) {
        nextProps = nextProps === props ? {...props} : nextProps;
        nextProps.style = mappedStyle;
        changed = true;
      }

      directColorProps.forEach(prop => {
        if (typeof props[prop] === 'string') {
          const mapped = resolveMappedColor(props[prop]);
          if (mapped !== props[prop]) {
            nextProps = nextProps === props ? {...props} : nextProps;
            nextProps[prop] = mapped;
            changed = true;
          }
        }
      });

      return changed ? nextProps : props;
    };

    const originalCreateElement = React.createElement;
    React.createElement = (type, props, ...children) =>
      originalCreateElement(type, mapPropsColors(props), ...children);

    // Automatic JSX runtime on RN can bypass React.createElement.
    // Patch jsx/jsxs so style and prop color remapping also applies there.
    try {
      const jsxRuntime = require('react/jsx-runtime');
      if (jsxRuntime && !global.__coThemeJsxRuntimePatched) {
        global.__coThemeJsxRuntimePatched = true;

        if (typeof jsxRuntime.jsx === 'function') {
          const originalJsx = jsxRuntime.jsx;
          jsxRuntime.jsx = (type, props, key) =>
            originalJsx(type, mapPropsColors(props), key);
        }

        if (typeof jsxRuntime.jsxs === 'function') {
          const originalJsxs = jsxRuntime.jsxs;
          jsxRuntime.jsxs = (type, props, key) =>
            originalJsxs(type, mapPropsColors(props), key);
        }
      }
    } catch (runtimePatchError) {
      console.warn(
        '[ThemeColorPatch] jsx-runtime patch failed:',
        runtimePatchError?.message || runtimePatchError,
      );
    }
  } catch (error) {
    console.warn('[ThemeColorPatch] startup patch failed:', error?.message || error);
  }
}
