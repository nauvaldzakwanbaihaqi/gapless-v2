/**
 * Utility helper to trigger client-side browser file download from a Blob
 */
export function downloadBlobFile(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}
