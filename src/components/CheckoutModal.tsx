import React, { useState } from 'react';
import {
  X,
  QrCode,
  CreditCard,
  Banknote,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Clock,
  Bike,
  Award,
  Store,
  HelpCircle,
  AlertCircle,
  MapPin,
  Search,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentMethodType, PaymentDetails } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    checkoutModalOpen,
    setCheckoutModalOpen,
    setCartDrawerOpen,
    setAuthModalOpen,
    cartTotal,
    cartSubtotal,
    cartDiscount,
    restaurantLoyaltyDiscount,
    pointsToRedeem,
    setPointsToRedeem,
    currentCartRestaurant,
    deliveryFee,
    deliveryAddress,
    setDeliveryAddress,
    deliveryType,
    customerPhone,
    setCustomerPhone,
    currentUser,
    placeOrder,
    coupons,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    selectedNeighborhood,
    setSelectedNeighborhood,
    selectedNeighborhoodFee,
    setSelectedNeighborhoodFee,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('pix');
  const [copiedPix, setCopiedPix] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Neighborhood search & auto-complete
  const [bairroSearch, setBairroSearch] = useState(selectedNeighborhood || '');
  const [showBairroDropdown, setShowBairroDropdown] = useState(false);
  const [addressDetails, setAddressDetails] = useState('');

  // Coupon state in checkout
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Card details
  const [cardBrand, setCardBrand] = useState<'visa' | 'mastercard' | 'elo' | 'hipercard'>('visa');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8910');
  const [cardHolder, setCardHolder] = useState(currentUser?.name || 'LUCAS FERREIRA');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('382');
  const [installments, setInstallments] = useState('1');

  // Debit card option
  const [debitCardBrand, setDebitCardBrand] = useState<string>('visa_debito');

  // Delivery payment details
  const [deliveryPayType, setDeliveryPayType] = useState<'card_machine' | 'cash'>('cash');
  const [needChange, setNeedChange] = useState(true);
  const [changeFor, setChangeFor] = useState<string>('100');

  // Loyalty toggle
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);

  if (!checkoutModalOpen) return null;

  // Restaurant payment configuration
  const paymentConfig = currentCartRestaurant?.paymentConfig || {
    pix: {
      enabled: true,
      keyType: 'cnpj' as const,
      keyValue: currentCartRestaurant?.cnpj || '12.345.678/0001-90',
      beneficiaryName: currentCartRestaurant?.name || 'Lanchonete',
      instructions: 'Pagamento Pix instantâneo',
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
      instructions: 'Aceitamos dinheiro com troco.',
    },
  };

  // Neighborhood search matches
  const restaurantNeighborhoods = currentCartRestaurant?.neighborhoodFees || [];
  const matchingNeighborhoods = restaurantNeighborhoods.filter(
    n => n.isActive && n.neighborhood.toLowerCase().includes(bairroSearch.toLowerCase())
  );

  const handleSelectNeighborhood = (neighborhoodName: string, fee: number) => {
    setSelectedNeighborhood(neighborhoodName);
    setSelectedNeighborhoodFee(fee);
    setBairroSearch(neighborhoodName);
    setShowBairroDropdown(false);
    
    // Update delivery address to include chosen neighborhood
    if (addressDetails) {
      setDeliveryAddress(`${addressDetails}, Bairro: ${neighborhoodName}`);
    } else {
      setDeliveryAddress(`Bairro: ${neighborhoodName}`);
    }
  };

  const loyaltyRules = currentCartRestaurant?.loyaltyRules || {
    pointsPerReal: 1,
    pointsRedemptionRate: 10,
    minPointsToRedeem: 50,
    maxDiscountPercent: 50,
    isActive: true,
  };

  const userPoints = currentUser?.loyaltyPoints || 0;
  const maxDiscountValue = (cartSubtotal * loyaltyRules.maxDiscountPercent) / 100;
  const maxPointsUsable = Math.min(userPoints, Math.floor(maxDiscountValue * loyaltyRules.pointsRedemptionRate));
  const canRedeem = loyaltyRules.isActive && userPoints >= loyaltyRules.minPointsToRedeem;

  const handleToggleLoyalty = (enable: boolean) => {
    setUseLoyaltyPoints(enable);
    if (!enable) {
      setPointsToRedeem(0);
    } else {
      const initialRedeem = Math.min(userPoints, Math.max(loyaltyRules.minPointsToRedeem, maxPointsUsable));
      setPointsToRedeem(initialRedeem);
    }
  };

  const simulatedPixCode = `00020126580014br.gov.bcb.pix0136${paymentConfig.pix.keyValue}-${Math.random().toString(36).substring(2, 7)}520400005303986540${cartTotal.toFixed(2)}5802BR5913${encodeURIComponent(paymentConfig.pix.beneficiaryName.slice(0, 15))}6009SaoPaulo62070503***6304`;

  const handleCopyPix = () => {
    navigator.clipboard?.writeText(simulatedPixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleApplyCheckoutCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponCodeInput).trim();
    if (!code) {
      setCouponMessage({ text: 'Informe o código do cupom.', isError: true });
      return;
    }
    const res = applyCoupon(code);
    if (res.success) {
      setCouponMessage({ text: res.message, isError: false });
      setCouponCodeInput('');
    } else {
      setCouponMessage({ text: res.message, isError: true });
    }
  };

  const handleCompleteOrder = async () => {
    setIsProcessing(true);

    let paymentDetails: PaymentDetails;

    if (paymentMethod === 'pix') {
      paymentDetails = {
        method: 'pix',
        status: 'aprovado',
        pixCode: simulatedPixCode,
        paidAt: new Date().toISOString(),
      };
    } else if (paymentMethod === 'credit_card') {
      paymentDetails = {
        method: 'credit_card',
        status: 'aprovado',
        cardBrand,
        cardLastDigits: cardNumber.replace(/\D/g, '').slice(-4) || '8910',
        installments: parseInt(installments, 10) || 1,
        paidAt: new Date().toISOString(),
      };
    } else if (paymentMethod === 'debit_card') {
      paymentDetails = {
        method: 'debit_card',
        status: 'pago_na_entrega',
        cardBrand: debitCardBrand,
        paymentDeliveryOption: 'card_machine',
      };
    } else {
      const parsedChange = needChange ? (parseFloat(changeFor) || cartTotal) : undefined;
      paymentDetails = {
        method: 'cash',
        status: 'pago_na_entrega',
        paymentDeliveryOption: deliveryPayType,
        changeFor: deliveryPayType === 'cash' && parsedChange && parsedChange > cartTotal ? parsedChange : undefined,
      };
    }

    // Delay to simulate secure gateway
    setTimeout(async () => {
      await placeOrder(paymentDetails);
      setIsProcessing(false);
    }, 600);
  };

  const calculatedChange = needChange ? Math.max(0, (parseFloat(changeFor) || 0) - cartTotal) : 0;
  const estimatedPointsToEarn = Math.floor(cartTotal * (loyaltyRules.pointsPerReal || 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        id="checkout-modal-card"
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-200 my-8"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              id="back-to-cart-btn"
              onClick={() => {
                setCheckoutModalOpen(false);
                setCartDrawerOpen(true);
              }}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold">Finalizar Pedido</h3>
                {currentCartRestaurant && (
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-semibold truncate max-w-[140px]">
                    {currentCartRestaurant.name}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-amber-100">
                Pagamento seguro e acompanhamento em tempo real
              </p>
            </div>
          </div>

          <button
            id="close-checkout-modal-btn"
            onClick={() => setCheckoutModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Destination Recap & Neighborhood Selection */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 text-xs">
            <div className="flex justify-between items-center text-stone-500 font-semibold">
              <span className="flex items-center gap-1.5 font-bold text-stone-800">
                <Bike className="w-4 h-4 text-orange-600" />
                {deliveryType === 'delivery' ? 'Entrega em Domicílio' : 'Retirada no Balcão'}
              </span>
              <span className="flex items-center gap-1 text-stone-700 font-medium">
                <Clock className="w-3.5 h-3.5 text-stone-500" /> {currentCartRestaurant?.deliveryTimeMin || 30}-{currentCartRestaurant?.deliveryTimeMax || 45} min
              </span>
            </div>

            {deliveryType === 'delivery' && (
              <div className="space-y-2 pt-1 border-t border-stone-200/80">
                <label className="block text-[11px] font-extrabold text-stone-800 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-600" />
                    Bairro de Entrega (Taxa Individual)
                  </span>
                  <span className="text-[10px] text-orange-600 lowercase font-normal">
                    busca automática por escrita
                  </span>
                </label>

                {/* Autocomplete Input */}
                <div className="relative">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 pointer-events-none" />
                    <input
                      id="checkout-neighborhood-input"
                      type="text"
                      value={bairroSearch}
                      onChange={e => {
                        setBairroSearch(e.target.value);
                        setShowBairroDropdown(true);
                        // Check exact match
                        const match = restaurantNeighborhoods.find(
                          n => n.isActive && n.neighborhood.toLowerCase().trim() === e.target.value.toLowerCase().trim()
                        );
                        if (match) {
                          setSelectedNeighborhood(match.neighborhood);
                          setSelectedNeighborhoodFee(match.fee);
                        }
                      }}
                      onFocus={() => setShowBairroDropdown(true)}
                      placeholder="Digite seu bairro para calcular a taxa (ex: Centro, Vila Mariana, Jardim...)"
                      className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-stone-300 bg-white font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {bairroSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setBairroSearch('');
                          setShowBairroDropdown(true);
                        }}
                        className="absolute right-2.5 p-0.5 rounded-full hover:bg-stone-100 text-stone-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Results Dropdown */}
                  {showBairroDropdown && matchingNeighborhoods.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white rounded-xl border border-stone-200 shadow-xl divide-y divide-stone-100">
                      {matchingNeighborhoods.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectNeighborhood(item.neighborhood, item.fee)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-orange-50 flex items-center justify-between transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 group-hover:text-orange-600" />
                            <span className="font-bold text-stone-800 group-hover:text-orange-950">
                              {item.neighborhood}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.estimatedMinutes && (
                              <span className="text-[10px] text-stone-400">
                                ~{item.estimatedMinutes} min
                              </span>
                            )}
                            <span className="text-xs font-black text-orange-600 bg-orange-100/70 px-2 py-0.5 rounded-md">
                              R$ {item.fee.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Popular Neighborhood Quick Pills */}
                {restaurantNeighborhoods.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-stone-500 self-center">Bairros atendidos:</span>
                    {restaurantNeighborhoods.slice(0, 5).map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectNeighborhood(item.neighborhood, item.fee)}
                        className={`text-[10px] px-2 py-1 rounded-lg border font-bold transition-all ${
                          selectedNeighborhood.toLowerCase() === item.neighborhood.toLowerCase()
                            ? 'border-orange-500 bg-orange-500 text-white shadow-xs'
                            : 'border-stone-200 bg-white text-stone-700 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        {item.neighborhood} • R$ {item.fee.toFixed(2).replace('.', ',')}
                      </button>
                    ))}
                  </div>
                )}

                {/* Active Fee Feedback */}
                <div className="p-2.5 bg-orange-50/80 rounded-xl border border-orange-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-stone-700">
                      Bairro Selecionado: <strong>{selectedNeighborhood}</strong>
                    </span>
                  </div>
                  <span className="text-xs font-black text-orange-700 bg-white px-2 py-0.5 rounded-md border border-orange-200">
                    Taxa: {deliveryFee === 0 ? 'Grátis' : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`}
                  </span>
                </div>

                {/* Street / Complement Address Input */}
                <div className="pt-1">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Rua, Número e Complemento
                  </label>
                  <input
                    type="text"
                    value={addressDetails}
                    onChange={e => {
                      setAddressDetails(e.target.value);
                      setDeliveryAddress(e.target.value ? `${e.target.value}, Bairro: ${selectedNeighborhood}` : `Bairro: ${selectedNeighborhood}`);
                    }}
                    placeholder="Ex: Rua das Flores, 120 - Bloco B, Apto 32"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}

            <div className="pt-1">
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                WhatsApp / Telefone para aviso de entrega
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full text-xs p-2 rounded-xl border border-stone-300 bg-white"
              />
            </div>
          </div>

          {/* ÁREA DE CUPOM DE DESCONTO */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50/70 rounded-2xl border border-amber-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-orange-600" />
                Cupom de Desconto
              </span>
              <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
                Previamente informado ou Novos Usuários
              </span>
            </div>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-xs text-emerald-950">{appliedCoupon.code}</p>
                      <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded">
                        {appliedCoupon.freeDelivery ? 'Frete Grátis' : `-R$ ${cartDiscount.toFixed(2).replace('.', ',')}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700">{appliedCoupon.description}</p>
                  </div>
                </div>
                <button
                  id="checkout-remove-coupon-btn"
                  type="button"
                  onClick={removeCoupon}
                  className="px-2.5 py-1 text-xs font-bold text-red-600 hover:text-red-800 bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                >
                  Remover
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    id="checkout-coupon-code-input"
                    type="text"
                    value={couponCodeInput}
                    onChange={e => {
                      setCouponCodeInput(e.target.value.toUpperCase());
                      setCouponMessage(null);
                    }}
                    placeholder="Digite seu cupom (Ex: PRIMEIRACOMPRA)"
                    className="flex-1 text-xs p-2.5 uppercase font-bold rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    id="checkout-apply-coupon-btn"
                    type="button"
                    onClick={() => handleApplyCheckoutCoupon()}
                    className="px-4 py-2.5 bg-stone-900 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-colors shadow-xs shrink-0 cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>

                {couponMessage && (
                  <p className={`text-[11px] font-semibold ${couponMessage.isError ? 'text-red-600' : 'text-emerald-600'}`}>
                    {couponMessage.text}
                  </p>
                )}

                {/* Suggestions Pills */}
                <div className="pt-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-stone-500">🎉 Novos Usuários:</span>
                    <button
                      type="button"
                      onClick={() => handleApplyCheckoutCoupon('PRIMEIRACOMPRA')}
                      className="text-[10px] bg-white hover:bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md font-bold border border-orange-200 transition-colors"
                    >
                      PRIMEIRACOMPRA (R$ 12 OFF)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCheckoutCoupon('BEMVINDO15')}
                      className="text-[10px] bg-white hover:bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md font-bold border border-orange-200 transition-colors"
                    >
                      BEMVINDO15 (15% OFF)
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-stone-500">🏪 Promoções Ativas:</span>
                    <button
                      type="button"
                      onClick={() => handleApplyCheckoutCoupon('FRETEGRATIS')}
                      className="text-[10px] bg-white hover:bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold border border-emerald-200 transition-colors"
                    >
                      FRETEGRATIS
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCheckoutCoupon('LANCHE15')}
                      className="text-[10px] bg-white hover:bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold border border-amber-200 transition-colors"
                    >
                      LANCHE15 (15%)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2.5">
              Escolha a Forma de Pagamento
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentConfig.pix.enabled && (
                <button
                  id="select-payment-pix-btn"
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                    paymentMethod === 'pix'
                      ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 shadow-xs ring-1 ring-emerald-500/20'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${paymentMethod === 'pix' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-black">Pix</p>
                    <span className="text-[10px] text-emerald-600 font-bold">Instantâneo</span>
                  </div>
                </button>
              )}

              {paymentConfig.creditCard.enabled && (
                <button
                  id="select-payment-card-btn"
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                    paymentMethod === 'credit_card'
                      ? 'border-orange-500 bg-orange-50/60 text-orange-950 shadow-xs ring-1 ring-orange-500/20'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${paymentMethod === 'credit_card' ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-black">Cartão de Crédito</p>
                    <span className="text-[10px] text-stone-500">Até 3x sem juros</span>
                  </div>
                </button>
              )}

              {paymentConfig.debitCard.enabled && (
                <button
                  id="select-payment-debit-btn"
                  type="button"
                  onClick={() => setPaymentMethod('debit_card')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                    paymentMethod === 'debit_card'
                      ? 'border-orange-500 bg-orange-50/60 text-orange-950 shadow-xs ring-1 ring-orange-500/20'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${paymentMethod === 'debit_card' ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-black">Cartão de Débito</p>
                    <span className="text-[10px] text-stone-500">Maquininha na entrega</span>
                  </div>
                </button>
              )}

              {paymentConfig.cash.enabled && (
                <button
                  id="select-payment-cash-btn"
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-orange-500 bg-orange-50/60 text-orange-950 shadow-xs ring-1 ring-orange-500/20'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${paymentMethod === 'cash' ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="font-black">Dinheiro / Espécie</p>
                    <span className="text-[10px] text-stone-500">Com opção de troco</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Conditional Payment Method Details */}
          {paymentMethod === 'pix' && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-3">
              <p className="text-xs font-bold text-emerald-950">
                Pague via Pix e seu pedido entra em preparo instantaneamente!
              </p>

              {/* Simulated QR Code Graphic */}
              <div className="w-36 h-36 mx-auto bg-white p-2.5 rounded-2xl border-2 border-emerald-300 shadow-sm flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect width="100" height="100" fill="white" />
                  <rect x="10" y="10" width="26" height="26" fill="#047857" rx="3" />
                  <rect x="15" y="15" width="16" height="16" fill="white" />
                  <rect x="19" y="19" width="8" height="8" fill="#047857" />

                  <rect x="64" y="10" width="26" height="26" fill="#047857" rx="3" />
                  <rect x="69" y="15" width="16" height="16" fill="white" />
                  <rect x="73" y="19" width="8" height="8" fill="#047857" />

                  <rect x="10" y="64" width="26" height="26" fill="#047857" rx="3" />
                  <rect x="15" y="69" width="16" height="16" fill="white" />
                  <rect x="19" y="73" width="8" height="8" fill="#047857" />

                  <rect x="42" y="14" width="6" height="6" fill="#047857" />
                  <rect x="50" y="24" width="6" height="6" fill="#047857" />
                  <rect x="42" y="34" width="6" height="6" fill="#047857" />
                  <rect x="14" y="44" width="6" height="6" fill="#047857" />
                  <rect x="26" y="50" width="6" height="6" fill="#047857" />
                  <rect x="44" y="48" width="12" height="12" fill="#047857" rx="2" />
                  <rect x="62" y="42" width="6" height="6" fill="#047857" />
                  <rect x="76" y="52" width="6" height="6" fill="#047857" />
                  <rect x="44" y="68" width="6" height="6" fill="#047857" />
                  <rect x="56" y="76" width="8" height="8" fill="#047857" />
                  <rect x="72" y="68" width="6" height="6" fill="#047857" />
                  <rect x="80" y="80" width="6" height="6" fill="#047857" />
                </svg>
              </div>

              {/* Copy Code */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={simulatedPixCode}
                  className="w-full text-[10px] bg-white border border-emerald-300 rounded-xl p-2 font-mono text-stone-600 truncate"
                />
                <button
                  id="copy-pix-code-btn"
                  type="button"
                  onClick={handleCopyPix}
                  className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs"
                >
                  {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedPix ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <p className="text-[11px] text-emerald-800 font-medium">
                Abra o app do seu banco e selecione "Pix Copia e Cola" ou escaneie o código acima.
              </p>
            </div>
          )}

          {paymentMethod === 'credit_card' && (
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3 text-xs">
              {/* Card Brands */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1.5">
                  Bandeira do Cartão
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['visa', 'mastercard', 'elo', 'hipercard'] as const).map(brand => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setCardBrand(brand)}
                      className={`p-2 rounded-xl border text-[11px] font-bold capitalize transition-all ${
                        cardBrand === brand
                          ? 'border-orange-500 bg-orange-50 text-orange-900 font-extrabold shadow-xs'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {brand === 'mastercard' ? 'Master' : brand}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Número do Cartão
                </label>
                <input
                  id="credit-card-number-input"
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  placeholder="0000 0000 0000 0000"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Nome Impresso no Cartão
                </label>
                <input
                  id="credit-card-holder-input"
                  type="text"
                  value={cardHolder}
                  onChange={e => setCardHolder(e.target.value.toUpperCase())}
                  placeholder="NOME COMO ESTÁ NO CARTÃO"
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Validade
                  </label>
                  <input
                    id="credit-card-expiry-input"
                    type="text"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    placeholder="MM/AA"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    CVV
                  </label>
                  <input
                    id="credit-card-cvv-input"
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value)}
                    placeholder="123"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Parcelamento
                </label>
                <select
                  id="credit-card-installments-select"
                  value={installments}
                  onChange={e => setInstallments(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                >
                  <option value="1">1x de R$ {cartTotal.toFixed(2).replace('.', ',')} (Sem juros)</option>
                  <option value="2">2x de R$ {(cartTotal / 2).toFixed(2).replace('.', ',')} (Sem juros)</option>
                  <option value="3">3x de R$ {(cartTotal / 3).toFixed(2).replace('.', ',')} (Sem juros)</option>
                </select>
              </div>
            </div>
          )}

          {paymentMethod === 'debit_card' && (
            <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-2xl text-xs space-y-3">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-orange-600" />
                <p className="font-bold text-orange-950">Cartão de Débito na Maquininha</p>
              </div>
              <p className="text-stone-600 leading-relaxed">
                O entregador levará a máquina até sua porta. Selecione a modalidade do seu cartão para o motoboy já preparar o terminal:
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { id: 'visa_debito', label: 'Visa Débito' },
                  { id: 'master_debito', label: 'Mastercard Maestro' },
                  { id: 'elo_debito', label: 'Elo Débito' },
                  { id: 'vr_alimentacao', label: 'VR / Sodexo / Alelo' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDebitCardBrand(opt.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                      debitCardBrand === opt.id
                        ? 'border-orange-500 bg-orange-100/70 text-orange-950 font-bold'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {paymentMethod === 'cash' && (
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs space-y-3">
              <label className="block font-bold text-stone-800">
                Como deseja pagar na entrega?
              </label>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryPayType('cash')}
                  className={`p-2.5 rounded-xl border font-bold text-xs transition-all ${
                    deliveryPayType === 'cash'
                      ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-xs'
                      : 'border-stone-200 bg-white text-stone-600'
                  }`}
                >
                  💵 Dinheiro
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryPayType('card_machine')}
                  className={`p-2.5 rounded-xl border font-bold text-xs transition-all ${
                    deliveryPayType === 'card_machine'
                      ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-xs'
                      : 'border-stone-200 bg-white text-stone-600'
                  }`}
                >
                  💳 Maquininha (Cartão)
                </button>
              </div>

              {deliveryPayType === 'cash' ? (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-200">
                    <span className="font-semibold text-stone-800">Precisa de troco para dinheiro?</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setNeedChange(true)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          needChange
                            ? 'bg-orange-600 text-white shadow-xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        Sim, preciso
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNeedChange(false);
                          setChangeFor(cartTotal.toFixed(2));
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          !needChange
                            ? 'bg-stone-800 text-white shadow-xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        Não, valor exato
                      </button>
                    </div>
                  </div>

                  {needChange ? (
                    <div className="space-y-2">
                      <label className="block font-semibold text-stone-700">
                        Troco para quanto em dinheiro?
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-600">R$</span>
                        <input
                          id="cash-change-input"
                          type="number"
                          step="5"
                          value={changeFor}
                          onChange={e => setChangeFor(e.target.value)}
                          placeholder={`Ex: 50, 100, 150 (maior que R$ ${cartTotal.toFixed(2)})`}
                          className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
                        />
                      </div>

                      {/* Preset Change Quick Buttons */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {['50', '100', '150', '200'].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setChangeFor(val)}
                            className={`px-3 py-1 text-[11px] rounded-lg border font-bold transition-colors ${
                              changeFor === val ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            Troco p/ R$ {val}
                          </button>
                        ))}
                      </div>

                      {calculatedChange > 0 ? (
                        <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl font-bold flex justify-between border border-emerald-200">
                          <span>Troco que o entregador levará:</span>
                          <span className="text-emerald-700 text-sm">R$ {calculatedChange.toFixed(2).replace('.', ',')}</span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          💡 Informe um valor maior que o total da compra (R$ {cartTotal.toFixed(2).replace('.', ',')}) para calcular o troco.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-stone-500 bg-stone-100 p-2 rounded-lg">
                      Perfeito! O pagamento será feito em dinheiro no valor exato de R$ {cartTotal.toFixed(2).replace('.', ',')}.
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-stone-600 leading-relaxed text-[11px]">
                  Nosso motoboy levará a maquininha sem fio com suporte para aproximação (NFC), chip, débito, crédito e PIX na maquininha.
                </div>
              )}
            </div>
          )}

          {/* ÁREA DE CUPOM DE DESCONTO NA OPÇÃO DE PAGAMENTO */}
          <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-stone-900">Cupom de Desconto</h4>
                  <p className="text-[10px] text-stone-500">
                    Insira o cupom do estabelecimento ou para novos usuários
                  </p>
                </div>
              </div>

              {appliedCoupon && (
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Cupom Ativo
                </span>
              )}
            </div>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                      <span>{appliedCoupon.code}</span>
                      <span className="text-emerald-700 font-extrabold">
                        ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.value}% OFF` : `R$ ${appliedCoupon.value.toFixed(2).replace('.', ',')} OFF`})
                      </span>
                    </p>
                    <p className="text-[11px] text-emerald-800">{appliedCoupon.description}</p>
                  </div>
                </div>

                <button
                  type="button"
                  id="checkout-remove-coupon-btn"
                  onClick={() => {
                    removeCoupon();
                    setCouponMessage(null);
                  }}
                  className="px-2.5 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg font-bold transition-colors"
                >
                  Remover
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (!couponCodeInput.trim()) return;
                    const res = applyCoupon(couponCodeInput.trim());
                    setCouponMessage({ text: res.message, isError: !res.success });
                    if (res.success) {
                      setCouponCodeInput('');
                    }
                  }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="checkout-coupon-input"
                      type="text"
                      placeholder="Código do cupom (ex: PRIMEIRACOMPRA)"
                      value={couponCodeInput}
                      onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3 py-2 text-xs uppercase font-extrabold rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <button
                    id="checkout-apply-coupon-btn"
                    type="submit"
                    className="px-4 py-2 bg-stone-900 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors shrink-0"
                  >
                    Aplicar
                  </button>
                </form>

                {couponMessage && (
                  <p
                    className={`text-[11px] font-bold p-2 rounded-lg ${
                      couponMessage.isError
                        ? 'text-red-700 bg-red-50 border border-red-200'
                        : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}

                {/* Suggestion Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-stone-400 font-bold">Cupons disponíveis:</span>
                  {[
                    { code: 'PRIMEIRACOMPRA', label: '🎉 Novo Usuário (-20%)' },
                    { code: 'BEMVINDO15', label: '👋 Boas-Vindas (R$ 15 OFF)' },
                    { code: 'LANCHE15', label: '🍔 Desconto Loja (15% OFF)' },
                    { code: 'FRETEGRATIS', label: '🛵 Frete Grátis' },
                  ].map(c => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setCouponCodeInput(c.code);
                        const res = applyCoupon(c.code);
                        setCouponMessage({ text: res.message, isError: !res.success });
                      }}
                      className="px-2 py-0.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 text-[10px] font-bold border border-orange-200 transition-colors"
                      title={`Aplicar cupom ${c.code}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clube de Fidelidade do Estabelecimento & Troca de Pontos */}
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200/90 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    Clube de Fidelidade • {currentCartRestaurant?.name || 'Restaurante'}
                  </h4>
                  <p className="text-[10px] text-amber-800">
                    Regra da casa: {loyaltyRules.pointsRedemptionRate} pts = R$ 1,00 de desconto
                  </p>
                </div>
              </div>

              {currentUser && (
                <div className="text-right">
                  <span className="text-[10px] font-bold text-amber-700 uppercase">Seu Saldo</span>
                  <p className="text-xs font-black text-amber-950">{userPoints} pts</p>
                </div>
              )}
            </div>

            {/* Rules Summary Pill */}
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60 text-[11px] text-stone-700 space-y-1">
              <div className="flex justify-between">
                <span>Mínimo para resgate:</span>
                <span className="font-bold text-amber-900">{loyaltyRules.minPointsToRedeem} pontos</span>
              </div>
              <div className="flex justify-between">
                <span>Desconto máximo permitido:</span>
                <span className="font-bold text-amber-900">Até {loyaltyRules.maxDiscountPercent}% do pedido</span>
              </div>
              <div className="flex justify-between">
                <span>Pontos a acumular neste pedido:</span>
                <span className="font-bold text-emerald-700">+{estimatedPointsToEarn} pontos</span>
              </div>
            </div>

            {/* Redemption Control */}
            {!currentUser ? (
              <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200 flex items-center justify-between gap-2 text-xs">
                <span className="text-stone-600 text-[11px]">
                  Entre na sua conta para acumular e resgatar pontos deste restaurante.
                </span>
                <button
                  id="checkout-login-loyalty-btn"
                  type="button"
                  onClick={() => {
                    setCheckoutModalOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shrink-0"
                >
                  Entrar
                </button>
              </div>
            ) : canRedeem ? (
              <div className="space-y-2.5 pt-1">
                <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-300 cursor-pointer shadow-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="toggle-redeem-points-checkbox"
                      checked={useLoyaltyPoints}
                      onChange={e => handleToggleLoyalty(e.target.checked)}
                      className="w-4 h-4 text-orange-600 rounded-md focus:ring-orange-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">
                        Trocar pontos por desconto agora
                      </span>
                      <span className="text-[10px] text-stone-500">
                        Disponível para este estabelecimento: até {maxPointsUsable} pontos
                      </span>
                    </div>
                  </div>
                  {useLoyaltyPoints && restaurantLoyaltyDiscount > 0 && (
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      -R$ {restaurantLoyaltyDiscount.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </label>

                {useLoyaltyPoints && (
                  <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-stone-700">Quantos pontos deseja trocar?</span>
                      <span className="font-black text-amber-900 text-sm">{pointsToRedeem} pts</span>
                    </div>

                    <input
                      type="range"
                      id="loyalty-points-slider"
                      min={loyaltyRules.minPointsToRedeem}
                      max={maxPointsUsable}
                      step={10}
                      value={pointsToRedeem}
                      onChange={e => setPointsToRedeem(Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />

                    <div className="flex justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setPointsToRedeem(loyaltyRules.minPointsToRedeem)}
                        className="flex-1 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-[10px] font-bold text-stone-700"
                      >
                        Mínimo ({loyaltyRules.minPointsToRedeem} pts)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPointsToRedeem(Math.floor(maxPointsUsable / 2))}
                        className="flex-1 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-[10px] font-bold text-stone-700"
                      >
                        Metade ({Math.floor(maxPointsUsable / 2)} pts)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPointsToRedeem(maxPointsUsable)}
                        className="flex-1 py-1 bg-amber-100 hover:bg-amber-200 rounded-lg text-[10px] font-bold text-amber-900"
                      >
                        Máximo ({maxPointsUsable} pts)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-2.5 bg-white/70 rounded-xl border border-amber-200/70 text-[11px] text-amber-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Você possui <strong>{userPoints} pontos</strong>. O mínimo para resgate de desconto neste restaurante é de <strong>{loyaltyRules.minPointsToRedeem} pontos</strong>.
                </span>
              </div>
            )}
          </div>

          {/* Price Summary Breakdown */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal dos itens</span>
              <span>R$ {cartSubtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            {cartDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Desconto de Cupom</span>
                <span>-R$ {cartDiscount.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            {restaurantLoyaltyDiscount > 0 && (
              <div className="flex justify-between text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded-lg">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  Troca de Pontos ({pointsToRedeem} pts)
                </span>
                <span>-R$ {restaurantLoyaltyDiscount.toFixed(2).replace('.', ',')}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>Taxa de Entrega</span>
              <span>{deliveryFee === 0 ? 'Grátis' : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`}</span>
            </div>
            <div className="border-t border-stone-200 pt-2 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-extrabold text-stone-900 block">Total a Pagar</span>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  + {estimatedPointsToEarn} pontos garantidos neste pedido
                </span>
              </div>
              <span className="text-xl font-black text-stone-950">
                R$ {cartTotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="p-5 bg-white border-t border-stone-200">
          <button
            id="confirm-checkout-and-pay-btn"
            disabled={isProcessing}
            onClick={handleCompleteOrder}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Confirmando Pedido & Pagamento...
              </span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {paymentMethod === 'pix'
                    ? 'Confirmar Pedido com Pix'
                    : paymentMethod === 'credit_card'
                    ? 'Pagar com Cartão & Enviar Pedido'
                    : paymentMethod === 'debit_card'
                    ? 'Confirmar Pedido (Débito na Entrega)'
                    : 'Confirmar Pedido (Pagar na Entrega)'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
