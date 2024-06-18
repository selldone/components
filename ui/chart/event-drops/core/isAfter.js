export const isAfter = (date, dateBounds) => {
  const endingDate = Math.max(...dateBounds.map((d) => new Date(d).getTime()));

  return new Date(date).getTime() > endingDate;
};
