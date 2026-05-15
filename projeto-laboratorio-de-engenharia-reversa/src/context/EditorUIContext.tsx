/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { LayoutMode, UIState } from '../types';

interface EditorUIContextType extends UIState {
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setLayoutMode: (mode: LayoutMode) => void;
  toggleSyncScrolling: () => void;
}

const EditorUIContext = createContext<EditorUIContextType | undefined>(undefined);

export const EditorUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UIState>({
    sidebarOpen: true,
    layoutMode: 'split',
    syncScrolling: true,
  });

  const setSidebarOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, sidebarOpen: open }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  }, []);

  const setLayoutMode = useCallback((layoutMode: LayoutMode) => {
    setState(prev => ({ ...prev, layoutMode }));
  }, []);

  const toggleSyncScrolling = useCallback(() => {
    setState(prev => ({ ...prev, syncScrolling: !prev.syncScrolling }));
  }, []);

  return (
    <EditorUIContext.Provider
      value={{
        ...state,
        setSidebarOpen,
        toggleSidebar,
        setLayoutMode,
        toggleSyncScrolling,
      }}
    >
      {children}
    </EditorUIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(EditorUIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within an EditorUIProvider');
  }
  return context;
};
