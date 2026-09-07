export const formatId = (prefix, id, number = null) => {
  if (number) return `${prefix}-${number}`;
  if (!id) return '';
  return `${prefix}-${id.split('-')[0].toUpperCase()}`;
};
