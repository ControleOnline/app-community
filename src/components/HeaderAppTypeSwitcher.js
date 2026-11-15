import React, {useMemo, useState} from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {
  app_type,
  app_type_base,
  app_type_options,
  clear_app_type,
  normalize_app_type,
  set_app_type,
} from '@appType';
import baseStyles, {appTypeThemeStyles} from './HeaderAppTypeSwitcher.styles';
import {colors as themeColors} from '../styles/ThemeColors';

// Reuse the shared selector flow with independently inspectable header colors.
const resolveStyles = () => {
  const themed = appTypeThemeStyles(themeColors);
  return themed ? Object.fromEntries(Object.keys(baseStyles).map(key => [key, [baseStyles[key], themed[key]]])) : baseStyles;
};

const reloadApp = () => {
  if (typeof window !== 'undefined' && typeof window.location?.reload === 'function') {
    window.location.reload();
  }
};

function AppTypeOptionsModal({visible, currentAppType, onClose, onSelect, compact}) {
  const styles = resolveStyles();
  const [query, setQuery] = useState('');

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return app_type_options;
    }

    return app_type_options.filter(option =>
      option.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  if (!visible) {
    return null;
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalPanel}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar tipo de app</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Fechar seletor"
              style={styles.closeButton}
              onPress={onClose}
            >
              <Icon name="x" size={18} color={themeColors.selectIcon} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.modalSearch}
            value={query}
            onChangeText={setQuery}
            placeholder="Filtrar"
            placeholderTextColor={themeColors.inputPlaceholderText}
          />
          <ScrollView contentContainerStyle={styles.optionList}>
            {filteredOptions.map(option => {
              const selected = option === currentAppType;

              return (
                <TouchableOpacity
                  key={option}
                  accessibilityRole="button"
                  accessibilityLabel={compact && option === 'ADMIN' && currentAppType !== 'ADMIN' ? 'Voltar para ADMIN' : option}
                  style={[styles.optionRow, selected && styles.optionRowActive]}
                  onPress={() => onSelect(option)}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextActive]}>
                    {compact && option === 'ADMIN' && currentAppType !== 'ADMIN' ? 'Voltar para ADMIN' : option}
                  </Text>
                  {selected && <Text style={styles.optionHint}>Visão atual</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const AppTypeSwitcher = ({compact = false}) => {
  const styles = resolveStyles();
  const buildAppType = normalize_app_type(app_type_base);
  const currentAppType = normalize_app_type(app_type);
  const [selectorOpen, setSelectorOpen] = useState(false);

  if (Platform.OS !== 'web' || buildAppType !== 'ADMIN') {
    return null;
  }

  const handleSelect = appType => {
    const normalizedAppType = normalize_app_type(appType);
    if (!normalizedAppType || normalizedAppType === currentAppType) {
      setSelectorOpen(false);
      return;
    }

    if (normalizedAppType === buildAppType) {
      clear_app_type();
    } else {
      set_app_type(normalizedAppType);
    }

    setSelectorOpen(false);
    reloadApp();
  };

  const handleReset = () => {
    clear_app_type();
    setSelectorOpen(false);
    reloadApp();
  };

  return (
    <>
      <View style={styles.container}>
        {!compact && <Text style={styles.label}>Tipo de app</Text>}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Selecionar tipo de app"
          activeOpacity={0.82}
          style={compact ? [styles.button, {minWidth: 0, width: 104, minHeight: 44, paddingHorizontal: 8, gap: 4}] : styles.button}
          onPress={() => setSelectorOpen(true)}
          >
          <Text numberOfLines={1} style={compact ? [styles.buttonText, {fontSize: 11, flexShrink: 1}] : styles.buttonText}>{currentAppType}</Text>
          <Icon name="chevron-down" size={16} color={themeColors.headerAppTypeIcon} />
        </TouchableOpacity>

        {!compact && currentAppType !== buildAppType && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Voltar para ADMIN"
            activeOpacity={0.82}
            style={styles.resetButton}
            onPress={handleReset}
          >
            <Text style={styles.resetText}>Voltar para ADMIN</Text>
          </TouchableOpacity>
        )}
      </View>

      <AppTypeOptionsModal
        visible={selectorOpen}
        currentAppType={currentAppType}
        compact={compact}
        onClose={() => setSelectorOpen(false)}
        onSelect={handleSelect}
      />
    </>
  );
};

export default AppTypeSwitcher;
