export const is999ffRow = recordRow => {
  return (
    recordRow.tag === '999'
    && recordRow.indicators
    && recordRow.indicators[0] === 'f'
    && recordRow.indicators[0] === 'f'
  )
};
