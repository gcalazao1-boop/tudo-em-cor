
export interface MockupSettings {
  scale: number;
  posX: number;
  posY: number;
  rotate: number;
  mugColor: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  rawArtUrl: string; // The flat image file for the mockup
  productImages: string[]; // Real photos of the mug
  category: string;
  views: number;
  price: number;
  filters?: string[]; // Added for filter management
  active: boolean; // New: Controls visibility in catalog
  isMug: boolean; // New: Controls if Mockup 3D is generated/shown
  mockupSettings?: MockupSettings; // New: Persisted mockup adjustments
}

export interface Category {
  id: string;
  name: string;
  active: boolean;
}

export interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  active: boolean;
}

export interface FilterOption {
  id: string;
  name: string;
  active: boolean;
}

export interface Branding {
  title: string;
  text: string;
  imageUrl: string;
  tag1: string; // New: Editable tag 1
  tag2: string; // New: Editable tag 2
  logoUrl?: string; // New: Custom logo URL
  siteBackgroundColor: string; // New: Custom site background color
  scrollbarColor: string; // New: Custom scrollbar thumb color
  savedColors: string[]; // New: List of saved custom colors
  whatsappNumber: string; // Adicionado: Número de WhatsApp para contato
  whatsappMessage: string; // Adicionado: Mensagem padrão para pedidos
  instagramUrl: string; // Adicionado: Link do perfil do Instagram
}

export type ProductContextType = {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  filters: FilterOption[];
  branding: Branding; 
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void; // New: Edit product
  deleteProduct: (id: string) => void;
  toggleProductActive: (id: string) => void;
  updateBanner: (banner: Banner) => void;
  updateBranding: (branding: Branding) => void;
  toggleCategory: (id: string) => void;
  updateCategory: (id: string, name: string) => void; // New: Edit category name
  toggleFilter: (id: string) => void;
  deleteFilter: (id: string) => void; // New: Delete filter
  addCategory: (name: string) => void;
  addFilter: (name: string) => void;
};
