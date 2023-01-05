export const toBoolean = (v: any) => {
  if ([true, 'true', 1, '1'].includes(v)) {
    return true;
  } else if ([false, 'false', 0, '0'].includes(v)) {
    return false;
  }

  return undefined;
};
