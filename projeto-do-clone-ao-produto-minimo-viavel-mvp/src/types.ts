export type AppState = 'idle' | 'loading' | 'success' | 'error';

export type MetadataCategory = 'File' | 'EXIF' | 'GPS' | 'IPTC' | 'XMP';

export interface MetadataValue {
  label: string;
  value: string | number | null;
}

export interface ExifData {
  File: MetadataValue[];
  EXIF: MetadataValue[];
  GPS: MetadataValue[];
  IPTC: MetadataValue[];
  XMP: MetadataValue[];
  ICC: MetadataValue[];
  JFIF: MetadataValue[];
  Midia: MetadataValue[];
  Outros: MetadataValue[];
}

export interface GPSCoords {
  lat: number;
  lng: number;
}
