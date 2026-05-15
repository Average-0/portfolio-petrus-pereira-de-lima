/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useUI } from '@/src/context/EditorUIContext';
import { useFiles } from '@/src/context/FileContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';
import Editor from './Editor';
import Preview from './Preview';

const StatusBar = ({ text }: { text: string }) => {
  const bytes = new TextEncoder().encode(text).length;
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const lines = text.split('\n').length;
  
  return (
    <footer className="h-7 bg-[#4285f4] border-t border-blue-400/20 flex items-center justify-between px-4 text-[10px] text-white font-mono tracking-tight shrink-0 z-30">
      <div className="flex items-center gap-4">
        <span>COL 1, LINE {lines}</span>
        <span className="opacity-40">|</span>
        <span>{bytes} BYTES</span>
      </div>
      <div className="flex items-center gap-4">
        <span>{words} WORDS</span>
        <span className="opacity-40">|</span>
        <span>{lines} LINES</span>
        <span className="opacity-40">|</span>
        <span className="uppercase font-bold">Markdown</span>
      </div>
    </footer>
  );
};

export default function MainLayout() {
  const { sidebarOpen, layoutMode } = useUI();
  const { currentFile } = useFiles();
  const content = currentFile?.content || '';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 font-sans text-slate-900 selection:bg-green-100 selection:text-green-900">
      {/* Sidebar - Collapsible */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="h-full overflow-hidden z-20 bg-slate-50 shrink-0"
          >
            <div className="w-[280px] h-full border-r border-slate-200">
              <Sidebar />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Toolbar />
        
        <main className="flex-1 flex overflow-hidden bg-white">
          <AnimatePresence>
            {layoutMode !== 'preview' && (
              <motion.div 
                key="editor"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex flex-col overflow-hidden",
                  layoutMode === 'split' ? "w-1/2" : "w-full"
                )}
              >
                <Editor />
              </motion.div>
            )}
            
            {layoutMode === 'split' && (
              <motion.div 
                key="divider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-px bg-slate-200 shrink-0" 
              />
            )}
            
            {layoutMode !== 'editor' && (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex flex-col overflow-hidden",
                  layoutMode === 'split' ? "w-1/2" : "w-full"
                )}
              >
                <Preview />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <StatusBar text={content} />
      </div>
    </div>
  );
}
