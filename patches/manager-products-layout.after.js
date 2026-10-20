import Formatter from '@controleonline/ui-common/src/utils/formatter.js';
import { getDateRange } from '@controleonline/ui-common/src/react/utils/dateRangeFilter';
import {
  getColumnKey,
  isDateLikeColumn,
  normalizeText,
  resolveCellText,
  resolveStoreNameFromList,
} from '../inputs/defaultInputUtils';
import styles from './DefaultTable.styles';
import {DEFAULT_CELL_MIN_WIDTH, IDENTITY_CELL_MIN_WIDTH, MONEY_CELL_MIN_WIDTH} from './DefaultTable.dataUtils';
export const isSortableColumn = column => column?.sortable === true;

export const getSortField = column => column?.sortField || getColumnKey(column);

export const resolveDefaultSort = columns => {
  if (!Array.isArray(columns)) {
    return null;
  }

  for (const column of columns) {
    if (!column || column?.defaultSort === undefined || column?.defaultSort === null || column?.defaultSort === false) {
      continue;
    }

    const field = getSortField(column);
    const defaultSort = column.defaultSort;

    if (defaultSort && typeof defaultSort === 'object' && !Array.isArray(defaultSort)) {
      const resolvedDirection = normalizeText(defaultSort.direction || defaultSort.order || 'desc').toLowerCase();
      const resolvedField = normalizeText(
        defaultSort.field || defaultSort.sortField || defaultSort.key || defaultSort.name || field,
      );

      return {
        direction: resolvedDirection === 'asc' ? 'asc' : 'desc',
        field: resolvedField || field,
      };
    }

    if (typeof defaultSort === 'string') {
      const normalizedSort = normalizeText(defaultSort).toLowerCase();
      if (normalizedSort === 'asc' || normalizedSort === 'desc') {
        return {
          direction: normalizedSort,
          field,
        };
      }

      return {
        direction: 'desc',
        field: normalizeText(defaultSort) || field,
      };
    }

    if (defaultSort === true) {
      return {
        direction: 'asc',
        field,
      };
    }
  }

  return null;
};

export const sanitizeStoredSortPreference = ({
  columns = [],
  fallbackSort = null,
  sort = null,
}) => {
  const normalizedFallback =
    fallbackSort &&
    typeof fallbackSort === 'object' &&
    typeof fallbackSort.field === 'string' &&
    fallbackSort.field.trim()
      ? {
          direction: fallbackSort.direction === 'asc' ? 'asc' : 'desc',
          field: fallbackSort.field.trim(),
        }
      : null;

  if (
    !sort ||
    typeof sort !== 'object' ||
    typeof sort.field !== 'string' ||
    !sort.field.trim()
  ) {
    return normalizedFallback;
  }

  const normalizedDirection = sort.direction === 'asc' ? 'asc' : 'desc';
  const normalizedField = sort.field.trim();
  const sortableFields = new Set(
    (Array.isArray(columns) ? columns : [])
      .filter(isSortableColumn)
      .map(column => getSortField(column))
      .filter(Boolean),
  );

  if (!sortableFields.has(normalizedField)) {
    return normalizedFallback;
  }

  return {
    direction: normalizedDirection,
    field: normalizedField,
  };
};

const readValueByPath = (object, path) => {
  if (!object || !path) return object;

  return String(path)
    .split('.')
    .reduce((currentValue, key) => {
      if (currentValue === null || currentValue === undefined) return currentValue;
      return currentValue?.[key];
    }, object);
};

export const normalizeSortText = value =>
  normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const parseSortNumber = value => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value == null) return NaN;

  const raw = String(value).trim();
  if (!raw || !/[0-9]/.test(raw) || raw.includes('/')) return NaN;

  const compact = raw.replace(/[^0-9,.-]/g, '');
  if (!compact) return NaN;

  const hasComma = compact.includes(',');
  const hasDot = compact.includes('.');
  let normalized = compact;

  if (hasComma && hasDot) {
    normalized = compact.lastIndexOf(',') > compact.lastIndexOf('.')
      ? compact.replace(/\./g, '').replace(',', '.')
      : compact.replace(/,/g, '');
  } else if (hasComma) {
    const parts = compact.split(',');
    normalized = parts.length === 2 && parts[1].length <= 2
      ? `${parts[0].replace(/\./g, '')}.${parts[1]}`
      : compact.replace(/,/g, '');
  } else if (hasDot) {
    const parts = compact.split('.');
    if (parts.length > 2) {
      normalized = compact.replace(/\./g, '');
    } else if (parts.length === 2 && parts[1].length === 3 && parts[0].length <= 3) {
      normalized = compact.replace(/\./g, '');
    }
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export const resolveSortComparable = ({ column, row, storeName, columns }) => {
  const fieldName = getColumnKey(column);
  const sortField = getSortField(column);
  const rawValue = sortField === fieldName ? row?.[fieldName] : readValueByPath(row, sortField);

  if (isDateLikeColumn(column)) {
    const dateValue =
      rawValue && typeof rawValue === 'object'
        ? rawValue?.value ??
          rawValue?.date ??
          rawValue?.createdAt ??
          rawValue?.updatedAt ??
          rawValue?.['@id'] ??
          rawValue?.[fieldName] ??
          rawValue
        : rawValue;
    const parsedDate = Date.parse(dateValue);
    return Number.isFinite(parsedDate) ? parsedDate : Number.NEGATIVE_INFINITY;
  }

  const resolvedValue = sortField === fieldName
    ? resolveCellText({
        column,
        columns,
        row,
        storeName,
      })
    : normalizeText(rawValue ?? resolveCellText({
        column,
        columns,
        row,
        storeName,
      }));

  const normalizedNumber = parseSortNumber(resolvedValue);

  if (Number.isFinite(normalizedNumber)) {
    return normalizedNumber;
  }

  return normalizeSortText(resolvedValue);
};

export const getColumnStyle = column => {
  const key = getColumnKey(column);
  const customSize = {};
  const columnWidth = Number(column?.width);
  const columnMinWidth = Number(column?.minWidth);
  const columnFlexBasis = Number(column?.flexBasis);

  if (Number.isFinite(columnWidth) && columnWidth > 0) {
    customSize.width = columnWidth;
    customSize.flexBasis = columnWidth;
    if(column?.cellComponent){customSize.flexGrow=0;customSize.maxWidth=columnWidth;}
  }

  if (Number.isFinite(columnMinWidth) && columnMinWidth > 0) {
    customSize.minWidth = columnMinWidth;
  }

  if (Number.isFinite(columnFlexBasis) && columnFlexBasis > 0) {
    customSize.flexBasis = columnFlexBasis;
  }

  const columnSizeStyle = Object.keys(customSize).length ? customSize : null;

  if (column?.isIdentity) return [styles.cell, styles.identityCell, columnSizeStyle];
  if (['price', 'total', 'amount', 'value'].includes(key)) {
    return [styles.cell, styles.moneyCell, columnSizeStyle];
  }
  return [styles.cell, columnSizeStyle];
};

export const getColumnMinWidth = column => {
  const columnMinWidth = Number(column?.minWidth);
  if (Number.isFinite(columnMinWidth) && columnMinWidth > 0) {
    return columnMinWidth;
  }

  const columnWidth = Number(column?.width);
  if (Number.isFinite(columnWidth) && columnWidth > 0) {
    return columnWidth;
  }

  const key = getColumnKey(column);
  if (column?.isIdentity) return IDENTITY_CELL_MIN_WIDTH;
  if (['price', 'total', 'amount', 'value'].includes(key)) {
    return MONEY_CELL_MIN_WIDTH;
  }
  return DEFAULT_CELL_MIN_WIDTH;
};
