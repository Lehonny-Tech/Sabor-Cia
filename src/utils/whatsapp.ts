import { Order, Restaurant } from '../types';

/**
 * Normalizes phone numbers to WhatsApp international format (defaults to Brazil +55)
 */
export function cleanPhoneNumber(phone?: string): string {
  if (!phone) return '5511987654321';
  const numeric = phone.replace(/\D/g, '');
  if (numeric.startsWith('55') && numeric.length >= 12) {
    return numeric;
  }
  if (numeric.length === 10 || numeric.length === 11) {
    return `55${numeric}`;
  }
  return numeric || '5511987654321';
}

function getStatusLabel(status: Order['status']): string {
  switch (status) {
    case 'recebido':
      return 'Recebido na Cozinha 📋';
    case 'em_preparo':
      return 'Na Chapa / Em Preparo 🔥';
    case 'saiu_para_entrega':
      return 'Saiu para Entrega com Motoboy 🛵';
    case 'entregue':
      return 'Entregue com Sucesso! ⭐';
    case 'cancelado':
      return 'Cancelado ❌';
    default:
      return status;
  }
}

/**
 * Generates WhatsApp URL for customer to track or ask questions about order
 */
export function generateCustomerTrackingWhatsAppUrl(order: Order, restaurant?: Restaurant | null): string {
  const storePhone = cleanPhoneNumber(restaurant?.phone || '11987654321');
  const storeName = restaurant?.name || order.restaurantName || 'Sabor & Cia';
  const statusLabel = getStatusLabel(order.status);
  const itemsSummary = order.items.map(i => `• ${i.quantity}x ${i.name}`).join('\n');

  const text = `*ACOMPANHAMENTO DE PEDIDO - ${storeName.toUpperCase()}*\n\n` +
    `Olá! Gostaria de acompanhar meu pedido:\n\n` +
    `📌 *Número do Pedido:* #${order.id}\n` +
    `⏱️ *Status Atual:* ${statusLabel}\n` +
    `👤 *Cliente:* ${order.customerName}\n` +
    `📍 *Endereço:* ${order.deliveryAddress}\n` +
    `💰 *Total:* R$ ${order.total.toFixed(2).replace('.', ',')} (${order.payment.method.toUpperCase()})\n\n` +
    `🛒 *Itens:*\n${itemsSummary}\n\n` +
    (order.driverInfo ? `🛵 *Entregador:* ${order.driverInfo.name} (${order.driverInfo.vehicle})\n` : '') +
    (order.estimatedDeliveryMinutes > 0 ? `⏳ *Previsão:* ~${order.estimatedDeliveryMinutes} minutos\n\n` : '\n') +
    `Por favor, me informe se houver qualquer atualização. Muito obrigado!`;

  return `https://wa.me/${storePhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generates WhatsApp URL for the restaurant to send order tracking updates directly to the customer
 */
export function generateAdminUpdateWhatsAppUrl(order: Order, restaurant?: Restaurant | null): string {
  const customerPhone = cleanPhoneNumber(order.customerPhone);
  const storeName = restaurant?.name || order.restaurantName || 'Sabor & Cia';
  const statusLabel = getStatusLabel(order.status);

  let extraNote = '';
  if (order.status === 'recebido') {
    extraNote = 'Seu pedido foi confirmado pelo caixa e já foi enviado para a cozinha!';
  } else if (order.status === 'em_preparo') {
    extraNote = 'Seus lanches já estão na chapa sendo preparados com todo capricho!';
  } else if (order.status === 'saiu_para_entrega') {
    extraNote = `O motoboy ${order.driverInfo?.name || 'da equipe'} acabou de sair com sua entrega na bag térmica! Fique atento(a) à campainha.`;
  } else if (order.status === 'entregue') {
    extraNote = 'Seu pedido foi entregue! Esperamos que aproveite sua refeição. Não se esqueça de avaliar no aplicativo!';
  }

  const text = `🍔 *${storeName.toUpperCase()} - ATUALIZAÇÃO DO SEU PEDIDO*\n\n` +
    `Olá, *${order.customerName}*!\n\n` +
    `Temos novidades sobre o seu pedido *#${order.id}*:\n` +
    `📌 *Status:* ${statusLabel}\n` +
    `💬 ${extraNote}\n\n` +
    (order.driverInfo && order.status === 'saiu_para_entrega'
      ? `🛵 *Entregador:* ${order.driverInfo.name} - ${order.driverInfo.vehicle}\n`
      : '') +
    `📍 *Endereço de entrega:* ${order.deliveryAddress}\n` +
    `💰 *Total:* R$ ${order.total.toFixed(2).replace('.', ',')} (${order.payment.method.toUpperCase()})\n\n` +
    `Agradecemos pela preferência! Se precisar de algo, responda a esta mensagem.`;

  return `https://wa.me/${customerPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generates WhatsApp URL for customer to speak directly to the delivery driver
 */
export function generateDriverWhatsAppUrl(order: Order): string | null {
  if (!order.driverInfo?.phone) return null;
  const driverPhone = cleanPhoneNumber(order.driverInfo.phone);

  const text = `🛵 *ENTREGA DO PEDIDO #${order.id}*\n\n` +
    `Olá, ${order.driverInfo.name}! Sou o(a) ${order.customerName}, cliente do pedido #${order.id}.\n` +
    `Endereço de entrega: ${order.deliveryAddress}.\n\n` +
    `Qualquer ponto de referência ou dúvida sobre interfone, pode me avisar por aqui!`;

  return `https://wa.me/${driverPhone}?text=${encodeURIComponent(text)}`;
}
