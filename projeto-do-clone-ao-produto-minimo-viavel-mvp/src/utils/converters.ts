/**
 * Converts EXIF DMS (Degrees, Minutes, Seconds) coordinates to Decimal.
 */
export function dmsToDecimal(dms: number[], ref: string): number {
  if (!dms || dms.length < 3) return 0;
  
  const degrees = dms[0];
  const minutes = dms[1];
  const seconds = dms[2];
  
  let decimal = degrees + minutes / 60 + seconds / 3600;
  
  if (ref === 'S' || ref === 'W') {
    decimal = decimal * -1;
  }
  
  return decimal;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
