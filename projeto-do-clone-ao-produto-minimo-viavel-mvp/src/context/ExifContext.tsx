import React, { useState, useCallback, createContext, useContext } from 'react';
import exifr from 'exifr';
import * as mm from 'music-metadata-browser';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '@/firebase';
import { AppState, ExifData, GPSCoords, MetadataValue } from '../types';

interface ExifContextType {
  state: AppState;
  data: ExifData | null;
  previewUrl: string | null;
  gps: GPSCoords | null;
  error: string | null;
  processFile: (file: File) => Promise<void>;
  reset: () => void;
}

const ExifContext = createContext<ExifContextType | undefined>(undefined);

export function ExifProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>('idle');
  const [data, setData] = useState<ExifData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [gps, setGps] = useState<GPSCoords | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setState('idle');
    setData(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setGps(null);
    setError(null);
  }, [previewUrl]);

  const processFile = async (file: File) => {
    setState('loading');
    setError(null);
    
    // Create local preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isAudio = file.type.startsWith('audio/');

      let dimensions = { width: 0, height: 0 };
      let duration = 0;

      // Map raw data to our structured format
      const mappedData: ExifData = {
        File: [
          { label: 'Nome do Arquivo', value: file.name },
          { label: 'Tamanho', value: `${(file.size / 1024).toFixed(2)} KB` },
          { label: 'Tipo', value: file.type },
          { label: 'Última Modificação', value: new Date(file.lastModified).toLocaleString() },
        ],
        EXIF: [],
        GPS: [],
        IPTC: [],
        XMP: [],
        ICC: [],
        JFIF: [],
        Midia: [],
        Outros: [],
      };

      // Get dimensions and duration based on type
      if (isImage) {
        dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
          img.onerror = () => resolve({ width: 0, height: 0 });
          img.src = url;
        });
        if (dimensions.width > 0) {
          mappedData.File.push({ label: 'Resolução', value: `${dimensions.width} x ${dimensions.height}` });
          const mp = (dimensions.width * dimensions.height) / 1000000;
          mappedData.File.push({ label: 'Megapixels', value: `${mp.toFixed(2)} MP` });
        }
      } else if (isVideo) {
        const videoData = await new Promise<{ width: number; height: number; duration: number }>((resolve) => {
          const video = document.createElement('video');
          video.onloadedmetadata = () => resolve({ width: video.videoWidth, height: video.videoHeight, duration: video.duration });
          video.onerror = () => resolve({ width: 0, height: 0, duration: 0 });
          video.src = url;
        });
        dimensions = { width: videoData.width, height: videoData.height };
        duration = videoData.duration;
        if (dimensions.width > 0) {
          mappedData.File.push({ label: 'Resolução', value: `${dimensions.width} x ${dimensions.height}` });
          const mp = (dimensions.width * dimensions.height) / 1000000;
          mappedData.File.push({ label: 'Megapixels', value: `${mp.toFixed(2)} MP` });
        }
        if (duration > 0) {
          mappedData.File.push({ label: 'Duração', value: `${duration.toFixed(2)}s` });
        }
      } else if (isAudio) {
        duration = await new Promise<number>((resolve) => {
          const audio = new Audio();
          audio.onloadedmetadata = () => resolve(audio.duration);
          audio.onerror = () => resolve(0);
          audio.src = url;
        });
        if (duration > 0) {
          mappedData.File.push({ label: 'Duração', value: `${duration.toFixed(2)}s` });
        }
      }

      // Extract metadata using exifr (for images/some videos)
      let rawData: any = null;
      if (isImage || isVideo) {
        try {
          rawData = await exifr.parse(file, {
            tiff: true,
            ifd0: true,
            exif: true,
            gps: true,
            iptc: true,
            xmp: true,
            icc: true,
            jfif: true,
            reviveValues: true,
            translateKeys: true,
            mergeOutput: true,
          } as any);
        } catch (e) {
          console.warn('Exifr could not parse metadata:', e);
        }
      }

      // Extract metadata using music-metadata-browser (for audio/video)
      let mmData: mm.IAudioMetadata | null = null;
      if (isAudio || isVideo) {
        try {
          mmData = await mm.parseBlob(file);
        } catch (e) {
          console.warn('Music-metadata could not parse metadata:', e);
        }
      }

      // Helper to format labels (e.g., "BitsPerSample" -> "Bits Per Sample")
      const formatLabel = (key: string) => {
        return key
          .replace(/([A-Z])/g, ' $1') // Add space before capital letters
          .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
          .trim();
      };

      // Map exifr data
      if (rawData) {
        const handledKeys = new Set<string>();
        const addPretty = (category: keyof ExifData, label: string, key: string) => {
          if (rawData[key] !== undefined && rawData[key] !== null) {
            mappedData[category].push({ label, value: String(rawData[key]) });
            handledKeys.add(key);
          }
        };

        addPretty('EXIF', 'Fabricante', 'Make');
        addPretty('EXIF', 'Modelo', 'Model');
        addPretty('EXIF', 'Software', 'Software');
        addPretty('EXIF', 'Tempo de Exposição', 'ExposureTime');
        addPretty('EXIF', 'Abertura', 'FNumber');
        addPretty('EXIF', 'ISO', 'ISO');
        addPretty('EXIF', 'Distância Focal', 'FocalLength');
        addPretty('EXIF', 'Data/Hora Original', 'DateTimeOriginal');
        addPretty('EXIF', 'Orientação', 'Orientation');

        if (rawData.latitude && rawData.longitude) {
          const coords = { lat: rawData.latitude, lng: rawData.longitude };
          setGps(coords);
          mappedData.GPS.push({ label: 'Latitude', value: coords.lat.toFixed(6) });
          mappedData.GPS.push({ label: 'Longitude', value: coords.lng.toFixed(6) });
          handledKeys.add('latitude');
          handledKeys.add('longitude');
        }

        addPretty('IPTC', 'Título', 'ObjectName');
        addPretty('IPTC', 'Legenda', 'Caption-Abstract');
        addPretty('IPTC', 'Crédito', 'Credit');
        addPretty('IPTC', 'Copyright', 'CopyrightNotice');

        Object.entries(rawData).forEach(([key, value]) => {
          if (handledKeys.has(key)) return;
          if (value === undefined || value === null) return;
          
          // Filter out "Native Digest" as it's often too large and technical
          if (key.toLowerCase().includes('nativedigest')) return;

          const label = formatLabel(key);
          const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
          
          if (key.startsWith('GPS')) mappedData.GPS.push({ label, value: stringValue });
          else if (key.includes('XMP') || key.startsWith('xmp')) mappedData.XMP.push({ label, value: stringValue });
          else if (key.includes('IPTC')) mappedData.IPTC.push({ label, value: stringValue });
          else if (key.startsWith('ICC')) mappedData.ICC.push({ label, value: stringValue });
          else if (key.startsWith('JFIF')) mappedData.JFIF.push({ label, value: stringValue });
          else mappedData.Outros.push({ label, value: stringValue });
        });
      }

      // Map music-metadata
      if (mmData) {
        const common = mmData.common;
        const format = mmData.format;

        if (common.title) mappedData.Midia.push({ label: 'Título', value: common.title });
        if (common.artist) mappedData.Midia.push({ label: 'Artista', value: common.artist });
        if (common.album) mappedData.Midia.push({ label: 'Álbum', value: common.album });
        if (common.year) mappedData.Midia.push({ label: 'Ano', value: String(common.year) });
        if (common.genre) mappedData.Midia.push({ label: 'Gênero', value: common.genre.join(', ') });
        
        if (format.bitrate) mappedData.Midia.push({ label: 'Bitrate', value: `${(format.bitrate / 1000).toFixed(0)} kbps` });
        if (format.sampleRate) mappedData.Midia.push({ label: 'Sample Rate', value: `${format.sampleRate} Hz` });
        if (format.container) mappedData.Midia.push({ label: 'Container', value: format.container });
        if (format.codec) mappedData.Midia.push({ label: 'Codec', value: format.codec });
        if (format.numberOfChannels) mappedData.Midia.push({ label: 'Canais', value: String(format.numberOfChannels) });
      }

      // Sort categories alphabetically
      Object.keys(mappedData).forEach((cat) => {
        const category = cat as keyof ExifData;
        if (category !== 'File') { // Keep File info in original order
          mappedData[category].sort((a, b) => a.label.localeCompare(b.label));
        }
      });

      setData(mappedData);
      setState('success');

      // Save to history if user is logged in
      if (auth.currentUser) {
        const historyPath = 'history';
        try {
          await addDoc(collection(db, historyPath), {
            userId: auth.currentUser.uid,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            metadata: mappedData,
            timestamp: new Date().toISOString()
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.CREATE, historyPath);
        }
      }
    } catch (err: any) {
      console.error('Error processing file:', err);
      setError(err.message || 'Failed to process file. Please try another file.');
      setState('error');
    }
  };

  return (
    <ExifContext.Provider value={{ state, data, previewUrl, gps, error, processFile, reset }}>
      {children}
    </ExifContext.Provider>
  );
}

export function useExif() {
  const context = useContext(ExifContext);
  if (context === undefined) {
    throw new Error('useExif must be used within an ExifProvider');
  }
  return context;
}
