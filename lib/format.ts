// Currency formatting for Indonesian Rupiah
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Date formatting for Indonesian locale
export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Jakarta'
  }).format(new Date(dateString));
};

export const formatDateTime = (dateString: string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  }).format(new Date(dateString));
};

// Format date for input fields (YYYY-MM-DD)
export const formatDateForInput = (dateString: string): string => {
  return new Date(dateString).toISOString().split('T')[0];
};

// Get current date in ISO format for default values
export const getCurrentDate = (): string => {
  return new Date().toISOString();
};

// Get date range for filtering (start and end of month/year)
export const getDateRange = (period: 'month' | 'year', date?: Date) => {
  const baseDate = date || new Date();
  
  if (period === 'month') {
    const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
    return { start: start.toISOString(), end: end.toISOString() };
  } else {
    const start = new Date(baseDate.getFullYear(), 0, 1);
    const end = new Date(baseDate.getFullYear(), 11, 31);
    return { start: start.toISOString(), end: end.toISOString() };
  }
};

export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Kemarin';  
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
  return `${Math.floor(diffDays / 365)} tahun lalu`;
};