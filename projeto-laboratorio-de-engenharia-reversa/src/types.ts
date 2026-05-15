/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MarkdownFile {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  lastModified: number;
}

export type LayoutMode = 'editor' | 'preview' | 'split';

export interface UIState {
  sidebarOpen: boolean;
  layoutMode: LayoutMode;
  syncScrolling: boolean;
}
