/**
 * QA tests for CEP lookup geocode miss (#696).
 * Validates the acceptance criteria:
 *   - isGeocodeMiss detects when Nominatim returns no coords but address text exists
 *   - mergePostalCodeData propagates null coords (does not preserve stale values)
 *   - GEOCODE_MISS_MESSAGE is in PT and mentions lat/long fields
 *   - parseOptionalCoordinate handles comma-decimal input
 *
 * These are integration tests running against the ui-default submodule code.
 */
import {
  GEOCODE_MISS_MESSAGE,
  isGeocodeMiss,
  mergePostalCodeData,
  parseOptionalCoordinate,
} from '@controleonline/ui-default/src/react/services/addressFormUtils';

describe('geocode miss (#696) — QA acceptance criteria', () => {
  // AC: CEP 12924-022 (Rua Lotus, Bragança Paulista) — Nominatim returns no coords
  test('isGeocodeMiss: true when address text present and coords are null', () => {
    expect(
      isGeocodeMiss({
        street: 'Rua Lotus',
        district: 'Condomínio Jardim das Palmeiras',
        city: 'Bragança Paulista',
        uf: 'SP',
        latitude: null,
        longitude: null,
      }),
    ).toBe(true);
  });

  // AC: CEP 12941-040 (Rua Antônio Bonini, Atibaia) — Nominatim finds coords
  test('isGeocodeMiss: false when Nominatim returns valid coordinates', () => {
    expect(
      isGeocodeMiss({
        street: 'Rua Antônio Bonini',
        district: 'Vila Santista',
        city: 'Atibaia',
        uf: 'SP',
        latitude: -23.12,
        longitude: -46.55,
      }),
    ).toBe(false);
  });

  test('isGeocodeMiss: false when no address text (empty response)', () => {
    expect(isGeocodeMiss({latitude: null, longitude: null})).toBe(false);
    expect(isGeocodeMiss(null)).toBe(false);
    expect(isGeocodeMiss({})).toBe(false);
  });

  // AC: mergePostalCodeData must NOT preserve previous coords when new lookup returns null
  test('mergePostalCodeData: clears previous coords when new lookup returns null', () => {
    const prev = {
      street: 'Rua Antônio Bonini',
      latitude: -23.12,
      longitude: -46.55,
      number: '100',
      complement: '',
      nickname: '',
      cep: '12941040',
    };
    const next = mergePostalCodeData(prev, {
      cep: '12924022',
      street: 'Rua Lotus',
      city: 'Bragança Paulista',
      uf: 'SP',
      latitude: null,
      longitude: null,
    });
    expect(next.street).toBe('Rua Lotus');
    expect(next.city).toBe('Bragança Paulista');
    expect(next.latitude).toBeNull();
    expect(next.longitude).toBeNull();
    // preserved user fields
    expect(next.number).toBe('100');
  });

  // AC: message must be visible and in Portuguese
  // These exact substrings are contractual per issue #696:
  // "Não foi possível obter a localização no mapa para este endereço.
  //  Você pode ajustar latitude e longitude manualmente."
  test('GEOCODE_MISS_MESSAGE: is non-empty Portuguese text mentioning lat/long', () => {
    expect(typeof GEOCODE_MISS_MESSAGE).toBe('string');
    expect(GEOCODE_MISS_MESSAGE.length).toBeGreaterThan(10);
    expect(GEOCODE_MISS_MESSAGE).toMatch(/localização no mapa/);
    expect(GEOCODE_MISS_MESSAGE).toMatch(/latitude e longitude/);
  });

  // AC: user can type comma-decimal coordinates (mobile keyboards)
  test('parseOptionalCoordinate: accepts comma as decimal separator', () => {
    expect(parseOptionalCoordinate('-23,5505')).toBeCloseTo(-23.5505);
    expect(parseOptionalCoordinate('-46,633')).toBeCloseTo(-46.633);
  });

  test('parseOptionalCoordinate: returns null for empty/invalid input', () => {
    expect(parseOptionalCoordinate('')).toBeNull();
    expect(parseOptionalCoordinate(null)).toBeNull();
    expect(parseOptionalCoordinate(undefined)).toBeNull();
    expect(parseOptionalCoordinate('abc')).toBeNull();
  });
});
