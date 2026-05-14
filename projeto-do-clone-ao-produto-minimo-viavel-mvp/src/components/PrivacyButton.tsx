import React, { useState } from 'react';
import { ShieldCheck, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrivacyButtonProps {
  imageUrl: string;
  fileName: string;
}

export function PrivacyButton({ imageUrl, fileName }: PrivacyButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const removeMetadata = async () => {
    setIsProcessing(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      ctx.drawImage(img, 0, 0);
      
      // toBlob strips metadata by default as it only encodes pixel data
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const extension = fileName.split('.').pop() || 'jpg';
        link.href = url;
        link.download = `mdata-clean.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsProcessing(false);
      }, 'image/jpeg', 0.9);
      
    } catch (error) {
      console.error('Error removing metadata:', error);
      alert('Erro ao processar imagem.');
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      onClick={removeMetadata} 
      disabled={isProcessing}
      variant="secondary"
      className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white border-none"
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ShieldCheck className="h-4 w-4" />
      )}
      {isProcessing ? 'Limpando...' : 'Remover Metadados e Baixar'}
    </Button>
  );
}
