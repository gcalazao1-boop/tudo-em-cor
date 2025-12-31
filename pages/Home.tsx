
import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ProductContextType } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Heart, Zap, Star, Instagram, MessageCircle } from 'lucide-react';

export const Home: React.FC = () => {
  const { products, banners, categories, branding } = useOutletContext<ProductContextType>();

  // Get Active Banner
  const activeBanner = banners.find(b => b.active) || banners[0];
  
  // Filter for "featured" logic and Active Categories, AND active products
  const activeCategoryNames = categories.filter(c => c.active).map(c => c.name);
  const availableProducts = products.filter(p => p.active && activeCategoryNames.includes(p.category));
  const featuredProducts = availableProducts.slice(0, 4);

  // Display only active themes in the strip
  const displayThemes = categories.filter(c => c.active).slice(0, 4);

  // Format WhatsApp link with branding configuration
  const getWhatsAppLink = () => {
      const phone = branding.whatsappNumber || '5511999999999';
      const msg = branding.whatsappMessage || 'Olá! Estava navegando no catálogo e gostaria de tirar uma dúvida.';
      // We use generic placeholders for general contact
      const finalMsg = msg.replace('{nome}', 'Visitante').replace('{sku}', 'Site');
      return `https://wa.me/${phone}?text=${encodeURIComponent(finalMsg)}`;
  };

  return (
    <div className="space-y-12 pb-12">
      
      {/* Dynamic Hero Banner - 100% Image, No Text Overlay */}
      <section className="relative w-full mx-auto max-w-7xl mt-4 md:mt-8 h-[300px] md:h-[500px] overflow-hidden rounded-b-[3rem] md:rounded-[3rem] shadow-lg shadow-gray-300 group">
         <Link to="/catalog">
            <img 
              src={activeBanner?.imageUrl} 
              alt={activeBanner?.title || "Banner Principal"}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
         </Link>
      </section>

      {/* Categories/Themes Strip */}
      <section className="bg-white py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {displayThemes.map((theme) => (
              <Link key={theme.id} to={`/catalog?category=${theme.name}`}>
                <div className="group cursor-pointer bg-cream hover:bg-sky hover:text-white transition-all duration-300 px-8 py-3 rounded-full flex items-center justify-center text-sm md:text-lg font-bold text-gray-600 shadow-sm border border-transparent hover:border-sky">
                  {theme.name}
                </div>
              </Link>
            ))}
            <Link to="/catalog">
                <div className="group cursor-pointer bg-white border border-gray-200 hover:border-cherry hover:text-cherry transition-all duration-300 px-8 py-3 rounded-full flex items-center justify-center text-sm md:text-lg font-bold text-gray-400 shadow-sm">
                  Ver todos
                </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Heart className="text-cherry fill-cherry" /> Mais Amadas
          </h2>
          <Link to="/catalog" className="text-sky font-bold hover:underline">ver tudo</Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* About Us Snippet (Dynamic) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-cherry/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold text-cherry mb-4">{branding.title}</h2>
            <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-line">
              {branding.text}
            </p>
            <div className="flex gap-4 flex-wrap justify-center md:justify-start">
              <div className="flex items-center gap-2 text-gray-600 font-semibold bg-white/50 px-3 py-1 rounded-full">
                <Zap size={20} className="text-gold fill-gold" /> {branding.tag1}
              </div>
              <div className="flex items-center gap-2 text-gray-600 font-semibold bg-white/50 px-3 py-1 rounded-full">
                <Star size={20} className="text-gold fill-gold" /> {branding.tag2}
              </div>
            </div>

            {/* SOCIAL ICONS CENTERED BELOW TEXT */}
            <div className="flex justify-center gap-8 mt-10">
                <a 
                    href={getWhatsAppLink()} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="group flex flex-col items-center gap-2 transition-transform hover:scale-110"
                    title="Chamar no WhatsApp"
                >
                    <div className="bg-white p-4 rounded-full shadow-lg text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                        <MessageCircle size={32} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp</span>
                </a>

                {branding.instagramUrl && (
                    <a 
                        href={branding.instagramUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="group flex flex-col items-center gap-2 transition-transform hover:scale-110"
                        title="Seguir no Instagram"
                    >
                        <div className="bg-white p-4 rounded-full shadow-lg text-pink-600 group-hover:bg-gradient-to-tr group-hover:from-yellow-400 group-hover:via-pink-600 group-hover:to-purple-600 group-hover:text-white transition-all">
                            <Instagram size={32} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instagram</span>
                    </a>
                )}
            </div>
          </div>
          <div className="w-full md:w-1/3 h-64 bg-white rounded-2xl shadow-lg overflow-hidden relative">
            <img 
              src={branding.imageUrl} 
              alt="Sobre nós" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

    </div>
  );
};
