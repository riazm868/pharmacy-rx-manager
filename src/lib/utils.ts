/**
 * Format a date string to a more readable format
 * @param dateString ISO date string
 * @returns Formatted date string (MM/DD/YYYY)
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

/**
 * Combine class names conditionally
 * @param inputs Class names to combine
 * @returns Combined class string
 */
export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}
