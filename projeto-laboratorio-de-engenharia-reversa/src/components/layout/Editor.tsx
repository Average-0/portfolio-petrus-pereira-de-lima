/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-markdown';
import { useFiles } from '@/src/context/FileContext';
import { cn } from '@/lib/utils';

export default function Editor() {
  const { currentFile, updateFileContent } = useFiles();
  const [content, setContent] = useState(currentFile?.content || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const handleAction = (e: any) => {
      const action = e.detail;
      if (!textareaRef.current) return;
      
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const selectedText = text.substring(start, end);
      
      let replacement = '';
      let cursorOffset = 0;

      switch (action) {
        case 'bold':
          replacement = `**${selectedText}**`;
          cursorOffset = selectedText ? replacement.length : 2;
          break;
        case 'italic':
          replacement = `*${selectedText}*`;
          cursorOffset = selectedText ? replacement.length : 1;
          break;
        case 'strikethrough':
          replacement = `~~${selectedText}~~`;
          cursorOffset = selectedText ? replacement.length : 2;
          break;
        case 'h1':
          replacement = `# ${selectedText}`;
          cursorOffset = replacement.length;
          break;
        case 'link':
          replacement = `[${selectedText || 'link text'}](https://)`;
          cursorOffset = selectedText ? replacement.length - 1 : 11;
          break;
        case 'image':
          replacement = `![${selectedText || 'image alt'}](https://)`;
          cursorOffset = selectedText ? replacement.length - 1 : 12;
          break;
        case 'list-ul':
          replacement = `\n- ${selectedText}`;
          cursorOffset = replacement.length;
          break;
        case 'list-ol':
          replacement = `\n1. ${selectedText}`;
          cursorOffset = replacement.length;
          break;
        case 'code':
          replacement = `\`\`\`\n${selectedText}\n\`\`\``;
          cursorOffset = 4;
          break;
        case 'quote':
          replacement = `\n> ${selectedText}`;
          cursorOffset = replacement.length;
          break;
        case 'table':
          replacement = `\n| Header | Header |\n| --- | --- |\n| Cell | Cell |`;
          cursorOffset = replacement.length;
          break;
        default:
          return;
      }

      const newValue = text.substring(0, start) + replacement + text.substring(end);
      setContent(newValue);
      if (currentFile) {
        updateFileContent(currentFile.id, newValue);
      }

      // Restore focus and selection
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + cursorOffset;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    };

    document.addEventListener('editor-action', handleAction);
    return () => document.removeEventListener('editor-action', handleAction);
  }, [currentFile, updateFileContent]);

  // Sync state with props
  useEffect(() => {
    if (currentFile && currentFile.content !== content) {
      setContent(currentFile.content);
    }
  }, [currentFile?.id, currentFile?.content]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    
    const currentFileId = currentFile?.id;
    if (currentFile) {
      timerRef.current = setTimeout(() => {
        if (currentFileId) updateFileContent(currentFileId, val);
      }, 50);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // Sync prism overlay
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }

    // Sync preview scroll
    const previewContainer = document.getElementById('preview-container');
    if (previewContainer) {
      const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
      const previewScrollHeight = previewContainer.scrollHeight - previewContainer.clientHeight;
      previewContainer.scrollTop = scrollPercentage * previewScrollHeight;
    }
  };

  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const highlightedCode = Prism.languages.markdown 
    ? Prism.highlight(
        content + (content.endsWith('\n') ? ' ' : ''),
        Prism.languages.markdown,
        'markdown'
      )
    : escapeHtml(content + (content.endsWith('\n') ? ' ' : ''));

  return (
    <div className="flex-1 h-full bg-white relative overflow-hidden flex flex-col font-mono text-sm editor-container">
      <div className="flex-1 relative overflow-hidden">
        {/* Highlighted Overlay */}
        <pre
          ref={preRef}
          aria-hidden="true"
          className="absolute inset-0 p-8 m-0 pointer-events-none whitespace-pre-wrap break-words overflow-hidden text-slate-800 bg-transparent selection:bg-transparent"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
        
        {/* Transparent Textarea */}
        <textarea
          ref={textareaRef}
          id="editor-textarea"
          className="absolute inset-0 w-full h-full p-8 bg-transparent text-transparent caret-slate-900 resize-none outline-none whitespace-pre-wrap break-words overflow-auto m-0 border-none focus:ring-0"
          value={content}
          onChange={handleChange}
          onScroll={handleScroll}
          spellCheck={false}
          autoFocus={currentFile?.id !== 'welcome'}
          placeholder="Start writing markdown..."
        />
      </div>
    </div>
  );
}
