function isInValid(element: unknown): boolean {
  return (
    element === undefined ||
    element === null ||
    (typeof element === 'string' && element.trim() === '') ||
    (Array.isArray(element) && element.length === 0)
  );
}

export const requestBodyValidation = (datas: unknown[]): boolean => {
  const hasInvalid = datas.some(isInValid);
  return !hasInvalid;
};
