import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  button: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    minWidth: 164,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  resetButton: {
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  resetText: {
    fontSize: 11,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  modalPanel: {
    alignSelf: 'center',
    borderRadius: 18,
    maxHeight: '80%',
    maxWidth: '100%',
    overflow: 'hidden',
    width: 480,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  modalSearch: {
    borderBottomWidth: 1,
    fontSize: 13,
    fontWeight: '700',
    minHeight: 42,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  optionList: {
    paddingVertical: 8,
  },
  optionRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionRowActive: {
  },
  optionText: {
    fontSize: 14,
    fontWeight: '800',
  },
  optionTextActive: {
  },
  optionHint: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});

// Object tokens are supplied by the caller; absent tokens are not substituted.
export function appTypeThemeStyles(colors) {
  if (!colors) return null;
  return {
    label:{color:colors.headerAppTypeLabelText},
    button:{backgroundColor:colors.headerAppTypeBackground,borderColor:colors.headerAppTypeBorder},
    buttonText:{color:colors.headerAppTypeText}, resetText:{color:colors.headerAppTypeResetText},
    modalOverlay:{backgroundColor:colors.modalOverlay},
    modalPanel:{backgroundColor:colors.modalBackground},
    modalHeader:{borderBottomColor:colors.modalBorder},
    modalTitle:{color:colors.modalHeaderText},
    modalSearch:{backgroundColor:colors.inputBackground,borderBottomColor:colors.inputBorder,color:colors.inputText},
    optionRow:{backgroundColor:colors.selectOptionBackground,borderColor:colors.selectOptionBorder},
    optionRowActive:{backgroundColor:colors.selectOptionSelectedBackground},
    optionText:{color:colors.selectText}, optionTextActive:{color:colors.selectOptionSelectedText},
    optionHint:{color:colors.textMuted},
  };
}
