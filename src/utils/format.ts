export const toBoolean = (v: any) => {
  if (v === '1' || v === 1) {
    return true;
  } else if (v === '0' || v === 0) {
    return false;
  }

  return v;
};
