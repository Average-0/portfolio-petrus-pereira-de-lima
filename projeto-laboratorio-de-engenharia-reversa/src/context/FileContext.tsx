/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MarkdownFile } from '../types';

interface FileContextType {
  files: MarkdownFile[];
  currentFile: MarkdownFile | null;
  createFile: (name: string) => void;
  deleteFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  renameFile: (id: string, name: string) => void;
  setCurrentFileId: (id: string) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

const STORAGE_KEY = 'stackedit_clone_files';
const CURRENT_FILE_KEY = 'stackedit_clone_current_file';

const INITIAL_FILE: MarkdownFile = {
  id: 'welcome',
  name: 'Welcome.md',
  content: '# Welcome to StackEdit Clone\n\nThis is your real-time Markdown editor.\n\n## Features\n- **Real-time Preview**\n- **Live Syntax Highlighting** (Coming soon)\n- **Scroll Synchronization**\n- **Local Persistence**\n\nStart typing on the left to see the results on the right!',
  createdAt: Date.now(),
  lastModified: Date.now(),
};

export const FileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<MarkdownFile[]>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const savedFiles = localStorage.getItem(STORAGE_KEY);
    const savedCurrentId = localStorage.getItem(CURRENT_FILE_KEY);

    if (savedFiles) {
      const parsedFiles = JSON.parse(savedFiles);
      setFiles(parsedFiles);
      if (savedCurrentId && parsedFiles.some((f: MarkdownFile) => f.id === savedCurrentId)) {
        setCurrentFileId(savedCurrentId);
      } else if (parsedFiles.length > 0) {
        setCurrentFileId(parsedFiles[0].id);
      }
    } else {
      setFiles([INITIAL_FILE]);
      setCurrentFileId(INITIAL_FILE.id);
    }
  }, []);

  // Persist files
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  }, [files]);

  // Persist current file ID
  useEffect(() => {
    if (currentFileId) {
      localStorage.setItem(CURRENT_FILE_KEY, currentFileId);
    }
  }, [currentFileId]);

  const createFile = useCallback((name: string) => {
    const newFile: MarkdownFile = {
      id: crypto.randomUUID(),
      name: name.endsWith('.md') ? name : `${name}.md`,
      content: '',
      createdAt: Date.now(),
      lastModified: Date.now(),
    };
    setFiles(prev => [...prev, newFile]);
    setCurrentFileId(newFile.id);
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      if (filtered.length === 0) {
        return [INITIAL_FILE];
      }
      return filtered;
    });
    if (currentFileId === id) {
      setFiles(prev => {
        if (prev.length > 0) setCurrentFileId(prev[0].id);
        return prev;
      });
    }
  }, [currentFileId]);

  const updateFileContent = useCallback((id: string, content: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, content, lastModified: Date.now() } : f));
  }, []);

  const renameFile = useCallback((id: string, name: string) => {
    const newName = name.endsWith('.md') ? name : `${name}.md`;
    setFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName, lastModified: Date.now() } : f));
  }, []);

  const currentFile = files.find(f => f.id === currentFileId) || null;

  return (
    <FileContext.Provider value={{
      files,
      currentFile,
      createFile,
      deleteFile,
      updateFileContent,
      renameFile,
      setCurrentFileId
    }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFiles = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};
