/**
 * Utility formatters for common data types
 */

/**
 * Format number as currency (FCFA)
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (!value) return '0 FCFA';

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return '0 FCFA';

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF', // West African CFA franc
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format date as DD/MM/YYYY
 */
export function formatDate(
  date: string | Date | null | undefined,
  format: 'short' | 'long' = 'short'
): string {
  if (!date) return 'N/A';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return 'N/A';

    if (format === 'long') {
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(dateObj);
    }

    // Short format: DD/MM/YYYY
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return 'N/A';
  }
}

/**
 * Format datetime as "DD/MM/YYYY HH:mm"
 */
export function formatDateTime(datetime: string | Date | null | undefined): string {
  if (!datetime) return 'N/A';

  try {
    const dateObj = typeof datetime === 'string' ? new Date(datetime) : datetime;

    if (isNaN(dateObj.getTime())) return 'N/A';

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return 'N/A';
  }
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals = 2): string {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with separators
 */
export function formatNumber(value: number | string, decimals = 0): string {
  if (!value) return '0';

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return '0';

  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format phone number
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return 'N/A';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as +XXX XX XX XX XX XX (French format)
  if (cleaned.length >= 9) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }

  return phone;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string | null | undefined, maxLength = 50): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string | null | undefined): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Format status display with color hint
 */
export function formatStatus(
  status: string,
  labels?: Record<string, string>
): string {
  if (labels && labels[status]) {
    return labels[status];
  }

  // Default capitalization
  return capitalize(status);
}

/**
 * Parse date string to ISO format
 */
export function parseDate(dateString: string): string | null {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 30) return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;

    return formatDate(dateObj);
  } catch {
    return 'N/A';
  }
}
