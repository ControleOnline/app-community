// The repository's flat ESLint config does not track JSX references.
/* eslint no-unused-vars: ["error", {"varsIgnorePattern": "^(React|View|Text|ScrollView|Pressable|Switch|TextInput|Button|CheckRow|Devices)$"}] */
import React, {useMemo} from 'react';
import {View, Text, ScrollView, Pressable, Switch, TextInput} from 'react-native';
import {buildSteps, deviceRoute, deviceSummary} from './model';
import {createStyles} from './styles';

const evidenceLabels = {
  unknown: 'Ainda não consultado', unavailable: 'Consulta indisponível — confira no módulo',
  partial: 'Consulta parcial — confira no módulo', found: 'Cadastros encontrados — revise a configuração',
  empty: 'Nenhum cadastro encontrado nesta consulta',
};
const setupResources = {team: 'Vínculos de pessoas', products: 'Produtos', devices: 'Devices', queues: 'Filas', displays: 'Displays'};

const Button = ({label, onPress, disabled, testID, styles}) => (
  <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled: Boolean(disabled)}} disabled={disabled} onPress={onPress} testID={testID} style={[styles.button, disabled && styles.disabled]}>
    <Text style={styles.buttonText}>{label}</Text>
  </Pressable>
);

const CheckRow = ({label, value, onChange, disabled, testID, styles}) => (
  <View style={styles.checkRow}>
    <Text style={styles.checkLabel}>{label}</Text>
    <Switch accessibilityLabel={label} disabled={disabled} onValueChange={onChange} testID={testID} value={value} />
  </View>
);

function Devices({runtime, navigation, editable, styles}) {
  const devices = runtime?.devices?.items || [];
  return (
    <View style={styles.stack}>
      <Text style={styles.subtitle}>Do responsável ao garçom, confira cada equipamento</Text>
      <Text style={styles.muted}>Modo e usuário responsável; mesa ou comanda; abertura de vínculos; autorização de cobrança; catálogo; impressão e destinos; alertas e comandos remotos.</Text>
      {devices.map(record => {
        const summary = deviceSummary(record);
        const target = deviceRoute(record);
        return (
          <View key={record.id || record['@id']} style={styles.deviceCard}>
            <Text style={styles.subtitle}>{record.alias || record.device?.alias || record.device?.device || `Device #${record.id}`}</Text>
            <Text style={styles.text}>Operação: {summary.mode}</Text>
            {String(record.type).toUpperCase() === 'PDV' ? (
              <>
                <Text style={styles.text}>Vínculo: {summary.link}</Text>
                <Text style={styles.text}>{summary.management}</Text>
                <Text style={styles.text}>Cobrança: {summary.charge}</Text>
              </>
            ) : null}
            <Button disabled={!editable || !target} label="Revisar configuração deste device" onPress={() => {if (editable && target) navigation.navigate(target.name, target.params);}} styles={styles} testID={`setup-device-${record.id}`} />
          </View>
        );
      })}
      <Text style={styles.muted}>A configuração é salva pelas telas do device. Comandos, pagamentos e envio à produção exigem as ações próprias desses módulos.</Text>
    </View>
  );
}

export default function OnboardingContent({company, access, palette, controller, navigation}) {
  const styles = useMemo(() => createStyles(palette), [palette]);
  const {draft, runtime, update, refresh, loading, ready, saveFailed} = controller;
  const editable = access === 'manage';
  const steps = buildSteps(draft, runtime);
  const index = Math.max(0, Math.min(steps.length - 1, draft.step));
  const step = steps[index];
  const required = steps.filter(item => item.required);
  const reviewed = required.filter(item => item.reviewed).length;
  const open = target => {if (editable) navigation.navigate(target.name, target.params || {});};

  if (access === 'denied') return (
    <View style={styles.page}>
      <Text style={styles.title}>Preparação da empresa</Text>
      <Text style={styles.text}>Selecione uma empresa na qual você seja proprietário, diretor ou gestor para configurar a operação.</Text>
    </View>
  );
  if (!ready) return <View style={styles.page}><Text style={styles.text}>Carregando sua preparação…</Text></View>;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} testID="setup-onboarding">
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>PREPARAÇÃO DA OPERAÇÃO</Text>
        <Text style={styles.title}>{company.alias || company.name || 'Sua empresa'}</Text>
        <Text style={styles.text}>Organize a equipe, o catálogo, os equipamentos e a produção usando os cadastros do seu ERP.</Text>
        <Text style={styles.muted}>{reviewed} de {required.length} etapas principais revisadas por você</Text>
      </View>
      {!editable ? <Text style={styles.notice}>Pré-visualização. Os cadastros e as configurações ficam disponíveis aos responsáveis pela empresa.</Text> : null}
      <Text style={styles.notice}>Suas escolhas e revisões ficam neste dispositivo. Os cadastros são salvos nas telas que você abrir.</Text>
      {saveFailed ? <Text accessibilityRole="alert" style={styles.notice}>Não foi possível salvar o acompanhamento neste dispositivo. Suas escolhas continuam disponíveis enquanto esta tela estiver aberta.</Text> : null}

      <View style={styles.tabs}>
        {steps.map((item, position) => (
          <Pressable accessibilityRole="button" accessibilityState={{selected: position === index}} key={item.id} onPress={() => update({step: position})} style={[styles.tab, position === index && styles.activeTab]} testID={`setup-step-${item.id}`}>
            <Text style={[styles.text, position === index && styles.activeTabText]}>{position + 1}. {item.title}{item.reviewed ? ' ✓' : ''}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.text}>{step.description}</Text>
        {step.id === 'company' ? (
          <>
            <Text style={styles.subtitle}>Como será a operação?</Text>
            <CheckRow disabled={!editable} label="A equipe terá garçons no PDV" onChange={waiters => update({waiters, reviewed: {...draft.reviewed, team: false, device: false}})} styles={styles} value={draft.waiters} />
            <CheckRow disabled={!editable} label="Usaremos filas de produção ou conferência" onChange={production => update({production, reviewed: {...draft.reviewed, production: false}})} styles={styles} value={draft.production} />
          </>
        ) : null}
        {step.id !== 'review' ? <Text style={styles.notice}>{evidenceLabels[step.evidence]}</Text> : null}
        <View style={styles.actions}>
          {step.routes.map(target => <Button disabled={!editable} key={target.name} label={target.label} onPress={() => open(target)} styles={styles} testID={`setup-route-${target.name}`} />)}
        </View>

        {step.id === 'device' ? <Devices editable={editable} navigation={navigation} runtime={runtime} styles={styles} /> : null}
        {step.id === 'production' ? (
          <View style={styles.stack}>
            <Text style={styles.subtitle}>Produtos → filas → displays → conferência</Text>
            <Text style={styles.text}>Abra os displays, revise as filas vinculadas e associe os produtos pelo cadastro existente. Confira os estados de entrada, preparo e saída e os equipamentos de impressão.</Text>
            {!draft.production ? <Text style={styles.muted}>Você ainda não indicou o uso de produção ou conferência. Esta etapa permanece opcional.</Text> : null}
          </View>
        ) : null}

        {step.id === 'review' ? (
          <View style={styles.stack}>
            <Text style={styles.subtitle}>Revisão local — {reviewed}/{required.length} etapas principais</Text>
            {steps.filter(item => item.id !== 'review').map(item => (
              <Pressable accessibilityRole="button" key={item.id} onPress={() => update({step: steps.indexOf(item)})} style={styles.reviewRow}>
                <Text style={styles.text}>{item.reviewed ? '✓ Revisado por você' : 'A revisar'} · {item.title}{!item.required ? ' · opcional' : ''}</Text>
              </Pressable>
            ))}
            <Text style={styles.muted}>A revisão local não substitui a validação funcional: acesso da equipe, lançamento e consulta no PDV, produção e cobrança conforme as permissões atuais.</Text>
            <Text style={styles.subtitle}>Observações da implantação</Text>
            <TextInput accessibilityLabel="Observações da implantação" editable={editable} maxLength={2000} multiline onChangeText={notes => update({notes})} placeholder="O que ainda precisa ser conferido?" placeholderTextColor={palette.textSecondary} style={styles.input} value={draft.notes} />
          </View>
        ) : (
          <CheckRow disabled={!editable} label="Revisei esta etapa nas telas do ERP" onChange={value => update({reviewed: {...draft.reviewed, [step.id]: value}})} styles={styles} testID={`setup-review-${step.id}`} value={step.reviewed} />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitle}>Cadastros da empresa selecionada</Text>
        <View style={styles.counts}>
          {Object.entries(setupResources).map(([key, label]) => {
            const result = runtime?.[key];
            return <Text key={key} style={styles.muted}>{label}: {!result ? 'a consultar' : !result.available ? 'consulta indisponível' : `${result.items.length}${result.complete ? '' : ' · parcial'}`}</Text>;
          })}
        </View>
        <Button disabled={!editable || loading} label={loading ? 'Consultando…' : 'Atualizar após configurar'} onPress={refresh} styles={styles} testID="setup-refresh" />
      </View>
      <View style={styles.actions}>
        <Button disabled={index === 0} label="Anterior" onPress={() => update({step: index - 1})} styles={styles} />
        <Button disabled={index === steps.length - 1} label="Próxima etapa" onPress={() => update({step: index + 1})} styles={styles} />
      </View>
    </ScrollView>
  );
}
