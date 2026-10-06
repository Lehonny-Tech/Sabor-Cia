import React, { useState } from 'react';
import {
  X,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tag,
  BarChart3,
  Star,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Bike,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  ChevronRight,
  Flame,
  ArrowUpRight,
  Store,
  Building,
  Phone,
  MapPin,
  Edit3,
  Save,
  Check,
  Power,
  MessageCircle,
  Upload,
  Image as ImageIcon,
  Shield,
  ShieldAlert,
  Trash2,
  QrCode,
  CreditCard,
  Banknote,
  RefreshCw,
  Crown,
  Award,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OrderStatus, Category, MenuItem, Restaurant, User, UserRole, NeighborhoodDeliveryFee, PaymentMethodsConfig } from '../types';
import { generateAdminUpdateWhatsAppUrl } from '../utils/whatsapp';

export const AdminPanel: React.FC = () => {
  const {
    adminPanelOpen,
    setAdminPanelOpen,
    orders,
    updateOrderStatus,
    menuItems,
    updateStock,
    updateItemPrice,
    toggleItemAvailability,
    addNewMenuItem,
    coupons,
    addNewCoupon,
    deleteCoupon,
    toggleCouponActive,
    setActiveTrackingOrderId,
    restaurants,
    activeAdminRestaurantId,
    setActiveAdminRestaurantId,
    updateRestaurant,
    deleteRestaurant,
    toggleRestaurantOpen,
    registerRestaurant,
    navigateToSection,
    currentUser,
    users,
    deleteUser,
    updateUser,
    addNewUser,
    deleteOrder,
    resetToInitialData,
    addNeighborhoodFee,
    updateNeighborhoodFee,
    deleteNeighborhoodFee,
    loadDefaultNeighborhoodFees,
    updatePaymentConfig,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'orders' | 'inventory' | 'coupons' | 'reports' | 'reviews' | 'stores' | 'neighborhoods' | 'payments' | 'superadmin'
  >('orders');

  // Orders Tab filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('todos');

  // Inventory filter
  const [inventorySearch, setInventorySearch] = useState('');
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);

  // Store edit modal state
  const [editingStore, setEditingStore] = useState<Restaurant | null>(null);

  // Neighborhoods Tab State
  const [bairroRestId, setBairroRestId] = useState<string>(
    activeAdminRestaurantId !== 'all' ? activeAdminRestaurantId : (restaurants[0]?.id || 'rest-sabor-cia')
  );
  const [bairroFilterSearch, setBairroFilterSearch] = useState('');
  const [newBairroName, setNewBairroName] = useState('');
  const [newBairroFee, setNewBairroFee] = useState('7.00');
  const [newBairroTime, setNewBairroTime] = useState('30');
  const [editingBairroModal, setEditingBairroModal] = useState<NeighborhoodDeliveryFee | null>(null);

  // Payments Tab State
  const [paymentRestId, setPaymentRestId] = useState<string>(
    activeAdminRestaurantId !== 'all' ? activeAdminRestaurantId : (restaurants[0]?.id || 'rest-sabor-cia')
  );
  const [paymentSavedBanner, setPaymentSavedBanner] = useState(false);

  // Super Admin Tab State
  const [superAdminSection, setSuperAdminSection] = useState<'stores' | 'users' | 'orders' | 'coupons'>('stores');
  const [superAdminUserSearch, setSuperAdminUserSearch] = useState('');
  const [editingUserModal, setEditingUserModal] = useState<User | null>(null);
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('123456');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('customer');
  const [newUserPoints, setNewUserPoints] = useState('100');
  const [newUserAddress, setNewUserAddress] = useState('');

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('29.90');
  const [newItemCategory, setNewItemCategory] = useState<Category>('burgers');
  const [newItemStock, setNewItemStock] = useState('20');
  const [newItemImage, setNewItemImage] = useState('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80');
  const [newItemTargetRestaurantId, setNewItemTargetRestaurantId] = useState<string>(
    activeAdminRestaurantId !== 'all' ? activeAdminRestaurantId : 'rest-sabor-cia'
  );

  // New coupon form state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState('15');
  const [newCouponMinOrder, setNewCouponMinOrder] = useState('50');
  const [newCouponFreeDelivery, setNewCouponFreeDelivery] = useState(false);

  if (!adminPanelOpen) return null;

  // Active restaurant entity
  const currentAdminRestaurant = restaurants.find(r => r.id === activeAdminRestaurantId) || null;

  // Scoped lists by active restaurant (enables identical management across every restaurant)
  const scopedOrders = activeAdminRestaurantId === 'all'
    ? orders
    : orders.filter(o => o.restaurantId === activeAdminRestaurantId);

  const scopedMenuItems = activeAdminRestaurantId === 'all'
    ? menuItems
    : menuItems.filter(i => i.restaurantId === activeAdminRestaurantId);

  // Key KPI Calculations
  const completedOrders = scopedOrders.filter(o => o.status === 'entregue');
  const activeOrders = scopedOrders.filter(o => o.status !== 'entregue' && o.status !== 'cancelado');
  const totalRevenue = scopedOrders
    .filter(o => o.status !== 'cancelado')
    .reduce((acc, o) => acc + o.total, 0);
  const averageTicket = scopedOrders.length > 0 ? totalRevenue / scopedOrders.length : 0;
  const lowStockItems = scopedMenuItems.filter(i => i.stock <= 5);

  // Reviews calculation
  const reviewedOrders = scopedOrders.filter(o => o.review);
  const averageRating = reviewedOrders.length > 0
    ? (reviewedOrders.reduce((acc, o) => acc + (o.review?.rating || 0), 0) / reviewedOrders.length).toFixed(1)
    : '4.9';

  // Filtered orders list
  const filteredOrders = scopedOrders.filter(o => {
    if (orderStatusFilter === 'todos') return true;
    return o.status === orderStatusFilter;
  });

  // Filtered inventory list
  const filteredInventory = scopedMenuItems.filter(item =>
    item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    item.category.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  const handleCreateMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;

    const restIdToUse = activeAdminRestaurantId !== 'all'
      ? activeAdminRestaurantId
      : newItemTargetRestaurantId || 'rest-sabor-cia';

    addNewMenuItem({
      restaurantId: restIdToUse,
      name: newItemName,
      description: newItemDesc || 'Delicioso preparo especial da nossa chapa.',
      price: parseFloat(newItemPrice) || 25,
      category: newItemCategory,
      imageUrl: newItemImage,
      stock: parseInt(newItemStock, 10) || 15,
      isAvailable: true,
      popular: false,
    });

    setNewItemModalOpen(false);
    setNewItemName('');
    setNewItemDesc('');
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;

    addNewCoupon({
      code: newCouponCode.toUpperCase().trim(),
      description: newCouponDesc || `Cupom ${newCouponCode}`,
      discountType: newCouponType,
      value: parseFloat(newCouponValue) || 10,
      minOrderValue: parseFloat(newCouponMinOrder) || 30,
      isActive: true,
      freeDelivery: newCouponFreeDelivery,
    });

    setNewCouponCode('');
    setNewCouponDesc('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        id="admin-management-panel"
        className="bg-stone-50 rounded-3xl shadow-2xl max-w-6xl w-full overflow-hidden border border-stone-300 flex flex-col h-[94vh] my-auto"
      >
        {/* Top Bar */}
        <div className="bg-amber-950 text-amber-50 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shrink-0 border-b border-amber-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">Painel Administrativo</h2>
                <span className="text-[10px] font-bold bg-amber-800 text-amber-200 px-2 py-0.5 rounded-full border border-amber-700">
                  Estoque • Pedidos • Relatórios
                </span>
              </div>
              <p className="text-xs text-amber-300">
                {currentAdminRestaurant ? `${currentAdminRestaurant.name} • ${currentAdminRestaurant.category}` : 'Visão Geral de Todas as Lojas'}
              </p>
            </div>
          </div>

          {/* Restaurant Selector & Fast Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-amber-900/80 px-2.5 py-1 rounded-xl border border-amber-800 shadow-inner">
              <Store className="w-3.5 h-3.5 text-amber-400 mr-1.5 shrink-0" />
              <span className="text-[11px] font-bold text-amber-200 mr-2 hidden sm:inline">Loja em Gestão:</span>
              <select
                id="admin-restaurant-selector"
                value={activeAdminRestaurantId}
                onChange={e => setActiveAdminRestaurantId(e.target.value)}
                className="bg-amber-950 text-amber-100 text-xs font-bold rounded-lg px-2 py-1 border border-amber-700/80 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer max-w-[200px] truncate"
              >
                <option value="all">🏢 Todas as Lojas (Rede Completa)</option>
                {restaurants.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick edit store button */}
            <button
              id="admin-quick-edit-store-btn"
              onClick={() => setEditingStore(currentAdminRestaurant || restaurants[0])}
              className="text-xs font-bold bg-amber-800 hover:bg-amber-700 text-amber-100 px-3 py-1.5 rounded-xl border border-amber-600/80 flex items-center gap-1.5 transition-all shadow-xs"
              title="Alterar nome, endereço, logo e detalhes desta lanchonete"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden md:inline">Alterar Dados da Loja</span>
            </button>

            {currentAdminRestaurant && (
              <button
                id="admin-quick-toggle-open"
                onClick={() => toggleRestaurantOpen(currentAdminRestaurant.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all shadow-xs ${
                  currentAdminRestaurant.isOpen
                    ? 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border-emerald-600'
                    : 'bg-red-900/80 hover:bg-red-800 text-red-200 border-red-600'
                }`}
                title="Clique para alternar o status de funcionamento desta loja"
              >
                <span className={`w-2 h-2 rounded-full ${currentAdminRestaurant.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                <span>{currentAdminRestaurant.isOpen ? 'Aberta' : 'Fechada'}</span>
              </button>
            )}

            <button
              id="admin-add-store-quick-btn"
              onClick={() => {
                setAdminPanelOpen(false);
                navigateToSection('register');
              }}
              className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
              title="Cadastrar novo restaurante na plataforma"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nova Lanchonete</span>
            </button>

            <button
              id="close-admin-panel-btn"
              onClick={() => setAdminPanelOpen(false)}
              className="p-1.5 rounded-full hover:bg-amber-800 text-amber-200 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global KPI Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 bg-white border-b border-stone-200 shrink-0">
          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                Faturamento {activeAdminRestaurantId === 'all' ? '(Rede)' : '(Loja)'}
              </p>
              <p className="text-lg sm:text-xl font-black text-stone-900">
                R$ {totalRevenue.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 bg-orange-50/70 rounded-2xl border border-orange-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-orange-800 uppercase tracking-wider">Pedidos Ativos</p>
              <p className="text-lg sm:text-xl font-black text-stone-900">
                {activeOrders.length} <span className="text-xs text-orange-600 font-bold">em preparo/rota</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">Ticket Médio</p>
              <p className="text-lg sm:text-xl font-black text-stone-900">
                R$ {averageTicket.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-stone-800 text-white flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3 bg-red-50/70 rounded-2xl border border-red-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-red-800 uppercase tracking-wider">Estoque Baixo (≤5)</p>
              <p className="text-lg sm:text-xl font-black text-red-700">
                {lowStockItems.length} {lowStockItems.length === 1 ? 'item' : 'itens'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-red-500 text-white flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Tab Selector Nav */}
        <div className="flex items-center gap-1 p-2 bg-stone-100 border-b border-stone-200 overflow-x-auto shrink-0">
          <button
            id="admin-tab-stores"
            onClick={() => setActiveAdminTab('stores')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeAdminTab === 'stores'
                ? 'bg-white text-orange-600 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Store className="w-4 h-4 text-orange-500" />
            Lojas & Restaurantes ({restaurants.length})
          </button>

          <button
            id="admin-tab-orders"
            onClick={() => setActiveAdminTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeAdminTab === 'orders'
                ? 'bg-white text-orange-600 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Gestão de Pedidos ({scopedOrders.length})
          </button>

          <button
            id="admin-tab-inventory"
            onClick={() => setActiveAdminTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeAdminTab === 'inventory'
                ? 'bg-white text-orange-600 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Package className="w-4 h-4" />
            Estoque & Cardápio ({scopedMenuItems.length})
          </button>

          <button
            id="admin-tab-coupons"
            onClick={() => setActiveAdminTab('coupons')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeAdminTab === 'coupons'
                ? 'bg-white text-orange-600 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Tag className="w-4 h-4" />
            Cupons de Desconto ({coupons.length})
          </button>

          <button
            id="admin-tab-reports"
            onClick={() => setActiveAdminTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeAdminTab === 'reports'
                ? 'bg-white text-orange-600 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Relatórios Mensais
          </button>

          <button
            id="admin-tab-reviews"
            onClick={() => setActiveAdminTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeAdminTab === 'reviews'
                ? 'bg-white text-orange-600 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500" />
            Avaliações ({reviewedOrders.length})
          </button>

          <button
            id="admin-tab-neighborhoods"
            onClick={() => setActiveAdminTab('neighborhoods')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeAdminTab === 'neighborhoods'
                ? 'bg-white text-orange-600 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Bike className="w-4 h-4 text-orange-500" />
            Taxas por Bairro
          </button>

          <button
            id="admin-tab-payments"
            onClick={() => setActiveAdminTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeAdminTab === 'payments'
                ? 'bg-white text-orange-600 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-600" />
            Formas de Pagamento
          </button>

          <button
            id="admin-tab-superadmin"
            onClick={() => setActiveAdminTab('superadmin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeAdminTab === 'superadmin'
                ? 'bg-white text-orange-600 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-500" />
            Painel Master
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50/50">
          {/* TAB 0: GESTÃO DE LOJAS E RESTAURANTES */}
          {activeAdminTab === 'stores' && (
            <div className="space-y-5">
              {/* Header inside stores tab */}
              <div className="bg-white p-5 rounded-3xl border border-stone-200 flex flex-wrap items-center justify-between gap-4 shadow-xs">
                <div>
                  <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                    <Store className="w-5 h-5 text-orange-600" />
                    Lanchonetes & Restaurantes Parceiros ({restaurants.length})
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Cada estabelecimento possui controle de estoque independente, pipeline de pedidos em tempo real, cupons e relatórios.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="admin-cadastrar-loja-btn"
                    onClick={() => {
                      setAdminPanelOpen(false);
                      navigateToSection('register');
                    }}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Cadastrar Nova Lanchonete
                  </button>
                </div>
              </div>

              {/* Stores Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {restaurants.map(rest => {
                  const restOrders = orders.filter(o => o.restaurantId === rest.id);
                  const restItems = menuItems.filter(i => i.restaurantId === rest.id);
                  const restRevenue = restOrders
                    .filter(o => o.status !== 'cancelado')
                    .reduce((acc, o) => acc + o.total, 0);
                  const isCurrentActive = activeAdminRestaurantId === rest.id;

                  return (
                    <div
                      key={rest.id}
                      id={`admin-store-card-${rest.id}`}
                      className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                        isCurrentActive ? 'border-orange-500 ring-2 ring-orange-400/30' : 'border-stone-200'
                      }`}
                    >
                      {/* Banner and Logo */}
                      <div className="relative h-28 w-full overflow-hidden bg-stone-100">
                        <img
                          src={rest.coverUrl || rest.logoUrl}
                          alt={rest.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <button
                            onClick={() => toggleRestaurantOpen(rest.id)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide border shadow-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                              rest.isOpen
                                ? 'bg-emerald-500/90 text-white border-emerald-400'
                                : 'bg-red-500/90 text-white border-red-400'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${rest.isOpen ? 'bg-white animate-ping' : 'bg-white'}`} />
                            {rest.isOpen ? 'ABERTA' : 'FECHADA'}
                          </button>
                        </div>

                        <div className="absolute bottom-3 left-4 flex items-center gap-3">
                          <img
                            src={rest.logoUrl}
                            alt={rest.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md bg-white shrink-0"
                          />
                          <div className="text-white drop-shadow-sm">
                            <h4 className="font-black text-base leading-tight">{rest.name}</h4>
                            <p className="text-[11px] text-stone-200 font-medium">{rest.category} • {rest.tagline}</p>
                          </div>
                        </div>
                      </div>

                      {/* Store Content */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-2 text-center bg-stone-50 p-2.5 rounded-2xl border border-stone-200/80">
                          <div>
                            <p className="text-[10px] text-stone-500 font-bold uppercase">Cardápio</p>
                            <p className="text-sm font-black text-stone-900">{restItems.length} itens</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-stone-500 font-bold uppercase">Pedidos</p>
                            <p className="text-sm font-black text-stone-900">{restOrders.length}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-stone-500 font-bold uppercase">Faturamento</p>
                            <p className="text-sm font-black text-emerald-700">R$ {restRevenue.toFixed(0)}</p>
                          </div>
                        </div>

                        {/* Operational Details */}
                        <div className="text-[11px] text-stone-600 space-y-1 bg-stone-50/50 p-2.5 rounded-xl border border-stone-100">
                          <div className="flex items-center justify-between">
                            <span className="text-stone-500">🛵 Taxa de Entrega:</span>
                            <span className="font-bold text-stone-800">
                              {rest.deliveryFee === 0 ? 'Grátis' : `R$ ${rest.deliveryFee.toFixed(2).replace('.', ',')}`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-stone-500">⏳ Tempo Médio:</span>
                            <span className="font-bold text-stone-800">{rest.deliveryTimeMin}-{rest.deliveryTimeMax} min</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-stone-500">💰 Pedido Mínimo:</span>
                            <span className="font-bold text-stone-800">R$ {rest.minOrder.toFixed(2).replace('.', ',')}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-stone-500">⏰ Horário:</span>
                            <span className="font-bold text-stone-800 truncate max-w-[180px]">{rest.openingHours}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-stone-500">📍 Endereço:</span>
                            <span className="font-bold text-stone-800 truncate max-w-[180px]">{rest.address}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            id={`manage-store-${rest.id}`}
                            onClick={() => {
                              setActiveAdminRestaurantId(rest.id);
                              setActiveAdminTab('inventory');
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              isCurrentActive
                                ? 'bg-orange-600 text-white shadow-sm'
                                : 'bg-stone-900 hover:bg-orange-600 text-white'
                            }`}
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>{isCurrentActive ? 'Em Gestão Agora' : 'Gerenciar Loja'}</span>
                          </button>

                          <button
                            id={`edit-store-${rest.id}`}
                            onClick={() => setEditingStore(rest)}
                            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-stone-200 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                            <span>Editar Dados</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 1: GESTÃO DE PEDIDOS */}
          {activeAdminTab === 'orders' && (
            <div className="space-y-4">
              {/* Order Status Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {[
                    { id: 'todos', label: 'Todos' },
                    { id: 'recebido', label: 'Novos Recebidos' },
                    { id: 'em_preparo', label: 'Na Chapa (Preparo)' },
                    { id: 'saiu_para_entrega', label: 'Com Entregador' },
                    { id: 'entregue', label: 'Concluídos' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      id={`order-filter-${tab.id}`}
                      onClick={() => setOrderStatusFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        orderStatusFilter === tab.id
                          ? 'bg-amber-900 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <span className="text-xs text-stone-500 font-semibold">
                  Exibindo {filteredOrders.length} pedidos
                </span>
              </div>

              {/* Order Cards Grid */}
              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-400">
                    Nenhum pedido encontrado para o filtro selecionado.
                  </div>
                ) : (
                  filteredOrders.map(ord => (
                    <div
                      key={ord.id}
                      id={`admin-order-card-${ord.id}`}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs hover:border-amber-300 transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-black text-stone-900">#{ord.id}</span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                            <Store className="w-3 h-3 text-orange-600" />
                            <span>{ord.restaurantName || restaurants.find(r => r.id === ord.restaurantId)?.name || 'Lanchonete'}</span>
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              ord.status === 'recebido'
                                ? 'bg-amber-100 text-amber-800'
                                : ord.status === 'em_preparo'
                                ? 'bg-orange-100 text-orange-800'
                                : ord.status === 'saiu_para_entrega'
                                ? 'bg-blue-100 text-blue-800'
                                : ord.status === 'entregue'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {ord.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-stone-500">
                            {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
                            {ord.payment.method.toUpperCase()} ({ord.payment.status})
                          </span>
                          <span className="text-base font-black text-stone-900">
                            R$ {ord.total.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>

                      {/* Customer info & items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="font-bold text-stone-900">
                            Cliente: {ord.customerName} ({ord.customerPhone})
                          </p>
                          <p className="text-stone-500 mt-0.5">
                            📍 {ord.deliveryAddress} ({ord.deliveryType === 'delivery' ? 'Entrega expressa' : 'Retirada'})
                          </p>
                          {ord.couponCodeApplied && (
                            <p className="text-emerald-700 font-semibold mt-1">
                              Cupom utilizado: {ord.couponCodeApplied} (-R$ {ord.discount.toFixed(2)})
                            </p>
                          )}
                        </div>

                        <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 space-y-1">
                          <p className="font-bold text-stone-700">Itens:</p>
                          {ord.items.map((it, idx) => (
                            <p key={idx} className="text-stone-600">
                              • <strong>{it.quantity}x</strong> {it.name}
                              {it.itemNotes && <span className="italic text-amber-700"> (Obs: {it.itemNotes})</span>}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Quick Status Management Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            id={`view-order-live-btn-${ord.id}`}
                            onClick={() => setActiveTrackingOrderId(ord.id)}
                            className="px-3 py-1.5 text-xs text-orange-600 hover:bg-orange-50 font-bold rounded-lg flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Rastreamento
                          </button>

                          {/* WhatsApp Customer Notification */}
                          {(() => {
                            const rest = restaurants.find(r => r.id === ord.restaurantId) || currentAdminRestaurant;
                            const waUrl = generateAdminUpdateWhatsAppUrl(ord, rest);
                            return (
                              <a
                                id={`admin-notify-whatsapp-${ord.id}`}
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                                title="Enviar atualização e rastreamento para o WhatsApp do cliente"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Notificar no WhatsApp</span>
                              </a>
                            );
                          })()}
                        </div>

                        <div className="flex items-center gap-2">
                          {ord.status === 'recebido' && (
                            <button
                              id={`admin-start-prep-btn-${ord.id}`}
                              onClick={() => updateOrderStatus(ord.id, 'em_preparo')}
                              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                            >
                              <Flame className="w-3.5 h-3.5" />
                              Iniciar Preparo na Chapa
                            </button>
                          )}

                          {ord.status === 'em_preparo' && (
                            <button
                              id={`admin-dispatch-btn-${ord.id}`}
                              onClick={() => updateOrderStatus(ord.id, 'saiu_para_entrega')}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                            >
                              <Bike className="w-3.5 h-3.5" />
                              Despachar com Motoboy
                            </button>
                          )}

                          {ord.status === 'saiu_para_entrega' && (
                            <button
                              id={`admin-mark-delivered-btn-${ord.id}`}
                              onClick={() => updateOrderStatus(ord.id, 'entregue')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Marcar como Entregue
                            </button>
                          )}

                          {ord.status === 'entregue' && (
                            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Pedido Concluído
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GESTÃO DE ESTOQUE & CARDÁPIO */}
          {activeAdminTab === 'inventory' && (
            <div className="space-y-4">
              {/* Controls bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    id="admin-inventory-search-input"
                    type="text"
                    placeholder="Buscar no estoque..."
                    value={inventorySearch}
                    onChange={e => setInventorySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-300"
                  />
                </div>

                <button
                  id="open-new-item-modal-btn"
                  onClick={() => setNewItemModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-stone-900 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Novo Item no Cardápio
                </button>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-stone-100/70 border-b border-stone-200 text-stone-600 font-bold">
                    <tr>
                      <th className="p-3">Produto</th>
                      {activeAdminRestaurantId === 'all' && <th className="p-3">Lanchonete</th>}
                      <th className="p-3">Categoria</th>
                      <th className="p-3">Preço (R$)</th>
                      <th className="p-3">Estoque Disponível</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredInventory.map(item => {
                      const isLow = item.stock <= 5;
                      const itemRest = restaurants.find(r => r.id === item.restaurantId);
                      return (
                        <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="p-3 flex items-center gap-3">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-lg object-cover border border-stone-200"
                            />
                            <div>
                              <p className="font-extrabold text-stone-900">{item.name}</p>
                              <p className="text-[10px] text-stone-400 truncate max-w-[200px]">
                                {item.description}
                              </p>
                            </div>
                          </td>

                          {activeAdminRestaurantId === 'all' && (
                            <td className="p-3">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md">
                                <Store className="w-3 h-3 text-amber-600" />
                                <span>{itemRest?.name || 'Sabor & Cia'}</span>
                              </span>
                            </td>
                          )}

                          <td className="p-3 capitalize font-semibold text-stone-600">
                            {item.category}
                          </td>

                          <td className="p-3 font-bold text-stone-900">
                            <div className="flex items-center gap-1">
                              <span>R$</span>
                              <input
                                type="number"
                                step="0.5"
                                defaultValue={item.price.toFixed(2)}
                                onBlur={e => updateItemPrice(item.id, parseFloat(e.target.value))}
                                className="w-16 p-1 border border-stone-200 rounded text-xs font-bold"
                              />
                            </div>
                          </td>

                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border border-stone-300 rounded-lg p-0.5 bg-white">
                                <button
                                  id={`stock-decrease-${item.id}`}
                                  onClick={() => updateStock(item.id, item.stock - 1)}
                                  className="px-1.5 py-0.5 text-stone-600 hover:bg-stone-100 rounded text-xs"
                                >
                                  -
                                </button>
                                <span className={`w-8 text-center font-black ${isLow ? 'text-red-600' : 'text-stone-900'}`}>
                                  {item.stock}
                                </span>
                                <button
                                  id={`stock-increase-${item.id}`}
                                  onClick={() => updateStock(item.id, item.stock + 5)}
                                  className="px-1.5 py-0.5 text-stone-600 hover:bg-stone-100 rounded text-xs"
                                  title="+5 unidades"
                                >
                                  +5
                                </button>
                              </div>
                              {isLow && (
                                <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                                  Repor!
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.isAvailable && item.stock > 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {item.isAvailable && item.stock > 0 ? 'Ativo' : 'Indisponível'}
                            </span>
                          </td>

                          <td className="p-3 text-right">
                            <button
                              id={`toggle-availability-${item.id}`}
                              onClick={() => toggleItemAvailability(item.id)}
                              className="text-xs font-bold text-stone-600 hover:text-orange-600 underline"
                            >
                              {item.isAvailable ? 'Pausar' : 'Ativar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add Item Modal */}
              {newItemModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
                  <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-extrabold text-base text-stone-900">Novo Lanche no Cardápio</h3>
                      <button onClick={() => setNewItemModalOpen(false)}>
                        <X className="w-5 h-5 text-stone-400" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateMenuItem} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Nome do Item</label>
                        <input
                          type="text"
                          required
                          value={newItemName}
                          onChange={e => setNewItemName(e.target.value)}
                          placeholder="Ex: Cheddar Duplo Especial"
                          className="w-full p-2 rounded-xl border border-stone-300"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Descrição</label>
                        <textarea
                          rows={2}
                          value={newItemDesc}
                          onChange={e => setNewItemDesc(e.target.value)}
                          placeholder="Ingredientes, pão, blend, molho..."
                          className="w-full p-2 rounded-xl border border-stone-300"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Preço (R$)</label>
                          <input
                            type="number"
                            step="0.1"
                            required
                            value={newItemPrice}
                            onChange={e => setNewItemPrice(e.target.value)}
                            className="w-full p-2 rounded-xl border border-stone-300"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Estoque Inicial</label>
                          <input
                            type="number"
                            required
                            value={newItemStock}
                            onChange={e => setNewItemStock(e.target.value)}
                            className="w-full p-2 rounded-xl border border-stone-300"
                          />
                        </div>
                      </div>

                      {activeAdminRestaurantId === 'all' && (
                        <div>
                          <label className="block font-bold text-stone-700 mb-1">Lanchonete / Restaurante</label>
                          <select
                            value={newItemTargetRestaurantId}
                            onChange={e => setNewItemTargetRestaurantId(e.target.value)}
                            className="w-full p-2 rounded-xl border border-stone-300 bg-white"
                          >
                            {restaurants.map(r => (
                              <option key={r.id} value={r.id}>
                                {r.name} ({r.category})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">Categoria</label>
                        <select
                          value={newItemCategory}
                          onChange={e => setNewItemCategory(e.target.value as Category)}
                          className="w-full p-2 rounded-xl border border-stone-300 bg-white"
                        >
                          <option value="burgers">Hambúrgueres</option>
                          <option value="hotdogs">Hot Dogs & Prensados</option>
                          <option value="pizzas">Pizzas & Calzones</option>
                          <option value="pasteis">Pastéis & Salgados</option>
                          <option value="porcoes">Porções & Fritas</option>
                          <option value="combos">Combos</option>
                          <option value="bebidas">Refrigerantes & Bebidas</option>
                          <option value="sucos">Sucos Naturais & Frutas</option>
                          <option value="sobremesas">Sobremesas & Shakes</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">URL da Foto</label>
                        <input
                          type="url"
                          value={newItemImage}
                          onChange={e => setNewItemImage(e.target.value)}
                          className="w-full p-2 rounded-xl border border-stone-300"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl mt-2"
                      >
                        Salvar e Adicionar ao Cardápio
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUPONS DE DESCONTO */}
          {activeAdminTab === 'coupons' && (
            <div className="space-y-6">
              {/* Form to create coupon */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-orange-500" />
                  Criar Novo Cupom Promocional
                </h4>

                <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Código</label>
                    <input
                      type="text"
                      required
                      placeholder="EX: SABOR20"
                      value={newCouponCode}
                      onChange={e => setNewCouponCode(e.target.value.toUpperCase())}
                      className="w-full p-2 uppercase font-bold rounded-xl border border-stone-300"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Tipo de Desconto</label>
                    <select
                      value={newCouponType}
                      onChange={e => setNewCouponType(e.target.value as 'percentage' | 'fixed')}
                      className="w-full p-2 rounded-xl border border-stone-300 bg-white"
                    >
                      <option value="percentage">Porcentagem (%)</option>
                      <option value="fixed">Valor Fixo (R$)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Valor ({newCouponType === 'percentage' ? '%' : 'R$'})
                    </label>
                    <input
                      type="number"
                      required
                      value={newCouponValue}
                      onChange={e => setNewCouponValue(e.target.value)}
                      className="w-full p-2 rounded-xl border border-stone-300 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Pedido Mínimo (R$)</label>
                    <input
                      type="number"
                      required
                      value={newCouponMinOrder}
                      onChange={e => setNewCouponMinOrder(e.target.value)}
                      className="w-full p-2 rounded-xl border border-stone-300 font-bold"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      id="save-new-coupon-btn"
                      type="submit"
                      className="w-full py-2 bg-stone-900 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors"
                    >
                      Ativar Cupom
                    </button>
                  </div>
                </form>
              </div>

              {/* Coupons List */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-600 font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-3">Código</th>
                      <th className="p-3">Desconto</th>
                      <th className="p-3">Pedido Mínimo</th>
                      <th className="p-3">Usos Registrados</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {coupons.map(c => (
                      <tr key={c.id} className="hover:bg-stone-50">
                        <td className="p-3 font-mono font-black text-amber-900">
                          {c.code}
                        </td>
                        <td className="p-3 font-semibold text-stone-800">
                          {c.discountType === 'percentage' ? `${c.value}% OFF` : `R$ ${c.value.toFixed(2)} OFF`}
                        </td>
                        <td className="p-3 text-stone-600">
                          R$ {c.minOrderValue.toFixed(2)}
                        </td>
                        <td className="p-3 font-bold text-stone-700">
                          {c.usageCount} vezes
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'}`}>
                            {c.isActive ? 'Ativo' : 'Pausado'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            id={`toggle-coupon-${c.id}`}
                            onClick={() => toggleCouponActive(c.id)}
                            className="text-xs font-bold text-stone-600 hover:text-orange-600 underline"
                          >
                            {c.isActive ? 'Desativar' : 'Reativar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: RELATÓRIOS MENSAIS DE DESEMPENHO */}
          {activeAdminTab === 'reports' && (
            <div className="space-y-6">
              {/* Month Header Banner */}
              <div className="p-5 bg-gradient-to-r from-amber-950 to-stone-900 text-white rounded-3xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Relatório Mensal Consolidado
                  </span>
                  <h3 className="text-xl font-black mt-0.5">Desempenho Comercial de Setembro de 2026</h3>
                  <p className="text-xs text-stone-300 mt-1">
                    Comparativo em tempo real com metas operacionais e histórico de vendas.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
                    Meta do Mês: 94% atingida
                  </span>
                </div>
              </div>

              {/* Monthly Visual Sales Chart */}
              <div className="bg-white p-5 rounded-3xl border border-stone-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-stone-900">Vendas Diárias (Últimos Dias)</h4>
                    <p className="text-[11px] text-stone-500">Volume de receita faturada em reais</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> +18.4% vs mês anterior
                  </span>
                </div>

                {/* Styled Bar Chart Graphic */}
                <div className="h-48 flex items-end justify-between gap-2 pt-6 border-b border-stone-200">
                  {[
                    { day: '01/09', val: 540, height: '45%' },
                    { day: '02/09', val: 680, height: '58%' },
                    { day: '03/09', val: 790, height: '68%' },
                    { day: '04/09', val: 920, height: '78%' },
                    { day: '05/09', val: 1140, height: '95%' },
                    { day: '06/09', val: 890, height: '75%' },
                    { day: 'Hoje', val: Math.round(totalRevenue % 1500) + 400, height: '88%' },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                      <span className="text-[10px] font-bold text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        R$ {bar.val}
                      </span>
                      <div
                        className="w-full max-w-[40px] bg-gradient-to-t from-amber-600 to-orange-500 hover:from-orange-600 hover:to-amber-400 rounded-t-xl transition-all shadow-xs"
                        style={{ height: bar.height }}
                      />
                      <span className="text-[10px] font-semibold text-stone-600">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Sellers & Payment Method Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top 5 Products */}
                <div className="bg-white p-5 rounded-3xl border border-stone-200 space-y-3 shadow-xs">
                  <h4 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider">
                    Lanches Mais Vendidos
                  </h4>
                  <div className="space-y-2.5">
                    {[
                      { name: 'Smash Brasa Duplo', units: 142, revenue: 4671.80, percent: 35 },
                      { name: 'X-Tudo Vulcão da Casa', units: 98, revenue: 3773.00, percent: 28 },
                      { name: 'Batata Rústica c/ Cheddar', units: 115, revenue: 3208.50, percent: 24 },
                      { name: 'Combo Casal Faminto', units: 36, revenue: 2876.40, percent: 21 },
                      { name: 'Milkshake de Nutella', units: 82, revenue: 1877.80, percent: 14 },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-extrabold text-stone-800">
                            #{idx + 1} {item.name}
                          </span>
                          <span className="font-bold text-stone-900">
                            {item.units} un • R$ {item.revenue.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: `${item.percent * 2.5}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Methods Split */}
                <div className="bg-white p-5 rounded-3xl border border-stone-200 space-y-3 shadow-xs">
                  <h4 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider">
                    Formas de Pagamento
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-600" />
                        <div>
                          <p className="font-extrabold text-emerald-950">Pix (Instantâneo)</p>
                          <p className="text-[11px] text-emerald-700">62% do volume total</p>
                        </div>
                      </div>
                      <span className="font-black text-emerald-900">R$ {(totalRevenue * 0.62).toFixed(2)}</span>
                    </div>

                    <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-600" />
                        <div>
                          <p className="font-extrabold text-orange-950">Cartão de Crédito / Débito</p>
                          <p className="text-[11px] text-orange-700">28% do volume total</p>
                        </div>
                      </div>
                      <span className="font-black text-orange-900">R$ {(totalRevenue * 0.28).toFixed(2)}</span>
                    </div>

                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-stone-600" />
                        <div>
                          <p className="font-extrabold text-stone-900">Dinheiro</p>
                          <p className="text-[11px] text-stone-500">10% do volume total</p>
                        </div>
                      </div>
                      <span className="font-black text-stone-900">R$ {(totalRevenue * 0.10).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AVALIAÇÕES DOS CLIENTES */}
          {activeAdminTab === 'reviews' && (
            <div className="space-y-4">
              <div className="p-5 bg-white rounded-3xl border border-stone-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500 text-stone-950 flex flex-col items-center justify-center font-black">
                    <span className="text-2xl leading-none">{averageRating}</span>
                    <span className="text-[10px] uppercase font-extrabold">de 5.0</span>
                  </div>
                  <div>
                    <h3 className="font-black text-base text-stone-900">Satisfação Geral dos Clientes</h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Baseado em {reviewedOrders.length} avaliações registradas após entrega.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>

              {/* Reviews Feed */}
              <div className="space-y-3">
                {reviewedOrders.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-400">
                    Nenhuma avaliação enviada ainda. Conclua e avalie pedidos para ver o feed aqui!
                  </div>
                ) : (
                  reviewedOrders.map(ord => {
                    const rev = ord.review!;
                    return (
                      <div
                        key={rev.id}
                        className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-2.5 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-stone-900">{rev.customerName}</span>
                            <span className="text-stone-400 text-xs">•</span>
                            <span className="text-[11px] text-stone-500">Pedido #{ord.id}</span>
                          </div>

                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                        </div>

                        {rev.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {rev.tags.map((t, idx) => (
                              <span
                                key={idx}
                                className="bg-amber-50 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {rev.comment && (
                          <p className="text-xs text-stone-700 leading-relaxed italic bg-stone-50 p-2.5 rounded-xl">
                            "{rev.comment}"
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB: TAXAS POR BAIRRO (SEM LIMITES DE BAIRROS) */}
          {activeAdminTab === 'neighborhoods' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                    <Bike className="w-5 h-5 text-orange-600" />
                    Taxas de Entrega Individuais por Bairro
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Cadastre a taxa de entrega personalizada para cada bairro da cidade, <strong>sem limites de bairros</strong>.
                    No ato da compra, o cliente busca o bairro por digitação com cálculo automático.
                  </p>
                </div>

                {/* Restaurant Switcher */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-stone-600">Lanchonete:</span>
                  <select
                    id="bairro-restaurant-select"
                    value={bairroRestId}
                    onChange={e => setBairroRestId(e.target.value)}
                    className="p-2 text-xs font-bold rounded-xl border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {restaurants.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Registration Form Card */}
              {(() => {
                const currentRest = restaurants.find(r => r.id === bairroRestId) || restaurants[0];
                const fees = currentRest?.neighborhoodFees || [];
                const filteredFees = fees.filter(f =>
                  f.neighborhood.toLowerCase().includes(bairroFilterSearch.toLowerCase())
                );

                return (
                  <>
                    <div className="bg-gradient-to-br from-orange-50/70 via-white to-amber-50/70 p-5 rounded-3xl border border-orange-200/80 shadow-xs space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Plus className="w-5 h-5 text-orange-600" />
                          <h4 className="font-extrabold text-stone-900 text-sm">
                            Cadastrar Nova Taxa de Bairro para "{currentRest?.name}"
                          </h4>
                        </div>

                        <button
                          type="button"
                          onClick={() => loadDefaultNeighborhoodFees(bairroRestId)}
                          className="px-3 py-1.5 bg-white hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-xl border border-orange-200 transition-colors flex items-center gap-1.5 shadow-xs"
                          title="Importa automaticamente 12 bairros da cidade com taxas realistas"
                        >
                          <MapPin className="w-3.5 h-3.5 text-orange-600" />
                          Preencher Lista com Bairros Populares da Cidade
                        </button>
                      </div>

                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          if (!newBairroName.trim()) return;
                          addNeighborhoodFee(bairroRestId, {
                            neighborhood: newBairroName.trim(),
                            fee: parseFloat(newBairroFee) || 0,
                            estimatedMinutes: parseInt(newBairroTime, 10) || 30,
                            isActive: true,
                          });
                          setNewBairroName('');
                        }}
                        className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"
                      >
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-stone-700 mb-1">
                            Nome do Bairro *
                          </label>
                          <input
                            id="new-bairro-name-input"
                            type="text"
                            required
                            placeholder="Ex: Jardim Paulista, Centro, Moema..."
                            value={newBairroName}
                            onChange={e => setNewBairroName(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">
                            Taxa de Entrega (R$) *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 font-bold text-stone-400">R$</span>
                            <input
                              id="new-bairro-fee-input"
                              type="number"
                              step="0.5"
                              min="0"
                              required
                              placeholder="7.00"
                              value={newBairroFee}
                              onChange={e => setNewBairroFee(e.target.value)}
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-stone-700 mb-1">
                            Tempo Estimado (min)
                          </label>
                          <input
                            id="new-bairro-time-input"
                            type="number"
                            min="5"
                            placeholder="30"
                            value={newBairroTime}
                            onChange={e => setNewBairroTime(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div className="sm:col-span-4 flex items-center justify-between gap-3 pt-1">
                          {/* Quick suggestions pills */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] text-stone-500 font-semibold">Sugestões rápidas:</span>
                            {['Centro', 'Bela Vista', 'Vila Mariana', 'Pinheiros', 'Santana', 'Tatuapé', 'Morumbi', 'Liberdade', 'Perdizes'].map(s => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setNewBairroName(s)}
                                className="px-2 py-0.5 rounded-lg bg-white hover:bg-orange-100 text-stone-600 text-[10px] font-bold border border-stone-200 transition-colors"
                              >
                                {s}
                              </button>
                            ))}
                          </div>

                          <button
                            id="add-bairro-btn"
                            type="submit"
                            className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Cadastrar Bairro</span>
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Neighborhoods List & Search */}
                    <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-stone-900 text-sm">
                            Bairros Cadastrados ({fees.length})
                          </h4>
                          <span className="text-[11px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                            Sem limite de bairros
                          </span>
                        </div>

                        {/* Search filter */}
                        <div className="relative w-full sm:w-64">
                          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            placeholder="Buscar bairro cadastrado..."
                            value={bairroFilterSearch}
                            onChange={e => setBairroFilterSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>

                      {fees.length === 0 ? (
                        <div className="text-center py-10 bg-stone-50 rounded-2xl border border-stone-200 text-stone-500 space-y-3">
                          <Bike className="w-8 h-8 text-stone-300 mx-auto" />
                          <p className="text-xs">Nenhum bairro cadastrado individualmente ainda para esta lanchonete.</p>
                          <button
                            type="button"
                            onClick={() => loadDefaultNeighborhoodFees(bairroRestId)}
                            className="px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl hover:bg-orange-700 transition-colors shadow-xs"
                          >
                            Carregar Bairros Populares da Cidade
                          </button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                                <th className="pb-3 font-extrabold">Bairro</th>
                                <th className="pb-3 font-extrabold">Taxa de Entrega</th>
                                <th className="pb-3 font-extrabold">Tempo Estimado</th>
                                <th className="pb-3 font-extrabold">Status</th>
                                <th className="pb-3 text-right font-extrabold">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                              {filteredFees.map(fee => (
                                <tr key={fee.id} className="hover:bg-stone-50/80 transition-colors">
                                  <td className="py-3 font-extrabold text-stone-900 flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                                    <span>{fee.neighborhood}</span>
                                  </td>

                                  <td className="py-3">
                                    <span className="font-extrabold text-stone-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                      R$ {fee.fee.toFixed(2).replace('.', ',')}
                                    </span>
                                  </td>

                                  <td className="py-3 text-stone-600 font-semibold">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-stone-400" />
                                      {fee.estimatedMinutes || 30} min
                                    </span>
                                  </td>

                                  <td className="py-3">
                                    <button
                                      type="button"
                                      onClick={() => updateNeighborhoodFee(bairroRestId, fee.id, { isActive: !fee.isActive })}
                                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                                        fee.isActive
                                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                          : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                                      }`}
                                    >
                                      {fee.isActive ? 'Ativo (Disponível)' : 'Pausado'}
                                    </button>
                                  </td>

                                  <td className="py-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setEditingBairroModal(fee)}
                                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                                        title="Editar Taxa e Tempo"
                                      >
                                        <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => deleteNeighborhoodFee(bairroRestId, fee.id)}
                                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                        title="Excluir Bairro"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* TAB: FORMAS DE PAGAMENTO DA LANCHONETE */}
          {activeAdminTab === 'payments' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-lg text-stone-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    Configuração de Formas de Pagamento
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Defina as formas de pagamento aceitas pela lanchonete: <strong>PIX</strong>, <strong>Cartão de Crédito</strong>, <strong>Cartão de Débito</strong> e <strong>Dinheiro (com opção de solicitar troco)</strong>.
                  </p>
                </div>

                {/* Restaurant Switcher */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-stone-600">Lanchonete:</span>
                  <select
                    id="payment-restaurant-select"
                    value={paymentRestId}
                    onChange={e => setPaymentRestId(e.target.value)}
                    className="p-2 text-xs font-bold rounded-xl border border-stone-300 bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {restaurants.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Settings Body */}
              {(() => {
                const rest = restaurants.find(r => r.id === paymentRestId) || restaurants[0];
                const cfg: PaymentMethodsConfig = rest?.paymentConfig || {
                  pix: {
                    enabled: true,
                    keyType: 'cnpj',
                    keyValue: rest?.cnpj || '12.345.678/0001-90',
                    beneficiaryName: rest?.name || 'Sabor & Cia',
                    instructions: 'Chave Pix oficial da loja',
                  },
                  creditCard: {
                    enabled: true,
                    acceptedBrands: ['Visa', 'Mastercard', 'Elo', 'Hipercard'],
                    payOnDelivery: true,
                    onlinePayment: true,
                  },
                  debitCard: {
                    enabled: true,
                    acceptedBrands: ['Visa Electron', 'Maestro', 'Elo Débito'],
                    payOnDelivery: true,
                  },
                  cash: {
                    enabled: true,
                    allowChange: true,
                    instructions: 'Entregador leva troco solicitado pelo cliente.',
                  },
                };

                const handleSavePaymentConfig = (updated: PaymentMethodsConfig) => {
                  updatePaymentConfig(paymentRestId, updated);
                  setPaymentSavedBanner(true);
                  setTimeout(() => setPaymentSavedBanner(false), 3000);
                };

                return (
                  <div className="space-y-5">
                    {paymentSavedBanner && (
                      <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-in fade-in duration-200">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>Configurações de pagamento para "{rest?.name}" foram salvas com sucesso!</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* 1. PIX */}
                      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                              <QrCode className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-stone-900 text-sm">Pagamento por PIX</h4>
                              <p className="text-[11px] text-stone-500">Aprovação imediata e QR Code dinâmico</p>
                            </div>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cfg.pix.enabled}
                              onChange={e => {
                                handleSavePaymentConfig({
                                  ...cfg,
                                  pix: { ...cfg.pix, enabled: e.target.checked },
                                });
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                        </div>

                        {cfg.pix.enabled && (
                          <div className="space-y-3 text-xs">
                            <div>
                              <label className="block font-bold text-stone-700 mb-1">Tipo de Chave PIX</label>
                              <select
                                value={cfg.pix.keyType}
                                onChange={e => {
                                  handleSavePaymentConfig({
                                    ...cfg,
                                    pix: { ...cfg.pix, keyType: e.target.value as any },
                                  });
                                }}
                                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-900"
                              >
                                <option value="cnpj">CNPJ</option>
                                <option value="cpf">CPF</option>
                                <option value="phone">Telefone / Celular</option>
                                <option value="email">E-mail</option>
                                <option value="random">Chave Aleatória (EVP)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block font-bold text-stone-700 mb-1">Chave PIX da Lanchonete *</label>
                              <input
                                type="text"
                                value={cfg.pix.keyValue}
                                onChange={e => {
                                  handleSavePaymentConfig({
                                    ...cfg,
                                    pix: { ...cfg.pix, keyValue: e.target.value },
                                  });
                                }}
                                placeholder="Insira sua chave Pix oficial"
                                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono font-bold text-stone-900"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-stone-700 mb-1">Nome do Beneficiário / Titular</label>
                              <input
                                type="text"
                                value={cfg.pix.beneficiaryName}
                                onChange={e => {
                                  handleSavePaymentConfig({
                                    ...cfg,
                                    pix: { ...cfg.pix, beneficiaryName: e.target.value },
                                  });
                                }}
                                placeholder="Nome ou Razão Social"
                                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-900"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 2. CARTÃO DE CRÉDITO */}
                      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                              <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-stone-900 text-sm">Cartão de Crédito</h4>
                              <p className="text-[11px] text-stone-500">Maquininha na entrega ou online</p>
                            </div>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cfg.creditCard.enabled}
                              onChange={e => {
                                handleSavePaymentConfig({
                                  ...cfg,
                                  creditCard: { ...cfg.creditCard, enabled: e.target.checked },
                                });
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {cfg.creditCard.enabled && (
                          <div className="space-y-3 text-xs">
                            <div className="space-y-2">
                              <label className="block font-bold text-stone-700">Modalidades Aceitas:</label>
                              <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={cfg.creditCard.payOnDelivery}
                                    onChange={e => {
                                      handleSavePaymentConfig({
                                        ...cfg,
                                        creditCard: { ...cfg.creditCard, payOnDelivery: e.target.checked },
                                      });
                                    }}
                                    className="rounded text-blue-600"
                                  />
                                  <span className="font-semibold text-stone-700">Maquininha na Entrega</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={cfg.creditCard.onlinePayment}
                                    onChange={e => {
                                      handleSavePaymentConfig({
                                        ...cfg,
                                        creditCard: { ...cfg.creditCard, onlinePayment: e.target.checked },
                                      });
                                    }}
                                    className="rounded text-blue-600"
                                  />
                                  <span className="font-semibold text-stone-700">Pagamento Online no App</span>
                                </label>
                              </div>
                            </div>

                            <div>
                              <label className="block font-bold text-stone-700 mb-1.5">Bandeiras Aceitas</label>
                              <div className="flex flex-wrap gap-1.5">
                                {['Visa', 'Mastercard', 'Elo', 'Hipercard', 'American Express'].map(brand => {
                                  const isSelected = cfg.creditCard.acceptedBrands.includes(brand);
                                  return (
                                    <button
                                      key={brand}
                                      type="button"
                                      onClick={() => {
                                        const updatedBrands = isSelected
                                          ? cfg.creditCard.acceptedBrands.filter(b => b !== brand)
                                          : [...cfg.creditCard.acceptedBrands, brand];
                                        handleSavePaymentConfig({
                                          ...cfg,
                                          creditCard: { ...cfg.creditCard, acceptedBrands: updatedBrands },
                                        });
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                                        isSelected
                                          ? 'bg-blue-600 text-white border-blue-600'
                                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                                      }`}
                                    >
                                      {brand}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 3. CARTÃO DE DÉBITO */}
                      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                              <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-stone-900 text-sm">Cartão de Débito</h4>
                              <p className="text-[11px] text-stone-500">Maquininha levada pelo entregador</p>
                            </div>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cfg.debitCard.enabled}
                              onChange={e => {
                                handleSavePaymentConfig({
                                  ...cfg,
                                  debitCard: { ...cfg.debitCard, enabled: e.target.checked },
                                });
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>

                        {cfg.debitCard.enabled && (
                          <div className="space-y-3 text-xs">
                            <div>
                              <label className="block font-bold text-stone-700 mb-1.5">Bandeiras Aceitas</label>
                              <div className="flex flex-wrap gap-1.5">
                                {['Visa Electron', 'Maestro', 'Elo Débito'].map(brand => {
                                  const isSelected = cfg.debitCard.acceptedBrands.includes(brand);
                                  return (
                                    <button
                                      key={brand}
                                      type="button"
                                      onClick={() => {
                                        const updatedBrands = isSelected
                                          ? cfg.debitCard.acceptedBrands.filter(b => b !== brand)
                                          : [...cfg.debitCard.acceptedBrands, brand];
                                        handleSavePaymentConfig({
                                          ...cfg,
                                          debitCard: { ...cfg.debitCard, acceptedBrands: updatedBrands },
                                        });
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                                        isSelected
                                          ? 'bg-purple-600 text-white border-purple-600'
                                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                                      }`}
                                    >
                                      {brand}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 4. DINHEIRO & TROCO */}
                      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                              <Banknote className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-stone-900 text-sm">Dinheiro na Entrega</h4>
                              <p className="text-[11px] text-stone-500">Com solicitação de troco pelo cliente</p>
                            </div>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cfg.cash.enabled}
                              onChange={e => {
                                handleSavePaymentConfig({
                                  ...cfg,
                                  cash: { ...cfg.cash, enabled: e.target.checked },
                                });
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                          </label>
                        </div>

                        {cfg.cash.enabled && (
                          <div className="space-y-3 text-xs">
                            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                              <div>
                                <span className="font-extrabold text-stone-900 block">Opção de Informar Troco</span>
                                <span className="text-[11px] text-stone-600">
                                  Permite ao cliente informar troco para R$ no ato da compra.
                                </span>
                              </div>
                              <input
                                type="checkbox"
                                checked={cfg.cash.allowChange}
                                onChange={e => {
                                  handleSavePaymentConfig({
                                    ...cfg,
                                    cash: { ...cfg.cash, allowChange: e.target.checked },
                                  });
                                }}
                                className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-stone-700 mb-1">Instruções para o Caixa / Entregador</label>
                              <input
                                type="text"
                                value={cfg.cash.instructions || ''}
                                onChange={e => {
                                  handleSavePaymentConfig({
                                    ...cfg,
                                    cash: { ...cfg.cash, instructions: e.target.value },
                                  });
                                }}
                                placeholder="Ex: Entregador leva troco solicitado."
                                className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-900"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => handleSavePaymentConfig(cfg)}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Salvar Configurações de Pagamento</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB: SUPER ADMIN MASTER (PODER TOTAL SOBRE O SITE) */}
          {activeAdminTab === 'superadmin' && (
            <div className="space-y-6">
              {/* Master Header Banner */}
              <div className="bg-gradient-to-r from-stone-950 via-amber-950 to-stone-900 text-white p-6 rounded-3xl border border-amber-500/40 shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <Crown className="w-6 h-6 text-amber-400" />
                      <span className="text-xs font-black uppercase tracking-widest text-amber-300">
                        Administrador Geral do Site
                      </span>
                    </div>
                    <h3 className="font-black text-xl sm:text-2xl text-white">
                      Painel Master — Controle Total do Sistema
                    </h3>
                    <p className="text-xs text-amber-100/80 leading-relaxed">
                      Você possui autorização com <strong>todos os poderes</strong> para alterar, excluir, remover e gerenciar 
                      qualquer dado da plataforma, tanto para <strong>clientes/usuários</strong> quanto para <strong>estabelecimentos/lanchonetes</strong>, pedidos e cupons.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja resetar todos os dados para o estado inicial de fábrica? Todos os testes e dados novos serão reiniciados.')) {
                          resetToInitialData();
                        }
                      }}
                      className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                      title="Restaura os estabelecimentos, produtos e cupons iniciais"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
                      Restaurar Dados Iniciais
                    </button>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-amber-500/20">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] uppercase font-bold text-amber-300">Lanchonetes</p>
                    <p className="text-xl font-black text-white">{restaurants.length}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] uppercase font-bold text-amber-300">Usuários / Clientes</p>
                    <p className="text-xl font-black text-white">{users.length}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] uppercase font-bold text-amber-300">Pedidos Totais</p>
                    <p className="text-xl font-black text-white">{orders.length}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] uppercase font-bold text-amber-300">Cupons Ativos</p>
                    <p className="text-xl font-black text-white">{coupons.length}</p>
                  </div>
                </div>
              </div>

              {/* Sub-Section Navigation */}
              <div className="flex items-center gap-2 p-1.5 bg-stone-100 rounded-2xl border border-stone-200 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setSuperAdminSection('stores')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    superAdminSection === 'stores'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Store className="w-4 h-4 text-orange-600" />
                  Estabelecimentos ({restaurants.length})
                </button>

                <button
                  type="button"
                  onClick={() => setSuperAdminSection('users')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    superAdminSection === 'users'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Users className="w-4 h-4 text-amber-600" />
                  Clientes & Usuários ({users.length})
                </button>

                <button
                  type="button"
                  onClick={() => setSuperAdminSection('orders')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    superAdminSection === 'orders'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  Todos os Pedidos ({orders.length})
                </button>

                <button
                  type="button"
                  onClick={() => setSuperAdminSection('coupons')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    superAdminSection === 'coupons'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Tag className="w-4 h-4 text-purple-600" />
                  Gestão de Cupons ({coupons.length})
                </button>
              </div>

              {/* SECTION: ESTABELECIMENTOS */}
              {superAdminSection === 'stores' && (
                <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-sm">Controle Total de Lanchonetes & Lojas</h4>
                      <p className="text-xs text-stone-500">Alterar qualquer detalhe, pausar operações ou excluir definitivamente da plataforma.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAdminPanelOpen(false);
                        navigateToSection('register_restaurant');
                      }}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Cadastrar Novo Estabelecimento
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase">
                          <th className="pb-3">Estabelecimento</th>
                          <th className="pb-3">Categoria</th>
                          <th className="pb-3">Gerente / Contato</th>
                          <th className="pb-3">Taxa / Tempo</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Ações Master</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {restaurants.map(r => (
                          <tr key={r.id} className="hover:bg-stone-50 transition-colors">
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={r.logoUrl}
                                  alt={r.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-stone-200"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <p className="font-extrabold text-stone-900">{r.name}</p>
                                  <p className="text-[11px] text-stone-500">{r.address}</p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 font-semibold text-stone-700 capitalize">
                              {r.category}
                            </td>

                            <td className="py-3">
                              <p className="font-bold text-stone-800">{r.managerName || 'Administração'}</p>
                              <p className="text-[11px] text-stone-500">{r.phone}</p>
                            </td>

                            <td className="py-3">
                              <p className="font-bold text-stone-900">R$ {r.deliveryFee.toFixed(2).replace('.', ',')}</p>
                              <p className="text-[11px] text-stone-500">{r.deliveryTime}</p>
                            </td>

                            <td className="py-3">
                              <button
                                type="button"
                                onClick={() => toggleRestaurantOpen(r.id)}
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  r.isOpen
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {r.isOpen ? 'Aberto' : 'Fechado'}
                              </button>
                            </td>

                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingStore(r)}
                                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-lg border border-amber-200 flex items-center gap-1 transition-colors"
                                  title="Editar Estabelecimento"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Editar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`ATENÇÃO SUPER ADMIN: Deseja realmente excluir o estabelecimento "${r.name}"? Todos os produtos do cardápio e dados associados serão removidos da plataforma.`)) {
                                      deleteRestaurant(r.id);
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg border border-red-200 flex items-center gap-1 transition-colors"
                                  title="Excluir Permanentemente"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Excluir</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION: CLIENTES & USUÁRIOS */}
              {superAdminSection === 'users' && (
                <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-sm">Controle Total de Clientes & Usuários</h4>
                      <p className="text-xs text-stone-500">Alterar papel (cliente/admin/superadmin), saldo de pontos fidelidade ou excluir contas.</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="relative w-56">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Buscar usuário..."
                          value={superAdminUserSearch}
                          onChange={e => setSuperAdminUserSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setNewUserModalOpen(true)}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Novo Usuário</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase">
                          <th className="pb-3">Usuário</th>
                          <th className="pb-3">Perfil / Cargo</th>
                          <th className="pb-3">Senha de Acesso</th>
                          <th className="pb-3">Clube Fidelidade</th>
                          <th className="pb-3">Endereço</th>
                          <th className="pb-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {users
                          .filter(u =>
                            u.name.toLowerCase().includes(superAdminUserSearch.toLowerCase()) ||
                            u.email.toLowerCase().includes(superAdminUserSearch.toLowerCase()) ||
                            (u.phone && u.phone.includes(superAdminUserSearch))
                          )
                          .map(u => (
                            <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                              <td className="py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs">
                                    {u.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-extrabold text-stone-900">{u.name}</p>
                                    <p className="text-[11px] text-stone-500">{u.email}</p>
                                    {u.phone && <p className="text-[10px] text-stone-400">{u.phone}</p>}
                                  </div>
                                </div>
                              </td>

                              <td className="py-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                    u.role === 'superadmin'
                                      ? 'bg-amber-200 text-amber-950 border border-amber-300'
                                      : u.role === 'admin'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-stone-100 text-stone-700'
                                  }`}
                                >
                                  {u.role === 'superadmin' ? 'Master' : u.role === 'admin' ? 'Admin / Gerente' : 'Cliente'}
                                </span>
                              </td>

                              <td className="py-3 font-mono text-[11px]">
                                <span className="bg-stone-100 text-stone-800 font-bold px-2 py-0.5 rounded border border-stone-200">
                                  {u.password || '123456'}
                                </span>
                              </td>

                              <td className="py-3 font-semibold text-stone-800">
                                <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md font-bold text-[11px]">
                                  {u.loyaltyPoints} pts ({u.loyaltyTier})
                                </span>
                              </td>

                              <td className="py-3 text-stone-600 max-w-xs truncate" title={u.address}>
                                {u.address || '—'}
                              </td>

                              <td className="py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditingUserModal(u)}
                                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg transition-colors flex items-center gap-1"
                                    title="Editar Dados do Usuário"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Editar</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`Excluir permanentemente o usuário "${u.name}" (${u.email})?`)) {
                                        deleteUser(u.id);
                                      }
                                    }}
                                    className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition-colors flex items-center gap-1"
                                    title="Excluir Usuário"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Excluir</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION: TODOS OS PEDIDOS */}
              {superAdminSection === 'orders' && (
                <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-sm">Todos os Pedidos da Plataforma ({orders.length})</h4>
                      <p className="text-xs text-stone-500">Supervisão de todos os estabelecimentos com controle de status e cancelamento/remoção.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase">
                          <th className="pb-3">#ID</th>
                          <th className="pb-3">Estabelecimento</th>
                          <th className="pb-3">Cliente</th>
                          <th className="pb-3">Total</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {orders.map(ord => (
                          <tr key={ord.id} className="hover:bg-stone-50 transition-colors">
                            <td className="py-3 font-mono font-bold text-stone-900">
                              #{ord.id}
                            </td>
                            <td className="py-3 font-bold text-stone-800">
                              {ord.restaurantName || 'Sabor & Cia'}
                            </td>
                            <td className="py-3">
                              <p className="font-bold text-stone-900">{ord.customerName}</p>
                              <p className="text-[11px] text-stone-500">{ord.deliveryAddress}</p>
                            </td>
                            <td className="py-3 font-extrabold text-stone-900">
                              R$ {ord.total.toFixed(2).replace('.', ',')}
                            </td>
                            <td className="py-3">
                              <select
                                value={ord.status}
                                onChange={e => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                                className="p-1 rounded-lg border border-stone-300 bg-white font-bold text-xs"
                              >
                                <option value="recebido">Recebido</option>
                                <option value="em_preparo">Em Preparo</option>
                                <option value="saiu_para_entrega">Saiu p/ Entrega</option>
                                <option value="entregue">Entregue</option>
                                <option value="cancelado">Cancelado</option>
                              </select>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Excluir permanentemente o pedido #${ord.id}?`)) {
                                    deleteOrder(ord.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                title="Excluir Pedido"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION: GESTÃO DE CUPONS */}
              {superAdminSection === 'coupons' && (
                <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-sm">Cupons de Desconto da Plataforma ({coupons.length})</h4>
                      <p className="text-xs text-stone-500">Crie ou exclua cupons globais, de estabelecimentos específicos ou para novos usuários.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase">
                          <th className="pb-3">Código</th>
                          <th className="pb-3">Desconto</th>
                          <th className="pb-3">Validade / Escopo</th>
                          <th className="pb-3">Usos</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {coupons.map(c => {
                          const rest = restaurants.find(r => r.id === c.restaurantId);
                          return (
                            <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                              <td className="py-3 font-mono font-black text-stone-900">
                                {c.code}
                              </td>
                              <td className="py-3 font-extrabold text-amber-700">
                                {c.discountType === 'percentage' ? `${c.value}% OFF` : `R$ ${c.value.toFixed(2)} OFF`}
                              </td>
                              <td className="py-3 text-stone-600 font-semibold">
                                {c.restaurantId ? (
                                  <span className="text-orange-700 font-bold">Loja: {rest?.name || c.restaurantId}</span>
                                ) : c.targetType === 'novos_usuarios' ? (
                                  <span className="text-emerald-700 font-bold">🎉 Novos Usuários</span>
                                ) : (
                                  <span className="text-stone-700 font-bold">🌐 Todas as Lojas</span>
                                )}
                              </td>
                              <td className="py-3 text-stone-600">
                                {c.usageCount || 0} vezes
                              </td>
                              <td className="py-3">
                                <button
                                  type="button"
                                  onClick={() => toggleCouponActive(c.id)}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                                  }`}
                                >
                                  {c.isActive ? 'Ativo' : 'Inativo'}
                                </button>
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Excluir o cupom "${c.code}"?`)) {
                                      deleteCoupon(c.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                  title="Excluir Cupom"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Store Edit Modal */}
        {editingStore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-stone-200 my-8">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg border border-amber-200 overflow-hidden shrink-0">
                    {editingStore.logoUrl ? (
                      <img
                        src={editingStore.logoUrl}
                        alt={editingStore.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Store className="w-6 h-6 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-stone-900">Editar Estabelecimento</h3>
                    <p className="text-xs text-stone-500">
                      Altere nome, endereço, logo, capa e configurações operacionais de <strong>{editingStore.name}</strong>
                    </p>
                  </div>
                </div>
                <button
                  id="close-store-edit-modal-btn"
                  onClick={() => setEditingStore(null)}
                  className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Switcher inside modal to easily edit any other registered store */}
              <div className="mb-5 p-2.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-amber-600" />
                  Alternar Loja para Editar:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {restaurants.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setEditingStore(r)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        editingStore.id === r.id
                          ? 'bg-amber-800 text-white shadow-xs'
                          : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200'
                      }`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  updateRestaurant(editingStore.id, {
                    name: editingStore.name,
                    tagline: editingStore.tagline,
                    description: editingStore.description,
                    category: editingStore.category,
                    phone: editingStore.phone,
                    address: editingStore.address,
                    openingHours: editingStore.openingHours,
                    logoUrl: editingStore.logoUrl,
                    coverUrl: editingStore.coverUrl || editingStore.bannerUrl,
                    bannerUrl: editingStore.bannerUrl || editingStore.coverUrl,
                    deliveryFee: Number(editingStore.deliveryFee),
                    minOrder: Number(editingStore.minOrder),
                    deliveryTimeMin: Number(editingStore.deliveryTimeMin),
                    deliveryTimeMax: Number(editingStore.deliveryTimeMax),
                    isOpen: editingStore.isOpen,
                    managerName: editingStore.managerName,
                    managerEmail: editingStore.managerEmail,
                  });
                  setEditingStore(null);
                }}
                className="space-y-5 text-xs max-h-[70vh] overflow-y-auto pr-1"
              >
                {/* 1. SEÇÃO LOGO E IDENTIDADE VISUAL */}
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-700" />
                    <h4 className="font-extrabold text-stone-900 text-sm">Logo & Identidade Visual</h4>
                  </div>

                  {/* Logo Config */}
                  <div>
                    <label className="block font-bold text-stone-700 mb-1.5">
                      Logo do Estabelecimento
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-amber-300 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {editingStore.logoUrl ? (
                          <img
                            src={editingStore.logoUrl}
                            alt="Preview Logo"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Store className="w-6 h-6 text-stone-400" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <input
                          id="store-logo-url-input"
                          type="url"
                          value={editingStore.logoUrl || ''}
                          onChange={e => setEditingStore({ ...editingStore, logoUrl: e.target.value })}
                          placeholder="https://exemplo.com/logo.jpg"
                          className="w-full p-2 rounded-xl border border-stone-300 bg-white font-mono text-[11px]"
                        />

                        {/* File Upload for Logo */}
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 font-bold rounded-lg border border-stone-300 flex items-center gap-1 transition-colors text-[11px]">
                            <Upload className="w-3 h-3 text-stone-500" />
                            <span>Carregar do Dispositivo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = ev => {
                                    if (ev.target?.result) {
                                      setEditingStore({ ...editingStore, logoUrl: ev.target.result as string });
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>

                          <span className="text-[10px] text-stone-400">ou escolha um modelo:</span>
                        </div>
                      </div>
                    </div>

                    {/* Logo Presets */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {[
                        { label: '🍔 Hambúrguer', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80' },
                        { label: '🍕 Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80' },
                        { label: '🌭 Hot Dog', url: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=200&auto=format&fit=crop&q=80' },
                        { label: '🥟 Pastel', url: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=200&auto=format&fit=crop&q=80' },
                        { label: '🍧 Açaí/Sobremesa', url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=200&auto=format&fit=crop&q=80' },
                        { label: '🥤 Bebidas', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200&auto=format&fit=crop&q=80' },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditingStore({ ...editingStore, logoUrl: preset.url })}
                          className="px-2 py-0.5 rounded-md bg-white hover:bg-amber-100 text-stone-700 text-[10px] font-semibold border border-stone-200 transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Banner / Cover Config */}
                  <div className="pt-2 border-t border-amber-200/50">
                    <label className="block font-bold text-stone-700 mb-1.5">
                      Foto de Capa / Banner da Loja
                    </label>
                    <div className="space-y-2">
                      <div className="h-20 w-full rounded-xl overflow-hidden border border-stone-300 bg-stone-100 relative">
                        {editingStore.bannerUrl || editingStore.coverUrl ? (
                          <img
                            src={editingStore.bannerUrl || editingStore.coverUrl}
                            alt="Preview Capa"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                            Sem imagem de capa
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          id="store-banner-url-input"
                          type="url"
                          value={editingStore.bannerUrl || editingStore.coverUrl || ''}
                          onChange={e => setEditingStore({
                            ...editingStore,
                            bannerUrl: e.target.value,
                            coverUrl: e.target.value
                          })}
                          placeholder="https://exemplo.com/banner.jpg"
                          className="w-full p-2 rounded-xl border border-stone-300 bg-white font-mono text-[11px]"
                        />

                        <label className="cursor-pointer px-2.5 py-2 bg-white hover:bg-stone-100 text-stone-700 font-bold rounded-xl border border-stone-300 flex items-center gap-1 shrink-0 transition-colors text-[11px]">
                          <Upload className="w-3 h-3 text-stone-500" />
                          <span>Carregar</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = ev => {
                                  if (ev.target?.result) {
                                    const bUrl = ev.target.result as string;
                                    setEditingStore({ ...editingStore, bannerUrl: bUrl, coverUrl: bUrl });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {/* Banner presets */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { label: 'Grelha Burger', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop&q=80' },
                          { label: 'Pizzaria Forno', url: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=1200&auto=format&fit=crop&q=80' },
                          { label: 'Lanchonete Rustica', url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=1200&auto=format&fit=crop&q=80' },
                          { label: 'Sobremesas', url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1200&auto=format&fit=crop&q=80' },
                        ].map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditingStore({
                              ...editingStore,
                              bannerUrl: preset.url,
                              coverUrl: preset.url
                            })}
                            className="px-2 py-0.5 rounded-md bg-white hover:bg-amber-100 text-stone-700 text-[10px] font-semibold border border-stone-200 transition-colors"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. DADOS PRINCIPAIS */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-orange-600" />
                    Dados Principais da Loja
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Nome da Lanchonete / Restaurante *
                      </label>
                      <input
                        id="store-name-input"
                        type="text"
                        required
                        value={editingStore.name}
                        onChange={e => setEditingStore({ ...editingStore, name: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
                        placeholder="Ex: Sabor & Cia Lanches"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Slogan / Subtítulo Curto
                      </label>
                      <input
                        id="store-tagline-input"
                        type="text"
                        value={editingStore.tagline || ''}
                        onChange={e => setEditingStore({ ...editingStore, tagline: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                        placeholder="Ex: O Melhor Hambúrguer Artesanal da Cidade"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Descrição Completa do Estabelecimento
                    </label>
                    <textarea
                      id="store-description-input"
                      rows={2}
                      value={editingStore.description || ''}
                      onChange={e => setEditingStore({ ...editingStore, description: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                      placeholder="História, diferenciais e especialidades que o cliente vê no rodapé e perfil..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Categoria Principal
                      </label>
                      <select
                        id="store-category-select"
                        value={editingStore.category}
                        onChange={e => setEditingStore({ ...editingStore, category: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-medium"
                      >
                        <option value="Hamburgueria">Hamburgueria Artesanal</option>
                        <option value="Lanchonete">Lanchonete Tradicional</option>
                        <option value="Pizzaria">Pizzaria & Massas</option>
                        <option value="Hot Dogs & Lanches">Hot Dogs & Prensados</option>
                        <option value="Pastelaria">Pastelaria & Salgados</option>
                        <option value="Açaí & Sobremesas">Açaí & Sobremesas</option>
                        <option value="Restaurante Geral">Restaurante Geral</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Status de Funcionamento
                      </label>
                      <div className="flex items-center gap-2 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-xl border border-stone-300 w-full">
                          <input
                            type="checkbox"
                            checked={editingStore.isOpen}
                            onChange={e => setEditingStore({ ...editingStore, isOpen: e.target.checked })}
                            className="w-4 h-4 text-emerald-600 rounded"
                          />
                          <span className={`font-bold ${editingStore.isOpen ? 'text-emerald-700' : 'text-red-600'}`}>
                            {editingStore.isOpen ? '🟢 Loja Aberta (Recebendo Pedidos)' : '🔴 Fechada Temporariamente'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. LOCALIZAÇÃO E CONTATO */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-600" />
                    Endereço & Atendimento ao Cliente
                  </h4>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Endereço Completo do Estabelecimento *
                    </label>
                    <input
                      id="store-address-input"
                      type="text"
                      required
                      value={editingStore.address}
                      onChange={e => setEditingStore({ ...editingStore, address: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-medium"
                      placeholder="Ex: Av. Gastronômica, 1420 - Centro, São Paulo - SP"
                    />
                    <p className="text-[10px] text-stone-500 mt-1">
                      Este endereço é exibido no topo da página, no rodapé e utilizado para cálculo de rota do motoboy.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        Telefone / WhatsApp de Atendimento *
                      </label>
                      <input
                        id="store-phone-input"
                        type="text"
                        required
                        value={editingStore.phone}
                        onChange={e => setEditingStore({ ...editingStore, phone: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-medium"
                        placeholder="Ex: (11) 98765-4321"
                      />
                      <p className="text-[10px] text-stone-500 mt-1">
                        Usado pelos clientes para rastrear pedidos via WhatsApp diretamente com esta loja.
                      </p>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Horário de Funcionamento
                      </label>
                      <input
                        id="store-opening-hours-input"
                        type="text"
                        value={editingStore.openingHours}
                        onChange={e => setEditingStore({ ...editingStore, openingHours: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                        placeholder="Ex: Terça a Domingo, 18h às 23h45"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Gerente / Responsável
                      </label>
                      <input
                        id="store-manager-name-input"
                        type="text"
                        value={editingStore.managerName || ''}
                        onChange={e => setEditingStore({ ...editingStore, managerName: e.target.value })}
                        className="w-full p-2 rounded-xl border border-stone-300 bg-white"
                        placeholder="Ex: Carlos Eduardo"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        E-mail de Contato
                      </label>
                      <input
                        id="store-manager-email-input"
                        type="email"
                        value={editingStore.managerEmail || ''}
                        onChange={e => setEditingStore({ ...editingStore, managerEmail: e.target.value })}
                        className="w-full p-2 rounded-xl border border-stone-300 bg-white"
                        placeholder="Ex: contato@loja.com"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. ENTREGAS, TAXAS E PRAZOS */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
                    <Bike className="w-4 h-4 text-blue-600" />
                    Regras de Entrega & Prazos
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Taxa de Entrega (R$)</label>
                      <input
                        id="store-delivery-fee-input"
                        type="number"
                        step="0.5"
                        min="0"
                        value={editingStore.deliveryFee}
                        onChange={e => setEditingStore({ ...editingStore, deliveryFee: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 rounded-xl border border-stone-300 bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Pedido Mínimo (R$)</label>
                      <input
                        id="store-min-order-input"
                        type="number"
                        step="1"
                        min="0"
                        value={editingStore.minOrder}
                        onChange={e => setEditingStore({ ...editingStore, minOrder: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 rounded-xl border border-stone-300 bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Tempo Mínimo (min)</label>
                      <input
                        id="store-time-min-input"
                        type="number"
                        min="5"
                        value={editingStore.deliveryTimeMin || 20}
                        onChange={e => setEditingStore({ ...editingStore, deliveryTimeMin: parseInt(e.target.value, 10) || 20 })}
                        className="w-full p-2 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Tempo Máximo (min)</label>
                      <input
                        id="store-time-max-input"
                        type="number"
                        min="10"
                        value={editingStore.deliveryTimeMax || 45}
                        onChange={e => setEditingStore({ ...editingStore, deliveryTimeMax: parseInt(e.target.value, 10) || 45 })}
                        className="w-full p-2 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setEditingStore(null)}
                    className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    id="save-store-settings-btn"
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Dados do Estabelecimento</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Editar Taxa de Bairro */}
        {editingBairroModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Bike className="w-5 h-5 text-orange-600" />
                  <h3 className="font-extrabold text-base text-stone-900">Editar Bairro e Taxa</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingBairroModal(null)}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  updateNeighborhoodFee(bairroRestId, editingBairroModal.id, {
                    neighborhood: editingBairroModal.neighborhood,
                    fee: Number(editingBairroModal.fee),
                    estimatedMinutes: Number(editingBairroModal.estimatedMinutes),
                    isActive: editingBairroModal.isActive,
                  });
                  setEditingBairroModal(null);
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nome do Bairro</label>
                  <input
                    type="text"
                    required
                    value={editingBairroModal.neighborhood}
                    onChange={e => setEditingBairroModal({ ...editingBairroModal, neighborhood: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Taxa de Entrega (R$)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      required
                      value={editingBairroModal.fee}
                      onChange={e => setEditingBairroModal({ ...editingBairroModal, fee: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Tempo Estimado (min)</label>
                    <input
                      type="number"
                      min="5"
                      value={editingBairroModal.estimatedMinutes || 30}
                      onChange={e => setEditingBairroModal({ ...editingBairroModal, estimatedMinutes: parseInt(e.target.value, 10) || 30 })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold text-stone-900"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="edit-bairro-active-chk"
                    checked={editingBairroModal.isActive}
                    onChange={e => setEditingBairroModal({ ...editingBairroModal, isActive: e.target.checked })}
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="edit-bairro-active-chk" className="font-bold text-stone-700 cursor-pointer">
                    Bairro Ativo para Entregas
                  </label>
                </div>

                <div className="flex gap-2 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setEditingBairroModal(null)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Bairro</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Editar Usuário / Cliente (Super Admin) */}
        {editingUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-600" />
                  <h3 className="font-extrabold text-base text-stone-900">Editar Dados do Usuário</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingUserModal(null)}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  updateUser(editingUserModal.id, {
                    name: editingUserModal.name,
                    email: editingUserModal.email,
                    password: editingUserModal.password || '123456',
                    phone: editingUserModal.phone,
                    role: editingUserModal.role,
                    loyaltyPoints: Number(editingUserModal.loyaltyPoints) || 0,
                    loyaltyTier: (Number(editingUserModal.loyaltyPoints) || 0) >= 500 ? 'Ouro' : (Number(editingUserModal.loyaltyPoints) || 0) >= 200 ? 'Prata' : 'Bronze',
                    address: editingUserModal.address,
                  });
                  setEditingUserModal(null);
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={editingUserModal.name}
                    onChange={e => setEditingUserModal({ ...editingUserModal, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">E-mail *</label>
                    <input
                      type="email"
                      required
                      value={editingUserModal.email}
                      onChange={e => setEditingUserModal({ ...editingUserModal, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Senha de Acesso *</label>
                    <input
                      type="text"
                      required
                      value={editingUserModal.password || '123456'}
                      onChange={e => setEditingUserModal({ ...editingUserModal, password: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono font-bold text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={editingUserModal.phone || ''}
                    onChange={e => setEditingUserModal({ ...editingUserModal, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Cargo / Permissão *</label>
                    <select
                      value={editingUserModal.role}
                      onChange={e => setEditingUserModal({ ...editingUserModal, role: e.target.value as UserRole })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
                    >
                      <option value="customer">Cliente Comum</option>
                      <option value="admin">Administrador da Loja</option>
                      <option value="superadmin">Painel Master (Poder Total)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Pontos Fidelidade</label>
                    <input
                      type="number"
                      min="0"
                      value={editingUserModal.loyaltyPoints}
                      onChange={e => setEditingUserModal({ ...editingUserModal, loyaltyPoints: parseInt(e.target.value, 10) || 0 })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Endereço de Entrega</label>
                  <input
                    type="text"
                    value={editingUserModal.address || ''}
                    onChange={e => setEditingUserModal({ ...editingUserModal, address: e.target.value })}
                    placeholder="Rua, número, complemento e bairro"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>

                <div className="flex gap-2 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setEditingUserModal(null)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Dados</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Cadastrar Novo Usuário (Super Admin) */}
        {newUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-stone-200">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-600" />
                  <h3 className="font-extrabold text-base text-stone-900">Novo Usuário / Cliente</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setNewUserModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!newUserName.trim() || !newUserEmail.trim()) return;
                  const pts = parseInt(newUserPoints, 10) || 50;
                  addNewUser({
                    name: newUserName.trim(),
                    email: newUserEmail.trim(),
                    password: newUserPassword.trim() || '123456',
                    phone: newUserPhone.trim(),
                    role: newUserRole,
                    loyaltyPoints: pts,
                    loyaltyTier: pts >= 500 ? 'Ouro' : pts >= 200 ? 'Prata' : 'Bronze',
                    address: newUserAddress.trim(),
                  });
                  setNewUserModalOpen(false);
                  setNewUserName('');
                  setNewUserEmail('');
                  setNewUserPassword('123456');
                  setNewUserPhone('');
                  setNewUserAddress('');
                  setNewUserRole('customer');
                  setNewUserPoints('100');
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João da Silva"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">E-mail *</label>
                    <input
                      type="email"
                      required
                      placeholder="joao@email.com"
                      value={newUserEmail}
                      onChange={e => setNewUserEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Senha de Acesso *</label>
                    <input
                      type="text"
                      required
                      placeholder="Mínimo 4 caracteres"
                      value={newUserPassword}
                      onChange={e => setNewUserPassword(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono font-bold text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={newUserPhone}
                    onChange={e => setNewUserPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Cargo / Papel *</label>
                    <select
                      value={newUserRole}
                      onChange={e => setNewUserRole(e.target.value as UserRole)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
                    >
                      <option value="customer">Cliente Comum</option>
                      <option value="admin">Administrador da Loja</option>
                      <option value="superadmin">Painel Master (Poder Total)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Pontos de Boas-Vindas</label>
                    <input
                      type="number"
                      min="0"
                      value={newUserPoints}
                      onChange={e => setNewUserPoints(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Endereço de Entrega</label>
                  <input
                    type="text"
                    placeholder="Rua, número, complemento e bairro"
                    value={newUserAddress}
                    onChange={e => setNewUserAddress(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>

                <div className="flex gap-2 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setNewUserModalOpen(false)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar Usuário</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
