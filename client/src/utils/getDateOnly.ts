function formatDigits(num: number) {
  return num.toString().padStart(2, "0");
}

export const getDateOnly = (dateString: string): string => {
  if (!dateString) return "-";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Пробуем парсить формат DD-MM-YYYY
      const ddmmyyyyPattern = /^(\d{2})-(\d{2})-(\d{4})$/;
      const match = dateString.match(ddmmyyyyPattern);
      if (match) {
        const day = match[1];
        const month = match[2];
        const year = match[3];
        return `${day}.${month}.${year}`;
      }
      return dateString;
    }
    return [
      formatDigits(date.getDate()),
      formatDigits(date.getMonth() + 1),
      String(date.getFullYear()).slice(2),
    ].join(".");
  } catch (error) {
    return dateString;
  }
};

