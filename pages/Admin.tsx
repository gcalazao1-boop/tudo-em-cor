
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useOutletContext, Navigate, Link, useLocation } from 'react-router-dom';
import { ProductContextType, Product, MockupSettings } from '../types';
import { Button } from '../components/Button';
import { MockupViewer } from '../components/MockupViewer';
// Added Share2 to the import list from lucide-react to fix compilation error on line 778
import { Plus, Upload, Check, LayoutGrid, Tag, Image as ImageIcon, Layers, ToggleLeft, ToggleRight, Filter, Trash2, Edit2, X, Archive, Eye, Palette, Save, ArrowLeft, PaintBucket, Box, MessageCircle, Instagram, Share2 } from 'lucide-react';

export const Admin: React.FC = () => {
  const { 
    addProduct, updateProduct, deleteProduct, products, isAuthenticated, 
    banners, updateBanner, 
    categories, toggleCategory, addCategory, updateCategory,
    filters, toggleFilter, addFilter, deleteFilter,
    branding, updateBranding
  } = useOutletContext<ProductContextType>();
  
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'products' | 'banners' | 'themes' | 'filters' | 'archived' | 'branding'>('products');
  const [subTabProduct, setSubTabProduct] = useState<'form' | 'list'>('list'); // Default to list view for "Manage All" feel

  // --- Product Form State ---
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    description: '',
    category: '',
    price: 49.90, // Default price
    rawArtUrl: '',
    productImages: [],
    filters: []
  });
  
  // Controls if we ask for mockup art or just real photos
  const [isMugType, setIsMugType] = useState(false);
  
  // MOCKUP SETTINGS STATE
  const [mockupSettings, setMockupSettings] = useState<MockupSettings>({
      scale: 1,
      posX: 0,
      posY: 0,
      rotate: 0,
      mugColor: '#ffffff'
  });
  
  const [showMockupPreview, setShowMockupPreview] = useState(false);
  const fileArtInputRef = useRef<HTMLInputElement>(null);
  const fileRealInputRef = useRef<HTMLInputElement>(null);

  // --- Banner State ---
  const [bannerUrlInput, setBannerUrlInput] = useState('');
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // --- Branding State ---
  const [brandingForm, setBrandingForm] = useState({
      title: branding.title,
      text: branding.text,
      imageUrl: branding.imageUrl,
      tag1: branding.tag1,
      tag2: branding.tag2,
      logoUrl: branding.logoUrl || '',
      siteBackgroundColor: branding.siteBackgroundColor || '#f3e9dc',
      scrollbarColor: branding.scrollbarColor || '#f2d88f',
      savedColors: branding.savedColors || [],
      whatsappNumber: branding.whatsappNumber || '',
      whatsappMessage: branding.whatsappMessage || '',
      instagramUrl: branding.instagramUrl || ''
  });
  const brandingFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // --- Theme/Filter Input State ---
  const [newThemeName, setNewThemeName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{id: string, name: string} | null>(null); 
  const [newFilterName, setNewFilterName] = useState('');
  
  // --- Archived Filter State ---
  const [archivedCategoryFilter, setArchivedCategoryFilter] = useState('Todos');

  // Handle direct navigation to edit from ProductDetail page
  useEffect(() => {
    if (location.state && (location.state as any).editingProductId) {
       const pid = (location.state as any).editingProductId;
       const prod = products.find(p => p.id === pid);
       if (prod) {
           handleEditProduct(prod);
       }
       // Clear state to avoid reopening on refresh
       window.history.replaceState({}, document.title);
    }
  }, [location.state, products]);


  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // --- Handlers ---

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFormData({ ...formData, category: e.target.value });
  }

  // Upload for Mockup Art (Flat Image)
  const handleArtUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, rawArtUrl: objectUrl }));
      setShowMockupPreview(true);
      // Reset settings on new upload - Default scale 1 now means "Fit Contain"
      setMockupSettings({ scale: 1, posX: 0, posY: 0, rotate: 0, mugColor: '#ffffff' });
    }
  };

  // Upload for Real Photos (Can be multiple in a real app, here simplified to add one by one or replace)
  const handleRealPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const objectUrl = URL.createObjectURL(file);
        // Appends to existing images array
        setFormData(prev => ({ 
            ...prev, 
            productImages: [...(prev.productImages || []), objectUrl] 
        }));
    }
  };

  const handleRemoveRealPhoto = (indexToRemove: number) => {
      setFormData(prev => ({
          ...prev,
          productImages: prev.productImages?.filter((_, index) => index !== indexToRemove)
      }));
  };

  const handleToggleProductFilter = (filterName: string) => {
      const currentFilters = formData.filters || [];
      if (currentFilters.includes(filterName)) {
          setFormData({ ...formData, filters: currentFilters.filter(f => f !== filterName) });
      } else {
          setFormData({ ...formData, filters: [...currentFilters, filterName] });
      }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setBannerUrlInput(objectUrl);
    }
  };

  const handleBrandingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setBrandingForm(prev => ({ ...prev, imageUrl: objectUrl }));
    }
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          
          // Simple size validation (2MB)
          if(file.size > 2 * 1024 * 1024) {
              alert("A imagem é muito grande. O tamanho máximo é 2MB.");
              return;
          }

          const objectUrl = URL.createObjectURL(file);
          setBrandingForm(prev => ({ ...prev, logoUrl: objectUrl }));
      }
  };

  const handleRemoveLogo = () => {
      setBrandingForm(prev => ({ ...prev, logoUrl: '' }));
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
  };

  const handleSaveColorToPalette = (color: string) => {
      if (!brandingForm.savedColors.includes(color)) {
          setBrandingForm(prev => ({
              ...prev,
              savedColors: [...prev.savedColors, color]
          }));
      }
  };

  const handleRemoveColorFromPalette = (color: string) => {
      setBrandingForm(prev => ({
          ...prev,
          savedColors: prev.savedColors.filter(c => c !== color)
      }));
  };

  const handleBrandingSave = () => {
    updateBranding(brandingForm);
    alert('Identidade Visual e Configurações de WhatsApp atualizadas com sucesso!');
  };

  const resetForm = () => {
    setFormData({ name: '', sku: '', description: '', category: '', price: 49.90, rawArtUrl: '', productImages: [], filters: [] });
    setIsMugType(false);
    setShowMockupPreview(false);
    setEditingProductId(null);
    setMockupSettings({ scale: 1, posX: 0, posY: 0, rotate: 0, mugColor: '#ffffff' });
    if (fileArtInputRef.current) fileArtInputRef.current.value = '';
    if (fileRealInputRef.current) fileRealInputRef.current.value = '';
  };

  const handleEditProduct = (product: Product) => {
      setEditingProductId(product.id);
      setFormData({
          name: product.name,
          sku: product.sku,
          description: product.description,
          category: product.category,
          price: product.price,
          rawArtUrl: product.rawArtUrl,
          productImages: product.productImages,
          filters: product.filters || []
      });
      setIsMugType(product.isMug);
      // Load settings if available
      if (product.mockupSettings) {
          setMockupSettings(product.mockupSettings);
      } else {
          setMockupSettings({ scale: 1, posX: 0, posY: 0, rotate: 0, mugColor: '#ffffff' });
      }
      setShowMockupPreview(true);
      setActiveTab('products');
      setSubTabProduct('form');
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.category) {
        alert("Preencha o nome e a categoria.");
        return;
    }
    
    const finalRawArt = isMugType ? formData.rawArtUrl : (formData.productImages?.[0] || '');

    const productData: Product = {
      id: editingProductId || Date.now().toString(),
      name: formData.name!,
      sku: formData.sku || `SKU-${Date.now()}`,
      description: formData.description || '',
      category: formData.category!,
      rawArtUrl: finalRawArt || 'https://via.placeholder.com/400', 
      productImages: (formData.productImages && formData.productImages.length > 0) ? formData.productImages : [],
      price: Number(formData.price) || 49.90,
      views: 0, // In real app, preserve views if editing
      filters: formData.filters || [],
      active: true,
      isMug: isMugType,
      mockupSettings: isMugType ? mockupSettings : undefined // Save settings!
    };

    if (editingProductId) {
        // Update existing
        // Need to find existing to preserve views/active state if not handling here
        const existing = products.find(p => p.id === editingProductId);
        if (existing) {
            updateProduct({ ...productData, views: existing.views, active: existing.active });
            alert('Produto atualizado com sucesso!');
        }
    } else {
        // Create new
        addProduct(productData);
        alert('Produto adicionado com sucesso!');
    }
    
    resetForm();
    setSubTabProduct('list'); // Go back to list after save
  };

  const handleBannerUpdate = () => {
    if (!bannerUrlInput) return;
    const currentBanner = banners[0];
    updateBanner({ ...currentBanner, imageUrl: bannerUrlInput, title: '', subtitle: '' }); // Clean update
    alert('Banner atualizado!');
    setBannerUrlInput('');
  };

  const handleEditCategory = (id: string) => {
      const cat = categories.find(c => c.id === id);
      if(cat) setEditingCategory(cat);
  };

  const saveEditedCategory = () => {
      if(editingCategory) {
          updateCategory(editingCategory.id, editingCategory.name);
          alert(`Categoria renomeada para ${editingCategory.name} com sucesso!`);
          setEditingCategory(null);
      }
  };
  
  const handleDeleteProductClick = (id: string, name: string) => {
      if(window.confirm(`Tem certeza que deseja excluir o produto "${name}" permanentemente?`)) {
          deleteProduct(id);
      }
  };

  // Logic for Archived Items
  const archivedProducts = products.filter(p => !p.active);
  const filteredArchivedProducts = archivedCategoryFilter === 'Todos' 
    ? archivedProducts 
    : archivedProducts.filter(p => p.category === archivedCategoryFilter);


  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Painel Administrativo</h1>
        <p className="text-gray-500">Bem-vindo, Administrador.</p>
      </div>

      {/* Top Tabs */}
      <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-200 pb-4">
        <button type="button" onClick={() => setActiveTab('products')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition ${activeTab === 'products' ? 'bg-cherry text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            <LayoutGrid size={20} /> Produtos
        </button>
        <button type="button" onClick={() => setActiveTab('banners')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition ${activeTab === 'banners' ? 'bg-cherry text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            <ImageIcon size={20} /> Banner
        </button>
        <button type="button" onClick={() => setActiveTab('themes')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition ${activeTab === 'themes' ? 'bg-cherry text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            <Layers size={20} /> Categorias
        </button>
        <button type="button" onClick={() => setActiveTab('filters')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition ${activeTab === 'filters' ? 'bg-cherry text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            <Filter size={20} /> Filtros
        </button>
        <button type="button" onClick={() => setActiveTab('branding')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition ${activeTab === 'branding' ? 'bg-cherry text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
            <Palette size={20} /> Identidade Visual
        </button>
        <button type="button" onClick={() => setActiveTab('archived')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition ${activeTab === 'archived' ? 'bg-gray-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            <Archive size={20} /> Itens Desativados
        </button>
      </div>

      {/* --- PRODUCTS TAB --- */}
      {activeTab === 'products' && (
        <div>
            {/* Sub-tab Navigation */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4">
                    <button type="button" onClick={() => setSubTabProduct('list')} className={`text-sm font-bold px-6 py-3 rounded-full flex items-center gap-2 transition ${subTabProduct === 'list' ? 'bg-sky text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600'}`}>
                        <LayoutGrid size={18} /> Todos os Produtos
                    </button>
                    <button type="button" onClick={() => { setSubTabProduct('form'); resetForm(); }} className={`text-sm font-bold px-6 py-3 rounded-full flex items-center gap-2 transition ${subTabProduct === 'form' && !editingProductId ? 'bg-cherry text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600'}`}>
                        <Plus size={18} /> Cadastrar Novo
                    </button>
                </div>
            </div>

            {subTabProduct === 'form' ? (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
                     
                     {/* LEFT COLUMN: FORM (Compact) */}
                    <div className="xl:col-span-5 space-y-4">
                         <div className="mb-2">
                            <button type="button" onClick={() => setSubTabProduct('list')} className="text-gray-500 hover:text-cherry flex items-center gap-1 text-sm font-bold">
                                 <ArrowLeft size={16} /> Cancelar e Voltar para Lista
                            </button>
                         </div>

                        <div className="bg-white rounded-3xl shadow-lg p-6 border border-cream">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                                {editingProductId ? <><Edit2 className="text-cherry" /> Editar Produto</> : <><Plus className="text-cherry" /> Novo Produto</>}
                            </h2>
                            <form onSubmit={handleSubmitProduct} className="space-y-5">
                                {/* Type Toggle at TOP */}
                                <div className="flex items-center justify-between gap-3 bg-gray-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg ${isMugType ? 'bg-cherry text-white' : 'bg-gray-200 text-gray-500'}`}>
                                            <Box size={24} />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-gray-700">Este produto é uma Caneca?</span>
                                            <span className="text-xs text-gray-500">Ativa o gerador de Mockup 3D.</span>
                                        </div>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsMugType(!isMugType)} 
                                        className={`w-12 h-6 rounded-full p-1 transition ${isMugType ? 'bg-cherry' : 'bg-gray-300'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition ${isMugType ? 'translate-x-6' : ''}`} />
                                    </button>
                                </div>

                                {/* Basics */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Produto</label>
                                    <input name="name" value={formData.name} onChange={handleProductChange} className="w-full p-3 bg-cream/30 rounded-xl border border-gray-200 focus:border-cherry outline-none" required />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">SKU (Opcional)</label>
                                        <input name="sku" value={formData.sku} onChange={handleProductChange} className="w-full p-3 bg-cream/30 rounded-xl border border-gray-200 focus:border-cherry outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Preço (R$)</label>
                                        <input type="number" step="0.01" name="price" value={formData.price} onChange={handleProductChange} className="w-full p-3 bg-cream/30 rounded-xl border border-gray-200 focus:border-cherry outline-none" />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Categoria</label>
                                    <select name="category" value={formData.category} onChange={handleCategoryChange} className="w-full p-3 bg-cream/30 rounded-xl border border-gray-200 focus:border-cherry outline-none" required>
                                        <option value="">Selecione...</option>
                                        {categories.filter(c => c.active).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
                                    <textarea name="description" value={formData.description} onChange={handleProductChange} className="w-full h-24 p-3 bg-cream/30 rounded-xl border border-gray-200 focus:border-cherry outline-none resize-none" />
                                </div>

                                {/* Filters Selection */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Filtros / Tags</label>
                                    <div className="flex flex-wrap gap-2">
                                        {filters.map(f => (
                                            <button
                                                key={f.id}
                                                type="button"
                                                onClick={() => handleToggleProductFilter(f.name)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                                                    formData.filters?.includes(f.name) 
                                                    ? 'bg-cherry text-white border-cherry' 
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-cherry'
                                                }`}
                                            >
                                                {f.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Images Section */}
                                <div className="space-y-4 border-t border-gray-100 pt-4">
                                    
                                    {/* 1. Mockup Art (Only if Mug) */}
                                    {isMugType && (
                                        <div className="bg-sky/5 p-4 rounded-xl border border-sky/20">
                                            <label className="block text-sm font-bold text-sky mb-2">1. Arte para Mockup (Imagem Plana)</label>
                                            <p className="text-xs text-sky/70 mb-3">Esta imagem será usada APENAS para gerar o 3D e não aparecerá para o cliente.</p>
                                            <input 
                                              type="file" 
                                              accept="image/*" 
                                              ref={fileArtInputRef}
                                              onChange={handleArtUpload}
                                              className="hidden"
                                            />
                                            <button 
                                              type="button" 
                                              onClick={() => fileArtInputRef.current?.click()} 
                                              className="w-full py-3 bg-white border-2 border-dashed border-sky text-sky font-bold rounded-xl hover:bg-sky hover:text-white transition flex items-center justify-center gap-2"
                                            >
                                                <Upload size={18} /> Carregar Arte do Mockup
                                            </button>
                                            {formData.rawArtUrl && <p className="text-xs text-green-600 mt-1 font-bold">Arte carregada!</p>}
                                        </div>
                                    )}

                                    {/* 2. Real Photos (Always Available) */}
                                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                        <label className="block text-sm font-bold text-orange-800 mb-2">2. Fotos Reais do Produto</label>
                                        <p className="text-xs text-orange-800/70 mb-3">Estas são as fotos que o cliente verá na galeria.</p>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            ref={fileRealInputRef}
                                            onChange={handleRealPhotoUpload}
                                            className="hidden"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => fileRealInputRef.current?.click()} 
                                            className="w-full py-3 bg-white border-2 border-dashed border-orange-300 text-orange-500 font-bold rounded-xl hover:bg-orange-400 hover:text-white transition flex items-center justify-center gap-2"
                                        >
                                            <ImageIcon size={18} /> Adicionar Foto Real
                                        </button>
                                        
                                        {/* Preview Real Photos */}
                                        <div className="flex gap-2 mt-2 overflow-x-auto">
                                            {formData.productImages?.map((img, idx) => (
                                                <div key={idx} className="relative group">
                                                    <img src={img} className="w-16 h-16 rounded-lg object-cover border border-gray-200" alt="preview" />
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleRemoveRealPhoto(idx)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" fullWidth className="py-4 text-lg">{editingProductId ? 'Salvar Alterações' : 'Criar Produto'}</Button>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PREVIEW (Wide & Sticky) */}
                    <div className="xl:col-span-7 space-y-6">
                        <div className="bg-white rounded-3xl shadow-lg p-6 border border-cream flex flex-col items-center justify-start min-h-[400px]">
                            <h3 className="text-lg font-bold text-gray-500 mb-4 w-full border-b pb-2 flex items-center gap-2">
                                <Eye size={20} /> Pré-visualização do Mockup
                            </h3>
                            
                            {isMugType ? (
                                showMockupPreview && formData.rawArtUrl ? (
                                    <MockupViewer 
                                        artUrl={formData.rawArtUrl} 
                                        isEditable={true}
                                        settings={mockupSettings}
                                        onSettingsChange={setMockupSettings}
                                    />
                                ) : (
                                    <div className="text-gray-300 text-center py-24 w-full border-2 border-dashed border-gray-200 rounded-2xl">
                                        <Layers size={64} className="mx-auto mb-4 opacity-50" />
                                        <p className="text-xl font-bold">Aguardando Arte...</p>
                                        <p className="text-sm mt-2">Carregue uma imagem no formulário al lado para gerar o 3D.</p>
                                    </div>
                                )
                            ) : (
                                <div className="text-center w-full">
                                    <div className="bg-gray-100 w-full h-[500px] rounded-2xl flex items-center justify-center mb-4 overflow-hidden border border-gray-200">
                                        {formData.productImages && formData.productImages.length > 0 ? (
                                            <img src={formData.productImages[0]} className="w-full h-full object-contain" alt="real" />
                                        ) : (
                                            <span className="text-gray-400 font-bold flex flex-col items-center gap-2">
                                                <ImageIcon size={48} />
                                                Sem imagem
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 font-bold">Modo Foto Real (Mockup 3D Desativado)</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-lg p-8 overflow-hidden">
                   <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-500 text-sm">
                          <th className="p-4 w-20">Foto</th>
                          <th className="p-4">Nome</th>
                          <th className="p-4">Preço</th>
                          <th className="p-4">Categoria</th>
                          <th className="p-4">Tags/Filtros</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                            <td className="p-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                    <img 
                                        src={p.productImages[0] || "https://placehold.co/100x100?text=..."} 
                                        alt="" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </td>
                            <td className="p-4 font-bold text-gray-800">{p.name}</td>
                            <td className="p-4 text-gray-600">R$ {p.price.toFixed(2)}</td>
                            <td className="p-4"><span className="bg-sky/10 text-sky px-2 py-1 rounded-md text-xs font-bold">{p.category}</span></td>
                            <td className="p-4">
                                <div className="flex flex-wrap gap-1 max-w-[150px]">
                                    {p.filters?.slice(0, 2).map(f => (
                                        <span key={f} className="text-[10px] bg-gray-100 px-1 rounded">{f}</span>
                                    ))}
                                    {(p.filters?.length || 0) > 2 && <span className="text-[10px] text-gray-400">+{ (p.filters?.length || 0) - 2 }</span>}
                                </div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {p.active ? 'Ativo' : 'Inativo'}
                                </span>
                            </td>
                            <td className="p-4 flex gap-2">
                                <button 
                                    type="button"
                                    onClick={() => handleEditProduct(p)} 
                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                                    title="Editar Tudo"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <Link 
                                    to={`/product/${p.id}`} 
                                    className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                                    title="Ver Página"
                                >
                                    <Eye size={16} />
                                </Link>
                                <button 
                                    type="button"
                                    onClick={() => handleDeleteProductClick(p.id, p.name)}
                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                    title="Excluir Permanentemente"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                   </div>
                   {products.length === 0 && (
                       <p className="text-center py-10 text-gray-400">Nenhum produto cadastrado.</p>
                   )}
                </div>
            )}
        </div>
      )}

      {/* ... (Rest of tabs are unchanged) ... */}
      {activeTab === 'banners' && (
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-cream max-w-2xl">
             <h2 className="text-2xl font-bold text-gray-800 mb-2">Banner Principal</h2>
             <p className="text-sm text-gray-500 mb-6">A imagem ocupará toda a largura. Use imagens de alta resolução.</p>
             
             <div className="mb-6">
                 <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img src={banners[0].imageUrl} alt="Banner Atual" className="w-full h-full object-cover" />
                 </div>
                 <p className="text-xs text-center mt-2 text-gray-400">Visualização Atual</p>
             </div>
             
             <div className="space-y-4">
                 <label className="block text-sm font-bold text-gray-700">Upload Nova Imagem</label>
                 <div className="flex flex-col gap-2">
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={bannerFileInputRef}
                        onChange={handleBannerUpload}
                        className="hidden"
                    />
                    <div className="flex gap-2">
                      <input 
                          value={bannerUrlInput}
                          readOnly
                          className="flex-grow p-3 bg-cream/30 rounded-xl border border-gray-200 text-gray-500 text-sm"
                          placeholder="Nenhum arquivo selecionado..."
                      />
                      <button 
                        type="button" 
                        onClick={() => bannerFileInputRef.current?.click()}
                        className="bg-gray-200 p-3 rounded-xl text-gray-600 hover:bg-gray-300 transition"
                      >
                        <Upload size={20}/>
                      </button>
                    </div>
                 </div>
                 <Button onClick={handleBannerUpdate} disabled={!bannerUrlInput} fullWidth>Atualizar Banner</Button>
             </div>
          </div>
      )}
      
      {/* ... (Categories, Filters tabs logic same as before) ... */}
      {activeTab === 'themes' && (
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-cream">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gerenciar Categorias</h2>
                <div className="flex gap-2">
                    <input 
                        value={newThemeName} 
                        onChange={(e) => setNewThemeName(e.target.value)}
                        placeholder="Nova Categoria" 
                        className="p-2 border border-gray-200 bg-white text-gray-800 rounded-lg text-sm outline-none focus:border-cherry"
                    />
                    <button type="button" onClick={() => { if(newThemeName) { addCategory(newThemeName); setNewThemeName(''); }}} className="bg-cherry text-white px-3 rounded-lg font-bold hover:bg-pink-600">+</button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.sort((a,b) => a.name.localeCompare(b.name)).map(cat => (
                    <div key={cat.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${cat.active ? 'border-sky bg-sky/5' : 'border-gray-200 bg-gray-50'}`}>
                        {editingCategory?.id === cat.id ? (
                            <div className="flex gap-2 flex-grow mr-2">
                                <input 
                                    value={editingCategory.name} 
                                    onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                                    className="w-full p-1 text-sm border border-cherry rounded bg-white text-gray-800"
                                />
                                <button type="button" onClick={saveEditedCategory} className="text-green-600"><Check size={18}/></button>
                                <button type="button" onClick={() => setEditingCategory(null)} className="text-red-500"><X size={18}/></button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => handleEditCategory(cat.id)} className="text-gray-400 hover:text-gray-600">
                                    <Edit2 size={14} />
                                </button>
                                <span className={`font-bold ${cat.active ? 'text-gray-700' : 'text-gray-400'}`}>{cat.name}</span>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-gray-400">{cat.active ? 'Ativo' : 'Inativo'}</span>
                            <button type="button" onClick={() => toggleCategory(cat.id)} className="text-sky hover:text-sky/80 transition">
                                {cat.active ? <ToggleRight size={32} className="fill-current" /> : <ToggleLeft size={32} className="text-gray-400" />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <p className="mt-4 text-xs text-gray-400">* Categorias inativas não aparecem no filtro do catálogo.</p>
        </div>
      )}

      {activeTab === 'filters' && (
        <div className="bg-white rounded-3xl shadow-lg p-8 border border-cream">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Filtros de Busca</h2>
                <div className="flex gap-2">
                    <input 
                        value={newFilterName} 
                        onChange={(e) => setNewFilterName(e.target.value)}
                        placeholder="Novo Filtro" 
                        className="p-2 border border-gray-200 bg-white text-gray-800 rounded-lg text-sm outline-none focus:border-cherry"
                    />
                    <button type="button" onClick={() => { if(newFilterName) { addFilter(newFilterName); setNewFilterName(''); }}} className="bg-cherry text-white px-3 rounded-lg font-bold hover:bg-pink-600">+</button>
                </div>
            </div>
            <div className="flex flex-wrap gap-4">
                {filters.map(filter => (
                    <div key={filter.id} className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer transition select-none ${filter.active ? 'bg-gold text-gray-800 border-gold shadow-sm' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                        <div onClick={() => toggleFilter(filter.id)} className="flex items-center gap-2">
                             <span className="font-bold text-sm">{filter.name}</span>
                             {filter.active && <Check size={14} />}
                        </div>
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); if(confirm('Excluir este filtro permanentemente?')) deleteFilter(filter.id); }}
                            className="ml-2 text-gray-400 hover:text-red-500 transition"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}

      {activeTab === 'branding' && (
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-cream max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Palette className="text-cherry" /> Identidade Visual</h2>
              
              <div className="space-y-6">
                  {/* Redes Sociais Section */}
                  <div className="bg-gradient-to-br from-green-50 to-pink-50 p-6 rounded-2xl border border-pink-100">
                      <div className="flex items-center gap-2 mb-4 text-gray-800">
                          <Share2 size={20} className="text-cherry" />
                          <h3 className="font-bold text-lg">Redes Sociais e Contato</h3>
                      </div>
                      
                      <div className="space-y-4">
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                  <MessageCircle size={16} className="text-green-600" /> WhatsApp (Número com DDD)
                              </label>
                              <input 
                                  type="text"
                                  value={brandingForm.whatsappNumber}
                                  onChange={(e) => setBrandingForm({...brandingForm, whatsappNumber: e.target.value})}
                                  placeholder="Ex: 5511999999999"
                                  className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-green-500 text-gray-800"
                              />
                          </div>
                          
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                  <Instagram size={16} className="text-pink-600" /> Link do Instagram
                              </label>
                              <input 
                                  type="url"
                                  value={brandingForm.instagramUrl}
                                  onChange={(e) => setBrandingForm({...brandingForm, instagramUrl: e.target.value})}
                                  placeholder="https://instagram.com/seuusuario"
                                  className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-pink-500 text-gray-800"
                              />
                          </div>

                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">Mensagem Automática (WhatsApp)</label>
                              <textarea 
                                  value={brandingForm.whatsappMessage}
                                  onChange={(e) => setBrandingForm({...brandingForm, whatsappMessage: e.target.value})}
                                  placeholder="Ex: Olá! Gostei do produto {nome} (Ref: {sku})..."
                                  className="w-full h-24 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-cherry resize-none text-gray-800 text-sm"
                              />
                              <p className="text-[10px] text-gray-400 mt-1">* Use {`{nome}`} e {`{sku}`} para preenchimento automático em pedidos.</p>
                          </div>
                      </div>
                  </div>

                  {/* --- PERSONALIZAÇÃO DE CORES --- */}
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100 mb-6">
                      <div className="flex items-center gap-2 mb-4 text-indigo-900">
                          <PaintBucket size={20} />
                          <h3 className="font-bold text-lg">Personalização de Cores</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">Cor de Fundo do Site</label>
                              <input 
                                type="color" 
                                value={brandingForm.siteBackgroundColor}
                                onChange={(e) => setBrandingForm({...brandingForm, siteBackgroundColor: e.target.value})}
                                className="w-full h-10 cursor-pointer p-0 border-0"
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">Cor da Barra de Rolagem</label>
                              <input 
                                type="color" 
                                value={brandingForm.scrollbarColor}
                                onChange={(e) => setBrandingForm({...brandingForm, scrollbarColor: e.target.value})}
                                className="w-full h-10 cursor-pointer p-0 border-0"
                              />
                          </div>
                      </div>
                  </div>

                  {/* --- LOGO SECTION --- */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Logo Principal</label>
                      <div className="flex items-center gap-4">
                          <div className="w-24 h-24 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                              {brandingForm.logoUrl ? (
                                  <img src={brandingForm.logoUrl} alt="Preview Logo" className="w-full h-full object-contain" />
                              ) : (
                                  <span className="text-xs text-gray-400 text-center px-1">Texto Padrão</span>
                              )}
                          </div>
                          <div className="flex flex-col gap-2">
                              <input 
                                  type="file" 
                                  accept="image/*" 
                                  ref={logoFileInputRef}
                                  onChange={handleLogoUpload}
                                  className="hidden"
                              />
                              <button 
                                  type="button" 
                                  onClick={() => logoFileInputRef.current?.click()} 
                                  className="px-4 py-2 bg-white border border-gray-300 text-gray-600 text-sm font-bold rounded-lg hover:border-cherry hover:text-cherry transition flex items-center gap-2"
                              >
                                  <Upload size={16} /> Carregar Logo
                              </button>
                              {brandingForm.logoUrl && (
                                  <button 
                                      type="button" 
                                      onClick={handleRemoveLogo}
                                      className="px-4 py-2 bg-red-50 text-red-500 text-sm font-bold rounded-lg hover:bg-red-100 transition flex items-center gap-2"
                                  >
                                      <Trash2 size={16} /> Remover Logo
                                  </button>
                              )}
                          </div>
                      </div>
                  </div>

                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Título da Seção Sobre Nós</label>
                      <input 
                          type="text"
                          value={brandingForm.title}
                          onChange={(e) => setBrandingForm({...brandingForm, title: e.target.value})}
                          className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-cherry text-gray-800"
                      />
                  </div>

                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Texto de Apresentação</label>
                      <textarea 
                          value={brandingForm.text}
                          onChange={(e) => setBrandingForm({...brandingForm, text: e.target.value})}
                          className="w-full h-40 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-cherry resize-none text-gray-800"
                      />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tag 1</label>
                        <input 
                            type="text"
                            value={brandingForm.tag1}
                            onChange={(e) => setBrandingForm({...brandingForm, tag1: e.target.value})}
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-cherry text-gray-800"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tag 2</label>
                        <input 
                            type="text"
                            value={brandingForm.tag2}
                            onChange={(e) => setBrandingForm({...brandingForm, tag2: e.target.value})}
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-cherry text-gray-800"
                        />
                    </div>
                  </div>

                  <div className="pt-4">
                      <Button onClick={handleBrandingSave} fullWidth>Salvar Alterações</Button>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'archived' && (
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-cream">
              <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                  <div>
                      <h2 className="text-2xl font-bold text-gray-800">Itens Desativados</h2>
                      <p className="text-gray-500">Produtos que não aparecem no catálogo público.</p>
                  </div>
                  <div className="flex items-center gap-2">
                      <Filter size={18} className="text-gray-400" />
                      <select 
                          value={archivedCategoryFilter}
                          onChange={(e) => setArchivedCategoryFilter(e.target.value)}
                          className="bg-gray-100 border-none rounded-lg px-3 py-2 text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-cherry"
                      >
                          <option value="Todos">Todas as Categorias</option>
                          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                  </div>
              </div>

              {filteredArchivedProducts.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                      <Archive size={48} className="mx-auto mb-3 opacity-20" />
                      <p>Nenhum item desativado nesta categoria.</p>
                  </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredArchivedProducts.map(product => (
                        <div key={product.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 opacity-80 hover:opacity-100 transition relative group">
                            <div className="aspect-square bg-white rounded-lg mb-3 overflow-hidden grayscale group-hover:grayscale-0 transition">
                                <img src={product.productImages[0] || "https://placehold.co/400x400/f3f3f3/333333?text=Sem+Foto"} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <h3 className="font-bold text-gray-700 text-sm mb-1">{product.name}</h3>
                            <p className="text-xs text-gray-500 mb-3">SKU: {product.sku}</p>
                            <Link to={`/product/${product.id}`} className="block text-center w-full bg-white border border-gray-300 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-cherry hover:text-white hover:border-cherry transition">
                                Gerenciar
                            </Link>
                        </div>
                    ))}
                </div>
              )}
          </div>
      )}
    </div>
  );
};
