export const LABOUR_SUBCATEGORIES = [
  'E2T Civil Work',
  'E2T Tile Work',
  'E2T Plumbing Work',
  'BDT Installation',
  'ACP Installation',
  'Welder',
  'Plumber',
  'Helper',
  'Other'
];

export const TRANSPORT_SUBCATEGORIES = [
  'Petrol',
  'Diesel',
  'FastTag',
  'Police Entry',
  'Other'
];

export const LODGING_SUBCATEGORIES = [
  'Hotel-GST',
  'Hotel-No GST',
  'Rent',
  'Godown',
  'Other'
];

export const PURCHASE_SUBCATEGORIES = [
  'Material-GST',
  'Material-No GST',
  'Other'
];

export const MISCELLANEOUS_SUBCATEGORIES = [
  'Other-Remark'
];

export const TRAVEL_SUBCATEGORIES = [
  'Bus',
  'Train',
  'Air',
  'Car',
  'Auto',
  'Bike',
  'Other'
];

export const isLabourCategory = (cat) => {
  if (!cat) return false;
  const c = String(cat).toLowerCase();
  return c.includes('labour') || c.includes('labor') || c.includes('contractor') || c.includes('wages');
};

export const isTransportCategory = (cat) => {
  if (!cat) return false;
  const c = String(cat).toLowerCase();
  return (c.includes('transport') || c.includes('logistics') || c.includes('freight')) && !c.includes('travel');
};

export const isLodgingCategory = (cat) => {
  if (!cat) return false;
  const c = String(cat).toLowerCase();
  return c.includes('lodging') || c.includes('hotel') || c.includes('boarding') || c.includes('room') || c.includes('stay');
};

export const isPurchaseCategory = (cat) => {
  if (!cat) return false;
  const c = String(cat).toLowerCase();
  return c.includes('purchase') || c.includes('material');
};

export const isMiscellaneousCategory = (cat) => {
  if (!cat) return false;
  const c = String(cat).toLowerCase();
  return c.includes('misc') || c.includes('emergency');
};

export const isTravelCategory = (cat) => {
  if (!cat) return false;
  const c = String(cat).toLowerCase();
  return c.includes('travel') || c.includes('conveyance');
};

export const isDailyAllowanceCategory = (cat) => {
  if (!cat) return false;
  const c = String(cat).toLowerCase();
  return c.includes('daily') || c.includes('allowance') || c.includes('bhatta') || c.includes('da');
};

export const extractSubCategory = (description) => {
  if (!description) return null;
  const match = String(description).match(/^\[(.*?)\]/);
  return match ? match[1].trim() : null;
};

export const cleanDescription = (description) => {
  if (!description) return '';
  return String(description).replace(/^\[(.*?)\]\s*/, '').trim();
};

export const formatSubCategoryDisplay = (category, subCategory) => {
  if (!subCategory) return null;
  if (isDailyAllowanceCategory(category)) {
    const match = String(subCategory).match(/(\d+(?:\.\d+)?\s*days?)/i);
    return match ? match[1] : null;
  }
  return subCategory;
};
