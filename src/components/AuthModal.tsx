import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Phone, MapPin, Sparkles, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, login, register } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'login') {
      const res = login(email, password);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    } else {
      if (!name || !email || !password || !phone || !address) {
        setErrorMessage('Por favor, preencha todos os campos.');
        return;
      }
      const res = register(name, email, password, phone, address);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="auth-modal-card"
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 text-white relative">
          <button
            id="close-auth-modal-btn"
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-semibold text-amber-100 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Acesso à Lanchonete
          </div>
          <h3 className="text-xl font-extrabold">
            {mode === 'login' ? 'Entre na sua Conta' : 'Crie seu Cadastro'}
          </h3>
          <p className="text-xs text-amber-100 mt-1">
            {mode === 'login'
              ? 'Acesse para pedir, acumular pontos e rastrear pedidos em tempo real.'
              : 'Cadastre-se e ganhe 50 pontos de fidelidade imediatos!'}
          </p>

          {/* Tab Selector */}
          <div className="flex bg-black/20 p-1 rounded-xl mt-4">
            <button
              id="tab-login-btn"
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'login' ? 'bg-white text-stone-900 shadow-sm' : 'text-amber-100 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              id="tab-register-btn"
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'register' ? 'bg-white text-stone-900 shadow-sm' : 'text-amber-100 hover:text-white'
              }`}
            >
              Cadastre-se (+50 pts)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl">
              {successMessage}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Nome Completo</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Lucas Silva"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="Mínimo 4 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Endereço de Entrega</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Rua, número, complemento e bairro"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md transition-all active:scale-98"
          >
            {mode === 'login' ? 'Entrar no Sistema' : 'Concluir Cadastro (+50 pts)'}
          </button>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-center gap-1.5 text-stone-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Acesso seguro com autenticação de login e senha</span>
          </div>
        </form>
      </div>
    </div>
  );
};
