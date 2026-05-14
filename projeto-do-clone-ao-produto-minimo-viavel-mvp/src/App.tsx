/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ExifProvider } from '@/context/ExifContext';
import { AuthProvider } from '@/context/AuthContext';
import { Home } from '@/pages/Home';
import { History } from '@/pages/History';
import { HowItWorks } from '@/pages/HowItWorks';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ExifProvider>
          <Router>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/history" element={<History />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
              </Routes>
            </MainLayout>
          </Router>
        </ExifProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}


