import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Tag,
  MapPin,
  Bike,
  Store,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Phone,
  Check,
  Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartDiscount,
    deliveryFee,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    deliveryType,
    setDeliveryType,
    deliveryAddress,
    setDeliveryAddress,
    customerPhone,
    setCustomerPhone,
    setCheckoutModalOpen,
    currentUser,
    setAuthModalOpen,
    selectedNeighborhood,
    setSelectedNeighborhood,
    selectedNeighborhoodFee,
    setSelectedNeighborhoodFee,
    currentCartRestaurant,
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const [bairroDrawerSearch, setBairroDrawerSearch] = useState(selectedNeighborhood || '');
  const [showDrawerBairroDropdown, setShowDrawerBairroDropdown] = useState(false);

  if (!cartDrawerOpen) return null;

  const restaurantNeighborhoods = currentCartRestaurant?.neighborhoodFees || [];
  const matchingNeighborhoods = restaurantNeighborhoods.filter(
    n => n.isActive && n.neighborhood.toLowerCase().includes(bairroDrawerSearch.toLowerCase())
  );

  const handleSelectBairroInDrawer = (name: string, fee: number) => {
    setSelectedNeighborhood(name);
    setSelectedNeighborhoodFee(fee);
    setBairroDrawerSearch(name);
    setShowDrawerBairroDropdown(false);
    setDeliveryAddress(`Bairro: ${name}`);
  };

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    if (!couponInput.trim()) {
      setCouponError('Digite um código de cupom.');
      return;
    }

    const res = applyCoupon(couponInput);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const handleProceedToCheckout = () => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setCartDrawerOpen(false);
    setCheckoutModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          id="cart-slideover-panel"
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
        >
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-stone-900">Seu Pedido</h3>
                <p className="text-[11px] text-stone-500 font-medium">
                  {cart.length} {cart.length === 1 ? 'item selecionado' : 'itens selecionados'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  id="clear-cart-btn"
                  onClick={clearCart}
                  className="text-xs text-stone-500 hover:text-red-600 p-1 font-medium transition-colors"
                  title="Esvaziar carrinho"
                >
                  Limpar
                </button>
              )}
              <button
                id="close-cart-drawer-btn"
                onClick={() => setCartDrawerOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {cart.length === 0 ? (
              <div className="py-16 text-center text-stone-400 space-y-3">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-stone-800">Seu carrinho está vazio</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Escolha um delicioso lanche do nosso cardápio e adicione aqui para pedir!
                </p>
                <button
                  id="empty-cart-back-btn"
                  onClick={() => setCartDrawerOpen(false)}
                  className="mt-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Explorar Cardápio
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items List */}
                <div className="space-y-3">
                  {cart.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 flex gap-3 items-start justify-between"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-extrabold text-xs text-stone-900 truncate pr-2">
                            {item.name}
                          </h4>
                          <span className="font-bold text-xs text-stone-900 shrink-0">
                            R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                          </span>
                        </div>

                        {/* Customizations summary */}
                        {item.customizations.length > 0 && (
                          <div className="text-[11px] text-stone-500 mt-1 space-y-0.5">
                            {item.customizations.map((c, i) => (
                              <p key={i} className="truncate">
                                • {c.selectedOption}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Notes */}
                        {item.itemNotes && (
                          <p className="text-[10px] text-amber-700 italic mt-1 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                            Obs: {item.itemNotes}
                          </p>
                        )}

                        {/* Controls */}
                        <div className="flex items-center justify-between mt-2.5">
                          <div className="flex items-center border border-stone-300 bg-white rounded-lg p-0.5 shadow-xs">
                            <button
                              id={`decrease-cart-item-${item.id}`}
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="p-1 text-stone-600 hover:text-stone-900 rounded-md hover:bg-stone-100"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-stone-800">
                              {item.quantity}
                            </span>
                            <button
                              id={`increase-cart-item-${item.id}`}
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="p-1 text-stone-600 hover:text-stone-900 rounded-md hover:bg-stone-100"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            id={`remove-cart-item-${item.id}`}
                            onClick={() => removeFromCart(item.id)}
                            className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                            title="Remover item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Type Option */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Modalidade de Entrega
                    </span>
                    <span className="text-[11px] text-amber-800 font-bold">
                      {deliveryType === 'delivery' ? 'Motoboy Express' : 'Retirar na Lanchonete'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="select-delivery-type-btn"
                      type="button"
                      onClick={() => setDeliveryType('delivery')}
                      className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                        deliveryType === 'delivery'
                          ? 'bg-amber-900 text-white border-amber-950 shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-amber-100/50'
                      }`}
                    >
                      <Bike className="w-4 h-4" />
                      Delivery ({deliveryFee === 0 ? 'Grátis' : 'R$ 7,00'})
                    </button>

                    <button
                      id="select-takeout-type-btn"
                      type="button"
                      onClick={() => setDeliveryType('retirada')}
                      className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                        deliveryType === 'retirada'
                          ? 'bg-amber-900 text-white border-amber-950 shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-amber-100/50'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      Retirada (Sem Taxa)
                    </button>
                  </div>

                  {deliveryType === 'delivery' && (
                    <div className="pt-2 space-y-2">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-orange-600" />
                            Bairro (Taxa Individual)
                          </span>
                          <span className="text-[10px] text-orange-600">Busca por escrita</span>
                        </label>
                        <div className="relative">
                          <div className="relative flex items-center">
                            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 pointer-events-none" />
                            <input
                              type="text"
                              value={bairroDrawerSearch}
                              onChange={e => {
                                setBairroDrawerSearch(e.target.value);
                                setShowDrawerBairroDropdown(true);
                                const match = restaurantNeighborhoods.find(
                                  n => n.isActive && n.neighborhood.toLowerCase().trim() === e.target.value.toLowerCase().trim()
                                );
                                if (match) {
                                  setSelectedNeighborhood(match.neighborhood);
                                  setSelectedNeighborhoodFee(match.fee);
                                }
                              }}
                              onFocus={() => setShowDrawerBairroDropdown(true)}
                              placeholder="Digite seu bairro..."
                              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-white font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>

                          {showDrawerBairroDropdown && matchingNeighborhoods.length > 0 && (
                            <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white rounded-xl border border-stone-200 shadow-xl divide-y divide-stone-100">
                              {matchingNeighborhoods.map(item => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => handleSelectBairroInDrawer(item.neighborhood, item.fee)}
                                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-orange-50 flex items-center justify-between transition-colors cursor-pointer"
                                >
                                  <span className="font-bold text-stone-800">{item.neighborhood}</span>
                                  <span className="text-[11px] font-black text-orange-600 bg-orange-100/70 px-1.5 py-0.5 rounded">
                                    R$ {item.fee.toFixed(2).replace('.', ',')}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {selectedNeighborhood && (
                          <div className="mt-1 text-[10px] text-stone-600 flex justify-between bg-orange-50/70 px-2 py-1 rounded-lg border border-orange-200">
                            <span>Bairro: <strong>{selectedNeighborhood}</strong></span>
                            <span className="font-bold text-orange-700">Taxa: R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Rua, número e complemento
                        </label>
                        <input
                          id="cart-delivery-address-input"
                          type="text"
                          value={deliveryAddress}
                          onChange={e => setDeliveryAddress(e.target.value)}
                          placeholder="Rua, número, complemento e bairro"
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-orange-600" />
                      WhatsApp / Telefone para aviso de entrega
                    </label>
                    <input
                      id="cart-customer-phone-input"
                      type="tel"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Coupon Input & Feedback */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-orange-500" />
                      Cupom de Desconto
                    </span>
                  </div>

                  {appliedCoupon ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-emerald-900">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-[10px] text-emerald-700">
                            {appliedCoupon.description} (-R$ {cartDiscount.toFixed(2).replace('.', ',')})
                          </p>
                        </div>
                      </div>
                      <button
                        id="remove-coupon-btn"
                        onClick={removeCoupon}
                        className="text-xs text-red-600 hover:text-red-800 font-bold p-1"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        id="coupon-code-input"
                        type="text"
                        placeholder="Ex: PRIMEIRACOMPRA"
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 text-xs p-2.5 uppercase font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        id="apply-coupon-btn"
                        type="submit"
                        className="px-4 py-2.5 bg-stone-900 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                      >
                        Aplicar
                      </button>
                    </form>
                  )}

                  {couponError && (
                    <p className="text-[11px] text-red-600 font-medium">{couponError}</p>
                  )}
                  {couponSuccess && (
                    <p className="text-[11px] text-emerald-600 font-medium">{couponSuccess}</p>
                  )}

                  {/* Suggestion Chips */}
                  {!appliedCoupon && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] text-stone-500 py-0.5">Sugestões:</span>
                      {['PRIMEIRACOMPRA', 'BEMVINDO15', 'LANCHE15', 'FRETEGRATIS'].map(code => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setCouponInput(code);
                            applyCoupon(code);
                          }}
                          className="text-[10px] bg-stone-100 hover:bg-orange-100 text-stone-700 hover:text-orange-700 px-2 py-0.5 rounded-md font-semibold transition-colors"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Loyalty Bonus Points Callout */}
                <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>
                      Você vai acumular <strong>+{Math.floor(cartTotal)} pontos</strong> neste pedido!
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Summary & Action */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">
                    R$ {cartSubtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {cartDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Desconto ({appliedCoupon?.code})</span>
                    <span>-R$ {cartDiscount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Taxa de Entrega</span>
                  <span className="font-semibold text-stone-900">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">Grátis</span>
                    ) : (
                      `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`
                    )}
                  </span>
                </div>

                <div className="border-t border-stone-200 pt-2 flex justify-between items-baseline">
                  <span className="text-sm font-extrabold text-stone-900">Total</span>
                  <span className="text-xl font-black text-stone-950">
                    R$ {cartTotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <button
                id="proceed-to-checkout-btn"
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-between active:scale-98"
              >
                <span>Avançar para Pagamento</span>
                <div className="flex items-center gap-1.5">
                  <span>R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
