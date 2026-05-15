/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFiles } from '@/src/context/FileContext';
import { useUI } from '@/src/context/EditorUIContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  FileText, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  Folder
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Sidebar() {
  const { files, currentFile, createFile, deleteFile, renameFile, setCurrentFileId } = useFiles();
  const { toggleSidebar } = useUI();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['documents']);

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => 
      prev.includes(folder) ? prev.filter(f => f !== folder) : [...prev, folder]
    );
  };

  const handleStartRename = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditValue(name.replace(/\.md$/, ''));
  };

  const handleSaveRename = (id: string) => {
    if (editValue.trim()) {
      renameFile(id, editValue.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = () => {
    setEditingId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this file?')) {
      deleteFile(id);
    }
  };

  const FileItem = ({ file }: { file: MarkdownFile }) => (
    <motion.div
      layout
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -5 }}
      className={cn(
        "group relative flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-colors text-slate-400 hover:text-white",
        currentFile?.id === file.id 
          ? "bg-[#3a3a3a] text-white" 
          : "hover:bg-white/5 uppercase font-medium"
      )}
      onClick={() => setCurrentFileId(file.id)}
    >
      <FileText size={14} className={cn("shrink-0", currentFile?.id === file.id ? "text-green-500" : "opacity-40")} />
      
      {editingId === file.id ? (
        <div className="flex-1 flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename(file.id);
              if (e.key === 'Escape') handleCancelRename();
            }}
            className="h-6 text-[10px] py-0 px-1 bg-[#1e1e1e] border-slate-700 text-white"
          />
        </div>
      ) : (
        <span className="flex-1 truncate text-[11px] tracking-wide">
          {file.name}
        </span>
      )}
    </motion.div>
  );

  const FolderHeader = ({ name, id, count }: { name: string, id: string, count?: number }) => (
    <div 
      className="flex items-center gap-2 px-2 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-300 transition-colors mt-2"
      onClick={() => toggleFolder(id)}
    >
      {expandedFolders.includes(id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      <Folder size={12} className="opacity-40" />
      <span className="flex-1">{name}</span>
      {count !== undefined && <span className="opacity-40">{count}</span>}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#2c2c2c] text-slate-300">
      {/* Sidebar Header - Icons only */}
      <div className="h-12 border-b border-white/5 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-0.5">
          <Button 
            variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5"
            onClick={() => createFile('Untitled')}
          >
            <Plus size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5">
            <FolderPlus size={18} />
          </Button>
          <Button 
            variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5"
            onClick={(e) => currentFile && handleDelete(e, currentFile.id)}
          >
            <Trash2 size={18} />
          </Button>
          <Button 
            variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5"
            onClick={(e) => currentFile && handleStartRename(e, currentFile.id, currentFile.name)}
          >
            <Edit2 size={18} />
          </Button>
        </div>
        
        <Button 
          variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5"
          onClick={toggleSidebar}
        >
          <X size={18} />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          <FolderHeader name="Documents" id="documents" count={files.length} />
          <AnimatePresence initial={false}>
            {expandedFolders.includes('documents') && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-0.5 pl-1"
              >
                {files.map(file => <FileItem key={file.id} file={file} />)}
              </motion.div>
            )}
          </AnimatePresence>

          <FolderHeader name="Temp" id="temp" count={0} />
          <FolderHeader name="Trash" id="trash" count={0} />
        </div>
      </ScrollArea>

      {/* Footer minimal */}
      <div className="p-3 border-t border-white/5 text-[9px] text-slate-500 font-mono flex justify-between items-center bg-[#242424]">
        <span className="uppercase">Persistence: Local</span>
        <div className="flex items-center gap-1.5">
          <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-green-500/50 w-[10%]" />
          </div>
          <span>10%</span>
        </div>
      </div>
    </div>
  );
}
