/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileProvider } from './context/FileContext';
import { EditorUIProvider } from './context/EditorUIContext';
import MainLayout from './components/layout/MainLayout';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function App() {
  return (
    <TooltipProvider>
      <EditorUIProvider>
        <FileProvider>
          <MainLayout />
        </FileProvider>
      </EditorUIProvider>
    </TooltipProvider>
  );
}
