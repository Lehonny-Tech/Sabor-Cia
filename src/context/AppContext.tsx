import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  MenuItem,
  CartItem,
  Order,
  OrderStatus,
  Coupon,
  PushNotification,
  LoyaltyReward,
  CartCustomization,
  PaymentDetails,
  OrderReview,
  UserRole,
  Restaurant,
  RestaurantCategory,
  NeighborhoodDeliveryFee,
  PaymentMethodsConfig
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_MENU_ITEMS,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
  INITIAL_RESTAURANTS,
  DEFAULT_NEIGHBORHOOD_FEES
} from '../data/initialData';
import { playNotificationChime } from '../utils/audio';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  restaurants: Restaurant[];
  selectedRestaurantId: string; // 'all' or specific restaurant ID for customer browsing
  setSelectedRestaurantId: (id: string) => void;
  activeAdminRestaurantId: string; // For admin panel filtering/managing
  setActiveAdminRestaurantId: (id: string) => void;
  registerRestaurant: (
    restaurantData: Omit<Restaurant, 'id' | 'rating' | 'reviewCount' | 'isOpen' | 'createdAt'>,
    initialProducts?: { name: string; description: string; price: number; category: any; imageUrl: string; stock: number }[]
  ) => { success: boolean; restaurantId: string; message: string };
  updateRestaurant: (id: string, data: Partial<Restaurant>) => void;
  deleteRestaurant: (id: string) => void;
  toggleRestaurantOpen: (id: string) => void;
  menuItems: MenuItem[];
  cart: CartItem[];
  appliedCoupon: Coupon | null;
  deliveryType: 'delivery' | 'retirada';
  setDeliveryType: (type: 'delivery' | 'retirada') => void;
  deliveryAddress: string;
  setDeliveryAddress: (address: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  selectedNeighborhood: string;
  setSelectedNeighborhood: (neighborhood: string) => void;
  selectedNeighborhoodFee: number | null;
  setSelectedNeighborhoodFee: (fee: number | null) => void;
  orders: Order[];
  coupons: Coupon[];
  notifications: PushNotification[];
  activeTrackingOrderId: string | null;
  setActiveTrackingOrderId: (id: string | null) => void;
  reviewModalOrderId: string | null;
  setReviewModalOrderId: (id: string | null) => void;
  loyaltyModalOpen: boolean;
  setLoyaltyModalOpen: (open: boolean) => void;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  checkoutModalOpen: boolean;
  setCheckoutModalOpen: (open: boolean) => void;
  adminPanelOpen: boolean;
  setAdminPanelOpen: (open: boolean) => void;
  activeMainTab: 'menu' | 'orders' | 'register_restaurant';
  setActiveMainTab: (tab: 'menu' | 'orders' | 'register_restaurant') => void;
  navigateToSection: (section: 'menu' | 'orders' | 'register') => void;
  
  // Auth methods
  login: (email: string, pass: string) => { success: boolean; message: string };
  logout: () => void;
  register: (name: string, email: string, pass: string, phone: string, address: string) => { success: boolean; message: string };
  loginAsDemo: (role: UserRole) => void;
  updateUser: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  addNewUser: (userData: Omit<User, 'id'>) => void;
  
  // Cart methods
  addToCart: (item: MenuItem, quantity: number, customizations: CartCustomization[], notes?: string, openDrawer?: boolean) => void;
  updateCartQuantity: (cartItemId: string, newQty: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  restaurantLoyaltyDiscount: number;
  pointsToRedeem: number;
  setPointsToRedeem: (pts: number) => void;
  currentCartRestaurant: Restaurant;
  deliveryFee: number;
  cartTotal: number;
  
  // Neighborhood Delivery Fees methods
  addNeighborhoodFee: (restaurantId: string, feeData: Omit<NeighborhoodDeliveryFee, 'id'>) => void;
  updateNeighborhoodFee: (restaurantId: string, feeId: string, data: Partial<NeighborhoodDeliveryFee>) => void;
  deleteNeighborhoodFee: (restaurantId: string, feeId: string) => void;
  loadDefaultNeighborhoodFees: (restaurantId: string) => void;

  // Payment Methods Configuration
  updatePaymentConfig: (restaurantId: string, config: PaymentMethodsConfig) => void;
  
  // Coupon methods
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addNewCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount'>) => void;
  deleteCoupon: (couponId: string) => void;
  toggleCouponActive: (couponId: string) => void;
  
  // Loyalty methods
  redeemLoyaltyReward: (reward: LoyaltyReward) => { success: boolean; message: string };
  
  // Checkout & Order methods
  placeOrder: (payment: PaymentDetails) => Promise<{ success: boolean; orderId?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  simulateNextOrderStep: (orderId: string) => void;
  submitReview: (orderId: string, rating: number, tags: string[], comment: string) => void;
  deleteOrder: (orderId: string) => void;
  
  // Admin Inventory & Stock
  updateStock: (itemId: string, newStock: number) => void;
  updateItemPrice: (itemId: string, newPrice: number) => void;
  toggleItemAvailability: (itemId: string) => void;
  addNewMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  
  // Super Admin Master & Data Management
  resetToInitialData: () => void;
  
  // Notifications
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  requestNotificationPermission: () => Promise<void>;
  sendPushNotification: (title: string, message: string, type?: PushNotification['type'], orderId?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence with localStorage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lanchonete_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      } catch {}
    }
    return null; // Modo demonstração desativado: usuário começa deslogado e entra com e-mail e senha
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('lanchonete_users');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Garante que todos os usuários tenham sua senha oficial cadastrada preservada
          const merged = parsed.map(u => {
            const initialMatch = INITIAL_USERS.find(iu => iu.id === u.id || iu.email.toLowerCase() === u.email.toLowerCase());
            return {
              ...u,
              password: u.password || initialMatch?.password || '123456',
            };
          });
          // Ensure superadmin user exists
          if (!merged.some(u => u.role === 'superadmin')) {
            const superAdmin = INITIAL_USERS.find(u => u.role === 'superadmin');
            if (superAdmin) return [...merged, superAdmin];
          }
          return merged;
        }
      } catch {}
    }
    return INITIAL_USERS;
  });

  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const saved = localStorage.getItem('lanchonete_restaurants');
    if (saved) {
      try {
        const parsed: Restaurant[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure neighborhood fees & payment config exist on every restaurant
          return parsed.map(r => {
            const initialMatch = INITIAL_RESTAURANTS.find(ir => ir.id === r.id);
            return {
              ...r,
              neighborhoodFees: r.neighborhoodFees && r.neighborhoodFees.length > 0
                ? r.neighborhoodFees
                : (initialMatch?.neighborhoodFees || DEFAULT_NEIGHBORHOOD_FEES.slice(0, 6)),
              paymentConfig: r.paymentConfig || initialMatch?.paymentConfig || {
                pix: {
                  enabled: true,
                  keyType: 'cnpj',
                  keyValue: r.cnpj || '12.345.678/0001-90',
                  beneficiaryName: r.name,
                  instructions: 'Chave Pix Oficial da Loja',
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
                  instructions: 'Aceitamos dinheiro em espécie com troco.',
                },
              },
            };
          });
        }
      } catch {}
    }
    return INITIAL_RESTAURANTS;
  });

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('rest-sabor-cia');
  const [activeAdminRestaurantId, setActiveAdminRestaurantId] = useState<string>('rest-sabor-cia');

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('lanchonete_menu_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_MENU_ITEMS.length) {
          return parsed;
        }
      } catch {
        // Fallback to fresh INITIAL_MENU_ITEMS
      }
    }
    return INITIAL_MENU_ITEMS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('lanchonete_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('lanchonete_coupons');
    if (saved) {
      try {
        const parsed: Coupon[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 4) {
          return parsed;
        }
      } catch {}
    }
    return INITIAL_COUPONS;
  });

  const [notifications, setNotifications] = useState<PushNotification[]>(() => {
    const saved = localStorage.getItem('lanchonete_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'notif-welcome',
        title: 'Bem-vindo ao Sabor & Cia! 🍔',
        message: 'Ganhe R$ 12 de desconto no seu 1º pedido com o cupom PRIMEIRACOMPRA.',
        type: 'promo',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
      },
    ];
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'retirada'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || 'Rua das Palmeiras, 342 - Apto 41, Jardim América');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '(11) 98765-4321');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('Jardim América');
  const [selectedNeighborhoodFee, setSelectedNeighborhoodFee] = useState<number | null>(null);

  // Main page navigation tab
  const [activeMainTab, setActiveMainTab] = useState<'menu' | 'orders' | 'register_restaurant'>('menu');

  const navigateToSection = (section: 'menu' | 'orders' | 'register') => {
    if (section === 'register') {
      setActiveMainTab('register_restaurant');
    } else if (section === 'orders') {
      setActiveMainTab('orders');
    } else {
      setActiveMainTab('menu');
    }
  };

  // UI state
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [reviewModalOrderId, setReviewModalOrderId] = useState<string | null>(null);
  const [loyaltyModalOpen, setLoyaltyModalOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('lanchonete_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('lanchonete_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('lanchonete_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('lanchonete_restaurants', JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem('lanchonete_menu_v3', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('lanchonete_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('lanchonete_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('lanchonete_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Push Notification Dispatcher
  const sendPushNotification = (
    title: string,
    message: string,
    type: PushNotification['type'] = 'status_update',
    orderId?: string
  ) => {
    const newNotif: PushNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type,
      orderId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Audio chime
    if (type === 'status_update') {
      playNotificationChime('status_update');
    } else if (type === 'promo') {
      playNotificationChime('success');
    } else {
      playNotificationChime('alert');
    }

    // Native Web Push Notification (if permitted)
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
        });
      } catch {
        // Ignore iframe restrictions
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const result = await Notification.requestPermission();
        if (result === 'granted') {
          sendPushNotification('Notificações Ativadas! 🔔', 'Você receberá atualizações em tempo real sobre seus pedidos.');
        }
      } catch {
        // Handled silently
      }
    }
  };

  // Auth Handlers
  const login = (email: string, pass: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, message: 'Usuário não encontrado com este e-mail.' };
    }
    // Validação de senha cadastrada do usuário
    if (user.password && user.password !== pass) {
      return { success: false, message: 'Senha incorreta. Verifique sua senha e tente novamente.' };
    }
    if (!user.password && pass.length < 4) {
      return { success: false, message: 'A senha deve ter pelo menos 4 caracteres.' };
    }
    setCurrentUser(user);
    if (user.address) setDeliveryAddress(user.address);
    if (user.phone) setCustomerPhone(user.phone);
    setAuthModalOpen(false);
    sendPushNotification(`Olá, ${user.name}! 👋`, 'Login efetuado com sucesso.', 'promo');
    return { success: true, message: 'Login realizado com sucesso!' };
  };

  const logout = () => {
    setCurrentUser(null);
    setAdminPanelOpen(false);
    sendPushNotification('Sessão Encerrada', 'Você saiu da sua conta.');
  };

  const register = (name: string, email: string, pass: string, phone: string, address: string) => {
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Este e-mail já está cadastrado.' };
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      password: pass,
      role: 'customer',
      phone,
      address,
      loyaltyPoints: 50, // Welcome bonus!
      loyaltyTier: 'Bronze',
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setDeliveryAddress(address);
    setCustomerPhone(phone);
    setAuthModalOpen(false);
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch {}
    sendPushNotification('Bem-vindo ao Clube! 🎉', 'Você ganhou 50 pontos de fidelidade de boas-vindas!', 'promo');
    return { success: true, message: 'Conta criada com sucesso!' };
  };

  const loginAsDemo = (role: UserRole) => {
    const demoUser = users.find(u => u.role === role) || (
      role === 'superadmin' ? INITIAL_USERS[2] : (role === 'admin' ? INITIAL_USERS[1] : INITIAL_USERS[0])
    );
    setCurrentUser(demoUser);
    if (demoUser.address) setDeliveryAddress(demoUser.address);
    if (demoUser.phone) setCustomerPhone(demoUser.phone);
    setAuthModalOpen(false);
    if (role === 'admin' || role === 'superadmin') {
      setAdminPanelOpen(true);
    }
    sendPushNotification(
      `Conectado como ${role === 'superadmin' ? 'Super Administrador Geral (Master) 👑' : (role === 'admin' ? 'Administrador / Gerente' : 'Cliente')}`,
      `Você está navegando com o perfil de ${demoUser.name}.`,
      'status_update'
    );
  };

  // User Management (Super Admin & Self)
  const updateUser = (userId: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
    }
    sendPushNotification('Usuário Atualizado', 'Dados do usuário salvos com sucesso.');
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
    sendPushNotification('Usuário Removido 🗑️', 'O cadastro foi excluído do sistema.');
  };

  const addNewUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
    };
    setUsers(prev => [newUser, ...prev]);
    sendPushNotification('Novo Usuário Cadastrado 👤', `${newUser.name} foi adicionado à plataforma.`);
  };

  // Cart Handlers
  const addToCart = (item: MenuItem, quantity: number, customizations: CartCustomization[], notes?: string, openDrawer: boolean = true) => {
    const extraTotal = customizations.reduce((acc, c) => acc + c.extraPrice, 0);
    const unitPrice = item.price + extraTotal;
    const itemRestaurant = restaurants.find(r => r.id === item.restaurantId);

    setCart(prev => {
      // Check if identical item with same customizations exists
      const existingIndex = prev.findIndex(ci => 
        ci.menuItemId === item.id &&
        ci.itemNotes === (notes || '') &&
        JSON.stringify(ci.customizations) === JSON.stringify(customizations)
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      const newCartItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        menuItemId: item.id,
        restaurantId: item.restaurantId,
        restaurantName: itemRestaurant?.name || 'Sabor & Cia',
        name: item.name,
        price: unitPrice,
        quantity,
        imageUrl: item.imageUrl,
        customizations,
        itemNotes: notes,
      };
      return [...prev, newCartItem];
    });

    if (openDrawer) {
      setCartDrawerOpen(true);
    }
    playNotificationChime('status_update');
  };

  const updateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity: newQty } : item));
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setPointsToRedeem(0);
  };

  // Restaurant Management methods
  const registerRestaurant = (
    restaurantData: Omit<Restaurant, 'id' | 'rating' | 'reviewCount' | 'isOpen' | 'createdAt'>,
    initialProducts?: { name: string; description: string; price: number; category: any; imageUrl: string; stock: number }[]
  ) => {
    const newId = `rest-${Date.now()}`;
    const slug = restaurantData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newRestaurant: Restaurant = {
      ...restaurantData,
      id: newId,
      slug,
      rating: 5.0,
      reviewCount: 0,
      isOpen: true,
      neighborhoodFees: restaurantData.neighborhoodFees && restaurantData.neighborhoodFees.length > 0
        ? restaurantData.neighborhoodFees
        : DEFAULT_NEIGHBORHOOD_FEES.slice(0, 6),
      paymentConfig: restaurantData.paymentConfig || {
        pix: {
          enabled: true,
          keyType: 'cnpj',
          keyValue: restaurantData.cnpj || '12.345.678/0001-90',
          beneficiaryName: restaurantData.name,
          instructions: 'Pix oficial do estabelecimento',
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
          instructions: 'Dinheiro na entrega com troco.',
        },
      },
      createdAt: new Date().toISOString(),
    };

    setRestaurants(prev => [newRestaurant, ...prev]);

    if (initialProducts && initialProducts.length > 0) {
      const newItems: MenuItem[] = initialProducts.map((p, idx) => ({
        id: `item-${newId}-${idx + 1}`,
        restaurantId: newId,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        imageUrl: p.imageUrl,
        stock: p.stock || 25,
        isAvailable: true,
        popular: idx === 0,
      }));
      setMenuItems(prev => [...prev, ...newItems]);
    }

    // Set as active selected and admin restaurant
    setSelectedRestaurantId(newId);
    setActiveAdminRestaurantId(newId);

    try {
      confetti({ particleCount: 75, spread: 70 });
    } catch {}

    playNotificationChime('order_placed');
    sendPushNotification(
      'Novo Estabelecimento Cadastrado! 🏪',
      `"${newRestaurant.name}" foi cadastrado com sucesso e já está integrado à plataforma com painel completo de gestão!`,
      'promo'
    );

    return { success: true, restaurantId: newId, message: 'Restaurante cadastrado com sucesso!' };
  };

  const updateRestaurant = (id: string, data: Partial<Restaurant>) => {
    setRestaurants(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    sendPushNotification('Dados Atualizados', 'As configurações do estabelecimento foram salvas.');
  };

  // Super Admin: Delete restaurant & its menu items completely
  const deleteRestaurant = (id: string) => {
    const target = restaurants.find(r => r.id === id);
    setRestaurants(prev => prev.filter(r => r.id !== id));
    setMenuItems(prev => prev.filter(item => item.restaurantId !== id));
    setOrders(prev => prev.filter(order => order.restaurantId !== id));

    if (selectedRestaurantId === id) {
      const remaining = restaurants.filter(r => r.id !== id);
      if (remaining.length > 0) {
        setSelectedRestaurantId(remaining[0].id);
      }
    }
    if (activeAdminRestaurantId === id) {
      const remaining = restaurants.filter(r => r.id !== id);
      setActiveAdminRestaurantId(remaining.length > 0 ? remaining[0].id : 'all');
    }

    sendPushNotification(
      'Estabelecimento Excluído 🗑️',
      `O restaurante "${target?.name || id}" e todos os seus produtos foram removidos da plataforma pelo Administrador Geral.`
    );
  };

  const toggleRestaurantOpen = (id: string) => {
    setRestaurants(prev =>
      prev.map(r => {
        if (r.id === id) {
          const nextState = !r.isOpen;
          sendPushNotification(
            nextState ? 'Loja Aberta! 🟢' : 'Loja Fechada 🔴',
            `O estabelecimento "${r.name}" agora está ${nextState ? 'aberto para receber pedidos' : 'temporariamente fechado'}.`
          );
          return { ...r, isOpen: nextState };
        }
        return r;
      })
    );
  };

  // Neighborhood Delivery Fees Handlers for each restaurant
  const addNeighborhoodFee = (restaurantId: string, feeData: Omit<NeighborhoodDeliveryFee, 'id'>) => {
    const newFee: NeighborhoodDeliveryFee = {
      ...feeData,
      id: `nf-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    };

    setRestaurants(prev =>
      prev.map(r => {
        if (r.id === restaurantId) {
          const existingFees = r.neighborhoodFees || [];
          return { ...r, neighborhoodFees: [...existingFees, newFee] };
        }
        return r;
      })
    );

    sendPushNotification('Taxa de Bairro Cadastrada! 🛵', `Bairro "${newFee.neighborhood}" cadastrado com taxa de R$ ${newFee.fee.toFixed(2).replace('.', ',')}.`);
  };

  const updateNeighborhoodFee = (restaurantId: string, feeId: string, data: Partial<NeighborhoodDeliveryFee>) => {
    setRestaurants(prev =>
      prev.map(r => {
        if (r.id === restaurantId) {
          const updatedFees = (r.neighborhoodFees || []).map(f => f.id === feeId ? { ...f, ...data } : f);
          return { ...r, neighborhoodFees: updatedFees };
        }
        return r;
      })
    );
  };

  const deleteNeighborhoodFee = (restaurantId: string, feeId: string) => {
    setRestaurants(prev =>
      prev.map(r => {
        if (r.id === restaurantId) {
          const filtered = (r.neighborhoodFees || []).filter(f => f.id !== feeId);
          return { ...r, neighborhoodFees: filtered };
        }
        return r;
      })
    );
    sendPushNotification('Taxa Excluída', 'Bairro removido da tabela de entregas.');
  };

  const loadDefaultNeighborhoodFees = (restaurantId: string) => {
    setRestaurants(prev =>
      prev.map(r => {
        if (r.id === restaurantId) {
          return { ...r, neighborhoodFees: [...DEFAULT_NEIGHBORHOOD_FEES] };
        }
        return r;
      })
    );
    sendPushNotification('Bairros Carregados! 📍', '12 bairros populares da cidade foram vinculados com taxas à lanchonete.');
  };

  // Payment configuration handler for each restaurant
  const updatePaymentConfig = (restaurantId: string, config: PaymentMethodsConfig) => {
    setRestaurants(prev =>
      prev.map(r => {
        if (r.id === restaurantId) {
          return { ...r, paymentConfig: config };
        }
        return r;
      })
    );
    sendPushNotification('Formas de Pagamento Salvas! 💳', 'Configurações de Pix, Cartões e Dinheiro atualizadas.');
  };

  // Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  const currentCartRestaurant = restaurants.find(r => r.id === cart[0]?.restaurantId) ||
    restaurants.find(r => r.id === selectedRestaurantId) ||
    restaurants[0];

  // Look for matching neighborhood fee from restaurant's configured neighborhood rates
  const matchedNeighborhoodItem = currentCartRestaurant?.neighborhoodFees?.find(
    nf => nf.isActive && nf.neighborhood.toLowerCase().trim() === selectedNeighborhood.toLowerCase().trim()
  );

  const calculatedBaseDeliveryFee = selectedNeighborhoodFee !== null
    ? selectedNeighborhoodFee
    : (matchedNeighborhoodItem ? matchedNeighborhoodItem.fee : (currentCartRestaurant?.deliveryFee ?? 7.00));

  const deliveryFee = deliveryType === 'retirada' 
    ? 0 
    : (appliedCoupon?.freeDelivery ? 0 : (cartSubtotal > 90 ? 0 : calculatedBaseDeliveryFee));

  const activeRules = currentCartRestaurant?.loyaltyRules || {
    pointsPerReal: 1,
    pointsRedemptionRate: 10,
    minPointsToRedeem: 50,
    maxDiscountPercent: 50,
    isActive: true,
  };

  let restaurantLoyaltyDiscount = 0;
  if (activeRules.isActive && pointsToRedeem >= activeRules.minPointsToRedeem) {
    const rawDiscount = pointsToRedeem / activeRules.pointsRedemptionRate;
    const maxDiscountAllowed = (cartSubtotal * activeRules.maxDiscountPercent) / 100;
    restaurantLoyaltyDiscount = Math.min(rawDiscount, maxDiscountAllowed);
  }

  let cartDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      cartDiscount = (cartSubtotal * appliedCoupon.value) / 100;
    } else {
      cartDiscount = appliedCoupon.value;
    }
  }
  // Discount cannot exceed subtotal
  cartDiscount = Math.min(cartDiscount, cartSubtotal);

  const totalDiscount = Math.min(cartDiscount + restaurantLoyaltyDiscount, cartSubtotal);
  const cartTotal = Math.max(0, cartSubtotal - totalDiscount + deliveryFee);

  // Coupon Handlers
  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === cleanCode);

    if (!found) {
      return { success: false, message: 'Cupom inválido ou inexistente.' };
    }
    if (!found.isActive) {
      return { success: false, message: 'Este cupom não está mais ativo.' };
    }
    // Check store restriction
    const targetRestId = cart[0]?.restaurantId || selectedRestaurantId;
    if (found.restaurantId && found.restaurantId !== targetRestId) {
      const rest = restaurants.find(r => r.id === found.restaurantId);
      return {
        success: false,
        message: `Este cupom é exclusivo para pedidos no estabelecimento "${rest?.name || 'específico'}".`,
      };
    }
    if (cartSubtotal < found.minOrderValue) {
      return {
        success: false,
        message: `Este cupom exige pedido mínimo de R$ ${found.minOrderValue.toFixed(2).replace('.', ',')}.`,
      };
    }

    setAppliedCoupon(found);
    try {
      confetti({ particleCount: 30, spread: 50 });
    } catch {}
    playNotificationChime('success');
    return { success: true, message: `Cupom "${found.code}" aplicado com sucesso!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const addNewCoupon = (couponData: Omit<Coupon, 'id' | 'usageCount'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `c-${Date.now()}`,
      code: couponData.code.toUpperCase(),
      usageCount: 0,
    };
    setCoupons(prev => [newCoupon, ...prev]);
    sendPushNotification('Novo Cupom Criado! 🎟️', `Cupom ${newCoupon.code} disponível para clientes.`, 'promo');
  };

  const deleteCoupon = (couponId: string) => {
    setCoupons(prev => prev.filter(c => c.id !== couponId));
    if (appliedCoupon?.id === couponId) {
      setAppliedCoupon(null);
    }
    sendPushNotification('Cupom Removido', 'O cupom foi excluído da plataforma.');
  };

  const toggleCouponActive = (couponId: string) => {
    setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, isActive: !c.isActive } : c));
  };

  // Loyalty Rewards
  const redeemLoyaltyReward = (reward: LoyaltyReward) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return { success: false, message: 'Faça login para resgatar recompensas.' };
    }
    if (currentUser.loyaltyPoints < reward.pointsCost) {
      return {
        success: false,
        message: `Você precisa de ${reward.pointsCost} pontos. Saldo atual: ${currentUser.loyaltyPoints} pontos.`,
      };
    }

    // Deduct points
    const newPoints = currentUser.loyaltyPoints - reward.pointsCost;
    const updatedUser: User = {
      ...currentUser,
      loyaltyPoints: newPoints,
      loyaltyTier: newPoints >= 400 ? 'Ouro' : newPoints >= 150 ? 'Prata' : 'Bronze',
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

    // If discount reward, generate a special coupon
    if (reward.discountValue) {
      const specialCoupon: Coupon = {
        id: `c-fidelidade-${Date.now()}`,
        code: `FIDELIDADE${reward.discountValue}`,
        description: `Recompensa Fidelidade R$ ${reward.discountValue} OFF`,
        discountType: 'fixed',
        value: reward.discountValue,
        minOrderValue: reward.discountValue + 5,
        isActive: true,
        usageCount: 0,
      };
      setCoupons(prev => [specialCoupon, ...prev]);
      setAppliedCoupon(specialCoupon);
    } else if (reward.freeItemName) {
      // Find matching item in menu and add for free
      const freeItem = menuItems.find(i => i.name.toLowerCase().includes(reward.freeItemName!.toLowerCase()));
      if (freeItem) {
        setCart(prev => [
          ...prev,
          {
            id: `cart-reward-${Date.now()}`,
            menuItemId: freeItem.id,
            name: `[RECOMPENSA] ${freeItem.name}`,
            price: 0,
            quantity: 1,
            imageUrl: freeItem.imageUrl,
            customizations: [],
            itemNotes: 'Resgate de fidelidade grátis!',
          },
        ]);
      }
    }

    try {
      confetti({ particleCount: 70, spread: 70 });
    } catch {}
    playNotificationChime('success');
    sendPushNotification('Recompensa Resgatada! 🏆', `Você resgatou: ${reward.title}. Aproveite!`, 'promo');
    return { success: true, message: `Recompensa "${reward.title}" resgatada com sucesso!` };
  };

  // Place Order
  const placeOrder = async (payment: PaymentDetails): Promise<{ success: boolean; orderId?: string }> => {
    if (cart.length === 0) {
      return { success: false };
    }

    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `PED-${orderNum}`;

    // Reduce stock for ordered items
    setMenuItems(prev =>
      prev.map(item => {
        const inCart = cart.find(ci => ci.menuItemId === item.id);
        if (inCart) {
          const newStock = Math.max(0, item.stock - inCart.quantity);
          if (newStock <= 3) {
            sendPushNotification('Alerta de Estoque ⚠️', `O item "${item.name}" está com estoque baixo (${newStock} un).`, 'stock_alert');
          }
          return { ...item, stock: newStock, isAvailable: newStock > 0 };
        }
        return item;
      })
    );

    // Increase coupon usage
    if (appliedCoupon) {
      setCoupons(prev =>
        prev.map(c => c.id === appliedCoupon.id ? { ...c, usageCount: c.usageCount + 1 } : c)
      );
    }

    const targetRestId = cart[0]?.restaurantId || selectedRestaurantId || 'rest-sabor-cia';
    const targetRestaurant = restaurants.find(r => r.id === targetRestId) || restaurants[0];
    const pointsMultiplier = targetRestaurant.loyaltyRules?.pointsPerReal || 1;
    const pointsEarned = Math.floor(cartTotal * pointsMultiplier);

    const newOrder: Order = {
      id: orderId,
      restaurantId: targetRestaurant.id,
      restaurantName: targetRestaurant.name,
      userId: currentUser?.id || 'guest',
      customerName: currentUser?.name || 'Cliente Balcão',
      customerPhone: customerPhone || '(11) 99999-0000',
      deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : `Retirada no Balcão (${targetRestaurant.name})`,
      deliveryType,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: cartDiscount + restaurantLoyaltyDiscount,
      deliveryFee,
      total: cartTotal,
      couponCodeApplied: appliedCoupon?.code,
      loyaltyPointsEarned: pointsEarned,
      loyaltyPointsUsed: pointsToRedeem,
      loyaltyDiscountApplied: restaurantLoyaltyDiscount,
      payment,
      status: 'recebido',
      statusHistory: [
        {
          status: 'recebido',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: `Pedido recebido por ${targetRestaurant.name} e enviado para a cozinha.`,
        },
      ],
      driverInfo: {
        name: 'Rafael Mendes',
        vehicle: 'Yamaha Fazer 250 - Azul (Placa: BRA-9Z88)',
        phone: '(11) 98123-4567',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        latPercent: 5,
      },
      createdAt: new Date().toISOString(),
      estimatedDeliveryMinutes: deliveryType === 'delivery' ? (targetRestaurant.deliveryTimeMin || 35) : 20,
    };

    // Update user loyalty points (deduct redeemed points, add newly earned points)
    if (currentUser) {
      const updatedPoints = Math.max(0, currentUser.loyaltyPoints - pointsToRedeem) + pointsEarned;
      const updatedUser: User = {
        ...currentUser,
        loyaltyPoints: updatedPoints,
        loyaltyTier: updatedPoints >= 400 ? 'Ouro' : updatedPoints >= 150 ? 'Prata' : 'Bronze',
      };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    setPointsToRedeem(0);
    setCheckoutModalOpen(false);
    setActiveTrackingOrderId(orderId);

    try {
      confetti({ particleCount: 80, spread: 80 });
    } catch {}

    playNotificationChime('order_placed');
    sendPushNotification(
      `Pedido #${orderId} Confirmado! 🍔`,
      `Você acumulou +${pointsEarned} pontos no Clube Fidelidade. Acompanhe a entrega em tempo real!`,
      'status_update',
      orderId
    );

    return { success: true, orderId };
  };

  // Order Status Tracking & Transitions
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id !== orderId) return ord;

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let description = '';
        let latPercent = ord.driverInfo?.latPercent || 0;

        if (newStatus === 'em_preparo') {
          description = 'Cozinheiros na chapa preparando seu lanche com ingredientes frescos!';
          latPercent = 10;
        } else if (newStatus === 'saiu_para_entrega') {
          description = 'O motoboy retirou seu pedido na lanchonete e está a caminho do seu endereço!';
          latPercent = 50;
        } else if (newStatus === 'entregue') {
          description = 'Pedido entregue com sucesso! Bom apetite!';
          latPercent = 100;
        } else if (newStatus === 'cancelado') {
          description = 'Pedido cancelado.';
        }

        const updatedHistory = [
          ...ord.statusHistory,
          { status: newStatus, timestamp: timeStr, description },
        ];

        return {
          ...ord,
          status: newStatus,
          statusHistory: updatedHistory,
          driverInfo: ord.driverInfo ? { ...ord.driverInfo, latPercent } : undefined,
          estimatedDeliveryMinutes: newStatus === 'entregue' ? 0 : (newStatus === 'saiu_para_entrega' ? 10 : 25),
        };
      })
    );

    // Push notification trigger
    let notifTitle = `Pedido #${orderId}`;
    let notifMessage = '';
    if (newStatus === 'em_preparo') {
      notifTitle = `🔥 Pedido #${orderId} no fogo!`;
      notifMessage = 'Seus lanches estão sendo preparados com muito capricho na chapa.';
    } else if (newStatus === 'saiu_para_entrega') {
      notifTitle = `🛵 Pedido #${orderId} a caminho!`;
      notifMessage = 'O motoboy acabou de sair. Fique atento à campainha e acompanhe no mapa!';
    } else if (newStatus === 'entregue') {
      notifTitle = `🎉 Pedido #${orderId} Entregue!`;
      notifMessage = 'Seu pedido foi entregue. Conte-nos como foi avaliando o lanche!';
      // Prompt review modal if it's the current active order
      setTimeout(() => {
        setReviewModalOrderId(orderId);
      }, 1200);
    }

    if (notifMessage) {
      sendPushNotification(notifTitle, notifMessage, 'status_update', orderId);
    }
  };

  const simulateNextOrderStep = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (order.status === 'recebido') {
      updateOrderStatus(orderId, 'em_preparo');
    } else if (order.status === 'em_preparo') {
      updateOrderStatus(orderId, 'saiu_para_entrega');
    } else if (order.status === 'saiu_para_entrega') {
      updateOrderStatus(orderId, 'entregue');
    }
  };

  // Submit Review
  const submitReview = (orderId: string, rating: number, tags: string[], comment: string) => {
    const review: OrderReview = {
      id: `rev-${Date.now()}`,
      orderId,
      customerName: currentUser?.name || 'Cliente Sabor & Cia',
      rating,
      tags,
      comment,
      createdAt: new Date().toISOString(),
    };

    setOrders(prev =>
      prev.map(ord => ord.id === orderId ? { ...ord, review } : ord)
    );

    setReviewModalOrderId(null);
    try {
      confetti({ particleCount: 60, spread: 60 });
    } catch {}
    playNotificationChime('success');
    sendPushNotification('Obrigado pela Avaliação! ⭐', `Sua nota (${rating}/5) ajuda nossa lanchonete a melhorar sempre!`, 'promo');
  };

  // Delete Order (Super Admin & Order Cancellation)
  const deleteOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    if (activeTrackingOrderId === orderId) {
      setActiveTrackingOrderId(null);
    }
    sendPushNotification('Pedido Excluído 🗑️', `O pedido #${orderId} foi removido do sistema.`);
  };

  // Super Admin: Reset to Factory Initial Data
  const resetToInitialData = () => {
    localStorage.removeItem('lanchonete_restaurants');
    localStorage.removeItem('lanchonete_users');
    localStorage.removeItem('lanchonete_menu_v3');
    localStorage.removeItem('lanchonete_orders');
    localStorage.removeItem('lanchonete_coupons');
    localStorage.removeItem('lanchonete_notifications');

    setRestaurants(INITIAL_RESTAURANTS);
    setUsers(INITIAL_USERS);
    setMenuItems(INITIAL_MENU_ITEMS);
    setOrders(INITIAL_ORDERS);
    setCoupons(INITIAL_COUPONS);
    setCurrentUser(INITIAL_USERS[2]); // Set as Super Admin Master
    setSelectedRestaurantId(INITIAL_RESTAURANTS[0].id);
    setActiveAdminRestaurantId(INITIAL_RESTAURANTS[0].id);

    try {
      confetti({ particleCount: 100, spread: 80 });
    } catch {}

    sendPushNotification('Sistema Restaurado! 🔄', 'Todos os dados padrão foram recarregados com sucesso!', 'promo');
  };

  // Stock & Inventory Admin methods
  const updateStock = (itemId: string, newStock: number) => {
    setMenuItems(prev =>
      prev.map(i => i.id === itemId ? { ...i, stock: Math.max(0, newStock), isAvailable: newStock > 0 } : i)
    );
  };

  const updateItemPrice = (itemId: string, newPrice: number) => {
    setMenuItems(prev =>
      prev.map(i => i.id === itemId ? { ...i, price: Math.max(0.01, newPrice) } : i)
    );
  };

  const toggleItemAvailability = (itemId: string) => {
    setMenuItems(prev =>
      prev.map(i => i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i)
    );
  };

  const addNewMenuItem = (itemData: Omit<MenuItem, 'id'>) => {
    const targetRestId = itemData.restaurantId || (activeAdminRestaurantId !== 'all' ? activeAdminRestaurantId : 'rest-sabor-cia');
    const newItem: MenuItem = {
      ...itemData,
      restaurantId: targetRestId,
      id: `item-${Date.now()}`,
    };
    setMenuItems(prev => [newItem, ...prev]);
    sendPushNotification('Cardápio Atualizado! 🍔', `Novo produto adicionado: ${newItem.name}`);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        restaurants,
        selectedRestaurantId,
        setSelectedRestaurantId,
        activeAdminRestaurantId,
        setActiveAdminRestaurantId,
        registerRestaurant,
        updateRestaurant,
        deleteRestaurant,
        toggleRestaurantOpen,
        menuItems,
        cart,
        appliedCoupon,
        deliveryType,
        setDeliveryType,
        deliveryAddress,
        setDeliveryAddress,
        customerPhone,
        setCustomerPhone,
        selectedNeighborhood,
        setSelectedNeighborhood,
        selectedNeighborhoodFee,
        setSelectedNeighborhoodFee,
        orders,
        coupons,
        notifications,
        activeTrackingOrderId,
        setActiveTrackingOrderId,
        reviewModalOrderId,
        setReviewModalOrderId,
        loyaltyModalOpen,
        setLoyaltyModalOpen,
        cartDrawerOpen,
        setCartDrawerOpen,
        authModalOpen,
        setAuthModalOpen,
        checkoutModalOpen,
        setCheckoutModalOpen,
        adminPanelOpen,
        setAdminPanelOpen,
        activeMainTab,
        setActiveMainTab,
        navigateToSection,
        login,
        logout,
        register,
        loginAsDemo,
        updateUser,
        deleteUser,
        addNewUser,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartDiscount,
        restaurantLoyaltyDiscount,
        pointsToRedeem,
        setPointsToRedeem,
        currentCartRestaurant,
        deliveryFee,
        cartTotal,
        addNeighborhoodFee,
        updateNeighborhoodFee,
        deleteNeighborhoodFee,
        loadDefaultNeighborhoodFees,
        updatePaymentConfig,
        applyCoupon,
        removeCoupon,
        addNewCoupon,
        deleteCoupon,
        toggleCouponActive,
        redeemLoyaltyReward,
        placeOrder,
        updateOrderStatus,
        simulateNextOrderStep,
        submitReview,
        deleteOrder,
        updateStock,
        updateItemPrice,
        toggleItemAvailability,
        addNewMenuItem,
        resetToInitialData,
        markNotificationAsRead,
        clearAllNotifications,
        requestNotificationPermission,
        sendPushNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
