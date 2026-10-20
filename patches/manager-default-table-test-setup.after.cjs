const React = require('react');
const renderer = require('react-test-renderer');

const {afterEach, beforeEach, describe, expect, it} = global;

global.IS_REACT_ACT_ENVIRONMENT = true;

let consoleErrorSpy = null;
const mockState = {stores: {}, windowDimensions: {width: 480, height: 800}, capturedColumnFilterProps: [], capturedDefaultFormProps: [], capturedDefaultInputProps: []};

const createLocalStorageMock = () => {
  let storage = {};

  return {
    clear: () => {
      storage = {};
    },
    getItem: key => (key in storage ? storage[key] : null),
    removeItem: key => {
      delete storage[key];
    },
    setItem: (key, value) => {
      storage[key] = String(value);
    },
  };
};

global.localStorage = createLocalStorageMock();

jest.mock('@store', () => ({
  getAllStores: jest.fn(() => ({})),
  useStore: require('./defaultTableStoreHarness.cjs')(() => mockState.stores),
}));

jest.mock('@react-navigation/native', () => ({
  NavigationRouteContext: require('react').createContext({name: 'OrderHistoryPage'}),
  useIsFocused: jest.fn(() => false),
  useRoute: jest.fn(() => ({
    key: 'OrderHistoryPage-key',
    name: 'OrderHistoryPage',
  })),
}));

jest.mock('@controleonline/ui-common/src/react/components/MessageService', () => ({
  useMessage: jest.fn(() => ({
    showError: jest.fn(),
  })),
}));

jest.mock('react-native-vector-icons/Feather', () => {
  const React = require('react');
  return props => React.createElement('icon', props, props.children);
});

jest.mock('react-native', () => {
  const React = require('react');
  const createComponent = name => props =>
    React.createElement(name, props, props.children);

  const FlatList = props => {
    const items = Array.isArray(props.data) ? props.data : [];

    return React.createElement(
      'FlatList',
      props,
      items.map((item, index) =>
        props.renderItem ? props.renderItem({item, index}) : null,
      ),
      items.length === 0 && props.ListEmptyComponent ? props.ListEmptyComponent : null,
      props.ListFooterComponent || null,
    );
  };

  return {
    FlatList,
    KeyboardAvoidingView: createComponent('KeyboardAvoidingView'),
    Modal: createComponent('Modal'),
    Platform: {
      OS: 'web',
      select: value => value.web || value.default || null,
    },
    ScrollView: createComponent('ScrollView'),
    StyleSheet: {create: value => value},
    Text: createComponent('Text'),
    TouchableOpacity: createComponent('TouchableOpacity'),
    View: createComponent('View'),
    useWindowDimensions: jest.fn(() => mockState.windowDimensions),
  };
});

jest.mock('../../../../react/components/filters/DefaultColumnFilter', () => props => {
  const React = require('react');
  mockState.capturedColumnFilterProps.push(props);
  return React.createElement('DefaultColumnFilter', props);
});

jest.mock('../../../../react/components/filters/DefaultSearch', () => props => {
  const React = require('react');
  return React.createElement('DefaultSearch', props);
});

jest.mock('../../../../react/components/table/DefaultTableImportModal', () => props => {
  const React = require('react');
  return React.createElement('DefaultTableImportModal', props);
});

jest.mock('../../../../react/components/form/DefaultForm', () => props => {
  const React = require('react');
  mockState.capturedDefaultFormProps.push(props);
  return React.createElement('DefaultForm', props);
});

jest.mock('../../../../react/components/inputs/DefaultInput', () => props => {
  const React = require('react');
  mockState.capturedDefaultInputProps.push(props);
  return React.createElement('DefaultInput', props);
});

jest.mock('@controleonline/ui-common/src/react/components/StateStore', () => props => {
  const React = require('react');
  return React.createElement('StateStore', props, props.children);
});

const {
  default: DefaultTable,
  mergeSortedDataWithLiveItems,
  resolveColumnListLoadParams,
  shouldTriggerEndReachedFromScroll,
} = require('../../../../react/components/table/DefaultTable');
const {
  DEFAULT_TABLE_PREFERENCES_STORAGE_KEY,
} = require('../../../../react/utils/tableVisibleColumnsPreferences');
const reactNavigation = require('@react-navigation/native');
const {getAllStores} = require('@store');
const STORE_ACTION_META_KEY = '__storeMeta';

const flattenStyle = style => {
  if (Array.isArray(style)) {
    return style.reduce(
      (acc, item) => ({
        ...acc,
        ...flattenStyle(item),
      }),
      {},
    );
  }

  return style && typeof style === 'object' ? style : {};
};


function registerDefaultTableTests(register) {
  describe('DefaultTable', () => {
beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockState.windowDimensions = {width: 480, height: 800};
    mockState.capturedColumnFilterProps = [];
    mockState.capturedDefaultFormProps = [];
    mockState.capturedDefaultInputProps = [];
    getAllStores.mockImplementation(() => ({}));
    global.localStorage = createLocalStorageMock();
    global.t = {
      t: jest.fn((store, type, key) => {
        if (type === 'label' && key === 'search') return 'Buscar';
        if (type === 'label' && key === 'items') return 'registros';
        if (type === 'label' && key === 'loading') return 'Carregando...';
        if (type === 'label' && key === 'empty') return 'Nenhum registro encontrado';
        if (type === 'label' && key === 'filters') return 'Filtros';
        if (type === 'label' && key === 'select') return 'Selecionar';
        if (type === 'button' && key === 'add') return 'Adicionar';
        if (type === 'button' && key === 'edit') return 'Editar';
        if (type === 'button' && key === 'apply') return 'Aplicar';
        if (type === 'button' && key === 'clear') return 'Limpar';
        if (type === 'input' && key === 'search') return 'Buscar...';
        return undefined;
      }),
    };
    reactNavigation.useIsFocused.mockImplementation(() => false);

    mockState.stores = {
      people: {
        getters: {
          currentCompany: {
            id: 1,
            theme: {
              colors: {},
            },
          },
        },
      },
      theme: {
        getters: {
          colors: {},
        },
      },
    };
  });
afterEach(() => {
    delete global.t;
    if (consoleErrorSpy) {
      consoleErrorSpy.mockRestore();
      consoleErrorSpy = null;
    }
  });
    register();
  });
}
module.exports = {registerDefaultTableTests, React, renderer, mockState, DefaultTable, mergeSortedDataWithLiveItems, resolveColumnListLoadParams, shouldTriggerEndReachedFromScroll, DEFAULT_TABLE_PREFERENCES_STORAGE_KEY, reactNavigation, getAllStores, STORE_ACTION_META_KEY, flattenStyle};
