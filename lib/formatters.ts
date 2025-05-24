/**
 * Formats a file size in bytes to a human-readable string with appropriate units
 * @param bytes File size in bytes
 * @param decimals Number of decimal places to show
 * @returns Formatted string with appropriate unit (B, KB, MB, GB)
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
}
