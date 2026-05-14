import React, { useState } from 'react';
import { Camera, LogIn, LogOut, User as UserIcon, Loader2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user, loading, login, logout } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    await login();
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-700 bg-gray-900/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-white">
            <Camera className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-gray-100">
            MData Explorer
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 mr-4">
            <Link 
              to="/how-it-works" 
              className="text-sm font-medium text-gray-400 hover:text-gray-100 transition-colors"
            >
              Como funciona
            </Link>
            {user && (
              <Link 
                to="/history" 
                className="text-sm font-medium text-gray-400 hover:text-gray-100 transition-colors flex items-center gap-1.5"
              >
                <Clock className="h-4 w-4" />
                Histórico
              </Link>
            )}
            <a href="#" className="text-sm font-medium text-gray-400 hover:text-gray-100 transition-colors">
              Privacidade
            </a>
          </nav>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-medium text-gray-100">{user.displayName}</span>
                <span className="text-[10px] text-gray-400">{user.email}</span>
              </div>
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Usuário'} 
                  className="h-8 w-8 rounded-full border border-gray-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                </div>
              )}
              <Button variant="ghost" size="icon-sm" onClick={handleLogout} title="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleLogin} 
              className="gap-2"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {isLoggingIn ? 'Entrando...' : 'Entrar'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
