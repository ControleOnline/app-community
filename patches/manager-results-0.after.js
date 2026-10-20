import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useStore} from '@store';
import legacyStyles from './IncomeStatement.styles';

const CURRENT_YEAR = new Date().getFullYear();

const MONTHS = [
  {id: 1, label: 'Janeiro'},
  {id: 2, label: 'Fevereiro'},
  {id: 3, label: 'Março'},
  {id: 4, label: 'Abril'},
  {id: 5, label: 'Maio'},
  {id: 6, label: 'Junho'},
  {id: 7, label: 'Julho'},
  {id: 8, label: 'Agosto'},
  {id: 9, label: 'Setembro'},
  {id: 10, label: 'Outubro'},
  {id: 11, label: 'Novembro'},
  {id: 12, label: 'Dezembro'},
];

const EMPTY_GROUP = {
  total_month_price: 0,
  parent_categories: {},
};

const normalizeObject = value => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value;
};

const normalizeCollection = value => {
  if (Array.isArray(value)) {
    return value;
  }

  return Object.values(normalizeObject(value));
};

const normalizeGroup = group => {
  const normalized = normalizeObject(group);

  return {
    total_month_price: Number(normalized.total_month_price || 0),
    parent_categories: normalizeObject(normalized.parent_categories),
  };
};

const safeLabel = value =>
  value && String(value).trim() ? String(value).trim() : 'Sem categoria';

const formatMoney = value =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

const getColumnsByWidth = width => {
  if (width >= 1024) return 6;
  if (width >= 768) return 4;
  if (width >= 600) return 2;
  return 1;
};

const getMonthData = (incomeStatements, monthId) => {
  const rawMonth =
    incomeStatements?.[monthId] ?? incomeStatements?.[String(monthId)] ?? {};

  return {
    receive: normalizeGroup(rawMonth.receive || EMPTY_GROUP),
    pay: normalizeGroup(rawMonth.pay || EMPTY_GROUP),
  };
};

const getParentCategories = categories =>
  normalizeCollection(categories);

const IncomeStatement = ({presentation = null} = {}) => {
  const styles = presentation?.styles || legacyStyles;
  const DetailsModal = presentation?.ModalComponent || Modal;
  const {width} = useWindowDimensions();
  const invoiceStore = useStore('invoice');
  const peopleStore = useStore('people');
  const {currentCompany} = peopleStore.getters || {};
  const getIncomeStatements = invoiceStore?.actions?.getIncomeStatements;

  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [incomeStatements, setIncomeStatements] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const columns = useMemo(() => getColumnsByWidth(width), [width]);

  const loadData = useCallback(
    async requestedYear => {
      if (!currentCompany?.id) {
        return;
      }

      if (typeof getIncomeStatements !== 'function') {
        setError('Ação getIncomeStatements indisponível.');
        setIncomeStatements({});
        return;
      }

      const targetYear = String(requestedYear || '').trim();

      if (targetYear.length !== 4) {
        Alert.alert('Ano inválido', 'Informe um ano válido com 4 dígitos.');
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const response = await getIncomeStatements({
          people: currentCompany.id,
          year: targetYear,
        });

        setIncomeStatements(normalizeObject(response));
      } catch (e) {
        console.error('Erro ao carregar income statements:', e);
        setError(presentation?.errorText || 'Não foi possível carregar os dados de comissões.');
        setIncomeStatements({});
      } finally {
        setIsLoading(false);
      }
    },
    [currentCompany?.id, getIncomeStatements],
  );

  // Reload only when the company context changes. Year changes are explicit via the filter button.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (currentCompany?.id) {
      loadData(year);
      return;
    }

    setIncomeStatements({});
  }, [currentCompany?.id]);

  const handleYearChange = text => {
    setYear(text.replace(/\D/g, '').slice(0, 4));
  };

  const handleFilter = () => {
    loadData(year);
  };

  const handleClear = () => {
    const nextYear = String(CURRENT_YEAR);
    setYear(nextYear);
    loadData(nextYear);
  };

  const openDetails = (title, categories) => {
    setSelectedTitle(title);
    setSelectedCategories(getParentCategories(categories));
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTitle('');
    setSelectedCategories([]);
  };

  const renderCategorySection = (label, onPress, monthLabel) => (
    <View style={styles.metricBox}>
      <Text style={styles.metricLabel}>{label}</Text>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Ver ${label.toLowerCase()} de ${monthLabel}`} activeOpacity={0.9} style={styles.metricAction} onPress={onPress}>
        <Icon name="info" size={16} color={presentation ? presentation.colors.buttonText : "#FFFFFF"} />
      </TouchableOpacity>
    </View>
  );

  const renderMonthCard = month => {
    const monthData = getMonthData(incomeStatements, month.id);
    const income = monthData.receive.total_month_price;
    const expense = monthData.pay.total_month_price;
    const balance = income - expense;
    const balanceColor = balance < 0 ? styles.textRed : styles.textGreen;

    return (
      <View key={month.id} style={[styles.monthCardContainer, {width: `${100 / columns}%`}]}>
        <View style={styles.monthCard}>
          <Text style={styles.monthTitle}>{month.label}</Text>

          {renderCategorySection('Receitas', () =>
            openDetails('Receitas', monthData.receive.parent_categories), month.label,
          )}

          {renderCategorySection('Despesas', () =>
            openDetails('Despesas', monthData.pay.parent_categories), month.label,
          )}

          <View style={styles.totalsBlock}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, styles.textGreen]}>Total de Receitas</Text>
              <Text style={[styles.totalValue, styles.textGreen]}>
                {formatMoney(income)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, styles.textRed]}>Total de Despesas</Text>
              <Text style={[styles.totalValue, styles.textRed]}>
                {formatMoney(expense)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, styles.bold, balanceColor]}>Saldo</Text>
              <Text style={[styles.totalValue, styles.bold, balanceColor]}>
                {formatMoney(balance)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (!currentCompany?.id) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyState}>
          <Icon name="business" size={36} color={presentation ? presentation.colors.textMuted : "#9CA3AF"} />
          <Text style={styles.emptyStateTitle}>Selecione uma empresa</Text>
          <Text style={styles.emptyStateText}>
            {presentation?.emptyText || 'O relatório de comissões precisa de uma empresa ativa para carregar os dados.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text accessibilityRole="header" style={styles.pageTitle}>{presentation?.title || 'Comissões'}</Text>

        <View style={styles.filterCard}>
          <View style={styles.filterRow}>
            <View style={styles.yearField}>
              <Text style={styles.yearLabel}>Ano</Text>
              {presentation?.renderYearInput ? presentation.renderYearInput({value: year, onChangeText: handleYearChange, onSubmitEditing: handleFilter}) : <TextInput
                value={year}
                onChangeText={handleYearChange}
                onSubmitEditing={handleFilter}
                keyboardType="numeric"
                maxLength={4}
                style={styles.yearInput}
              />}
            </View>

            <TouchableOpacity
              accessibilityRole="button" accessibilityLabel="Filtrar resultados"
              style={styles.filterButton}
              activeOpacity={0.9}
              onPress={handleFilter}>
              <Text style={styles.filterButtonText}>FILTRAR</Text>
              <Icon name="search" size={18} color={presentation ? presentation.colors.buttonText : "#F4C400"} />
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button" accessibilityLabel="Limpar filtro de ano"
              style={styles.clearButton}
              activeOpacity={0.9}
              onPress={handleClear}>
              <Icon name="filter-alt-off" size={18} color={presentation ? presentation.colors.buttonText : "#F4C400"} />
            </TouchableOpacity>
          </View>
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.monthGrid}>
          {MONTHS.map(month => renderMonthCard(month))}
        </View>
      </ScrollView>

      <DetailsModal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedTitle}</Text>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}>
              {selectedCategories.length > 0 ? (
                selectedCategories.map((parentCategory, index) => {
                  const childCategories = normalizeCollection(
                    parentCategory?.categories_childs,
                  );

                  return (
                    <View key={`${parentCategory?.parent_id || index}`} style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>
                        {safeLabel(parentCategory?.parent_category_name)}
                      </Text>

                      {childCategories.length > 0 ? (
                        childCategories.map((category, childIndex) => (
                          <Text
                            key={`${category?.category_id || childIndex}`}
                            style={styles.modalText}>
                            {safeLabel(category?.category_name)}:{' '}
                            {formatMoney(category?.category_price || 0)}
                          </Text>
                        ))
                      ) : (
                        <Text style={styles.modalEmptyText}>Nenhuma subcategoria</Text>
                      )}
                    </View>
                  );
                })
              ) : (
                <Text style={styles.modalEmptyText}>Nenhuma categoria disponível</Text>
              )}
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.modalButton}
              onPress={closeModal}>
              <Text style={styles.modalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </DetailsModal>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={presentation ? presentation.colors.loadingSpinner : "#F4C400"} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default IncomeStatement;
