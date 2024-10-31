function formatDigits(num: number) {
  return num.toString().padStart(2, "0");
}

export const getDateFormat = (dateSting: string) => {
  const date = new Date(dateSting);
  return (
    [
      formatDigits(date.getDate()),
      formatDigits(date.getMonth() + 1),
      String(date.getFullYear()).slice(2),
    ].join(".") +
    " " +
    [
      formatDigits(date.getHours()),
      formatDigits(date.getMinutes()),
      formatDigits(date.getSeconds()),
    ].join(":")
  );
};
