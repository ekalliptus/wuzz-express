/**
 * Format a number as Indonesian Rupiah currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string,
  options: { withSymbol?: boolean; decimal?: number } = {}
): string {
  const { withSymbol = true, decimal = 0 } = options;
  
  // Parse the amount to a number if it's a string
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle non-numeric values
  if (isNaN(value)) {
    return withSymbol ? 'Rp 0' : '0';
  }
  
  // Format the number with Indonesian locale and specified decimal places
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: decimal,
    maximumFractionDigits: decimal
  });
  
  const formatted = formatter.format(value);
  
  // Remove the currency symbol if not required
  if (!withSymbol) {
    return formatted.replace(/[^\d.,]/g, '').trim();
  }
  
  return formatted;
} 