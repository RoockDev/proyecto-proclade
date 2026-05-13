const REGION_PHONE_DIGITS = 9;

export const normalizeRegionPhone = (value: string | null | undefined): string =>
  (value ?? '').replace(/\D+/g, '').slice(0, REGION_PHONE_DIGITS);

export const formatRegionPhone = (value: string | null | undefined): string => {
  const digits = normalizeRegionPhone(value);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 5) {
    return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
  }

  return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
};

export const hasCompleteRegionPhone = (value: string | null | undefined): boolean =>
  normalizeRegionPhone(value).length === REGION_PHONE_DIGITS;
