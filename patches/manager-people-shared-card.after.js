/* eslint-disable no-unused-vars */
// Technical wiki: https://github.com/ControleOnline/ui-people/wiki/Cadastro-de-Pessoas-Contatos-Usuarios-e-Vendedores
/*
 * Contract imported from AGENTS.md
 * ## Escopo
 * - `ui-people` e o modulo React de pessoas e relacionamentos do app.
 * - Esta tela centraliza busca, filtros e representacao de pessoas.
 *
 * ## Estado
 *
 * ## Limites
 * - Nao espalhar a normalizacao de contexto por outros modulos.
 * - Manter aqui a busca e a apresentacao principal de pessoas.
 */
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Modal, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '@store';
import Icon from 'react-native-vector-icons/FontAwesome';
import AddCompanyModal from '@controleonline/ui-people/src/react/components/AddCompanyModal';
import PeopleAvatar from '@controleonline/ui-people/src/react/components/PeopleAvatar';
import DefaultEntityCard from '@controleonline/ui-default/src/react/components/cards/DefaultEntityCard';
import DefaultTable from '@controleonline/ui-default/src/react/components/table/DefaultTable';
import ImportsPage from '@controleonline/ui-common/src/react/pages/Imports';
import {
  buildPeopleContextConfig,
  normalizePeopleContextType,
  resolvePeopleContextSearchPlaceholder,
} from '@controleonline/ui-people/src/react/utils/peopleContext';
import {
  ALL_PEOPLE_LINK_TYPES_KEY,
  buildCompanyLinksRequestParams,
  buildParentCompanyRequestParams,
  buildPeopleLinkRequestParams,
  normalizeEntityId,
} from '@controleonline/ui-people/src/react/utils/peopleLinkFilters';
import {
  isCompanyPeople,
  resolvePeopleAvatarEmail,
  resolvePeopleDisplayName,
} from '@controleonline/ui-people/src/react/utils/peopleImage';
import styles from './People.styles';
import { inlineStyle_133_14, inlineStyle_137_16 } from './People.styles';

const EMPLOYMENT_CONTEXT = 'employment';

// The people_link store declares no columns (its original presentation is
// cards only), so table mode rendered empty rows (app-community#1123).
// company-links rows carry the person under `people`.
const COMPANY_LINK_TABLE_COLUMNS = [
  { name: 'id', label: 'ID', editable: false, sortable: false, isIdentity: true },
  {
    name: 'people',
    label: 'Colaborador',
    editable: false,
    sortable: false,
    format: person =>
      String(resolvePeopleDisplayName(person) || person?.name || person?.alias || '-'),
  },
];

const People = ({ context = {}, initialShowAddModal = false, companyScope = 'people' }) => {
  const contextConfig = useMemo(() => buildPeopleContextConfig(context), [context]);
  const title = context.title;

  const peopleStore = useStore('people');
  const authStore = useStore('auth');
  const themeStore = useStore('theme');
  const { getters, actions } = peopleStore;
  const { currentCompany } = getters;
  const { user } = authStore.getters || {};
  const { colors: themeColors } = themeStore.getters;

  const navigation = useNavigation();

  const [selectedLinkType, setSelectedLinkType] = useState(contextConfig.defaultType);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const isCompanyScope = companyScope === 'companies';
  // Multi-type registrations still expose DefaultTable external filter UI for
  // link.linkType; requestParams always seeds company + resolved link types
  // so the first list load is not empty when selected type is "all".

  const hasAutoOpenedAddModalRef = useRef(false);

  useEffect(() => {
    setSelectedLinkType(previousType =>
      contextConfig.availableTypes.includes(previousType)
        ? previousType
        : contextConfig.defaultType,
    );
  }, [contextConfig.availableTypes, contextConfig.defaultType]);

  useEffect(() => {
    if (!initialShowAddModal || hasAutoOpenedAddModalRef.current) {
      return;
    }

    hasAutoOpenedAddModalRef.current = true;
    setShowAddCompanyModal(true);
  }, [initialShowAddModal]);

  const activeSearchPlaceholder = useMemo(
    () => resolvePeopleContextSearchPlaceholder(selectedLinkType, context),
    [context, selectedLinkType],
  );

  const runtimeContext = useMemo(
    () => ({
      ...context,
      context: selectedLinkType,
      contextOptions: contextConfig.availableTypes,
      defaultContext: contextConfig.defaultType,
      defaultPeopleType:
        selectedLinkType === 'courier' ? 'F' : context.defaultPeopleType,
      enableExistingOwnerSelection:
        context.enableExistingOwnerSelection ?? selectedLinkType === 'franchisee',
      selectedContext: selectedLinkType,
    }),
    [context, contextConfig.availableTypes, contextConfig.defaultType, selectedLinkType],
  );

  const palette = useMemo(
    () => ({
      buttonBackground: themeColors.buttonBackground,
      buttonBorder: themeColors.buttonBorder,
      buttonText: themeColors.buttonText,
      cardBackground: themeColors.cardBackground,
      cardBorder: themeColors.cardBorder,
      cardIcon: themeColors.cardIcon,
      cardIconBackground: themeColors.cardIconBackground || themeColors.cardBackground,
      cardIconColor: themeColors.cardIconColor || themeColors.cardIcon || themeColors.listItemText,
      cardShadow: themeColors.cardShadow,
      iconInverse: themeColors.iconInverse,
      listItemIcon: themeColors.listItemIcon,
      listItemSubtitleText: themeColors.listItemSubtitleText,
      listItemText: themeColors.listItemText,
      tableActionBackground: themeColors.tableActionBackground,
      tableActionBorder: themeColors.tableActionBorder,
      tableActionIcon: themeColors.tableActionIcon,
    }),
    [themeColors],
  );

  const cardStyle = useMemo(
    () => ({
      backgroundColor: palette.cardBackground,
      borderWidth: palette.cardBorder ? 1 : 0,
      borderColor: palette.cardBorder,
      shadowColor: palette.cardShadow,
      ...(Platform.OS === 'web' && palette.cardShadow
        ? { boxShadow: `0 8px 16px ${palette.cardShadow}` }
        : {}),
    }),
    [palette],
  );

  const avatarStyle = useMemo(
    () => ({
      backgroundColor: palette.cardIconBackground,
    }),
    [palette.cardIconBackground],
  );

  const clientNameStyle = useMemo(
    () => ({
      color: palette.listItemText,
      lineHeight: 30,
    }),
    [palette.listItemText],
  );

  const clientSubtitleStyle = useMemo(
    () => ({
      color: palette.listItemSubtitleText,
    }),
    [palette.listItemSubtitleText],
  );

  const toolbarActions = useMemo(
    () => [
      {
        key: 'import',
        icon: 'upload',
        style: {
          backgroundColor: palette.buttonBackground,
          borderColor: palette.buttonBorder,
        },
        color: palette.buttonText,
        onPress: () => setShowImportModal(true),
      },
      {
        key: 'add',
        icon: 'plus',
        testID: isCompanyScope ? 'my-companies-add' : 'people-add',
        style: {
          backgroundColor: palette.buttonBackground,
          borderColor: palette.buttonBorder,
        },
        color: palette.buttonText,
        onPress: () => setShowAddCompanyModal(true),
      },
    ],
    [palette, isCompanyScope],
  );

  // Collaborators (employment context) = PF people linked to the currentCompany
  // through peopleLink, whatever the link type. "employment" is not a real
  // link.linkType, so it must never be sent as a linkType filter.
  const collaboratorScope = useMemo(() => {
    const isEmployment =
      contextConfig.defaultType === EMPLOYMENT_CONTEXT ||
      contextConfig.availableTypes.includes(EMPLOYMENT_CONTEXT);
    return {
      peopleType: context?.peopleType ?? (isEmployment ? 'F' : undefined),
      anyLinkType: context?.anyLinkType ?? isEmployment,
    };
  }, [context?.peopleType, context?.anyLinkType, contextConfig]);

  // company-links source: lists the people_link rows of the currentCompany
  // (people_link.company_id = currentCompany) and renders the linked person.
  // This is what My Company Details / EmployeesTab already do, and the API
  // scopes it by company access instead of the global /people visibility wall.
  const isCompanyLinksSource = !isCompanyScope && context?.listSource === 'company-links';

  const requestParams = useMemo(
    () => {
      if (isCompanyLinksSource) {
        return buildCompanyLinksRequestParams({
          currentCompany,
          availableTypes: contextConfig.availableTypes,
          selectedLinkType,
        });
      }

      if (isCompanyScope) {
        return buildParentCompanyRequestParams({
          availableTypes: contextConfig.availableTypes,
          selectedLinkType,
          user,
        });
      }

      // Always scope by currentCompany + resolved linkType(s). When the table
      // owns the external linkType filter UI, still seed
      // the expanded types for "all" so the first request is not empty;
      // DefaultTable may refine the filter after load.
      return buildPeopleLinkRequestParams({
        currentCompany,
        availableTypes: contextConfig.availableTypes,
        selectedLinkType,
        peopleType: collaboratorScope.peopleType,
        anyLinkType: collaboratorScope.anyLinkType,
      });
    },
    [
      collaboratorScope,
      contextConfig.availableTypes,
      currentCompany,
      isCompanyLinksSource,
      isCompanyScope,
      selectedLinkType,
      user,
    ],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: title,
    });
  }, [navigation, title]);

  const getExternalFilterOptions = useCallback(
    column => {
      if ((column?.name || column?.key) !== 'link.linkType') {
        return [];
      }

      // "all" is represented by the absence of a link-type constraint. It
      // must not be sent as a literal API value when selected in the table.
      return contextConfig.options.filter(
        option => option.key !== ALL_PEOPLE_LINK_TYPES_KEY,
      );
    },
    [contextConfig.options],
  );

  const handleEdit = useCallback(
    row => {
      // company-links rows are people_link records; the target is the linked person.
      const client =
        isCompanyLinksSource && row?.people && typeof row.people === 'object'
          ? row.people
          : row;
      // Resolve people id from common list shapes (direct people, nested company, IRI).
      const clientId =
        normalizeEntityId(client?.id ?? client?.['@id']) ||
        normalizeEntityId(client?.company?.id ?? client?.company?.['@id']) ||
        normalizeEntityId(client?.people?.id ?? client?.people?.['@id']);
      if (!clientId) {
        return;
      }

      const peoplePayload =
        client && typeof client === 'object'
          ? client.company && typeof client.company === 'object'
            ? client.company
            : client
          : null;

      if (peoplePayload) {
        actions?.setItem?.(peoplePayload);
      }

      const detailsRouteName = context?.detailsRouteName || 'ClientDetails';
      const baseParams =
        typeof context?.detailsRouteParams === 'function'
          ? context.detailsRouteParams(peoplePayload || client, selectedLinkType)
          : (context?.detailsRouteParams || {
              clientId,
              contextKey:
                selectedLinkType === ALL_PEOPLE_LINK_TYPES_KEY
                  ? ''
                  : String(selectedLinkType || ''),
            });

      // Only serializable scalars in route params — never `client: object`
      // (web query becomes client=[object Object], app-community#641).
      const detailsRouteParams = {
        ...(baseParams && typeof baseParams === 'object' ? baseParams : {}),
        // Seed for details screen so first paint does not depend only on store.
        // Web serializes route params into the URL, so an object becomes
        // client=[object Object] (app-community#1124). The store is already
        // seeded through actions.setItem above, so web omits the object.
        ...(Platform.OS === 'web' ? {} : { client: peoplePayload || client }),
      };

      if (baseParams?.employeeId) {
        detailsRouteParams.employeeId = String(baseParams.employeeId);
        delete detailsRouteParams.clientId;
      } else if (baseParams?.companyId) {
        detailsRouteParams.companyId = String(baseParams.companyId);
        delete detailsRouteParams.clientId;
      } else {
        detailsRouteParams.clientId = String(baseParams?.clientId || clientId);
      }

      try {
        if (typeof navigation?.navigate === 'function') {
          navigation.navigate(detailsRouteName, detailsRouteParams);
        } else if (typeof navigation?.push === 'function') {
          navigation.push(detailsRouteName, detailsRouteParams);
        }
      } catch (err) {
        // Fallback: CRM client-details route always registered.
        if (detailsRouteName !== 'ClientDetails' && typeof navigation?.navigate === 'function') {
          navigation.navigate('ClientDetails', detailsRouteParams);
        }
      }
    },
    [actions, context?.detailsRouteName, context?.detailsRouteParams, isCompanyLinksSource, navigation, selectedLinkType],
  );

  const handleCreateSuccess = useCallback(
    (savedClient, metadata = {}) => {
      const registrationLinkType = normalizePeopleContextType(metadata?.registrationLinkType);
      const nextLinkType =
        registrationLinkType && contextConfig.availableTypes.includes(registrationLinkType)
          ? registrationLinkType
          : selectedLinkType;
      if (savedClient?.id) {
        actions?.setItem?.(savedClient);
      }
      if (nextLinkType && nextLinkType !== selectedLinkType) {
        setSelectedLinkType(nextLinkType);
      }
    },
    [actions, contextConfig.availableTypes, selectedLinkType],
  );

  const renderContactLine = useCallback(people => {
    const email = resolvePeopleAvatarEmail(people);
    const phone = Array.isArray(people?.phone)
      ? people.phone.find(item => item?.phone || item?.value)
      : people?.phone;
    const phoneValue =
      typeof phone === 'object'
        ? String(phone?.phone || phone?.value || '').trim()
        : String(phone || '').trim();

    return email || phoneValue || '';
  }, []);

  const renderPeopleCard = useCallback(
    ({ item: people, openRow }) => {
      const displayName = String(resolvePeopleDisplayName(people) ?? '').replace(/\s+/g, ' ').trim();
      const legalName = String(people?.name || people?.alias || '').replace(/\s+/g, ' ').trim();
      const contactLine = renderContactLine(people);
      const peopleTypeLabel = isCompanyPeople(people) ? 'PJ' : 'PF';

      return (
        <TouchableOpacity
          style={{width:'100%'}}
          onPress={() => handleEdit(people)}
          activeOpacity={0.8}
        >
          <DefaultEntityCard embedded palette={palette}><View style={[styles.cardHeader,{marginBottom:0}]}>
            <PeopleAvatar
              people={people}
              size={52}
              backgroundColor={avatarStyle.backgroundColor}
              borderColor={palette.cardBorder || avatarStyle.backgroundColor}
              borderWidth={1}
              textColor={palette.cardIconColor}
              iconColor={palette.cardIconColor}
              useGravatar={contextConfig.useGravatar}
              usePeopleImage={contextConfig.usePeopleImage}
              style={styles.avatar}
            />

            <View style={inlineStyle_133_14}>
              <View style={styles.contactTitleRow}>
                <Text style={[styles.clientName, clientNameStyle]} numberOfLines={1}>
                  {displayName || legalName || '-'}
                </Text>
                <View style={[styles.peopleTypeBadge, { borderColor: palette.cardBorder }]}>
                  <Text style={[styles.peopleTypeBadgeText, { color: palette.listItemSubtitleText }]}>
                    {peopleTypeLabel}
                  </Text>
                </View>
              </View>
              <Text style={[styles.clientSubtitle, inlineStyle_137_16, clientSubtitleStyle]} numberOfLines={1}>
                {legalName && legalName !== displayName ? legalName : contactLine || '-'}
              </Text>
              {legalName && legalName !== displayName && contactLine ? (
                <Text style={[styles.contactLine, clientSubtitleStyle]} numberOfLines={1}>
                  {contactLine}
                </Text>
              ) : null}
            </View>

            <Icon name="chevron-right" size={14} color={palette.listItemIcon} />
          </View></DefaultEntityCard>
        </TouchableOpacity>
      );
    },
    [
      avatarStyle.backgroundColor,
      cardStyle,
      clientNameStyle,
      clientSubtitleStyle,
      handleEdit,
      palette.cardBorder,
      palette.cardIconColor,
      palette.listItemIcon,
      palette.listItemSubtitleText,
      renderContactLine,
    ],
  );

  const renderClientCard = useCallback(
    args =>
      renderPeopleCard(
        isCompanyLinksSource && args?.item?.people
          ? { ...args, item: args.item.people }
          : args,
      ),
    [isCompanyLinksSource, renderPeopleCard],
  );

  const renderCompanyCard = useCallback(
    args => renderPeopleCard(args),
    [renderPeopleCard],
  );

  return (
    <View style={styles.container}>
      <View style={styles.tableWrap}>
        <DefaultTable
          actions={isCompanyLinksSource ? undefined : actions}
          add={false}
          columns={isCompanyLinksSource ? COMPANY_LINK_TABLE_COLUMNS : undefined}
          initialViewMode="cards"
          requestParams={requestParams}
          onRowPress={handleEdit}
          renderCard={isCompanyScope ? renderCompanyCard : renderClientCard}
          searchKey="search"
          searchPlaceholder={activeSearchPlaceholder}
          showSearch={!isCompanyLinksSource}
          getOptionsForColumn={getExternalFilterOptions}
          showColumnFiltersButton
          showRowActions={false}
          storeName={isCompanyLinksSource ? 'people_link' : 'people'}
          toolbarActions={toolbarActions}
        />
      </View>

      <AddCompanyModal
        visible={showAddCompanyModal}
        onClose={() => setShowAddCompanyModal(false)}
        context={runtimeContext}
        onSuccess={handleCreateSuccess}
        autoLinkAuthenticatedPerson={isCompanyScope}
      />

      <Modal
        visible={showImportModal}
        animationType="slide"
        transparent={false}
      >
        <ImportsPage
          context={runtimeContext}
          onClose={() => setShowImportModal(false)}
        />
      </Modal>
    </View>
  );
};

export default People;
