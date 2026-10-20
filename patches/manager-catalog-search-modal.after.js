import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import DefaultSearch from '../filters/DefaultSearch';
import styles from './DefaultTable.styles';
import useDefaultTableTheme from './useDefaultTableTheme';

const DefaultSearchModal = ({
  searchKey = 'search',
  searchPlaceholder = '',
  storeName,
  visible = false,
  onClose,
  onSearch,
  filters,
  onChangeFilters,
  value,
  title,
}) => {
  const { modalColors } = useDefaultTableTheme();
  if (!visible) return null;

  const {
    backgroundColor,
    borderColor,
    closeIconColor,
    headerTextColor,
    overlayColor,
  } = modalColors;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
        style={[styles.modalOverlay, { backgroundColor: overlayColor }]}>
        <View style={[styles.modalCard, styles.searchModalCard, { borderColor, backgroundColor }]}>
          <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
            <Text style={[styles.modalTitle, { color: headerTextColor }]} numberOfLines={1}>
              {title || global.t?.t(storeName, 'label', 'search')}
            </Text>
            <TouchableOpacity
              style={[styles.modalCloseButton, { borderColor, backgroundColor }]}
              activeOpacity={0.82}
              onPress={onClose}
            >
              <Icon name="x" size={16} color={closeIconColor} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchModalBody}>
            <DefaultSearch
              autoFocus
              placeholder={searchPlaceholder}
              searchKey={searchKey}
              storeName={storeName}
              filters={filters}
              onChangeFilters={onChangeFilters}
              value={value}
              onSearch={query => {onSearch?.(query); onClose?.();}}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default DefaultSearchModal;
