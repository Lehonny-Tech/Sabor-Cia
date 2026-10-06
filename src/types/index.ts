export type UserRole = 'customer' | 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  loyaltyPoints: number;
  loyaltyTier: 'Bronze' | 'Prata' | 'Ouro';
  managedRestaurantId?: string; // ID do restaurante que gerencia (se for admin)
  password?: string; // Senha de acesso do usuário
}

export type RestaurantCategory =
  | 'hamburgueria'
  | 'lanchonete'
  | 'pizzaria'
  | 'hotdogs'
  | 'pastelaria'
  | 'sobremesas'
  | 'bebidas'
  | 'combos';

export interface RestaurantLoyaltyRule {
  pointsPerReal: number; // Quantos pontos de fidelidade o cliente ganha a cada R$ 1 gasto neste restaurante (ex: 1 pt)
  pointsRedemptionRate: number; // Quantos pontos são necessários para R$ 1,00 de desconto (ex: 10 pontos = R$ 1,00)
  minPointsToRedeem: number; // Saldo mínimo de pontos para poder resgatar desconto (ex: 50 pontos)
  maxDiscountPercent: number; // Percentual máximo do valor dos itens que pode ser pago com pontos (ex: 50%)
  isActive: boolean;
  programName?: string; // Nome do programa deste estabelecimento (ex: "Clube Fidelidade Sabor & Cia")
  specialPerk?: string; // Benefício ou mimo do estabelecimento
}

export interface NeighborhoodDeliveryFee {
  id: string;
  neighborhood: string; // Nome do bairro (ex: "Centro", "Jardim Paulista", "Bela Vista")
  fee: number; // Taxa em R$
  estimatedMinutes?: number; // Tempo de entrega estimado para o bairro (ex: 35)
  isActive: boolean;
}

export interface PaymentMethodsConfig {
  pix: {
    enabled: boolean;
    keyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
    keyValue: string;
    beneficiaryName: string;
    instructions?: string;
  };
  creditCard: {
    enabled: boolean;
    acceptedBrands: string[]; // ['Visa', 'Mastercard', 'Elo', 'Hipercard', 'American Express']
    payOnDelivery: boolean; // Maquininha na entrega
    onlinePayment: boolean; // Pagamento online no app
  };
  debitCard: {
    enabled: boolean;
    acceptedBrands: string[]; // ['Visa Electron', 'Maestro', 'Elo Débito']
    payOnDelivery: boolean;
  };
  cash: {
    enabled: boolean;
    allowChange: boolean; // Opção de solicitar troco
    instructions?: string;
  };
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryType: RestaurantCategory;
  description: string;
  tagline?: string;
  slogan?: string;
  logoUrl: string;
  bannerUrl: string;
  coverUrl?: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string; // ex: "30-45 min"
  deliveryTimeMin?: number;
  deliveryTimeMax?: number;
  deliveryFee: number; // Taxa padrão caso o bairro não tenha taxa específica
  minOrder: number;
  phone: string;
  address: string;
  openingHours: string;
  cnpj?: string;
  managerName?: string;
  managerEmail?: string;
  isOpen: boolean;
  featured?: boolean;
  loyaltyRules?: RestaurantLoyaltyRule; // Regras de fidelidade personalizadas do estabelecimento
  neighborhoodFees?: NeighborhoodDeliveryFee[]; // Taxas individuais por bairro cadastradas pela lanchonete
  paymentConfig?: PaymentMethodsConfig; // Configuração detalhada de pagamentos aceitos pela lanchonete
  createdAt: string;
}

export type Category = 'burgers' | 'hotdogs' | 'porcoes' | 'bebidas' | 'sucos' | 'sobremesas' | 'combos' | 'pizzas' | 'pasteis';

export interface MenuItem {
  id: string;
  restaurantId: string; // Vínculo com a lanchonete/restaurante
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  stock: number;
  isAvailable: boolean;
  popular?: boolean;
  customizations?: {
    name: string;
    options: { label: string; extraPrice: number }[];
  }[];
}

export interface CartCustomization {
  groupName: string;
  selectedOption: string;
  extraPrice: number;
}

export interface CartItem {
  id: string; // unique cart item id
  menuItemId: string;
  restaurantId?: string;
  restaurantName?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  customizations: CartCustomization[];
  itemNotes?: string;
}

export type OrderStatus = 'recebido' | 'em_preparo' | 'saiu_para_entrega' | 'entregue' | 'cancelado';

export type PaymentMethodType = 'pix' | 'credit_card' | 'debit_card' | 'cash';

export interface PaymentDetails {
  method: PaymentMethodType;
  status: 'pendente' | 'aprovado' | 'pago_na_entrega';
  pixCode?: string;
  pixQrUrl?: string;
  changeFor?: number; // Para dinheiro
  cardLastDigits?: string;
  cardBrand?: string;
  installments?: number;
  paymentDeliveryOption?: 'card_machine' | 'cash'; // Maquininha ou dinheiro na entrega
  paidAt?: string;
}

export interface OrderReview {
  id: string;
  orderId: string;
  restaurantId?: string;
  customerName: string;
  rating: number; // 1 to 5
  tags: string[];
  comment: string;
  createdAt: string;
}

export interface Order {
  id: string;
  restaurantId: string; // ID da lanchonete/restaurante do pedido
  restaurantName: string; // Nome da lanchonete
  userId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryType: 'delivery' | 'retirada';
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponCodeApplied?: string;
  loyaltyPointsEarned: number;
  loyaltyPointsUsed?: number;
  loyaltyDiscountApplied?: number; // Valor em R$ do desconto de fidelidade atribuído às regras da loja
  payment: PaymentDetails;
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    description: string;
  }[];
  driverInfo?: {
    name: string;
    vehicle: string;
    phone: string;
    photoUrl: string;
    latPercent: number; // 0 (restaurante) a 100 (casa)
  };
  review?: OrderReview;
  createdAt: string;
  estimatedDeliveryMinutes: number;
}

export interface Coupon {
  id: string;
  restaurantId?: string; // Se omitido, válido para todas ou específico
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  value: number; // ex: 15% ou R$ 15
  minOrderValue: number;
  isActive: boolean;
  usageCount: number;
  freeDelivery?: boolean;
  targetType?: 'all' | 'new_users' | 'restaurant';
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  orderId?: string;
  type: 'status_update' | 'promo' | 'stock_alert' | 'review_request';
  timestamp: string;
  read: boolean;
}

export interface LoyaltyReward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  discountValue?: number;
  freeItemName?: string;
}
