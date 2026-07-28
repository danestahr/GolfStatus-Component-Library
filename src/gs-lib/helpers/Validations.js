import { isEmail, isLink, isPhone, isCanadianPostalCode, isUsaPostalCode } from './RegexHelper';

export function validEmail(value) {
  return value === undefined || isEmail(value);
}

export function validLink(value) {
  return value === undefined || isLink(value);
}

export function validPhone(value) {
  return value === undefined || isPhone(value);
}

export function validPostalCode(value, country) {
  if (value === undefined) {
    return true;
  }

  switch (country) {
    case "USA":
      return isUsaPostalCode(value);
    case "CA":
      return isCanadianPostalCode(value);
    default:
      return true;
  }
}

export const validations = {validEmail, validLink, validPhone, validPostalCode};
