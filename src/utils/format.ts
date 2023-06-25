import * as xss from 'xss';

export const toBoolean = (v: any) => {
  if ([true, 'true', 1, '1'].includes(v)) {
    return true;
  } else if ([false, 'false', 0, '0'].includes(v)) {
    return false;
  }

  return undefined;
};

export const htmlToText = (str?: string) => {
  return (
    str &&
    str
      .replace(/<.*?>/g, '')
      .replace(/&.*;/g, '')
      .replace(/\s{2,}/g, ' ')
  );
};

export const xssFilter = (str: string) => {
  return xss.filterXSS(str);
};
