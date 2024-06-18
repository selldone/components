export const isBefore = (date, dateBounds) => {
  const startingDate = Math.min(
    ...dateBounds.map((d) => new Date(d).getTime()),
  );

  return new Date(date).getTime() < startingDate;
};
