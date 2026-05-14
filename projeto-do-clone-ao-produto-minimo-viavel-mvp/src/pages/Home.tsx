import React, { ChangeEvent, useState, useEffect } from 'react';
import { useExif } from '@/context/ExifContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, AlertCircle, RefreshCcw, FileJson, FileText, LogIn, Music, Video, File as FileIcon, Clock } from 'lucide-react';
import { FilterBar } from '@/components/FilterBar';
import { PrivacyButton } from '@/components/PrivacyButton';

import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Home() {
  const { state, data, previewUrl, processFile, reset, error } = useExif();
  const { user, loading: authLoading, login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch recent history
  useEffect(() => {
    const fetchRecent = async () => {
      if (!user) return;
      const historyPath = 'history';
      try {
        const q = query(
          collection(db, historyPath),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(3)
        );
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentHistory(items);
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, historyPath);
      }
    };
    fetchRecent();
  }, [user, state]); // Refetch when user changes or new file is processed

  // Determine media type for preview
  const fileType = data?.File.find(f => f.label === 'Tipo')?.value as string || '';
  const isImage = fileType.startsWith('image/');
  const isVideo = fileType.startsWith('video/');
  const isAudio = fileType.startsWith('audio/');

  const categories = data ? Object.keys(data).filter(cat => data[cat as keyof typeof data].length > 0) : [];

  const filteredData = React.useMemo(() => {
    if (!data) return null;
    
    const result: any = {};
    Object.entries(data).forEach(([category, values]) => {
      if (selectedCategory !== 'all' && category !== selectedCategory) return;
      
      const filteredValues = values.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.value.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (filteredValues.length > 0) {
        result[category] = filteredValues;
      }
    });
    return result;
  }, [data, searchQuery, selectedCategory]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    await login();
    setIsLoggingIn(false);
  };

  const exportData = (format: 'json' | 'txt') => {
    if (!data) return;

    let content = '';
    let mimeType = '';
    let fileName = `metadata-${Date.now()}`;

    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      fileName += '.json';
    } else {
      Object.entries(data).forEach(([category, values]) => {
        if (values.length > 0) {
          content += `=== ${category} ===\n`;
          values.forEach((item: any) => {
            content += `${item.label}: ${item.value}\n`;
          });
          content += '\n';
        }
      });
      mimeType = 'text/plain';
      fileName += '.txt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {state === 'idle' && (
        <div className="space-y-24">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-100">
                Veja os metadados de <span className="text-blue-500">qualquer mídia.</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                Análise rápida e segura diretamente no navegador, com histórico opcional sincronizado na sua conta.
              </p>
            </div>

            <div className="w-full max-w-xl space-y-8">
              <label className="relative group block cursor-pointer">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,video/*,audio/*"
                  onChange={handleFileChange}
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-700 bg-gray-800 p-12 rounded-xl hover:border-blue-500 transition-all">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 mb-4">
                    <Upload className="h-8 w-8 text-gray-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-100">Clique para carregar ou arraste e solte</p>
                    <p className="text-sm text-gray-500 mt-1">Imagens, Vídeos ou Áudios (máx 50MB)</p>
                  </div>
                  <Button className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-8 pointer-events-none">
                    Selecionar Arquivo
                  </Button>
                </div>
              </label>

              {!user && !authLoading && (
                <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/50 flex flex-col items-center gap-4">
                  <p className="text-sm text-gray-400 text-center">
                    Faça login com sua conta Google para salvar seu histórico de análises e acessar recursos avançados.
                  </p>
                  <Button 
                    onClick={handleLogin} 
                    variant="outline"
                    size="sm"
                    className="border-gray-700 hover:bg-gray-800 gap-2"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogIn className="h-4 w-4" />
                    )}
                    {isLoggingIn ? 'Entrando...' : 'Entrar com Google'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {state === 'loading' && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
          <p className="text-lg font-medium text-gray-400">Extraindo metadados...</p>
        </div>
      )}

      {state === 'error' && (
        <div className="flex flex-col items-center justify-center py-24 space-y-6 max-w-md mx-auto text-center">
          <div className="h-16 w-16 rounded-full bg-red-950/30 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-100">Falha no Processamento</h2>
            <p className="text-gray-400">{error || 'Ocorreu um erro ao ler o arquivo.'}</p>
          </div>
          <Button onClick={reset} variant="outline" className="gap-2 border-gray-700 hover:bg-gray-800">
            <RefreshCcw className="h-4 w-4" />
            Tentar Novamente
          </Button>
        </div>
      )}

      {state === 'success' && data && (
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-100">Resultados dos Metadados</h2>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => exportData('json')} 
                variant="outline" 
                size="sm" 
                className="gap-2 bg-gray-800 border-gray-700 hover:bg-gray-700"
              >
                <FileJson className="h-4 w-4" />
                Exportar JSON
              </Button>
              <Button 
                onClick={() => exportData('txt')} 
                variant="outline" 
                size="sm" 
                className="gap-2 bg-gray-800 border-gray-700 hover:bg-gray-700"
              >
                <FileText className="h-4 w-4" />
                Exportar TXT
              </Button>
              <Button onClick={reset} variant="outline" size="sm" className="gap-2 bg-gray-800 border-gray-700 hover:bg-gray-700">
                <RefreshCcw className="h-4 w-4" />
                Novo Upload
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-700 bg-gray-800 shadow-sm overflow-hidden flex items-center justify-center min-h-[300px]">
                {previewUrl && (
                  <>
                    {isImage && (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-auto object-contain max-h-[500px]"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    {isVideo && (
                      <video 
                        src={previewUrl} 
                        controls 
                        className="w-full h-auto max-h-[500px]"
                      />
                    )}
                    {isAudio && (
                      <div className="flex flex-col items-center justify-center p-12 space-y-6 w-full">
                        <div className="h-24 w-24 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Music className="h-12 w-12 text-blue-500" />
                        </div>
                        <audio 
                          src={previewUrl} 
                          controls 
                          className="w-full"
                        />
                      </div>
                    )}
                    {!isImage && !isVideo && !isAudio && (
                      <div className="flex flex-col items-center justify-center p-12 space-y-4">
                        <FileIcon className="h-16 w-16 text-gray-500" />
                        <p className="text-gray-400">Arquivo carregado</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              {isImage && previewUrl && (
                <PrivacyButton 
                  imageUrl={previewUrl} 
                  fileName={data.File.find(f => f.label === 'Nome do Arquivo')?.value as string || 'image.jpg'} 
                />
              )}
            </div>
            <div className="space-y-6">
              <div className="rounded-xl border border-gray-700 bg-gray-800 shadow-sm p-6">
                <FilterBar 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  categories={categories}
                />
                <div className="divide-y divide-gray-700 border-t border-gray-700 pt-4">
                  {filteredData && Object.entries(filteredData).map(([category, values]) => (
                    <div key={category} className="py-6 first:pt-0 space-y-4">
                      <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider">{category}</h3>
                      <div className="space-y-2">
                        {(values as any[]).map((item, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-start justify-between text-sm py-2 border-b border-gray-700/50 last:border-0 gap-1 sm:gap-4">
                            <span className="text-gray-400 sm:w-1/3 shrink-0 font-medium">{item.label}</span>
                            <span className="text-gray-100 font-medium text-left sm:text-right break-all sm:break-words overflow-hidden">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {filteredData && Object.keys(filteredData).length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-gray-500">Nenhum metadado encontrado para os filtros aplicados.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {user && recentHistory.length > 0 && state === 'idle' && (
        <div className="mt-16 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Histórico Recente
            </h2>
            <Link to="/history" className="text-sm text-blue-500 hover:underline">Ver tudo</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentHistory.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-gray-700 bg-gray-800/50 hover:border-gray-600 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-100 truncate">{item.fileName}</h3>
                </div>
                <p className="text-[10px] text-gray-500">
                  {format(new Date(item.timestamp), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
