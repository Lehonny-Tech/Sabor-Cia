import React from 'react';
import { X, Award, Sparkles, Gift, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LOYALTY_REWARDS } from '../data/initialData';

export const LoyaltyModal: React.FC = () => {
  const { loyaltyModalOpen, setLoyaltyModalOpen, currentUser, setAuthModalOpen, redeemLoyaltyReward } = useApp();

  if (!loyaltyModalOpen) return null;

  const points = currentUser?.loyaltyPoints || 0;
  const tier = currentUser?.loyaltyTier || 'Bronze';

  // Target for next tier
  let nextTierName = 'Prata';
  let nextTierPoints = 150;
  if (tier === 'Prata') {
    nextTierName = 'Ouro';
    nextTierPoints = 400;
  } else if (tier === 'Ouro') {
    nextTierName = 'Máximo';
    nextTierPoints = 400;
  }

  const progressPercent = Math.min(100, Math.round((points / nextTierPoints) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        id="loyalty-modal-card"
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-200 my-8 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white relative shrink-0">
          <button
            id="close-loyalty-modal-btn"
            onClick={() => setLoyaltyModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full text-xs font-bold text-amber-100 mb-2">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            Clube Fidelidade Sabor & Cia
          </div>
          <h3 className="text-2xl font-black">Seus Pontos & Recompensas</h3>
          <p className="text-xs text-amber-100 mt-1">
            Cada R$ 1 gasto na lanchonete rende 1 ponto de fidelidade para trocar por lanches grátis e descontos!
          </p>

          {/* User Points Card */}
          {currentUser ? (
            <div className="mt-5 p-4 bg-black/25 backdrop-blur-md rounded-2xl border border-white/15">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-[11px] text-amber-200 font-semibold uppercase tracking-wider">
                    Saldo Atual
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">{points}</span>
                    <span className="text-xs font-bold text-amber-300">pontos acumulados</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-amber-200 font-medium">Nível de Cliente</span>
                  <p className="text-sm font-black text-white bg-amber-500/40 border border-amber-300/40 px-3 py-1 rounded-full">
                    Nível {tier} 👑
                  </p>
                </div>
              </div>

              {tier !== 'Ouro' && (
                <div>
                  <div className="flex justify-between text-[11px] text-amber-200 mb-1 font-semibold">
                    <span>Progresso para Nível {nextTierName}</span>
                    <span>{points} / {nextTierPoints} pts</span>
                  </div>
                  <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 p-4 bg-white/15 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Faça login para acumular pontos</p>
                <p className="text-[11px] text-amber-200">Ganhe 50 pontos de boas-vindas no cadastro!</p>
              </div>
              <button
                id="loyalty-login-trigger-btn"
                onClick={() => {
                  setLoyaltyModalOpen(false);
                  setAuthModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-white text-stone-900 rounded-xl text-xs font-bold shadow-sm"
              >
                Entrar / Cadastrar
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Rewards Catalogue */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Tier Benefits */}
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className={`p-3 rounded-2xl border ${tier === 'Bronze' ? 'border-amber-500 bg-amber-50 font-bold' : 'border-stone-200 bg-stone-50'}`}>
              <span className="text-amber-800 text-[11px] block">🥉 Bronze</span>
              <p className="text-[10px] text-stone-500 mt-0.5">1 pt por R$ 1 gasto</p>
            </div>
            <div className={`p-3 rounded-2xl border ${tier === 'Prata' ? 'border-amber-500 bg-amber-50 font-bold' : 'border-stone-200 bg-stone-50'}`}>
              <span className="text-stone-700 text-[11px] block">🥈 Prata (150+ pts)</span>
              <p className="text-[10px] text-stone-500 mt-0.5">Sobremesa no aniversário</p>
            </div>
            <div className={`p-3 rounded-2xl border ${tier === 'Ouro' ? 'border-amber-500 bg-amber-50 font-bold' : 'border-stone-200 bg-stone-50'}`}>
              <span className="text-amber-600 text-[11px] block">🥇 Ouro (400+ pts)</span>
              <p className="text-[10px] text-stone-500 mt-0.5">Frete Grátis e Mimos VIP</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-orange-500" />
              Catálogo de Recompensas para Resgatar
            </h4>

            <div className="space-y-3">
              {LOYALTY_REWARDS.map(reward => {
                const canRedeem = points >= reward.pointsCost;

                return (
                  <div
                    key={reward.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 hover:bg-stone-50 flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-stone-900">{reward.title}</span>
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                          {reward.pointsCost} pontos
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">{reward.description}</p>
                    </div>

                    <button
                      id={`redeem-reward-${reward.id}`}
                      disabled={!canRedeem}
                      onClick={() => redeemLoyaltyReward(reward)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                        canRedeem
                          ? 'bg-amber-800 hover:bg-amber-900 text-white shadow-xs active:scale-95'
                          : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      {canRedeem ? 'Resgatar' : `Faltam ${reward.pointsCost - points} pts`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
