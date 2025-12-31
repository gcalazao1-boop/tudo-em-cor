import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Search, Menu, LogOut } from 'lucide-react';
import { ProductContextType } from '../types';
import { LoginModal } from './LoginModal';

interface NavbarProps {
  context: ProductContextType;
}

export const Navbar: React.FC<NavbarProps> = ({ context }) => {
  const location = useLocation();
  const { isAuthenticated, login, logout, branding } = context;

  const [isLoginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-white/50 py-2 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo (Dynamic Image or Text Fallback) */}
          <Link to="/" className="flex flex-col leading-none hover:opacity-80 transition items-start">
            {branding.logoUrl ? (
                <img 
                    src={branding.logoUrl} 
                    alt={branding.title} 
                    className="h-16 md:h-20 w-auto object-contain max-w-[200px]" 
                />
            ) : (
                <>
                    <span className="text-3xl font-bold text-gray-800 tracking-tighter">tudo em</span>
                    <span className="text-4xl font-bold text-cherry tracking-tighter -mt-2">cor</span>
                </>
            )}
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 bg-white/50 px-6 py-2 rounded-full">
            <Link to="/" className={`font-semibold hover:text-cherry transition ${location.pathname === '/' ? 'text-cherry' : 'text-gray-600'}`}>
              Início
            </Link>
            <Link to="/catalog" className={`font-semibold hover:text-cherry transition ${location.pathname === '/catalog' ? 'text-cherry' : 'text-gray-600'}`}>
              Catálogo
            </Link>
            {isAuthenticated && (
              <Link to="/admin" className={`font-semibold hover:text-cherry transition ${location.pathname === '/admin' ? 'text-cherry' : 'text-gray-600'}`}>
                Gerenciar
              </Link>
            )}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-white rounded-full px-3 py-1.5 border border-gray-200 focus-within:border-cherry transition">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar caneca..." 
                className="bg-transparent border-none focus:ring-0 text-sm px-2 w-32 outline-none text-gray-600"
              />
            </div>
            
            {isAuthenticated ? (
               <div className="flex items-center gap-2">
                  <Link to="/admin" className="p-2 bg-cherry text-white rounded-full hover:bg-pink-600 transition shadow-md" title="Painel Admin">
                    <User size={20} />
                  </Link>
                  <button onClick={logout} className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition" title="Sair">
                    <LogOut size={20} />
                  </button>
               </div>
            ) : (
              <button 
                onClick={() => setLoginOpen(true)} 
                className="p-2 bg-white text-cherry border border-cherry rounded-full hover:bg-cherry hover:text-white transition shadow-md"
                title="Login Administrativo"
              >
                <User size={20} />
              </button>
            )}

            <button className="md:hidden p-2 text-gray-600">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setLoginOpen(false)} 
        onLogin={login} 
      />
    </>
  );
};