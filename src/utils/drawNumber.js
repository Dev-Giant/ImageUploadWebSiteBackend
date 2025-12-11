export const formatDrawNumber = (country, city, wave, seq) => {
  return `${country}-${city}-${wave}-${String(seq).padStart(6, '0')}`;
};
