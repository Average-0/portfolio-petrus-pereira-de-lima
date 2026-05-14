import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Clock, FileText, ChevronRight, AlertCircle } from 'lucide-react';
import { ExifData } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoryItem {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  metadata: ExifData;
  timestamp: string;
}

export function History() {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const historyPath = 'history';
      try {
        const q = query(
          collection(db, historyPath),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const items: HistoryItem[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as HistoryItem);
        });
        setHistory(items);
      } catch (err: any) {
        handleFirestoreError(err, OperationType.LIST, historyPath);
        setError('Não foi possível carregar o histórico.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const historyPath = `history/${id}`;
    try {
      await deleteDoc(doc(db, 'history', id));
      setHistory(history.filter(item => item.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
      setConfirmDeleteId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, historyPath);
      setError('Erro ao excluir item do histórico.');
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="text-lg font-medium text-gray-400">Carregando histórico...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto">
          <Clock className="h-10 w-10 text-gray-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-100">Histórico não disponível</h2>
          <p className="text-gray-400">Você precisa estar logado para ver seu histórico de uploads.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* List */}
        <div className={`flex-1 space-y-6 ${selectedItem ? 'hidden md:block' : 'block'}`}>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-500" />
              Seu Histórico
            </h1>
            <span className="text-sm text-gray-500">{history.length} itens</span>
          </div>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-3 text-red-400">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {history.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-gray-800 rounded-xl">
              <p className="text-gray-500">Nenhum arquivo processado ainda.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`group p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedItem?.id === item.id 
                      ? 'bg-blue-500/10 border-blue-500/50' 
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-gray-100 font-medium truncate">{item.fileName}</h3>
                      <p className="text-xs text-gray-500">
                        {format(new Date(item.timestamp), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {confirmDeleteId === item.id ? (
                      <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                          className="text-xs text-gray-400 hover:text-gray-100"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          disabled={deletingId === item.id}
                          className="text-xs h-8"
                        >
                          {deletingId === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Excluir'}
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(item.id);
                        }}
                        className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <ChevronRight className={`h-5 w-5 text-gray-600 transition-transform ${selectedItem?.id === item.id ? 'rotate-90 md:rotate-0' : ''}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Panel */}
        {selectedItem && (
          <div className="flex-1 space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedItem(null)}
                className="md:hidden text-gray-400 hover:text-gray-100"
              >
                Voltar para lista
              </Button>
              <h2 className="text-xl font-bold text-gray-100 hidden md:block">Detalhes do Arquivo</h2>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-700 bg-gray-900/50">
                <h3 className="text-lg font-semibold text-gray-100 truncate">{selectedItem.fileName}</h3>
                <p className="text-sm text-gray-400">
                  {(selectedItem.fileSize / 1024).toFixed(2)} KB • {selectedItem.fileType}
                </p>
              </div>
              <div className="divide-y divide-gray-700 max-h-[600px] overflow-y-auto custom-scrollbar">
                {Object.entries(selectedItem.metadata).map(([category, values]) => (
                  (values as any[]).length > 0 && (
                    <div key={category} className="p-6 space-y-4">
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
                  )
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
