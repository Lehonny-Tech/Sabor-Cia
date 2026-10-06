import React, { useState } from 'react';
import {
  UtensilsCrossed,
  ShoppingBag,
  Award,
  Bell,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  MapPin,
  Clock,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Store,
  Bike,
  Crown
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  activeTab: 'menu' | 'orders' | 'register_restaurant';
  setActiveTab: (tab: 'menu' | 'orders' | 'register_restaurant') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentUser,
    cart,
    setCartDrawerOpen,
    setAuthModalOpen,
    logout,
    setLoyaltyModalOpen,
    setAdminPanelOpen,
    adminPanelOpen,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    orders,
    setActiveTrackingOrderId,
    deliveryAddress,
    restaurants,
  } = useApp();

  const mainRestaurant = restaurants.find(r => r.id === 'rest-sabor-cia') || restaurants[0];

  const [notifOpen, setNotifOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trackingDropdownOpen, setTrackingDropdownOpen] = useState(false);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  // Active orders (in progress)
  const activeOrders = orders.filter(o => o.status !== 'entregue' && o.status !== 'cancelado');

  // Trackable orders: Last 4 orders or orders made in the last 90 days
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const userOrAllOrders = orders.filter(o => {
    if (currentUser?.role === 'admin') return true;
    return !currentUser || o.userId === currentUser.id;
  });
  const ordersInLast90Days = userOrAllOrders.filter(o => new Date(o.createdAt) >= ninetyDaysAgo);
  const trackableOrders = (ordersInLast90Days.length > 0 ? ordersInLast90Days : userOrAllOrders).slice(0, 4);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-xs">
      {/* Top Banner with Snack Bar Status */}
      <div className="bg-amber-900 text-amber-50 text-xs px-4 py-1.5 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-4 text-amber-200">
          <span className="flex items-center gap-1.5 font-medium">
            <span className={`inline-block w-2 h-2 rounded-full ${mainRestaurant?.isOpen !== false ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            {mainRestaurant?.name || 'Sabor & Cia'} • {mainRestaurant?.isOpen !== false ? 'Aberto p/ Pedidos' : 'Temporariamente Fechado'} • {mainRestaurant?.deliveryTime || '30-45 min'}
          </span>
          <span className="hidden md:flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {mainRestaurant?.openingHours || 'Terça a Domingo, das 18h às 23h45'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-1.5 text-[11px] bg-amber-800/90 text-amber-100 px-3 py-1 rounded-full border border-amber-700/80 shadow-xs">
              {currentUser.role === 'superadmin' ? (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span className="font-bold">Painel Master</span>
                </>
              ) : currentUser.role === 'admin' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold">Admin Loja</span>
                </>
              ) : (
                <>
                  <UserIcon className="w-3.5 h-3.5 text-amber-300" />
                  <span className="font-medium">{currentUser.name.split(' ')[0]}</span>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="text-[11px] bg-amber-800 hover:bg-amber-700 text-amber-100 px-3 py-1 rounded-full border border-amber-700 flex items-center gap-1.5 transition-colors font-medium"
            >
              <UserIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>Entrar / Cadastrar</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 text-amber-200">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span className="truncate max-w-[200px]" title={mainRestaurant?.address || deliveryAddress}>
              {mainRestaurant?.address || deliveryAddress}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => {
                setActiveTab('menu');
                setAdminPanelOpen(false);
              }}
              className="flex items-center gap-3 group text-left"
            >
              {mainRestaurant?.logoUrl ? (
                <img
                  src={mainRestaurant.logoUrl}
                  alt={mainRestaurant.name}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-2xl object-cover shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform border border-amber-200"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold text-stone-900 tracking-tight">
                    {mainRestaurant?.name || 'Sabor & Cia'}
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    {mainRestaurant?.category || 'Lanches'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium">
                  {mainRestaurant?.tagline || mainRestaurant?.description?.substring(0, 45) || 'Hambúrgueres Artesanais & Delivery'}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-100/80 p-1 rounded-xl border border-stone-200/60">
            <button
              id="nav-menu-btn"
              onClick={() => {
                setActiveTab('menu');
                setAdminPanelOpen(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'menu' && !adminPanelOpen
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              Cardápio
            </button>

            <button
              id="nav-orders-btn"
              onClick={() => {
                setActiveTab('orders');
                setAdminPanelOpen(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all relative flex items-center gap-1.5 ${
                activeTab === 'orders' && !adminPanelOpen
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              Meus Pedidos
              {activeOrders.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              )}
            </button>

            <button
              id="nav-loyalty-btn"
              onClick={() => setLoyaltyModalOpen(true)}
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-stone-700 hover:text-amber-700 hover:bg-amber-50/70 transition-all flex items-center gap-1.5"
            >
              <Award className="w-4 h-4 text-amber-500" />
              Clube Fidelidade
            </button>

            {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && (
              <button
                id="nav-admin-btn"
                onClick={() => setAdminPanelOpen(true)}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  adminPanelOpen
                    ? 'bg-amber-900 text-amber-100 shadow-xs'
                    : 'text-amber-900 bg-amber-100/80 hover:bg-amber-200/70'
                }`}
              >
                {currentUser?.role === 'superadmin' ? (
                  <>
                    <Crown className="w-4 h-4 text-amber-600" />
                    <span>Painel Master</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Painel Admin</span>
                  </>
                )}
              </button>
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Tracking Dropdown / Popover (Shows last 4 orders or orders made in the last 90 days) */}
            {trackableOrders.length > 0 && (
              <div className="relative">
                <button
                  id="quick-tracking-chip"
                  onClick={() => setTrackingDropdownOpen(!trackingDropdownOpen)}
                  className="hidden lg:flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-orange-100 transition-colors animate-pulse"
                >
                  <span className="w-2 h-2 rounded-full bg-orange-600" />
                  <span>Rastrear Pedido</span>
                </button>

                {trackingDropdownOpen && (
                  <div
                    id="tracking-orders-dropdown"
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-stone-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-2">
                      <div className="flex items-center gap-2">
                        <Bike className="w-4 h-4 text-orange-600" />
                        <h4 className="font-bold text-stone-900 text-sm">Rastrear Pedido</h4>
                        <span className="text-xs bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                          Últimos {trackableOrders.length} pedidos
                        </span>
                      </div>
                      <button
                        onClick={() => setTrackingDropdownOpen(false)}
                        className="text-stone-400 hover:text-stone-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-500 mb-2.5">
                      Pedidos realizados nos últimos 90 dias com acompanhamento em tempo real:
                    </p>

                    <div className="max-h-72 overflow-y-auto space-y-2">
                      {trackableOrders.map(ord => {
                        const isCompleted = ord.status === 'entregue';
                        const inProgress = !isCompleted && ord.status !== 'cancelado';
                        const statusLabel =
                          ord.status === 'recebido'
                            ? 'Recebido'
                            : ord.status === 'em_preparo'
                            ? 'Em Preparo'
                            : ord.status === 'saiu_para_entrega'
                            ? 'A Caminho (GPS)'
                            : isCompleted
                            ? 'Entregue'
                            : 'Cancelado';

                        return (
                          <div
                            key={ord.id}
                            onClick={() => {
                              setActiveTrackingOrderId(ord.id);
                              setTrackingDropdownOpen(false);
                            }}
                            className="p-3 rounded-xl border border-stone-200 hover:border-orange-400 hover:bg-orange-50/50 transition-all cursor-pointer text-left group"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-extrabold text-xs text-stone-900">
                                Pedido #{ord.id}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  inProgress
                                    ? 'bg-orange-600 text-white animate-pulse'
                                    : isCompleted
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-stone-100 text-stone-600'
                                }`}
                              >
                                {statusLabel}
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-1.5 text-xs text-stone-600">
                              <span className="truncate max-w-[200px]">
                                {ord.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                              </span>
                              <span className="font-bold text-stone-900 shrink-0">
                                R$ {ord.total.toFixed(2).replace('.', ',')}
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 text-[11px]">
                              <span className="text-stone-400">
                                {new Date(ord.createdAt).toLocaleDateString('pt-BR')} às{' '}
                                {new Date(ord.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="font-bold text-orange-600 flex items-center gap-1 group-hover:text-orange-700">
                                Acompanhar ao vivo →
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2.5 border-t border-stone-100 mt-2 flex justify-between items-center text-xs">
                      <button
                        onClick={() => {
                          setActiveTab('orders');
                          setTrackingDropdownOpen(false);
                        }}
                        className="text-orange-600 hover:text-orange-700 font-bold"
                      >
                        Ver todos em Meus Pedidos →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                id="notifications-bell-btn"
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                title="Notificações push"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notifOpen && (
                <div
                  id="notifications-dropdown-menu"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-stone-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-2">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-orange-500" />
                      <h4 className="font-bold text-stone-900 text-sm">Notificações</h4>
                      {unreadNotifsCount > 0 && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                          {unreadNotifsCount} novas
                        </span>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button
                        id="clear-all-notifs-btn"
                        onClick={clearAllNotifications}
                        className="text-xs text-stone-500 hover:text-stone-800"
                      >
                        Limpar tudo
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-stone-400 text-xs">
                        Nenhuma notificação no momento.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            if (notif.orderId) {
                              setActiveTrackingOrderId(notif.orderId);
                              setNotifOpen(false);
                            }
                          }}
                          className={`p-3 rounded-xl transition-colors cursor-pointer text-left ${
                            notif.read ? 'bg-transparent hover:bg-stone-50' : 'bg-orange-50/60 hover:bg-orange-50'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h5 className="font-semibold text-xs text-stone-900">{notif.title}</h5>
                            <span className="text-[10px] text-stone-400 shrink-0">{notif.timestamp}</span>
                          </div>
                          <p className="text-xs text-stone-600 mt-1">{notif.message}</p>
                          {notif.orderId && (
                            <span className="inline-block mt-1.5 text-[10px] font-bold text-orange-600 hover:underline">
                              Ver acompanhamento →
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Account / Profile Menu */}
            <div className="relative">
              {currentUser ? (
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 sm:pr-3 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50/40 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-stone-800 leading-none truncate max-w-[110px]">
                      {currentUser.name.split(' ')[0]}
                    </p>
                    <span className="text-[10px] text-stone-500 capitalize">
                      {currentUser.role === 'superadmin' ? 'Super Admin' : currentUser.role === 'admin' ? 'Gerente Loja' : `${currentUser.loyaltyTier}`}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>
              ) : (
                <button
                  id="login-trigger-btn"
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  Entrar
                </button>
              )}

              {/* User Dropdown Menu */}
              {userDropdownOpen && currentUser && (
                <div
                  id="user-dropdown-popover"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900">{currentUser.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{currentUser.email}</p>
                    <div className="mt-1.5 flex items-center justify-between gap-1.5 text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded-md">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        {currentUser.loyaltyPoints} pts ({currentUser.loyaltyTier})
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded">
                        {currentUser.role}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      id="dropdown-loyalty-btn"
                      onClick={() => {
                        setLoyaltyModalOpen(true);
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-100 rounded-lg flex items-center gap-2"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      Clube Fidelidade
                    </button>

                    <button
                      id="dropdown-orders-btn"
                      onClick={() => {
                        setActiveTab('orders');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-stone-700 hover:bg-stone-100 rounded-lg flex items-center gap-2"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />
                      Histórico de Pedidos
                    </button>

                    {(currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
                      <button
                        id="dropdown-admin-panel-btn"
                        onClick={() => {
                          setAdminPanelOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 font-bold text-amber-900 bg-amber-100/60 hover:bg-amber-100 transition-colors"
                      >
                        {currentUser.role === 'superadmin' ? (
                          <Crown className="w-3.5 h-3.5 text-amber-700" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                        )}
                        {currentUser.role === 'superadmin' ? 'Painel Master' : 'Painel Administrativo'}
                      </button>
                    )}
                  </div>

                  <div className="pt-1 border-t border-stone-100">
                    <button
                      id="dropdown-logout-btn"
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sair da Conta
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              id="header-cart-btn"
              onClick={() => setCartDrawerOpen(true)}
              className="relative flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Carrinho</span>
              <span className="bg-white text-orange-600 px-1.5 py-0.5 rounded-full text-[11px] font-extrabold min-w-[20px] text-center">
                {cartItemsCount}
              </span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-stone-100 flex flex-col gap-2 pb-4">
            <button
              onClick={() => {
                setActiveTab('menu');
                setAdminPanelOpen(false);
                setMobileMenuOpen(false);
              }}
              className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold ${
                activeTab === 'menu' && !adminPanelOpen ? 'bg-orange-50 text-orange-600' : 'text-stone-700'
              }`}
            >
              Cardápio Completo
            </button>

            <button
              onClick={() => {
                setActiveTab('orders');
                setAdminPanelOpen(false);
                setMobileMenuOpen(false);
              }}
              className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                activeTab === 'orders' && !adminPanelOpen ? 'bg-orange-50 text-orange-600' : 'text-stone-700'
              }`}
            >
              <span>Meus Pedidos</span>
              {activeOrders.length > 0 && (
                <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {activeOrders.length} em andamento
                </span>
              )}
            </button>

            {trackableOrders.length > 0 && (
              <button
                onClick={() => {
                  if (trackableOrders.length === 1) {
                    setActiveTrackingOrderId(trackableOrders[0].id);
                  } else {
                    setActiveTab('orders');
                  }
                  setMobileMenuOpen(false);
                }}
                className="text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-orange-700 bg-orange-50 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Bike className="w-4 h-4 text-orange-600" />
                  <span>Rastrear Pedido</span>
                </span>
                <span className="text-[10px] bg-orange-200 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                  Últimos {trackableOrders.length}
                </span>
              </button>
            )}

            <button
              onClick={() => {
                setLoyaltyModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-800 bg-amber-50 flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>Clube Fidelidade</span>
            </button>

            {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && (
              <button
                onClick={() => {
                  setAdminPanelOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="text-left px-4 py-2.5 rounded-xl text-sm font-bold text-amber-950 bg-amber-100 flex items-center gap-2"
              >
                {currentUser?.role === 'superadmin' ? (
                  <Crown className="w-4 h-4 text-amber-700" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                )}
                {currentUser?.role === 'superadmin' ? 'Painel Master' : 'Painel Administrativo'}
              </button>
            )}

            {!currentUser ? (
              <button
                onClick={() => {
                  setAuthModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="text-left px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-stone-900 flex items-center gap-2 mt-1"
              >
                <UserIcon className="w-4 h-4 text-amber-300" />
                <span>Entrar / Criar Conta</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da Conta ({currentUser.name.split(' ')[0]})</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
