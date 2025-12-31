
import React, { useState, useCallback, useMemo } from 'react';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetail } from './pages/ProductDetail';
import { Admin } from './pages/Admin';
import { Product, ProductContextType, Banner, Category, FilterOption, Branding } from './types';

// Initial Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    sku: 'CN-ANM-01',
    name: 'Caneca Luffy Gear 5',
    description: 'O despertar do guerreiro da libertação! Caneca com arte vibrante do Gear 5.',
    category: 'Animes',
    price: 49.90,
    views: 120,
    // Using placeholder images that support CORS
    rawArtUrl: 'https://placehold.co/800x400/FF0000/FFFFFF/png?text=Arte+Luffy', 
    productImages: ['https://placehold.co/600x600/f3f3f3/333333/png?text=Foto+Luffy+1'],
    filters: ['Masculino', 'Presente'],
    active: true,
    isMug: true
  },
  {
    id: '2',
    sku: 'CN-MIN-02',
    name: 'Bom Dia com Amor',
    description: 'Design minimalista com tipografia elegante para começar o dia bem.',
    category: 'Minimalista',
    price: 45.90,
    views: 85,
    rawArtUrl: 'https://placehold.co/800x400/FFF8DC/e36888/png?text=Arte+Bom+Dia',
    productImages: ['https://placehold.co/600x600/f3f3f3/333333/png?text=Foto+Minimalista'],
    filters: ['Feminino'],
    active: true,
    isMug: true
  },
  {
    id: '3',
    sku: 'CN-FRS-03',
    name: 'Não Falo Antes do Café',
    description: 'A caneca perfeita para quem precisa de cafeína antes de qualquer interação social.',
    category: 'Frases',
    price: 49.90,
    views: 200,
    rawArtUrl: 'https://placehold.co/800x400/333333/FFFFFF/png?text=Arte+Cafe',
    productImages: ['https://placehold.co/600x600/f3f3f3/333333/png?text=Foto+Cafe'],
    filters: ['Engraçado'],
    active: true,
    isMug: true
  },
  {
    id: '4',
    sku: 'CN-DAT-04',
    name: 'Melhor Mãe do Mundo',
    description: 'Presente ideal para o dia das mães. Arte floral delicada.',
    category: 'Datas Comemorativas',
    price: 55.90,
    views: 150,
    rawArtUrl: 'https://placehold.co/800x400/FFC0CB/e36888/png?text=Arte+Mae',
    productImages: ['https://placehold.co/600x600/f3f3f3/333333/png?text=Foto+Mae'],
    filters: ['Dia das Mães', 'Feminino'],
    active: true,
    isMug: true
  }
];

const INITIAL_CATEGORIES: Category[] = [
    { id: '1', name: 'Animes', active: true },
    { id: '2', name: 'Minimalista', active: true },
    { id: '3', name: 'Frases', active: true },
    { id: '4', name: 'Datas Comemorativas', active: true },
    { id: '5', name: 'Geek', active: false },
    { id: '6', name: 'Bottons', active: true },
];

const INITIAL_FILTERS: FilterOption[] = [
    { id: '1', name: 'Masculino', active: true },
    { id: '2', name: 'Feminino', active: true },
    { id: '3', name: 'Infantil', active: true },
    { id: '4', name: 'Presente', active: true },
    { id: '5', name: 'Engraçado', active: true },
];

const INITIAL_BANNERS: Banner[] = [
    { 
        id: '1', 
        imageUrl: 'https://placehold.co/1200x500/f2d88f/e36888/png?text=Banner+Promocional+Tudo+Em+Cor', 
        title: '', 
        subtitle: '', 
        active: true 
    }
];

const INITIAL_BRANDING: Branding = {
    title: 'Sobre a Tudo em Cor',
    text: 'Nós transformamos canecas em obras de arte. Cada peça é feita com carinho, pensando em trazer mais cor e alegria para o seu dia a dia.\n\nTrabalhamos com materiais de alta qualidade e impressões vibrantes que resistem ao tempo. Seja para presentear alguém especial ou para completar sua coleção, temos a caneca perfeita para você.',
    imageUrl: 'https://placehold.co/600x400/e36888/ffffff/png?text=Foto+Sobre+Nos',
    tag1: 'Entrega Rápida',
    tag2: 'Qualidade Premium',
    logoUrl: '', // Empty string defaults to Text Logo
    siteBackgroundColor: '#f3e9dc',
    scrollbarColor: '#f2d88f',
    savedColors: ['#f3e9dc', '#f2d88f', '#e36888', '#6698cc', '#ffffff', '#000000'],
    whatsappNumber: '5511999999999',
    whatsappMessage: 'Olá! Gostei muito da caneca "{nome}" (Ref: {sku}). Gostaria de encomendar!',
    instagramUrl: 'https://instagram.com/tudoemcor'
};

const Layout: React.FC<{ context: ProductContextType }> = ({ context }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800">
      {/* Dynamic Style Injection */}
      <style>{`
        body {
          background-color: ${context.branding.siteBackgroundColor} !important;
          transition: background-color 0.5s ease;
        }
        ::-webkit-scrollbar-track {
          background: ${context.branding.siteBackgroundColor};
        }
        ::-webkit-scrollbar-thumb {
          background: ${context.branding.scrollbarColor};
        }
        ::-webkit-scrollbar-thumb:hover {
          filter: brightness(0.9);
        }
      `}</style>

      <Navbar context={context} />
      <main className="flex-grow">
        <Outlet context={context} />
      </main>
      <footer className="bg-white border-t border-cream py-8 text-center text-gray-500 text-sm">
        <p>© 2024 Tudo em Cor. Todos os direitos reservados.</p>
        <p className="mt-2 text-xs text-cherry font-bold">Feito com muito amor ☕</p>
      </footer>
    </div>
  );
};

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [filters, setFilters] = useState<FilterOption[]>(INITIAL_FILTERS);
  const [branding, setBrandingState] = useState<Branding>(INITIAL_BRANDING);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback((password: string) => {
    if (password === 'Admin1') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const addProduct = useCallback((product: Product) => {
    setProducts(prev => [...prev, product]);
  }, []);

  const updateProduct = useCallback((product: Product) => {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
      setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const toggleProductActive = useCallback((id: string) => {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  }, []);

  const updateBanner = useCallback((banner: Banner) => {
    setBanners(prev => prev.map(b => b.id === banner.id ? banner : b));
  }, []);

  const updateBranding = useCallback((newBranding: Branding) => {
      setBrandingState(newBranding);
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  }, []);
  
  const updateCategory = useCallback((id: string, name: string) => {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, name: name } : c));
  }, []);

  const addCategory = useCallback((name: string) => {
      const newCat = { id: Date.now().toString(), name, active: true };
      setCategories(prev => [...prev, newCat]);
  }, []);

  const toggleFilter = useCallback((id: string) => {
      setFilters(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f));
  }, []);

  const deleteFilter = useCallback((id: string) => {
      setFilters(prev => prev.filter(f => f.id !== id));
  }, []);

  const addFilter = useCallback((name: string) => {
      const newFilter = { id: Date.now().toString(), name, active: true };
      setFilters(prev => [...prev, newFilter]);
  }, []);

  const contextValue: ProductContextType = useMemo(() => ({
    products,
    categories,
    banners,
    filters,
    branding,
    isAuthenticated,
    login,
    logout,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive,
    updateBanner,
    updateBranding,
    toggleCategory,
    updateCategory,
    addCategory,
    toggleFilter,
    deleteFilter,
    addFilter
  }), [products, categories, banners, filters, branding, isAuthenticated, login, logout, addProduct, updateProduct, deleteProduct, toggleProductActive, updateBanner, updateBranding, toggleCategory, updateCategory, addCategory, toggleFilter, deleteFilter, addFilter]);

  return (
    <MemoryRouter>
      <Routes>
        <Route element={<Layout context={contextValue} />}>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}
