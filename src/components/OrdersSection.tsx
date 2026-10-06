import React from 'react';
import {
  ShoppingBag,
  Clock,
  Bike,
  CheckCircle2,
  ChevronRight,
  Star,
  RotateCcw,
  Sparkles,
  MapPin,
  Flame,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types';
import { generateCustomerTrackingWhatsAppUrl } from '../utils/whatsapp';

interface OrdersSectionProps {
  onGoToMenu: () => void;
}

export const OrdersSection: React.FC<OrdersSectionProps> = ({ onGoToMenu }) => {
  const {
    orders,
    setActiveTrackingOrderId,
    setReviewModalOrderId,
    addToCart,
    menuItems,
    restaurants,
  } = useApp();

  const handleReorder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    order.items.forEach(item => {
      const originalMenuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (originalMenuItem) {
        addToCart(originalMenuItem, item.quantity, item.customizations, item.itemNotes);
      }
    });
  };

  return (
    <div className="py-6 sm:py-8 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">Meus Pedidos</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Acompanhe o status em tempo real, avalie suas refeições e repita pedidos favoritos.
          </p>
        </div>

        <button
          id="back-to-menu-from-orders-btn"
          onClick={onGoToMenu}
          className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-xl transition-colors"
        >
          Ver Cardápio
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-stone-900">Você ainda não fez nenhum pedido</h3>
          <p className="text-xs text-stone-500 mt-1 mb-4 max-w-sm mx-auto">
            Que tal escolher um Smash Burger ou uma porção quentinha de batatas para hoje?
          </p>
          <button
            id="orders-empty-go-menu-btn"
            onClick={onGoToMenu}
            className="px-5 py-2.5 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors"
          >
            Fazer Meu Primeiro Pedido
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const isCompleted = order.status === 'entregue';
            const isCancelled = order.status === 'cancelado';
            const inProgress = !isCompleted && !isCancelled;

            return (
              <div
                key={order.id}
                id={`customer-order-card-${order.id}`}
                className={`bg-white rounded-3xl border p-5 sm:p-6 transition-all shadow-xs ${
                  inProgress
                    ? 'border-orange-300 ring-2 ring-orange-100'
                    : 'border-stone-200'
                }`}
              >
                {/* Top status info */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                        inProgress
                          ? 'bg-orange-600 text-white animate-pulse'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {inProgress ? <Bike className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-stone-900">Pedido #{order.id}</span>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            order.status === 'recebido'
                              ? 'bg-amber-100 text-amber-800'
                              : order.status === 'em_preparo'
                              ? 'bg-orange-100 text-orange-800'
                              : order.status === 'saiu_para_entrega'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'entregue'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {order.status === 'recebido'
                            ? 'Recebido na Cozinha'
                            : order.status === 'em_preparo'
                            ? 'Em Preparo na Chapa'
                            : order.status === 'saiu_para_entrega'
                            ? 'A Caminho com Motoboy'
                            : order.status === 'entregue'
                            ? 'Entregue'
                            : 'Cancelado'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-stone-500 block">Total</span>
                    <span className="text-base font-black text-stone-900">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                {/* Items summary */}
                <div className="py-4 space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-xs">
                      <div>
                        <span className="font-bold text-stone-800">
                          {item.quantity}x {item.name}
                        </span>
                        {item.customizations?.map((c, i) => (
                          <span key={i} className="text-[11px] text-stone-500 block">
                            • {c.selectedOption}
                          </span>
                        ))}
                      </div>
                      <span className="font-medium text-stone-600">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}

                  <div className="pt-2 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-600" />
                      {order.deliveryAddress}
                    </span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      +{order.loyaltyPointsEarned} pts fidelidade
                    </span>
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                  {/* Action 1: Track live */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      id={`track-order-btn-${order.id}`}
                      onClick={() => setActiveTrackingOrderId(order.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                        inProgress
                          ? 'bg-orange-600 hover:bg-orange-700 text-white animate-pulse'
                          : 'bg-stone-900 hover:bg-orange-600 text-white'
                      }`}
                    >
                      <Bike className="w-3.5 h-3.5" />
                      <span>{inProgress ? 'Acompanhar Entrega ao Vivo' : 'Ver Rastreamento'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* WhatsApp Tracking Link */}
                    {(() => {
                      const orderRest = restaurants.find(r => r.id === order.restaurantId) || null;
                      const waUrl = generateCustomerTrackingWhatsAppUrl(order, orderRest);
                      return (
                        <a
                          id={`whatsapp-track-btn-${order.id}`}
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1.5 transition-colors shadow-xs"
                          title="Acompanhar status do pedido via WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Rastrear no WhatsApp</span>
                          <ExternalLink className="w-3 h-3 text-emerald-500" />
                        </a>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Action 2: Review (if completed) */}
                    {isCompleted && (
                      order.review ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>Você avaliou com {order.review.rating} estrelas</span>
                        </div>
                      ) : (
                        <button
                          id={`evaluate-order-btn-${order.id}`}
                          onClick={() => setReviewModalOrderId(order.id)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          Avaliar Pedido
                        </button>
                      )
                    )}

                    {/* Action 3: Repeat Order */}
                    <button
                      id={`reorder-btn-${order.id}`}
                      onClick={() => handleReorder(order.id)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 border border-stone-200 flex items-center gap-1 transition-colors"
                      title="Adicionar estes mesmos itens ao carrinho"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Repetir Pedido
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
