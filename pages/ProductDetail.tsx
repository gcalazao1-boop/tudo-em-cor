import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, Link, useNavigate } from 'react-router-dom';
import { ProductContextType } from '../types';
import { MockupViewer } from '../components/MockupViewer';
import { Button } from '../components/Button';
import { MessageCircle, Share2, ArrowLeft, Image as ImageIcon, Box, Trash2, EyeOff, Eye, Download, Lock } from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, isAuthenticated, deleteProduct, toggleProductActive, branding } = useOutletContext<ProductContextType>();
  const product = products.find(p => p.id === id);

  const [activeTab, setActiveTab] = useState<'photos' | 'mockup'>('photos');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Set default tab based on product type
  useEffect(() => {
    if (product?.isMug) {
        setActiveTab('mockup');
    } else {
        setActiveTab('photos');
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
        <h2 className="text-2xl font-bold mb-4">Produto não encontrado</h2>
        <Link to="/catalog" className="text-cherry hover:underline">Voltar para o catálogo</Link>
      </div>
    );
  }

  const handleWhatsAppClick = () => {
    const phone = branding.whatsappNumber || '5511999999999';
    const messageTemplate = branding.whatsappMessage || 'Olá! Gostei da caneca "{nome}" (Ref: {sku}). Gostaria de mais informações!';
    
    const message = messageTemplate
      .replace('{nome}', product.name)
      .replace('{sku}', product.sku);
      
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleDelete = () => {
      if (window.confirm(`Tem certeza que deseja EXCLUIR o produto "${product.name}" permanentemente? esta ação não pode ser desfeita.`)) {
          deleteProduct(product.id);
          navigate('/catalog');
      }
  };

  const handleToggleActive = () => {
      toggleProductActive(product.id);
  };

  // Logic: Do NOT show rawArtUrl in the 2D gallery. 
  // If productImages is empty, we show a placeholder.
  const displayImages = product.productImages.length > 0 
    ? product.productImages 
    : ['https://placehold.co/600x600/f3f3f3/aaaaaa?text=Sem+Foto+Real'];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <Link to="/catalog" className="inline-flex items-center text-gray-500 hover:text-cherry mb-8 font-semibold transition">
        <ArrowLeft size={20} className="mr-2" /> Voltar ao catálogo
      </Link>

      {!product.active && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 font-bold flex items-center gap-2">
              <EyeOff size={20} /> Este produto está DESATIVADO e não aparece no catálogo público.
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Visuals (Mockup & Photos) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Tab Switcher - Only show Mockup tab if it IS a mug */}
          <div className="flex p-1 bg-white rounded-full w-fit shadow-sm border border-gray-100 mx-auto lg:mx-0">
            <button 
              type="button"
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'photos' ? 'bg-cherry text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ImageIcon size={16} /> Fotos Reais
            </button>
            {product.isMug && (
                <button 
                type="button"
                onClick={() => setActiveTab('mockup')}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'mockup' ? 'bg-cherry text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                >
                <Box size={16} /> Mockup 3D
                </button>
            )}
          </div>

          {/* Display Area */}
          <div className="w-full">
            {activeTab === 'mockup' && product.isMug ? (
              // Mockup viewer still receives rawArtUrl to generate texture, but handles it internally
              <MockupViewer 
                artUrl={product.rawArtUrl} 
                settings={product.mockupSettings} // Pass saved settings
                isEditable={false} // Read-only mode for customers
              />
            ) : (
              <div className="space-y-4">
                 <div className="aspect-square w-full bg-white rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                   <img 
                     src={displayImages[activeImageIndex]} 
                     alt={product.name} 
                     className="w-full h-full object-cover"
                   />
                 </div>
                 {/* Thumbnails */}
                 <div className="flex gap-4 overflow-x-auto pb-2">
                   {displayImages.map((img, idx) => (
                     <button 
                       key={idx}
                       type="button"
                       onClick={() => setActiveImageIndex(idx)}
                       className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${activeImageIndex === idx ? 'border-cherry ring-2 ring-pink-200' : 'border-transparent opacity-70 hover:opacity-100'}`}
                     >
                       <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                     </button>
                   ))}
                 </div>
              </div>
            )}
          </div>

          {/* --- ADMIN ONLY AREA: RAW ART --- */}
          {isAuthenticated && (
              <div className="bg-gray-800 text-white p-6 rounded-2xl shadow-xl mt-8 border border-gray-700">
                  <div className="flex items-center gap-2 mb-4 text-gold">
                      <Lock size={20} />
                      <h3 className="font-bold text-lg">Área do Administrador: Arte Original</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">
                      Esta imagem (arte bruta) é visível apenas para administradores.
                  </p>
                  
                  <div className="flex gap-6 items-start">
                      <div className="w-32 h-32 bg-gray-700 rounded-lg overflow-hidden border border-gray-600">
                          {product.rawArtUrl ? (
                             <img src={product.rawArtUrl} alt="Arte Bruta" className="w-full h-full object-contain" />
                          ) : (
                              <div className="flex items-center justify-center h-full text-xs text-gray-500">Sem Arte</div>
                          )}
                      </div>
                      <div className="flex-1">
                          <p className="text-xs text-gray-400 mb-2">Arquivo de origem para sublimação.</p>
                          {product.rawArtUrl ? (
                              <a 
                                href={product.rawArtUrl} 
                                download={`Arte-${product.sku}.png`}
                                className="inline-flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg font-bold hover:bg-gold transition text-sm"
                              >
                                  <Download size={16} /> Baixar Arte
                              </a>
                          ) : (
                              <span className="text-red-400 text-sm font-bold">Nenhum arquivo de arte carregado.</span>
                          )}
                      </div>
                  </div>
              </div>
          )}

        </div>

        {/* Right Column: Info & Actions */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-sky/10 text-sky px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                {product.category}
              </span>
              <span className="text-gray-400 text-sm font-mono">SKU: {product.sku}</span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-800 mb-4 leading-tight">{product.name}</h1>
            
            <div className="text-3xl font-bold text-cherry mb-6">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream">
              <h3 className="font-bold text-gray-800 mb-2">Sobre a arte</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
              
              {/* Filter Tags with Links */}
              {product.filters && product.filters.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                      {product.filters.map(tag => (
                          <Link 
                            key={tag} 
                            to={`/catalog?filter=${tag}`}
                            className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded-full hover:bg-cherry hover:text-white transition"
                          >
                              #{tag}
                          </Link>
                      ))}
                  </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200">
            <Button onClick={handleWhatsAppClick} fullWidth variant="primary" className="flex items-center justify-center gap-2 h-14 text-lg">
              <MessageCircle size={24} /> Encomendar no WhatsApp
            </Button>
            
            <Button fullWidth variant="secondary" className="flex items-center justify-center gap-2 h-12 text-gray-700">
              <Share2 size={20} /> Compartilhar
            </Button>
          </div>

          {/* Admin Controls */}
          {isAuthenticated && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Administração</h3>
                  <div className="flex flex-col gap-3">
                      {/* Navigate back to admin to edit this product */}
                      <Link 
                        to="/admin" 
                        state={{ editingProductId: product.id }} 
                        className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition flex items-center justify-center gap-2"
                      >
                         <Eye size={18} /> Editar Produto
                      </Link>

                      <button 
                        type="button"
                        onClick={handleToggleActive}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${product.active ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                      >
                          {product.active ? <><EyeOff size={18}/> Desativar Item</> : <><Eye size={18}/> Reativar Item</>}
                      </button>
                      
                      <button 
                        type="button"
                        onClick={handleDelete}
                        className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition flex items-center justify-center gap-2"
                      >
                          <Trash2 size={18} /> Excluir Permanentemente
                      </button>
                  </div>
              </div>
          )}

          <div className="bg-yellow-50 p-4 rounded-xl flex gap-3 items-start mt-6">
             <div className="bg-gold text-white p-1 rounded-full mt-1">
               <Box size={14} />
             </div>
             <div>
               <p className="text-sm text-gray-800 font-bold">Dica de Personalização</p>
               <p className="text-xs text-gray-600 mt-1">
                 Gostou da arte mas quer adicionar seu nome? Fale com a gente no WhatsApp! Fazemos ajustes na hora.
               </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};