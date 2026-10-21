export function resolveGuideStep(route, items = []) {
  if (route === 'HomePage') {
    const destination = ['OrderHistoryPage', 'DevicesIndex', 'ClientsIndex']
      .map(name => items.find(item => item.name === name)).find(Boolean) || null;
    return {title: 'Um próximo passo?',
      message: destination ? `Quer conferir ${destination.title.toLowerCase()}? Posso abrir essa área para você.` : 'Explore as áreas disponíveis no menu. Estou aqui quando precisar.',
      destination};
  }
  const messages = {
    OrderHistoryPage: 'Use os filtros para escolher o período e a situação dos pedidos. Abra um pedido para acompanhar seus detalhes.',
    ProfilePage: 'Aqui você encontra seu perfil e as opções da sua conta. Qualquer alteração continua sob sua escolha.',
    DevicesIndex: 'Escolha um dispositivo para consultar suas configurações. Cada equipamento pode ter uma função diferente na operação.',
    ClientsIndex: 'Busque um cliente pelo nome ou use os filtros. Selecione um cadastro para consultar seus detalhes.',
    IncomeStatement: 'Confira a empresa e o período antes de interpretar os resultados.',
  };
  return {title: 'Vamos por partes', message: messages[route] || 'Explore esta área no seu ritmo. Você pode usar o menu para mudar de caminho a qualquer momento.', destination: null};
}

// Session-only navigation observations. Do not retain payloads or conversation.
export function appendGuideEvent(events, event) {
  const next = {type: event.type, route: event.route};
  if (event.target) next.target = event.target;
  return [...events, next].slice(-20);
}
