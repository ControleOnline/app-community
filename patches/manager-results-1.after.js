import React, { useEffect, useMemo, useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DefaultExtraData from '../extra-data/DefaultExtraData';
import DefaultFileColumn from '../files/DefaultFileColumn';
import Icon from 'react-native-vector-icons/Feather';
import {
  buildReadPresentationStyles,
  getColumnKey,
  isColorColumn,
  isDateLikeColumn,
  isEditableColumn,
  isExtraDataColumn,
  isFileColumn,
  isIconColumn,
  isValidFeatherIcon,
  normalizeText,
  resolveCellPresentation,
  resolveCellText,
  resolveEditValue,
} from './defaultInputUtils';
import DefaultColorInput from './DefaultColorInput';
import DefaultDateInput from './DefaultDateInput';
import DefaultFeatherIconPicker, {
  normalizeFeatherIconName,
} from './DefaultFeatherIconPicker';
import DefaultSelect from './DefaultSelect';
import styles from './DefaultInput.styles';

const DefaultInput = ({
  accentColor = '#2563EB',
  autoFocus = true,
  autoSave = true,
  column,
  columns = [],
  containerStyle = null,
  displayValue,
  defaultColor = '',
  editing = false,
  getOptionsForColumn = null,
  inputStyle = null,
  label = '',
  maxLength,
  onSubmitEditing = null,
  numberOfLines = 1,
  onBeforeOpen = null,
  onCancelEditing = null,
  onChangeValue = null,
  onSave = null,
  onSearchChange = null,
  onStartEditing = null,
  readTextStyle = null,
  row = {},
  saving = false,
  showLabel = false,
  storeName = '',
  value,
  variant = 'cell',
}) => {
  const fieldName = getColumnKey(column);
  const isExtraDataField = isExtraDataColumn(column) || ['extradata', 'extra_data'].includes(
    normalizeText(fieldName).replace(/[^a-zA-Z0-9_]/g, '').toLowerCase(),
  );
  const isForm = variant === 'form';
  const canEdit = isEditableColumn(column) && typeof onStartEditing === 'function';
  const editValue = useMemo(
    () => normalizeText(value ?? resolveEditValue(column, row)),
    [column, row, value],
  );
  const [draftValue, setDraftValue] = useState(editValue);
  const resolvedLabel =
    displayValue ?? resolveCellText({ column, columns, row, storeName, value });
  const readPresentation = useMemo(
    () => resolveCellPresentation({ column, columns, row, storeName, value }),
    [column, columns, row, storeName, value],
  );
  const readPresentationStyles = useMemo(
    () => buildReadPresentationStyles({
      ...readPresentation,
      label: resolvedLabel,
    }),
    [readPresentation, resolvedLabel],
  );

  useEffect(() => {
    setDraftValue(editValue);
  }, [editValue, editing]);

  if (column?.list) {
    return (
      <DefaultSelect
        accentColor={accentColor}
        autoSave={autoSave}
        column={column}
        columns={columns}
        containerStyle={containerStyle}
        displayValue={displayValue}
        editing={editing}
        getOptionsForColumn={getOptionsForColumn}
        label={label}
        numberOfLines={numberOfLines}
        onBeforeOpen={onBeforeOpen}
        onCancelEditing={onCancelEditing}
        onChangeValue={onChangeValue}
        onSave={onSave}
        onStartEditing={onStartEditing}
        readTextStyle={readTextStyle}
        row={row}
        saving={saving}
        showLabel={showLabel}
        storeName={storeName}
        value={value}
        variant={variant}
      />
    );
  }

  if (isColorColumn(column)) {
    return (
      <DefaultColorInput
        accentColor={accentColor}
        autoFocus={autoFocus}
        autoSave={autoSave}
        column={column}
        containerStyle={containerStyle}
        defaultColor={defaultColor}
        editing={editing}
        inputStyle={inputStyle}
        label={label}
        onCancelEditing={onCancelEditing}
        onChangeValue={onChangeValue}
        onSave={onSave}
        onStartEditing={onStartEditing}
        row={row}
        saving={saving}
        showLabel={showLabel}
        storeName={storeName}
        value={value}
        variant={variant}
      />
    );
  }

  if (isIconColumn(column)) {
    const fieldNameIcon = getColumnKey(column);
    const rawIconValue = value ?? row?.[fieldNameIcon];
    const selectedIcon = normalizeFeatherIconName(rawIconValue);
    const isFormIcon = variant === 'form';
    const canEditIcon = isEditableColumn(column) && typeof onStartEditing === 'function';

    const commitIcon = nextIcon => {
      const normalized = normalizeFeatherIconName(nextIcon);
      if (autoSave) {
        onSave?.(normalized);
        return;
      }
      onChangeValue?.(normalized);
    };

    if (!editing && !isFormIcon) {
      return (
        <View style={[styles.wrap, containerStyle]}>
          {showLabel ? (
            <Text style={styles.fieldLabel}>{label || column?.label || fieldNameIcon}</Text>
          ) : null}
          <TouchableOpacity
            style={styles.readButton}
            activeOpacity={canEditIcon ? 0.78 : 1}
            disabled={!canEditIcon}
            onPress={() => onStartEditing?.()}
          >
            <View style={styles.readValueWrap}>
              <Icon
                name={selectedIcon || 'search'}
                size={14}
                color={selectedIcon ? '#0F172A' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.readText,
                  !selectedIcon ? styles.mutedText : null,
                  readTextStyle,
                ]}
                numberOfLines={numberOfLines}
              >
                {selectedIcon || '-'}
              </Text>
            </View>
            {saving ? (
              <Text style={[styles.savingText, { color: accentColor }]}>Salvando</Text>
            ) : canEditIcon ? (
              <Icon style={styles.editIcon} name="edit-2" size={13} color="#64748B" />
            ) : null}
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={[styles.wrap, containerStyle]}>
        {showLabel ? (
          <Text style={styles.fieldLabel}>{label || column?.label || fieldNameIcon}</Text>
        ) : null}
        <View style={styles.editingWrap}>
          <View style={styles.editingRow}>
            <DefaultFeatherIconPicker
              value={selectedIcon}
              onChange={commitIcon}
              placeholder={
                global.t?.t(storeName, 'input', column?.label || fieldNameIcon) ||
                'Buscar icone'
              }
              style={[isFormIcon ? styles.formInput : null, inputStyle, { flex: 1 }]}
            />
            {!isFormIcon ? (
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.8}
                onPress={onCancelEditing}
              >
                <Icon name="x" size={14} color="#64748B" />
              </TouchableOpacity>
            ) : null}
          </View>
          {saving ? <Text style={styles.savingText}>Salvando</Text> : null}
        </View>
      </View>
    );
  }

  if (isDateLikeColumn(column)) {
    return (
      <DefaultDateInput
        accentColor={accentColor}
        autoFocus={autoFocus}
        autoSave={autoSave}
        column={column}
        columns={columns}
        containerStyle={containerStyle}
        displayValue={displayValue}
        editing={editing}
        inputStyle={inputStyle}
        label={label}
        numberOfLines={numberOfLines}
        onCancelEditing={onCancelEditing}
        onChangeValue={onChangeValue}
        onSave={onSave}
        onSearchChange={onSearchChange}
        onStartEditing={onStartEditing}
        readTextStyle={readTextStyle}
        row={row}
        saving={saving}
        showLabel={showLabel}
        storeName={storeName}
        value={value}
        variant={variant}
      />
    );
  }

  const saveDraft = () => {
    if (autoSave) {
      onSave?.(draftValue);
      return;
    }

    onChangeValue?.(draftValue);
  };

  const updateDraft = nextValue => {
    setDraftValue(nextValue);
    if (!autoSave) onChangeValue?.(nextValue);
  };

  if (!editing && !isForm) {
    if (isExtraDataField) {
      return (
        <View style={[styles.wrap, containerStyle]}>
          {showLabel ? <Text style={styles.fieldLabel}>{label || column?.label || fieldName}</Text> : null}
          <DefaultExtraData
            column={column}
            row={row}
            value={value ?? row?.[fieldName]}
            variant={variant}
          />
        </View>
      );
    }

    if (isFileColumn(column)) {
      return (
        <View style={[styles.wrap, containerStyle]}>
          {showLabel ? <Text style={styles.fieldLabel}>{label || column?.label || fieldName}</Text> : null}
          <DefaultFileColumn
            column={column}
            row={row}
            value={value}
            variant={variant}
          />
        </View>
      );
    }

    const readIconName = isValidFeatherIcon(readPresentation.icon)
      ? readPresentation.icon
      : '';
    const shouldRenderIconFallbackText = Boolean(
      readPresentationStyles.hasDecoration &&
      !readIconName &&
      readPresentationStyles.color &&
      normalizeText(resolvedLabel) &&
      resolvedLabel !== '-',
    );

    return (
      <View style={[styles.wrap, containerStyle]}>
        {showLabel ? <Text style={styles.fieldLabel}>{label || column?.label || fieldName}</Text> : null}
        <TouchableOpacity
          style={styles.readButton}
          activeOpacity={canEdit ? 0.78 : 1}
          disabled={!canEdit}
          onPress={() => onStartEditing?.()}
        >
          {shouldRenderIconFallbackText ? (
            <Text
              style={[
                styles.readText,
                styles.readTextBadge,
                readPresentationStyles.color ? { color: readPresentationStyles.color } : null,
                readTextStyle,
              ]}
              numberOfLines={numberOfLines}
            >
              {resolvedLabel}
            </Text>
          ) : (
            <View
              style={[
                styles.readValueWrap,
                readPresentationStyles.hasDecoration ? styles.readBadge : null,
                readPresentationStyles.badgeStyle,
              ]}
            >
              {readPresentation.image ? (
                <Image
                  source={readPresentation.image}
                  style={styles.readImage}
                  resizeMode="contain"
                />
              ) : null}
              {readPresentationStyles.hasDecoration && readIconName && readPresentationStyles.color ? (
                <Icon
                  style={styles.readBadgeIcon}
                  name={readIconName}
                  size={12}
                  color={readPresentationStyles.color}
                />
              ) : null}
              <Text
                style={[
                  styles.readText,
                  readPresentationStyles.hasDecoration ? styles.readBadgeText : null,
                  resolvedLabel === '-' ? styles.mutedText : null,
                  readPresentationStyles.color ? { color: readPresentationStyles.color } : null,
                  readTextStyle,
                ]}
                numberOfLines={numberOfLines}
              >
                {column?.prefix || ''}
                {resolvedLabel || '-'}
                {column?.sufix || column?.suffix || ''}
              </Text>
            </View>
          )}
          {saving ? (
            <Text style={[styles.savingText, { color: accentColor }]}>Salvando</Text>
          ) : canEdit ? (
            <Icon style={styles.editIcon} name="edit-2" size={13} color="#64748B" />
          ) : null}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, containerStyle]}>
      {showLabel ? <Text style={styles.fieldLabel}>{label || column?.label || fieldName}</Text> : null}
      <View style={styles.editingWrap}>
        <View style={styles.editingRow}>
          <TextInput
            style={[
              styles.input,
              isForm ? styles.formInput : null,
              inputStyle,
            ]}
            value={draftValue}
            keyboardType={column?.inputType === 'number' || column?.inputType === 'float' ? 'numeric' : 'default'}
            placeholder={global.t?.t(storeName, 'input', column?.label || fieldName)}
            onBlur={autoSave ? saveDraft : undefined}
            onChangeText={updateDraft}
            maxLength={maxLength}
            onSubmitEditing={() => { saveDraft(); onSubmitEditing?.(draftValue); }}
            autoFocus={autoFocus && !isForm}
            selectTextOnFocus
          />
          {!isForm ? (
            <TouchableOpacity style={styles.cancelButton} activeOpacity={0.8} onPress={onCancelEditing}>
              <Icon name="x" size={14} color="#64748B" />
            </TouchableOpacity>
          ) : null}
        </View>
        {saving ? <Text style={styles.savingText}>Salvando</Text> : null}
      </View>
    </View>
  );
};

export default DefaultInput;
