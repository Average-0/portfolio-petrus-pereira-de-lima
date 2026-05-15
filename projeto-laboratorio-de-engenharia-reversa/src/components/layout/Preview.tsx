/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useFiles } from '@/src/context/FileContext';

export default function Preview() {
  const { currentFile } = useFiles();
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex-1 h-full p-12 overflow-auto bg-[#fafafa] border-l border-slate-200" id="preview-container">
      <div className="max-w-3xl mx-auto" ref={previewRef}>
        <div className="prose prose-slate prose-sm md:prose-base max-w-none prose-pre:bg-[#1e1e1e] prose-pre:text-slate-300">
          {currentFile?.content ? (
            <ReactMarkdown>
              {currentFile.content}
            </ReactMarkdown>
          ) : (
            <div className="text-slate-400 italic">No content to preview</div>
          )}
        </div>
      </div>
    </div>
  );
}
