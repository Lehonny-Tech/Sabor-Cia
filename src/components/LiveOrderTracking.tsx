import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Flame,
  Bike,
  MapPin,
  Phone,
  Store,
  ChevronRight,
  Star,
  Sparkles,
  Play,
  RotateCcw,
  MessageCircle,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types';
import { generateCustomerTrackingWhatsAppUrl, generateDriverWhatsAppUrl } from '../utils/whatsapp';

interface LiveOrderTrackingProps {
  orderId: string;
  onClose: () => void;
}

export const LiveOrderTracking: React.FC<LiveOrderTrackingProps> = ({ orderId, onClose }) => {
  const {
    orders,
    simulateNextOrderStep,
    setReviewModalOrderId,
    restaurants,
    setActiveTrackingOrderId,
    currentUser,
  } = useApp();
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Last 4 orders or orders made in the last 90 days
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const userOrAllOrders = orders.filter(o => {
    if (currentUser?.role === 'admin') return true;
    return !currentUser || o.userId === currentUser.id;
  });
  const ordersInLast90Days = userOrAllOrders.filter(o => new Date(o.createdAt) >= ninetyDaysAgo);
  const trackableOrders = (ordersInLast90Days.length > 0 ? ordersInLast90Days : userOrAllOrders).slice(0, 4);

  const order = orders.find(o => o.id === orderId);

  if (!order) return null;

  const orderRestaurant = restaurants.find(r => r.id === order.restaurantId) || null;
  const whatsAppTrackingUrl = generateCustomerTrackingWhatsAppUrl(order, orderRestaurant);
  const driverWhatsAppUrl = generateDriverWhatsAppUrl(order);

  const handleCopyTracking = () => {
    const summary = `Pedido #${order.id} no ${orderRestaurant?.name || 'Sabor & Cia'} - Status: ${order.status.toUpperCase()} - Total: R$ ${order.total.toFixed(2).replace('.', ',')} - Endereço: ${order.deliveryAddress}`;
    navigator.clipboard.writeText(summary);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const steps: { key: OrderStatus; label: string; icon: React.ElementType; desc: string }[] = [
    {
      key: 'recebido',
      label: 'Pedido Recebido',
      icon: CheckCircle2,
      desc: 'Confirmado pelo caixa e impresso para a cozinha.',
    },
    {
      key: 'em_preparo',
      label: 'Na Chapa (Em Preparo)',
      icon: Flame,
      desc: 'Pães selados e burgers grelhados no ponto certo.',
    },
    {
      key: 'saiu_para_entrega',
      label: 'Saiu para Entrega',
      icon: Bike,
      desc: 'Com o motoboy na bag térmica lacrada.',
    },
    {
      key: 'entregue',
      label: 'Pedido Entregue',
      icon: Star,
      desc: 'Entregue em mãos! Bom apetite!',
    },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order.status);

  // Map driver percentage position (0 to 100)
  let bikePercent = 10;
  if (order.status === 'em_preparo') bikePercent = 25;
  if (order.status === 'saiu_para_entrega') bikePercent = 70;
  if (order.status === 'entregue') bikePercent = 95;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        id="live-order-tracking-modal"
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-200 my-8 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-100 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Acompanhamento em Tempo Real
            </div>
            <h3 className="text-lg font-black">Pedido #{order.id}</h3>
            <p className="text-xs text-amber-100">
              Feito às {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Previsão: {order.estimatedDeliveryMinutes > 0 ? `~${order.estimatedDeliveryMinutes} min` : 'Concluído'}
            </p>
          </div>

          <button
            id="close-tracking-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector for last 4 orders / 90 days */}
        {trackableOrders.length > 1 && (
          <div className="px-5 py-2.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
            <span className="text-[11px] font-bold text-stone-600 shrink-0 flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5 text-orange-600" />
              <span>Alternar Pedido ({trackableOrders.length} recentes):</span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {trackableOrders.map(ro => {
                const isCurrent = ro.id === order.id;
                const statusName =
                  ro.status === 'saiu_para_entrega'
                    ? 'A caminho'
                    : ro.status === 'em_preparo'
                    ? 'Na chapa'
                    : ro.status === 'recebido'
                    ? 'Recebido'
                    : 'Entregue';

                return (
                  <button
                    key={ro.id}
                    onClick={() => setActiveTrackingOrderId(ro.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    <span>#{ro.id}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                        isCurrent
                          ? 'bg-orange-700 text-white'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {statusName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Stepper Progress Timeline */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <div className="grid grid-cols-4 gap-2 relative mb-6">
              {/* Progress Line */}
              <div className="absolute top-4 left-[12%] right-[12%] h-1 bg-stone-200 -z-0">
                <div
                  className="h-full bg-orange-600 transition-all duration-700 rounded-full"
                  style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const IconComponent = step.icon;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-orange-600 text-white ring-4 ring-orange-200 shadow-md scale-110'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-200 text-stone-400'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[11px] font-extrabold mt-2 leading-tight ${
                        isCurrent
                          ? 'text-orange-600'
                          : isCompleted
                          ? 'text-stone-900'
                          : 'text-stone-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Current Step Description Card */}
            <div className="p-3.5 bg-white rounded-xl border border-stone-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-ping" />
                <div>
                  <p className="font-extrabold text-stone-900">
                    {steps[currentStepIndex]?.desc || 'Aguardando atualização de status...'}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Última atualização registrada no sistema
                  </p>
                </div>
              </div>

              {order.status === 'entregue' && !order.review && (
                <button
                  id="review-from-tracking-btn"
                  onClick={() => setReviewModalOrderId(order.id)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1 shrink-0"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Avaliar Pedido
                </button>
              )}
            </div>
          </div>

          {/* WhatsApp Live Tracking Interaction Card */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-3 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-emerald-950 flex items-center gap-1.5">
                    Rastreamento via WhatsApp
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                      Ao Vivo
                    </span>
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Acompanhe em tempo real ou fale com {orderRestaurant?.name || 'o estabelecimento'} com 1 toque
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 p-3 rounded-xl border border-emerald-100 text-xs space-y-1.5 text-stone-700">
              <div className="flex justify-between items-center text-[11px] text-stone-500 pb-1 border-b border-emerald-100/60">
                <span>Estabelecimento: <strong>{orderRestaurant?.name || 'Sabor & Cia'}</strong></span>
                <span>WhatsApp: <strong>{orderRestaurant?.phone || '(11) 98765-4321'}</strong></span>
              </div>
              <p className="text-xs text-stone-800 line-clamp-2 italic">
                "{order.customerName}, seu pedido #{order.id} está com status: <strong>{steps[currentStepIndex]?.label}</strong>"
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                id="whatsapp-track-btn"
                href={whatsAppTrackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[200px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Rastrear no WhatsApp da Loja
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <button
                id="copy-tracking-btn"
                onClick={handleCopyTracking}
                className="py-2.5 px-3 bg-white hover:bg-emerald-100/60 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                {copiedTracking ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar Dados
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Delivery Route Map Visual */}
          <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-3 shadow-inner relative overflow-hidden">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orange-400" />
                Rota da Entrega em Tempo Real
              </span>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                GPS Conectado
              </span>
            </div>

            {/* Stylized SVG Map */}
            <div className="relative h-44 w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* Street Grid Patterns */}
                <defs>
                  <pattern id="street-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#street-grid)" />

                {/* Secondary Avenues */}
                <line x1="0" y1="50" x2="100%" y2="50" stroke="#334155" strokeWidth="6" opacity="0.4" />
                <line x1="0" y1="120" x2="100%" y2="120" stroke="#334155" strokeWidth="6" opacity="0.4" />
                <line x1="120" y1="0" x2="120" y2="100%" stroke="#334155" strokeWidth="6" opacity="0.4" />
                <line x1="380" y1="0" x2="380" y2="100%" stroke="#334155" strokeWidth="6" opacity="0.4" />

                {/* Primary Curving Delivery Route */}
                <path
                  d="M 60 120 Q 200 40 320 120 T 520 60"
                  fill="none"
                  stroke="#fb923c"
                  strokeWidth="5"
                  strokeDasharray="8 6"
                  className="animate-pulse"
                />
              </svg>

              {/* Start Pin: Restaurant */}
              <div className="absolute left-10 bottom-8 flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white">
                  <Store className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-amber-300 mt-1 bg-black/60 px-1.5 py-0.5 rounded-md">
                  Sabor & Cia
                </span>
              </div>

              {/* Destination Pin: Customer */}
              <div className="absolute right-10 top-6 flex flex-col items-center">
                <div className="relative">
                  <span className="absolute -inset-1 rounded-full bg-orange-500/40 animate-ping" />
                  <div className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white relative z-10">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-orange-200 mt-1 bg-black/60 px-1.5 py-0.5 rounded-md truncate max-w-[120px]">
                  Seu Endereço
                </span>
              </div>

              {/* Moving Motoboy Icon along bezier estimate */}
              <div
                className="absolute transition-all duration-1000 ease-out flex flex-col items-center"
                style={{
                  left: `calc(15% + ${bikePercent * 0.7}%)`,
                  top: `${bikePercent > 50 ? '35%' : '60%'}`,
                }}
              >
                <div className="w-8 h-8 rounded-full bg-white text-orange-600 flex items-center justify-center shadow-xl border-2 border-orange-500">
                  <Bike className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-extrabold text-white bg-orange-600 px-1.5 py-0.5 rounded-md mt-1 shadow-sm whitespace-nowrap">
                  {order.driverInfo?.name || 'Motoboy'}
                </span>
              </div>
            </div>

            {/* Driver Contact Card */}
            {order.driverInfo && (
              <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={order.driverInfo.photoUrl}
                    alt={order.driverInfo.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border-2 border-orange-400"
                  />
                  <div>
                    <h5 className="font-extrabold text-xs text-white">{order.driverInfo.name}</h5>
                    <p className="text-[11px] text-slate-300">{order.driverInfo.vehicle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {driverWhatsAppUrl && (
                    <a
                      id="driver-whatsapp-btn"
                      href={driverWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Conversar com o entregador pelo WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>
                  )}
                  <a
                    href={`tel:${order.driverInfo.phone}`}
                    className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Ligar
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Controle Operacional para Administradores da Loja */}
          {(currentUser?.role === 'admin' || currentUser?.role === 'superadmin') && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-amber-700" />
                  Controle Operacional de Etapas (Cozinha & Entrega)
                </span>
                <span className="text-[10px] text-amber-800 font-bold bg-amber-200/80 px-2 py-0.5 rounded-full">
                  Gerenciamento
                </span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Avance o pedido diretamente desta tela (Em Preparo → Saiu para Entrega → Entregue).
              </p>
              <button
                id="simulate-next-step-btn"
                onClick={() => simulateNextOrderStep(order.id)}
                disabled={order.status === 'entregue'}
                className="w-full py-2 px-3 bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 disabled:text-stone-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {order.status === 'recebido'
                  ? 'Avançar: Iniciar Preparo na Chapa'
                  : order.status === 'em_preparo'
                  ? 'Avançar: Despachar Motoboy para Entrega'
                  : order.status === 'saiu_para_entrega'
                  ? 'Avançar: Confirmar Entrega Realizada (Liberar Avaliação)'
                  : 'Pedido Já Concluído'}
              </button>
            </div>
          )}

          {/* Items Recap in this Order */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <h5 className="font-extrabold text-xs text-stone-900 uppercase tracking-wider">
              Itens do Pedido ({order.items.length})
            </h5>
            <div className="space-y-2 divide-y divide-stone-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex justify-between items-start text-xs">
                  <div>
                    <span className="font-extrabold text-stone-800">
                      {item.quantity}x {item.name}
                    </span>
                    {item.customizations?.map((c, i) => (
                      <p key={i} className="text-[11px] text-stone-500">
                        • {c.selectedOption}
                      </p>
                    ))}
                    {item.itemNotes && (
                      <p className="text-[10px] text-amber-700 italic">Obs: {item.itemNotes}</p>
                    )}
                  </div>
                  <span className="font-bold text-stone-900 shrink-0">
                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-200 pt-2.5 flex justify-between items-baseline text-xs">
              <span className="font-extrabold text-stone-900">Total Pago ({order.payment.method.toUpperCase()})</span>
              <span className="text-base font-black text-stone-950">
                R$ {order.total.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
