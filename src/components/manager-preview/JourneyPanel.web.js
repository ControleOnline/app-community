import React, {useSyncExternalStore} from 'react';
const labels = {
  'navigation.requested':'Navegação solicitada', 'screen.committed':'Estrutura da tela apresentada',
  'view.data-committed':'Dados apresentados pela tela', 'journey.interrupted':'Jornada interrompida',
  'read.started':'Consulta iniciada', 'read.returned':'Resposta disponível', 'read.failed':'Consulta falhou',
  'read.shared-returned':'Resposta compartilhada disponível', 'read.cache-hit':'Resposta reaproveitada', 'read.deduplicated':'Consulta em andamento reaproveitada',
};
export default function JourneyPanel({experience}) {
  const snapshot = useSyncExternalStore(experience.journal.subscribe, experience.journal.snapshot, experience.journal.snapshot);
  const stats = experience.stats();
  const status = stats.pending > 0 ? 'Aguardando resposta das consultas.' : snapshot.active?.finished ? 'Dados apresentados. Você escolhe o próximo passo.' : 'Acompanhando sua navegação.';
  return <><p role="status">{status}</p><details className="on-guide-journey">
    <summary>Jornada local · {snapshot.events.length} acontecimentos</summary>
    <p>Tempos observados nesta sessão. Receber uma resposta não significa que toda a tela terminou de renderizar.</p>
    <ol>{snapshot.events.slice(-10).map(event => <li key={event.seq}>
      <span>{labels[event.type] || event.type}</span>
      <small>{event.route || event.resource || ''}{event.durationMs !== undefined ? ` · ${Math.round(event.durationMs)} ms` : ''}</small>
    </li>)}</ol>
    <small>Reusos: {stats.hits} · Antecipações aproveitadas: {stats.predictionHits} · Não aproveitadas: {stats.predictionWaste}</small>
  </details></>;
}
