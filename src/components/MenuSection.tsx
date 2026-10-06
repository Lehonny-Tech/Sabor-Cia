import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Flame,
  Plus,
  Minus,
  Check,
  AlertCircle,
  X,
  Sparkles,
  ShoppingBag,
  SlidersHorizontal,
  ThumbsUp,
  Store,
  Clock,
  MapPin,
  Bike,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Lock,
  CheckCircle2,
  Trash2,
  CupSoda,
  GlassWater,
  Pizza,
  Utensils
} from 'lucide-react';
import { MenuItem, CartCustomization, Restaurant } from '../types';
import { useApp } from '../context/AppContext';

interface CustomizationOption {
  label: string;
  extraPrice: number;
}

interface MenuSectionProps {
  onGoToRegister?: () => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ onGoToRegister }) => {
  const {
    menuItems,
    addToCart,
    restaurants,
    selectedRestaurantId,
    setSelectedRestaurantId,
    currentUser,
    setAuthModalOpen,
    setCheckoutModalOpen,
    cart,
    clearCart,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeItemForCustomization, setActiveItemForCustomization] = useState<MenuItem | null>(null);

  // Pending item when user clicked without being logged in
  const [pendingItemAfterLogin, setPendingItemAfterLogin] = useState<MenuItem | null>(null);

  // Feedback notification banner
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type?: 'success' | 'info' } | null>(null);

  // Customization modal local state
  const [customizationSelections, setCustomizationSelections] = useState<Record<string, CustomizationOption>>({});
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemNotes, setItemNotes] = useState<string>('');
  const [conflictModalOpen, setConflictModalOpen] = useState(false);

  // Carousel ref
  const carouselRef = useRef<HTMLDivElement>(null);

  const activeRestaurant = restaurants.find(r => r.id === selectedRestaurantId) || null;

  // Most popular items across ALL establishments (first row carousel)
  const popularItems = menuItems.filter(item => item.popular && item.isAvailable);

  // Resume selection if user just logged in and had a pending item
  useEffect(() => {
    if (currentUser && pendingItemAfterLogin) {
      const itemToOpen = pendingItemAfterLogin;
      setPendingItemAfterLogin(null);
      openCustomizationModal(itemToOpen);
    }
  }, [currentUser, pendingItemAfterLogin]);

  const categories = [
    { id: 'todos', label: 'Todos os Produtos' },
    { id: 'burgers', label: 'Hambúrgueres' },
    { id: 'hotdogs', label: 'Hot Dogs & Prensados' },
    { id: 'pizzas', label: 'Pizzas & Calzones' },
    { id: 'pasteis', label: 'Pastéis & Salgados' },
    { id: 'porcoes', label: 'Porções & Fritas' },
    { id: 'combos', label: 'Combos Especiais' },
    { id: 'bebidas', label: 'Refrigerantes & Bebidas' },
    { id: 'sucos', label: 'Sucos Naturais & Frutas' },
    { id: 'sobremesas', label: 'Sobremesas & Shakes' },
  ];

  // Filtering
  const filteredItems = menuItems.filter(item => {
    const matchesRestaurant = selectedRestaurantId === 'all' || item.restaurantId === selectedRestaurantId;
    const matchesCategory = selectedCategory === 'todos' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRestaurant && matchesCategory && matchesSearch;
  });

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Main entry when user clicks to choose an item
  const handleSelectSnack = (item: MenuItem) => {
    // 1. Direct navigation: set the establishment directly
    setSelectedRestaurantId(item.restaurantId);

    // 2. If user is not logged in, prompt login as requested
    if (!currentUser) {
      setPendingItemAfterLogin(item);
      const rest = restaurants.find(r => r.id === item.restaurantId);
      setFeedbackToast({
        message: `Para pedir "${item.name}" no ${rest?.name || 'restaurante'}, faça seu login ou entre como visitante!`,
        type: 'info',
      });
      setTimeout(() => setFeedbackToast(null), 5000);
      setAuthModalOpen(true);
      return;
    }

    // 3. User is logged in, open the purchase modal
    openCustomizationModal(item);
  };

  const openCustomizationModal = (item: MenuItem) => {
    setActiveItemForCustomization(item);
    setItemQuantity(1);
    setItemNotes('');
    
    // Set default selections for single-select customizations if any
    const defaults: Record<string, { label: string; extraPrice: number }> = {};
    if (item.customizations) {
      item.customizations.forEach(group => {
        if (group.options.length > 0) {
          defaults[group.name] = group.options[0];
        }
      });
    }
    setCustomizationSelections(defaults);
  };

  // Check restaurant conflict: Cart has items from Restaurant A, but item is from Restaurant B
  const isRestaurantConflict = activeItemForCustomization &&
    cart.length > 0 &&
    cart[0].restaurantId &&
    cart[0].restaurantId !== activeItemForCustomization.restaurantId;

  const currentCartRestaurantName = cart[0]?.restaurantName || 'outro restaurante';
  const activeItemRestaurant = restaurants.find(r => r.id === activeItemForCustomization?.restaurantId);

  const executeAddToCart = (finalizeImmediately: boolean = false) => {
    if (!activeItemForCustomization) return;

    const formattedCustomizations: CartCustomization[] = Object.entries(customizationSelections).map(([groupName, option]) => {
      const opt = option as CustomizationOption;
      return {
        groupName,
        selectedOption: opt.label,
        extraPrice: opt.extraPrice,
      };
    });

    const itemToAdd = activeItemForCustomization;
    const qty = itemQuantity;
    const notes = itemNotes.trim() || undefined;

    // Add to cart without opening drawer so the customer isn't disrupted
    addToCart(itemToAdd, qty, formattedCustomizations, notes, false);
    setActiveItemForCustomization(null);
    setConflictModalOpen(false);

    if (finalizeImmediately) {
      // Directly open checkout
      setCheckoutModalOpen(true);
    } else {
      // Feedback toast for "Adicionar mais itens"
      const restName = activeItemRestaurant?.name || 'o estabelecimento';
      setFeedbackToast({
        message: `${qty}x "${itemToAdd.name}" adicionado ao pedido! Você pode escolher mais lanches do ${restName} ou finalizar quando quiser.`,
        type: 'success',
      });
      setTimeout(() => setFeedbackToast(null), 4500);
    }
  };

  const handleAction = (finalizeImmediately: boolean) => {
    if (isRestaurantConflict) {
      setConflictModalOpen(true);
      return;
    }
    executeAddToCart(finalizeImmediately);
  };

  const handleConfirmConflictAndAdd = (finalizeImmediately: boolean) => {
    clearCart();
    executeAddToCart(finalizeImmediately);
  };

  // Calculate modal unit total
  const modalExtrasTotal = (Object.values(customizationSelections) as CustomizationOption[]).reduce(
    (acc, curr) => acc + (curr?.extraPrice || 0),
    0
  );
  const modalUnitPrice = (activeItemForCustomization?.price || 0) + modalExtrasTotal;
  const modalFinalTotal = modalUnitPrice * itemQuantity;

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md bg-stone-900 text-white p-4 rounded-2xl shadow-2xl border border-stone-700 flex items-start gap-3 animate-in slide-in-from-top-4 duration-200">
          <div className="p-1 rounded-lg bg-orange-500 text-white shrink-0 mt-0.5">
            <Check className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <p className="font-bold text-white mb-0.5">
              {feedbackToast.type === 'success' ? 'Lanche Adicionado!' : 'Acesso ao Restaurante'}
            </p>
            <p className="text-stone-300 leading-relaxed">{feedbackToast.message}</p>
          </div>
          <button
            onClick={() => setFeedbackToast(null)}
            className="text-stone-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. PRIMEIRA LINHA: CARROSSEL DOS MAIS PEDIDOS (INDEPENDENTE DO ESTABELECIMENTO) */}
      <section id="popular-snacks-carousel-section" className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-950 tracking-tight flex items-center gap-2">
                Mais Pedidos da Cidade
                <span className="text-[10px] bg-orange-100 text-orange-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Top Escolhas
                </span>
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Os lanches favoritos de todos os restaurantes parceiros reunidos aqui
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="popular-carousel-left-btn"
              onClick={() => scrollCarousel('left')}
              className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors shadow-xs"
              title="Voltar lanches"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="popular-carousel-right-btn"
              onClick={() => scrollCarousel('right')}
              className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors shadow-xs"
              title="Avançar lanches"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel Track */}
        <div
          ref={carouselRef}
          className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth' }}
        >
          {popularItems.map(item => {
            const itemRestaurant = restaurants.find(r => r.id === item.restaurantId);
            return (
              <div
                key={item.id}
                id={`carousel-item-${item.id}`}
                className="w-72 sm:w-80 shrink-0 bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group snap-start"
              >
                <div>
                  {/* Image with restaurant pill */}
                  <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />

                    {/* Popular Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 bg-orange-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                        <Flame className="w-3 h-3 text-amber-300" /> Mais Pedido
                      </span>
                    </div>

                    {/* Establishment Pill on Image */}
                    {itemRestaurant && (
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-stone-900 text-[10px] font-bold px-2 py-1 rounded-xl border border-stone-200/70 shadow-xs flex items-center gap-1.5 max-w-[150px] truncate">
                        <img
                          src={itemRestaurant.logoUrl}
                          alt={itemRestaurant.name}
                          className="w-4 h-4 rounded-full object-cover shrink-0"
                        />
                        <span className="truncate">{itemRestaurant.name}</span>
                      </div>
                    )}

                    {/* Price Tag */}
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white">
                      <span className="text-xl font-black drop-shadow-md">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[11px] font-bold text-amber-300 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-lg">
                        ★ {itemRestaurant?.rating.toFixed(1) || '4.9'}
                      </span>
                    </div>
                  </div>

                  {/* Snack Details */}
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">
                      <Store className="w-3 h-3" />
                      <span>{itemRestaurant?.name || 'Lanchonete Parceira'}</span>
                    </div>
                    <h3 className="font-extrabold text-stone-900 text-sm group-hover:text-orange-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Direct Action Button: Takes directly to establishment and prompts login/options */}
                <div className="p-4 pt-0">
                  <button
                    id={`carousel-select-btn-${item.id}`}
                    onClick={() => handleSelectSnack(item)}
                    className="w-full py-2.5 px-3 bg-stone-900 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md active:scale-98"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-300" />
                    <span>Escolher Lanche</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. BARRA DE RESTAURANTES & LANCHONETES */}
      <section className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-stone-900">Restaurantes Cadastrados</h2>
              <p className="text-[11px] text-stone-500">
                Selecione para explorar o cardápio exclusivo de cada estabelecimento
              </p>
            </div>
          </div>

          {onGoToRegister && (
            <button
              id="top-register-store-btn"
              onClick={onGoToRegister}
              className="text-xs bg-orange-600 hover:bg-orange-700 text-white font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Cadastrar Minha Lanchonete
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          <button
            id="rest-filter-all"
            onClick={() => setSelectedRestaurantId('all')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
              selectedRestaurantId === 'all'
                ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            Todos os Restaurantes ({restaurants.length})
          </button>

          {restaurants.map(rest => {
            const isSelected = selectedRestaurantId === rest.id;
            return (
              <button
                key={rest.id}
                id={`rest-filter-${rest.id}`}
                onClick={() => setSelectedRestaurantId(rest.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2.5 border ${
                  isSelected
                    ? 'bg-orange-50 text-orange-950 border-orange-500 ring-2 ring-orange-500/20 shadow-xs'
                    : 'bg-white text-stone-700 hover:border-stone-300 border-stone-200'
                }`}
              >
                <img
                  src={rest.logoUrl}
                  alt={rest.name}
                  className="w-6 h-6 rounded-lg object-cover"
                />
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate max-w-[140px]">{rest.name}</span>
                    <span className="flex items-center text-[10px] text-amber-500 font-black">
                      ★ {rest.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. HERO BANNER DO RESTAURANTE SELECIONADO */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-white shadow-xl">
        {activeRestaurant && (
          <img
            src={activeRestaurant.coverUrl}
            alt={activeRestaurant.name}
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
        )}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs px-3 py-1 rounded-full font-semibold mb-3">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              {activeRestaurant ? `${activeRestaurant.slogan}` : 'Plataforma Multi-Restaurantes • Sabor & Cia'}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {activeRestaurant ? activeRestaurant.name : 'O Melhor Sabor Artesanal da Cidade'}
            </h1>
            <p className="mt-2 text-stone-300 text-sm sm:text-base leading-relaxed">
              {activeRestaurant ? activeRestaurant.description : 'Explore os melhores hambúrgueres artesanais, hot dogs, porções crocantes e lanches com entrega rápida e clube de fidelidade.'}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-amber-200">
              {activeRestaurant ? (
                <>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" /> {activeRestaurant.deliveryTimeMin}-{activeRestaurant.deliveryTimeMax} min
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Bike className="w-4 h-4 text-amber-400" /> Taxa: {activeRestaurant.deliveryFee === 0 ? 'Grátis' : `R$ ${activeRestaurant.deliveryFee.toFixed(2).replace('.', ',')}`}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-current" /> {activeRestaurant.rating.toFixed(1)} ({activeRestaurant.reviewCount} avaliações)
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" /> +1 Ponto Fidelidade a cada R$ 1 gasto
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ThumbsUp className="w-4 h-4 text-amber-400" /> 4.9 estrelas de satisfação média
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-right">
              <p className="text-xs text-amber-200 font-semibold">Cupom de Boas-Vindas</p>
              <p className="text-lg font-black text-white">PRIMEIRACOMPRA</p>
              <p className="text-[11px] text-stone-300">R$ 12 OFF no seu 1º pedido</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shadow-md">
              %
            </div>
          </div>
        </div>
      </section>

      {/* 4. BUSCA & FILTRO POR CATEGORIAS */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              id="menu-search-input"
              type="text"
              placeholder="Buscar por burger, pizza, pastel, refrigerante, suco de laranja, melancia..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white rounded-2xl border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                id="clear-menu-search-btn"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 self-end sm:self-auto">
            <span>{filteredItems.length} itens disponíveis</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              id={`cat-btn-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-amber-900 text-amber-50 shadow-sm shadow-amber-950/20 scale-[1.02]'
                  : 'bg-white text-stone-600 hover:text-stone-900 hover:bg-amber-100/50 border border-stone-200/80'
              }`}
            >
              {cat.id === 'burgers' && <Flame className="w-3.5 h-3.5 text-orange-500" />}
              {cat.id === 'pizzas' && <Pizza className="w-3.5 h-3.5 text-red-500" />}
              {cat.id === 'pasteis' && <Utensils className="w-3.5 h-3.5 text-amber-600" />}
              {cat.id === 'bebidas' && <CupSoda className="w-3.5 h-3.5 text-blue-500" />}
              {cat.id === 'sucos' && <GlassWater className="w-3.5 h-3.5 text-emerald-500" />}
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* 5. GRID COMPLETO DE LANCHES */}
      <section>
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">Nenhum lanche encontrado</h3>
            <p className="text-xs text-stone-500 mt-1 mb-4">
              Não encontramos nenhum produto com "{searchQuery}". Tente outros termos ou limpe a busca.
            </p>
            <button
              id="reset-search-btn"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('todos');
              }}
              className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-stone-800"
            >
              Ver Cardápio Completo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => {
              const isOutOfStock = item.stock <= 0 || !item.isAvailable;
              const isLowStock = item.stock > 0 && item.stock <= 5;
              const itemRestaurant = restaurants.find(r => r.id === item.restaurantId);

              return (
                <div
                  key={item.id}
                  id={`menu-item-card-${item.id}`}
                  className={`group bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
                    isOutOfStock ? 'opacity-70 grayscale-20' : ''
                  }`}
                >
                  <div>
                    {/* Image Container */}
                    <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent opacity-60" />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {item.popular && (
                          <span className="inline-flex items-center gap-1 bg-orange-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                            <Flame className="w-3 h-3" /> Mais Pedido
                          </span>
                        )}
                        {isLowStock && (
                          <span className="inline-flex items-center gap-1 bg-amber-500 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            <AlertCircle className="w-3 h-3" /> Só restam {item.stock}!
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                            Esgotado
                          </span>
                        )}
                      </div>

                      {/* Stock indicator badge top right */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-stone-800 text-[11px] font-bold px-2 py-0.5 rounded-lg border border-stone-200/60">
                        Estoque: {item.stock} un
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white">
                        <span className="text-xl font-black drop-shadow-md">
                          R$ {item.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>

                    {/* Content Info */}
                    <div className="p-5">
                      <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">
                        <Store className="w-3 h-3 text-orange-600" />
                        <span>{itemRestaurant?.name || 'Restaurante Parceiro'}</span>
                      </div>
                      <h3 className="font-extrabold text-stone-900 text-base group-hover:text-orange-600 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-stone-500 mt-1.5 leading-relaxed line-clamp-3">
                        {item.description}
                      </p>

                      {item.customizations && item.customizations.length > 0 && (
                        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg w-fit">
                          <SlidersHorizontal className="w-3 h-3" /> Opções & Adicionais Disponíveis
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action: Direct Choose Snack */}
                  <div className="p-5 pt-0">
                    <button
                      id={`add-item-btn-${item.id}`}
                      disabled={isOutOfStock}
                      onClick={() => handleSelectSnack(item)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-xs ${
                        isOutOfStock
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          : 'bg-stone-900 hover:bg-orange-600 text-white active:scale-98'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 text-amber-400" />
                      {isOutOfStock ? 'Indisponível no Momento' : 'Escolher Lanche'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. MODAL DE ESCOLHA DO LANCHE (REGRA DE COMPRAS & CONTADOR DE LANCHES) */}
      {activeItemForCustomization && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            id="item-customization-modal"
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header with Image & Establishment Info */}
            <div className="relative h-44 bg-stone-100 shrink-0">
              <img
                src={activeItemForCustomization.imageUrl}
                alt={activeItemForCustomization.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                id="close-customization-modal-btn"
                onClick={() => setActiveItemForCustomization(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl text-[11px] font-bold text-stone-900 shadow-sm flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-orange-600" />
                <span>{activeItemRestaurant?.name || 'Restaurante'}</span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <h3 className="text-xl font-black">{activeItemForCustomization.name}</h3>
                <div className="flex items-center justify-between text-xs text-stone-300 mt-0.5">
                  <span>Preço unitário: R$ {modalUnitPrice.toFixed(2).replace('.', ',')}</span>
                  <span className="text-amber-300 font-semibold">
                    {activeItemRestaurant?.deliveryTimeMin}-{activeItemRestaurant?.deliveryTimeMax} min de entrega
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable Options */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              <p className="text-xs text-stone-600 leading-relaxed">
                {activeItemForCustomization.description}
              </p>

              {/* Restaurant Conflict Warning (Regra de Compras) */}
              {isRestaurantConflict && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Regra de Compras por Restaurante</span>
                  </div>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    Seu carrinho já tem itens de <strong>{currentCartRestaurantName}</strong>. Pedidos de restaurantes diferentes não podem ser misturados na mesma entrega.
                  </p>
                  <p className="text-[11px] text-amber-900 font-semibold">
                    Ao confirmar este lanche, seu carrinho será atualizado com os itens do <strong>{activeItemRestaurant?.name}</strong>.
                  </p>
                </div>
              )}

              {/* CONTADOR DE LANCHES (QUANTIDADE) */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-black text-stone-900 uppercase tracking-wider block">
                      Quantos lanches iguais você deseja?
                    </label>
                    <span className="text-[11px] text-stone-500">
                      Disponível em estoque: {activeItemForCustomization.stock} unidades
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-stone-300 bg-white rounded-xl p-1 shadow-xs">
                    <button
                      id="decrease-modal-qty-btn"
                      onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                      className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 active:scale-95"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span
                      id="modal-item-quantity-display"
                      className="w-10 text-center text-sm font-black text-stone-950"
                    >
                      {itemQuantity}
                    </span>
                    <button
                      id="increase-modal-qty-btn"
                      onClick={() => setItemQuantity(Math.min(activeItemForCustomization.stock, itemQuantity + 1))}
                      className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Quantity Chips */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-stone-500 font-semibold mr-1">Rápido:</span>
                  {[1, 2, 3, 4, 5].map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setItemQuantity(Math.min(activeItemForCustomization.stock, q))}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        itemQuantity === q
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {q}x
                    </button>
                  ))}
                </div>

                {/* Subtotal calculation pill */}
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-stone-200 text-xs">
                  <span className="text-stone-600 font-medium">Subtotal deste lanche:</span>
                  <span className="font-extrabold text-stone-950">
                    {itemQuantity}x R$ {modalUnitPrice.toFixed(2).replace('.', ',')} = <strong className="text-orange-600 text-sm">R$ {modalFinalTotal.toFixed(2).replace('.', ',')}</strong>
                  </span>
                </div>
              </div>

              {/* Customization Groups (Ponto da carne, adicionais, etc.) */}
              {activeItemForCustomization.customizations?.map((group, groupIdx) => (
                <div key={groupIdx} className="border-t border-stone-100 pt-4">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5">
                    {group.name}
                  </h4>
                  <div className="space-y-2">
                    {group.options.map((option, optIdx) => {
                      const isSelected = customizationSelections[group.name]?.label === option.label;
                      return (
                        <label
                          key={optIdx}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50/50 text-stone-900 font-semibold shadow-xs'
                              : 'border-stone-200 hover:border-stone-300 text-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="radio"
                              name={group.name}
                              checked={isSelected}
                              onChange={() => {
                                setCustomizationSelections(prev => ({
                                  ...prev,
                                  [group.name]: option,
                                }));
                              }}
                              className="text-orange-600 focus:ring-orange-500"
                            />
                            <span>{option.label}</span>
                          </div>
                          {option.extraPrice > 0 && (
                            <span className="font-bold text-orange-600">
                              +R$ {option.extraPrice.toFixed(2).replace('.', ',')}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Special Instructions / Notes */}
              <div className="border-t border-stone-100 pt-4">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                  Alguma observação para o preparo?
                </label>
                <textarea
                  id="item-customization-notes-input"
                  rows={2}
                  placeholder="Ex: Tirar cebola, maionese à parte, carne bem passada..."
                  value={itemNotes}
                  onChange={e => setItemNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Bottom Actions Footer (Dois botões: Escolher Mais Itens ou Finalizar Pedido) */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
              {/* Button 1: Adicionar mais itens */}
              <button
                id="add-more-items-btn"
                onClick={() => handleAction(false)}
                className="w-full sm:flex-1 py-3 px-3 bg-white hover:bg-stone-100 text-stone-800 font-extrabold text-xs rounded-xl border border-stone-300 shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98"
                title="Adiciona este lanche ao pedido e permite escolher mais itens deste restaurante"
              >
                <Plus className="w-4 h-4 text-stone-600" />
                <span>Adicionar e Escolher Mais Itens</span>
              </button>

              {/* Button 2: Finalizar Pedido Diretamente */}
              <button
                id="confirm-and-finalize-order-btn"
                onClick={() => handleAction(true)}
                className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-between active:scale-98"
                title="Adiciona e vai direto para a tela de pagamento e entrega"
              >
                <span>Finalizar Pedido</span>
                <span>R$ {modalFinalTotal.toFixed(2).replace('.', ',')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Modal when switching restaurants */}
      {conflictModalOpen && activeItemForCustomization && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-stone-900">
              Iniciar novo pedido no {activeItemRestaurant?.name}?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Você já possui lanches do <strong>{currentCartRestaurantName}</strong> na sacola. Deseja limpar a sacola anterior para pedir do <strong>{activeItemRestaurant?.name}</strong>?
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setConflictModalOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleConfirmConflictAndAdd(false)}
                className="flex-1 py-2.5 text-xs font-extrabold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors shadow-sm"
              >
                Sim, Novo Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
