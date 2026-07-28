/* eslint-disable no-useless-escape */

export function isEmail(text) {
  const expression =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  return testRegex(expression, text);
}

export function isLink(text) {
  var expression =
    /^((https?\:\/\/www\.)|(www\.)|(https?\:\/\/(?!www\.)))([a-zA-z0-9-])+(\.)([a-zA-Z0-9]{2,})+/gi;
  return testRegex(expression, text);
}

export function isPhone(text) {
  //Replace everything that is not a decimal and validate length.
  const phoneNum = text?.replace(/[^\d]/g, '');
  return phoneNum?.length >= 10 && phoneNum?.length < 14;
}

export function isHex(text) {
  var expression = /[0-9A-Fa-f]{6}/g;
  return testRegex(expression, text);
}

// TODO: leaving these here for later when we add more granular validation
export function isCanadianPostalCode(text) {
  const expression = /^[ABCEGHJ-NPRSTVXY][0-9][ABCEGHJ-NPRSTV-Z] ?[0-9][ABCEGHJ-NPRSTV-Z][0-9]$/i;
  return testRegex(expression, text);
}

export function isUsaPostalCode(text) {
  const expression = /^[0-9]{5}(-{0,1}[0-9]{4})?$/;
  return testRegex(expression, text);
}

export function numberWithCommas(x) {
  return x.toLocaleString("en-US", {minimumFractionDigits: 2});
}

export function moneyWithCommas(x) {
  if(x === undefined)
  {
    return "$0.00"
  }
  return `$${fixedWithCommas(x)}`;
}

export function fixedWithCommas(x) {
  return `${numberWithCommas(Number.parseFloat(`${x}`))}`;
}

function testRegex(expression, text) {
  var regex = new RegExp(expression);
  return regex.test(text);
}
