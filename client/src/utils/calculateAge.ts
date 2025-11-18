export const calculateAge = (birthDateString: string): number | null => {
  if (!birthDateString) return null;

  try {
    let birthDate: Date;
    
    // Проверяем формат DD-MM-YYYY
    const ddmmyyyyPattern = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = birthDateString.match(ddmmyyyyPattern);
    
    if (match) {
      // Формат DD-MM-YYYY: день, месяц (0-indexed), год
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // месяцы в JS начинаются с 0
      const year = parseInt(match[3], 10);
      birthDate = new Date(year, month, day);
    } else {
      // Пробуем стандартный парсинг Date
      birthDate = new Date(birthDateString);
    }
    
    // Проверяем валидность даты
    if (isNaN(birthDate.getTime())) {
      return null;
    }
    
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 0 ? age : null;
  } catch (error) {
    return null;
  }
};

