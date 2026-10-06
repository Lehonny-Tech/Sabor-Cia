import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { MenuSection } from './components/MenuSection';
import { OrdersSection } from './components/OrdersSection';
import { RegisterRestaurantSection } from './components/RegisterRestaurantSection';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { LiveOrderTracking } from './components/LiveOrderTracking';
import { OrderReviewModal } from './components/OrderReviewModal';
import { LoyaltyModal } from './components/LoyaltyModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { NotificationToast } from './components/NotificationToast';
import { UtensilsCrossed, Phone, MapPin, Clock, ShieldCheck, Heart, Award, Sparkles } from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'register_restaurant'>('menu');

  const {
    activeTrackingOrderId,
    setActiveTrackingOrderId,
    reviewModalOrderId,
    currentUser,
    setLoyaltyModalOpen,
    setAdminPanelOpen,
    restaurants,
  } = useApp();

  const mainRestaurant = restaurants.find(r => r.id === 'rest-sabor-cia') || restaurants[0];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-orange-500 selection:text-white">
      {/* Header Navigation */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'menu' ? (
          <MenuSection onGoToRegister={() => setActiveTab('register_restaurant')} />
        ) : activeTab === 'orders' ? (
          <OrdersSection onGoToMenu={() => setActiveTab('menu')} />
        ) : (
          <RegisterRestaurantSection
            onGoToMenu={() => setActiveTab('menu')}
            onOpenAdmin={() => setAdminPanelOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-400 text-xs border-t border-stone-800 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-stone-800">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white">
                {mainRestaurant?.logoUrl ? (
                  <img
                    src={mainRestaurant.logoUrl}
                    alt={mainRestaurant.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-xl object-cover border border-amber-600/40"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center font-bold">
                    <UtensilsCrossed className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className="font-extrabold text-base tracking-tight">
                  {mainRestaurant?.name || 'Sabor & Cia'}
                </span>
              </div>
              <p className="text-stone-400 text-xs leading-relaxed">
                {mainRestaurant?.description || 'A verdadeira experiência do hambúrguer artesanal na brasa. Ingredientes selecionados, molhos especiais e entrega rápida com rastreamento ao vivo.'}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-amber-400">
                <Award className="w-4 h-4" />
                <span>Clube Fidelidade: Ganhe lanches grátis</span>
              </div>
            </div>

            {/* Hours */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-xs text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
                Horário de Atendimento
              </h4>
              <p className="text-stone-400">{mainRestaurant?.openingHours || 'Terça a Domingo: 18h00 às 23h45'}</p>
              <p className="text-stone-400">Segunda-feira: Fechado para descanso da equipe</p>
              <span className="inline-block mt-1 text-[11px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800">
                Entrega Expressa em {mainRestaurant?.deliveryTime || '30 a 45 minutos'}
              </span>
            </div>

            {/* Address & Contact */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-xs text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                Endereço & Contato
              </h4>
              <p className="text-stone-400">{mainRestaurant?.address || 'Av. Gastronômica, 1420 - Centro'}</p>
              <p className="text-stone-400 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-orange-400" /> {mainRestaurant?.phone || '(11) 98765-4321'} • WhatsApp
              </p>
              <p className="text-stone-500 text-[11px]">Pagamento via Pix, Cartão ou Dinheiro</p>
            </div>

            {/* Segurança & Atendimento */}
            <div className="space-y-2 bg-stone-900/80 p-4 rounded-2xl border border-stone-800">
              <h4 className="font-extrabold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Segurança & Atendimento
              </h4>
              <p className="text-[11px] text-stone-400">
                Plataforma oficial com acompanhamento em tempo real e programa de fidelidade.
              </p>
              <div className="flex flex-col gap-1.5 pt-1 text-stone-300 text-xs">
                <div className="flex items-center gap-2 text-stone-300 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Pedidos criptografados e rastreados</span>
                </div>
                <div className="flex items-center gap-2 text-stone-300 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Pontos de fidelidade automáticos</span>
                </div>
                <div className="flex items-center gap-2 text-stone-300 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span>Suporte e atendimento via WhatsApp</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-stone-500 text-[11px]">
            <p>© 2026 Sabor & Cia Lanchonete & Delivery. Todos os direitos reservados.</p>
            <p className="flex items-center gap-1">
              Desenvolvido com carinho para amantes de bom lanche <Heart className="w-3 h-3 text-red-500 fill-current" />
            </p>
          </div>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <CheckoutModal />
      {activeTrackingOrderId && (
        <LiveOrderTracking
          orderId={activeTrackingOrderId}
          onClose={() => setActiveTrackingOrderId(null)}
        />
      )}
      <OrderReviewModal />
      <LoyaltyModal />
      <AuthModal />
      <AdminPanel />
      <NotificationToast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
