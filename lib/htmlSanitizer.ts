/**
 * Sanitizes a string to prevent XSS attacks when used in HTML
 * @param unsafe The potentially unsafe string
 * @returns A sanitized string safe for HTML insertion
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

/**
 * Creates a safe HTML template by escaping all variable content
 * @param strings Template string parts
 * @param values Values to insert into the template
 * @returns Safe HTML string with escaped values
 */
export function safeHtml(strings: TemplateStringsArray, ...values: any[]): string {
  return strings.reduce((result, string, i) => {
    const value = i < values.length ? escapeHtml(String(values[i])) : ""
    return result + string + value
  }, "")
}
