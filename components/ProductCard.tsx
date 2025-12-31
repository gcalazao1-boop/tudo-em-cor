import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { ArrowRight, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Logic: Prioritize real photos. If none, use a placeholder. Do NOT use rawArtUrl.
  const imageUrl = (product.productImages && product.productImages.length > 0)
    ? product.productImages[0]
    : 'https://placehold.co/400x400/f3f3f3/aaaaaa?text=Sem+Foto';

  return (
    <div className="group bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-gold flex flex-col h-full relative">
      <div className="relative w-full pt-[100%] bg-cream rounded-2xl overflow-hidden mb-4">
        {/* Image */}
        <img 
          src={imageUrl} 
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Hover Action - Increased z-index for safety */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 pointer-events-none group-hover:pointer-events-auto">
             <Link to={`/product/${product.id}`} className="bg-white text-cherry px-4 py-2 rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg flex items-center gap-2 hover:bg-gray-100">
                <Eye size={16} /> Ver Detalhes
             </Link>
        </div>
      </div>

      <div className="flex flex-col flex-grow">
        <span className="text-xs font-bold text-sky uppercase tracking-wider mb-1">{product.category}</span>
        <h3 className="text-lg font-bold text-gray-800 leading-tight mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">{product.description}</p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm text-gray-400">Ref: {product.sku}</span>
          <Link to={`/product/${product.id}`} className="text-cherry hover:text-pink-700 font-bold text-sm flex items-center gap-1 z-20">
            ver mais <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};