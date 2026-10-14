import {StyleSheet} from 'react-native';

export default function createStyles({colors = {}, width = 1024}) {
  const palette = {
    primary: colors.primary,
    surface: colors.cardBackground,
    background: colors.pageBackground,
    border: colors.cardBorder,
    text: colors.textPrimary,
    muted: colors.textMuted,
  };
  const cardIconBackground = colors.cardIconBackground;
  const cardIconColor = colors.cardIconColor;
  const iconBackground = colors.iconBackground;
  const iconColor = colors.iconColor;

  palette.sectionTone = {
    background: iconBackground,
    foreground: iconColor,
  };
  palette.segmentTone = {
    background: cardIconBackground,
    foreground: cardIconColor,
  };

  const isCompact = width < 700;
  const gap = isCompact ? 10 : 12;
  const columns = width < 520 ? 2 : width < 980 ? 3 : 4;
  const cardWidth = `${100 / columns}%`;

  return {
    palette,
    ...StyleSheet.create({
      wrapper: {
        gap: 18,
      },
      section: {
        gap: 12,
      },
      sectionHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 9,
      },
      sectionIcon: {
        alignItems: 'center',
        backgroundColor: palette.sectionTone.background,
        borderRadius: 6,
        height: 28,
        justifyContent: 'center',
        width: 28,
      },
      sectionTitle: {
        color: palette.text,
        fontSize: isCompact ? 15 : 16,
        fontWeight: '800',
      },
      infoButton: {
        height: 20,
        marginLeft: 2,
        width: 20,
      },
      grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -gap / 2,
        rowGap: gap,
      },
      cardOuter: {
        flexBasis: cardWidth,
        maxWidth: cardWidth,
        minWidth: cardWidth,
        paddingHorizontal: gap / 2,
      },
      card: {
        alignItems: 'center',
        backgroundColor: palette.surface,
        borderColor: palette.border,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: 'row',
        gap: 14,
        justifyContent: 'flex-start',
        minHeight: 80,
        padding: 12,
        shadowColor: palette.text,
        shadowOffset: {height: 1, width: 0},
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      cardIcon: {
        alignItems: 'center',
        borderRadius: 8,
        height: 38,
        justifyContent: 'center',
        width: 38,
      },
      cardLabel: {
        color: palette.text,
        flex: 1,
        fontSize: isCompact ? 13 : 14,
        fontWeight: '700',
        lineHeight: isCompact ? 17 : 18,
        textAlign: 'left',
      },
      cardLabelCompact: {
        fontSize: isCompact ? 11 : 12,
        lineHeight: isCompact ? 15 : 16,
      },
      emptyBox: {
        alignItems: 'center',
        backgroundColor: palette.surface,
        borderColor: palette.border,
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 22,
      },
      emptyText: {
        color: palette.muted,
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
      },
    }),
  };
}
