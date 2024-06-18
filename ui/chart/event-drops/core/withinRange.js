export const withinRange = (date, dateBounds) => {
  const timestamps = dateBounds.map(d => new Date(d).getTime());
  const startingDate = Math.min(...timestamps);
  const endingDate = Math.max(...timestamps);

  const dateTimestamp = new Date(date).getTime();
  return dateTimestamp >= startingDate && dateTimestamp <= endingDate;
};
