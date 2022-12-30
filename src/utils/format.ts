export const toBoolean = (v: any) => {
  if ([true, 1, '1'].includes(v)) {
    return true;
  } else if ([false, 0, '0'].includes(v)) {
    return false;
  }

  return undefined;
};
