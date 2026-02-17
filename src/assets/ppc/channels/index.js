const CHANNEL_LOGOS = {
  ifood: require('./ifood.png'),
  '99food': require('./99food.png'),
  instagram: require('./instagram.png'),
  keeta: require('./keeta.png'),
  messenger: require('./messenger.png'),
  whatsapp: require('./whatsapp.png'),
}

const normalize = value =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

const matchChannel = rawValue => {
  const value = normalize(rawValue)
  if (!value) return null

  if (value.includes('ifood')) return 'ifood'
  if (value.includes('food99')) return '99food'
  if (value.includes('99food') || value.includes('99 food')) return '99food'
  if (value.includes('insta')) return 'instagram'
  if (value.includes('keeta')) return 'keeta'
  if (value.includes('messenger') || value.includes('facebook')) return 'messenger'
  if (value.includes('whats')) return 'whatsapp'
  return null
}

const extractExtraDataValues = extraData => {
  if (!extraData) return []

  if (Array.isArray(extraData)) {
    return extraData.flatMap(item =>
      [
        item?.value,
        item?.content,
        item?.label,
        item?.key,
        item?.extra_fields?.context,
        item?.extraField?.context,
      ].filter(Boolean),
    )
  }

  if (typeof extraData === 'object') {
    return Object.values(extraData).filter(value => typeof value === 'string')
  }

  if (typeof extraData === 'string') return [extraData]
  return []
}

export const getOrderChannelKey = order => {
  const candidates = [
    order?.channel,
    order?.origin,
    order?.source,
    order?.app,
    order?.integration?.name,
    ...extractExtraDataValues(order?.extraData),
  ]

  for (const candidate of candidates) {
    const key = matchChannel(candidate)
    if (key) return key
  }

  return null
}

export const getOrderChannelLogo = order => {
  const key = getOrderChannelKey(order)
  return key ? CHANNEL_LOGOS[key] : null
}

export const getOrderChannelLabel = order => {
  const key = getOrderChannelKey(order)
  if (key === '99food') return '99Food'
  if (key === 'ifood') return 'iFood'
  if (key === 'instagram') return 'Instagram'
  if (key === 'keeta') return 'Keeta'
  if (key === 'messenger') return 'Messenger'
  if (key === 'whatsapp') return 'WhatsApp'
  return normalize(order?.app || order?.channel || order?.origin || 'Balcao') || 'Balcao'
}
