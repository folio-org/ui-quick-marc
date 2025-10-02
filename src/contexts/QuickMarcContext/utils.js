export const getIsSharedFromUrl = (searchQuery) => {
  return new URLSearchParams(searchQuery).get('shared') === 'true';
};
