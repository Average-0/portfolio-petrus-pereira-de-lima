import React from 'react';

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-700 bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} MData Explorer. Processamento local por padrão. Histórico opcional sincronizado na conta.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs font-medium text-gray-500 hover:text-gray-100 transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="text-xs font-medium text-gray-500 hover:text-gray-100 transition-colors">
              Termos de Serviço
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
