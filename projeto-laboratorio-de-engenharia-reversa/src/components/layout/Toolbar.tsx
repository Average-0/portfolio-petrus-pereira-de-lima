/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useUI } from '@/src/context/EditorUIContext';
import { useFiles } from '@/src/context/FileContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Bold,
  Italic,
  Heading1,
  Strikethrough,
  Table,
  Link as LinkIcon, 
  Image as ImageIcon, 
  List, 
  ListOrdered, 
  Code, 
  Quote, 
  Undo, 
  Redo,
  FolderOpen,
  Eye,
  Columns,
  Square
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

type FormatAction = 'bold' | 'italic' | 'strikethrough' | 'h1' | 'link' | 'image' | 'table' | 'list-ul' | 'list-ol' | 'code' | 'quote' | 'undo' | 'redo';

export default function Toolbar() {
  const { sidebarOpen, toggleSidebar, layoutMode, setLayoutMode } = useUI();
  const { currentFile, renameFile } = useFiles();
  
  const handleFormat = (action: FormatAction) => {
    console.log(`Action: ${action}`);
    document.dispatchEvent(new CustomEvent('editor-action', { detail: action }));
  };

  const ToolButton = ({ icon: Icon, label, action, shortcut, active }: { icon: any, label: string, action: FormatAction, shortcut?: string, active?: boolean }) => (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 transition-colors",
              active && "text-green-500 bg-white/5"
            )}
            onClick={() => handleFormat(action)}
          >
            <Icon size={16} />
          </Button>
        }
      />
      <TooltipContent side="bottom" className="text-xs bg-slate-800 text-white border-slate-700">
        <p>{label} {shortcut && <span className="opacity-50 ml-1">({shortcut})</span>}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <header className="h-12 border-b border-white/5 bg-[#1e1e1e] flex items-center px-4 shrink-0 relative">
      <div className="flex items-center gap-1 z-10">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 mr-2 transition-colors",
                  sidebarOpen ? "text-green-500 bg-white/5" : "text-slate-400 hover:text-white"
                )}
                onClick={toggleSidebar}
              >
                <FolderOpen size={18} />
              </Button>
            }
          />
          <TooltipContent side="bottom" className="text-xs bg-slate-800 text-white border-slate-700">
            <p>{sidebarOpen ? 'Close Explorer' : 'Open Explorer'}</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mr-2 h-6 self-center bg-white/10" />

        <div className="flex items-center gap-0.5">
          <ToolButton icon={Bold} label="Bold" action="bold" shortcut="Ctrl+B" />
          <ToolButton icon={Italic} label="Italic" action="italic" shortcut="Ctrl+I" />
          <ToolButton icon={Strikethrough} label="Strikethrough" action="strikethrough" />
          <ToolButton icon={Heading1} label="Heading" action="h1" />
        </div>

        <Separator orientation="vertical" className="mx-1 h-6 self-center bg-white/10" />

        <div className="flex items-center gap-0.5">
          <ToolButton icon={LinkIcon} label="Link" action="link" shortcut="Ctrl+K" />
          <ToolButton icon={ImageIcon} label="Image" action="image" shortcut="Ctrl+G" />
          <ToolButton icon={Table} label="Table" action="table" />
          <ToolButton icon={Quote} label="Quote" action="quote" />
          <ToolButton icon={Code} label="Code" action="code" />
        </div>

        <Separator orientation="vertical" className="mx-1 h-6 self-center bg-white/10" />

        <div className="flex items-center gap-0.5">
          <ToolButton icon={List} label="Unordered List" action="list-ul" />
          <ToolButton icon={ListOrdered} label="Ordered List" action="list-ol" />
        </div>

        <Separator orientation="vertical" className="mx-1 h-6 self-center bg-white/10" />

        <div className="flex items-center gap-0.5">
          <ToolButton icon={Undo} label="Undo" action="undo" shortcut="Ctrl+Z" />
          <ToolButton icon={Redo} label="Redo" action="redo" shortcut="Ctrl+Y" />
        </div>
      </div>

      {/* Editable Document Name - Centered */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto max-w-[30%]">
          <Input
            value={currentFile?.name.replace(/\.md$/, '') || ''}
            onChange={(e) => currentFile && renameFile(currentFile.id, e.target.value)}
            className="h-8 bg-transparent border-transparent hover:border-white/10 focus:border-white/20 text-white font-medium text-sm text-center px-2 py-0 min-w-[120px] transition-colors"
            placeholder="Untitled document"
          />
          <span className="text-slate-500 text-xs font-mono">.md</span>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto z-10">
        <div className="flex items-center bg-white/5 p-1 rounded-md border border-white/10">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-7 w-7 text-slate-400 hover:text-white transition-colors", layoutMode === 'editor' && "bg-white/10 text-white shadow-sm")}
                  onClick={() => setLayoutMode('editor')}
                >
                  <Square size={14} />
                </Button>
              }
            />
            <TooltipContent side="bottom" className="text-xs bg-slate-800 text-white">Editor Only</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-7 w-7 text-slate-400 hover:text-white transition-colors", layoutMode === 'split' && "bg-white/10 text-white shadow-sm")}
                  onClick={() => setLayoutMode('split')}
                >
                  <Columns size={14} />
                </Button>
              }
            />
            <TooltipContent side="bottom" className="text-xs bg-slate-800 text-white">Split View</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-7 w-7 text-slate-400 hover:text-white transition-colors", layoutMode === 'preview' && "bg-white/10 text-white shadow-sm")}
                  onClick={() => setLayoutMode('preview')}
                >
                  <Eye size={14} />
                </Button>
              }
            />
            <TooltipContent side="bottom" className="text-xs bg-slate-800 text-white">Preview Only</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
