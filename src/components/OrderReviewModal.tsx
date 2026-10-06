import React, { useState } from 'react';
import { X, Star, Sparkles, ThumbsUp, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OrderReviewModal: React.FC = () => {
  const { reviewModalOrderId, setReviewModalOrderId, orders, submitReview } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Lanche Quentinho 🔥', 'Muito Saboroso 😋']);
  const [comment, setComment] = useState<string>('');

  if (!reviewModalOrderId) return null;

  const order = orders.find(o => o.id === reviewModalOrderId);
  if (!order) return null;

  const availableTags = [
    'Lanche Quentinho 🔥',
    'Entrega Rápida ⚡',
    'Muito Saboroso 😋',
    'Embalagem Perfeita 📦',
    'Atendimento Nota 10 👏',
    'Porção Generosa 🍟',
    'Blend Suculento 🥩',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReview(reviewModalOrderId, rating, selectedTags, comment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="order-review-modal-card"
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white relative text-center">
          <button
            id="close-review-modal-btn"
            onClick={() => setReviewModalOrderId(null)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-2 text-amber-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold">Como estava o seu pedido?</h3>
          <p className="text-xs text-amber-100 mt-1">
            Avalie o Pedido #{order.id} e ajude a nossa lanchonete a manter o padrão de excelência!
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Star Rating Selector */}
          <div className="text-center">
            <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
              Sua Nota Geral
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => {
                const active = hoverRating ? star <= hoverRating : star <= rating;
                return (
                  <button
                    key={star}
                    id={`star-rating-btn-${star}`}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 text-3xl transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        active
                          ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-bold text-stone-700 mt-2">
              {rating === 5 && '🌟 Incrível! Amamos seu carinho!'}
              {rating === 4 && '👍 Muito bom! Obrigado pelo retorno!'}
              {rating === 3 && '👌 Bom, mas podemos melhorar.'}
              {rating === 2 && '😕 Sentimos muito, vamos corrigir.'}
              {rating === 1 && '💔 Lamentamos, entraremos em contato.'}
            </p>
          </div>

          {/* Quick Feedback Tags */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              O que mais se destacou?
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment Textarea */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
              Comentário ou Elogio (Opcional)
            </label>
            <textarea
              id="review-comment-input"
              rows={3}
              placeholder="Conte detalhes sobre o sabor, a temperatura, o atendimento do motoboy..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full p-3 rounded-2xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Submit */}
          <button
            id="submit-review-btn"
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all active:scale-98"
          >
            Enviar Avaliação
          </button>
        </form>
      </div>
    </div>
  );
};
