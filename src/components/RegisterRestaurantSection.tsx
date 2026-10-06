import React, { useState } from 'react';
import {
  Store,
  MapPin,
  Clock,
  DollarSign,
  Bike,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  ArrowRight,
  ShieldCheck,
  Package,
  Flame,
  Phone,
  Layers,
  UtensilsCrossed,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RestaurantCategory } from '../types';

interface RegisterRestaurantSectionProps {
  onGoToMenu: () => void;
  onOpenAdmin: () => void;
}

const CATEGORY_PRESETS: {
  id: RestaurantCategory;
  label: string;
  defaultCover: string;
  defaultLogo: string;
  sampleItems: { name: string; description: string; price: number; category: any; imageUrl: string; stock: number }[];
}[] = [
  {
    id: 'lanchonete',
    label: 'Lanchonete Tradicional',
    defaultCover: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
    defaultLogo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
    sampleItems: [
      {
        name: 'X-Tudo Especial da Casa',
        description: 'Pão tradicional, hambúrguer caseiro 150g, presunto, queijo prato, bacon crocante, ovo, alface e maionese verde.',
        price: 26.90,
        category: 'burgers',
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
        stock: 30,
      },
      {
        name: 'Porção Mista de Fritas & Calabresa',
        description: 'Batata frita crocante 400g coberta com calabresa fatiada, cebola na chapa e queijo derretido.',
        price: 34.50,
        category: 'porcoes',
        imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
        stock: 20,
      },
      {
        name: 'Suco Natural de Laranja 500ml',
        description: 'Laranjas frescas espremidas na hora, bem gelado.',
        price: 9.50,
        category: 'bebidas',
        imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
        stock: 45,
      },
    ],
  },
  {
    id: 'hamburgueria',
    label: 'Hamburgueria Artesanal',
    defaultCover: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop&q=80',
    defaultLogo: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200&auto=format&fit=crop&q=80',
    sampleItems: [
      {
        name: 'Smash Bacon Supreme',
        description: '2 smash burgers 100g de Angus, cheddar inglês fundido, geleia de bacon e maionese defumada no pão brioche.',
        price: 33.90,
        category: 'burgers',
        imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
        stock: 25,
      },
      {
        name: 'Batata Rústica com Alecrim & Alho',
        description: 'Batatas com casca fritas duas vezes, perfumadas com alecrim fresco e maionese de alho negro.',
        price: 22.00,
        category: 'porcoes',
        imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
        stock: 35,
      },
      {
        name: 'Milkshake de Nutella com Ninho 400ml',
        description: 'Sorvete artesanal de baunilha batido com creme de avelã Nutella e finalizado com leite Ninho.',
        price: 19.90,
        category: 'sobremesas',
        imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
        stock: 25,
      },
    ],
  },
  {
    id: 'pizzaria',
    label: 'Pizzaria & Forno a Lenha',
    defaultCover: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=80',
    defaultLogo: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=200&auto=format&fit=crop&q=80',
    sampleItems: [
      {
        name: 'Pizza Margherita Especial Grande',
        description: 'Molho pelati italiano, mozzarella de búfala, manjericão fresco e azeite extravirgem (8 pedaços).',
        price: 58.00,
        category: 'porcoes',
        imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80',
        stock: 20,
      },
      {
        name: 'Pizza Calabresa Artesanal com Catupiry',
        description: 'Calabresa fininha premium, cebola roxa, azeitonas pretas e borda recheada de Catupiry original.',
        price: 62.00,
        category: 'porcoes',
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
        stock: 25,
      },
      {
        name: 'Calzone Quatro Queijos',
        description: 'Massa italiana fechada recheada com gorgonzola, provolone, parmesão e mozzarella derretida.',
        price: 36.00,
        category: 'porcoes',
        imageUrl: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&auto=format&fit=crop&q=80',
        stock: 15,
      },
    ],
  },
  {
    id: 'hotdogs',
    label: 'Hot Dogs Prensados & Especiais',
    defaultCover: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=1200&auto=format&fit=crop&q=80',
    defaultLogo: 'https://images.unsplash.com/photo-1627054234057-0805cfa488ee?w=200&auto=format&fit=crop&q=80',
    sampleItems: [
      {
        name: 'Dogão Prensado Duplo Tudo',
        description: '2 salsichas perdigão, purê de batata caseiro, milho, vinagrete, bacon, batata palha e queijo gratinado.',
        price: 21.90,
        category: 'hotdogs',
        imageUrl: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?w=600&auto=format&fit=crop&q=80',
        stock: 40,
      },
      {
        name: 'Dogão Especial com Costela Desfiada',
        description: 'Pão artesanal, salsicha Frankfurter, costela bovina desfiada no barbecue e queijo provolone.',
        price: 27.50,
        category: 'hotdogs',
        imageUrl: 'https://images.unsplash.com/photo-1627054234057-0805cfa488ee?w=600&auto=format&fit=crop&q=80',
        stock: 25,
      },
      {
        name: 'Guaraná Antarctica Lata 350ml',
        description: 'Refrigerante lata trincando de gelado.',
        price: 6.50,
        category: 'bebidas',
        imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
        stock: 50,
      },
    ],
  },
  {
    id: 'pastelaria',
    label: 'Pastelaria Crocante & Caldos',
    defaultCover: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80',
    defaultLogo: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&auto=format&fit=crop&q=80',
    sampleItems: [
      {
        name: 'Pastel Gigante Especial de Carne com Queijo',
        description: 'Massa caseira super crocante e sequinha de 25cm com carne moída temperada e queijo mussarela.',
        price: 16.50,
        category: 'porcoes',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        stock: 50,
      },
      {
        name: 'Pastel de Frango com Catupiry & Bacon',
        description: 'Frango desfiado suave, Catupiry legítimo e cubos de bacon crocantes.',
        price: 17.50,
        category: 'porcoes',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
        stock: 45,
      },
      {
        name: 'Caldo de Cana Natural Gelado 500ml',
        description: 'Caldo de cana extraído na hora com toque de limão tahiti.',
        price: 8.50,
        category: 'bebidas',
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
        stock: 30,
      },
    ],
  },
];

export const RegisterRestaurantSection: React.FC<RegisterRestaurantSectionProps> = ({
  onGoToMenu,
  onOpenAdmin,
}) => {
  const { registerRestaurant, setActiveAdminRestaurantId } = useApp();

  // Form State
  const [name, setName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RestaurantCategory>('hamburgueria');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [phone, setPhone] = useState('(11) 9');
  const [cnpj, setCnpj] = useState('');
  const [managerName, setManagerName] = useState('');
  const [deliveryTimeMin, setDeliveryTimeMin] = useState<number>(35);
  const [deliveryTimeMax, setDeliveryTimeMax] = useState<number>(50);
  const [deliveryFee, setDeliveryFee] = useState<string>('6.50');
  const [minOrderValue, setMinOrderValue] = useState<string>('25.00');
  const [openingHours, setOpeningHours] = useState('Terça a Domingo: 18h às 23h45');
  const [autoSeedProducts, setAutoSeedProducts] = useState(true);

  // Visual Assets
  const currentPreset = CATEGORY_PRESETS.find(p => p.id === category) || CATEGORY_PRESETS[0];
  const [coverUrl, setCoverUrl] = useState(currentPreset.defaultCover);
  const [logoUrl, setLogoUrl] = useState(currentPreset.defaultLogo);

  // Success State
  const [registeredStore, setRegisteredStore] = useState<{ id: string; name: string } | null>(null);

  const handleCategoryChange = (newCat: RestaurantCategory) => {
    setCategory(newCat);
    const preset = CATEGORY_PRESETS.find(p => p.id === newCat);
    if (preset) {
      setCoverUrl(preset.defaultCover);
      setLogoUrl(preset.defaultLogo);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Por favor, informe o Nome da Lanchonete ou Restaurante.');
      return;
    }

    const feeNumber = parseFloat(deliveryFee.replace(',', '.')) || 0;
    const minOrderNumber = parseFloat(minOrderValue.replace(',', '.')) || 0;

    const sampleProducts = autoSeedProducts ? currentPreset.sampleItems : [];

    const result = registerRestaurant(
      {
        name: name.trim(),
        slogan: slogan.trim() || `O melhor em ${currentPreset.label}`,
        description: description.trim() || `Especialistas em lanches e refeições artesanais preparadas com os melhores ingredientes.`,
        category,
        address: address.trim() || 'Rua Gastronômica, 500',
        neighborhood: neighborhood.trim() || 'Centro',
        phone: phone.trim() || '(11) 98888-7777',
        cnpj: cnpj.trim() || '12.345.678/0001-90',
        coverUrl,
        logoUrl,
        deliveryTimeMin: Number(deliveryTimeMin) || 30,
        deliveryTimeMax: Number(deliveryTimeMax) || 45,
        deliveryFee: feeNumber,
        minOrderValue: minOrderNumber,
        openingHours: openingHours.trim() || 'Todos os dias: 18h às 23h30',
        paymentMethods: ['pix', 'cartao_credito', 'cartao_debito', 'dinheiro'],
      },
      sampleProducts
    );

    if (result.success) {
      setRegisteredStore({ id: result.restaurantId, name });
    }
  };

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-200">
      {/* Registration Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 border border-amber-300 text-xs px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider mb-3">
          <Store className="w-4 h-4 text-orange-600" />
          Expansão Multi-Restaurantes
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
          Cadastre sua Lanchonete ou Restaurante
        </h1>
        <p className="mt-2 text-stone-600 text-sm sm:text-base leading-relaxed">
          Cadastre seu estabelecimento e passe a receber pedidos online com controle de estoque integrado,
          rastreamento de entrega ao vivo, cupons e relatórios de faturamento em tempo real!
        </p>
      </div>

      {/* Success Modal / Banner when newly registered */}
      {registeredStore ? (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-8 sm:p-10 text-center shadow-xl space-y-6">
          <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-emerald-950">
              {registeredStore.name} Cadastrado com Sucesso! 🎉
            </h2>
            <p className="text-emerald-800 text-sm sm:text-base leading-relaxed">
              O seu estabelecimento agora faz parte da plataforma. Todos os recursos de gerenciamento,
              incluindo estoque, pedidos recebidos, notificações e cupons estão totalmente ativos e configurados.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              id="view-store-menu-btn"
              onClick={onGoToMenu}
              className="w-full sm:w-auto px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <UtensilsCrossed className="w-5 h-5" />
              Ver Cardápio da Loja
            </button>

            <button
              id="open-admin-for-store-btn"
              onClick={() => {
                setActiveAdminRestaurantId(registeredStore.id);
                onOpenAdmin();
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-amber-200 font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 border border-stone-700"
            >
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              Gerenciar no Painel Administrativo
            </button>

            <button
              id="register-another-store-btn"
              onClick={() => {
                setRegisteredStore(null);
                setName('');
                setSlogan('');
                setDescription('');
              }}
              className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-stone-100 text-stone-700 font-semibold rounded-2xl border border-stone-200 transition-all text-sm"
            >
              Cadastrar Outro Estabelecimento
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Card 1: Tipo & Categoria */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-extrabold text-base text-stone-900">Especialidade & Categoria</h3>
                <p className="text-xs text-stone-500">Escolha o segmento gastronômico do seu negócio</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {CATEGORY_PRESETS.map(preset => (
                <button
                  type="button"
                  key={preset.id}
                  id={`cat-select-${preset.id}`}
                  onClick={() => handleCategoryChange(preset.id)}
                  className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between gap-3 ${
                    category === preset.id
                      ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 bg-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center">
                    <Store className={`w-4 h-4 ${category === preset.id ? 'text-orange-600' : 'text-stone-600'}`} />
                  </div>
                  <span className={`text-xs font-bold leading-tight ${category === preset.id ? 'text-orange-950' : 'text-stone-800'}`}>
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Card 2: Dados do Estabelecimento */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-extrabold text-base text-stone-900">Dados da Lanchonete ou Restaurante</h3>
                <p className="text-xs text-stone-500">Nome fantasia, slogan e apresentação aos clientes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Nome do Estabelecimento *
                </label>
                <input
                  id="store-name-input"
                  type="text"
                  required
                  placeholder="Ex: Mega Burguer Artesanal, Pizzaria Bella Luna..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Slogan ou Frase de Destaque
                </label>
                <input
                  id="store-slogan-input"
                  type="text"
                  placeholder="Ex: O autêntico burger no carvão desde 2018"
                  value={slogan}
                  onChange={e => setSlogan(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Descrição Completa da Casa
                </label>
                <textarea
                  id="store-desc-input"
                  rows={3}
                  placeholder="Conte um pouco sobre as especialidades, receitas artesanais e diferenciais dos seus lanches..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Nome do Gerente / Responsável
                </label>
                <input
                  id="store-manager-input"
                  type="text"
                  placeholder="Ex: Carlos Eduardo Silveira"
                  value={managerName}
                  onChange={e => setManagerName(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  CNPJ ou CPF Comercial
                </label>
                <input
                  id="store-cnpj-input"
                  type="text"
                  placeholder="00.000.000/0001-00"
                  value={cnpj}
                  onChange={e => setCnpj(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Endereço & Atendimento */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-extrabold text-base text-stone-900">Localização & Contato</h3>
                <p className="text-xs text-stone-500">Onde fica a cozinha e como os clientes podem contatar</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Endereço da Cozinha / Balcão
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    id="store-address-input"
                    type="text"
                    placeholder="Rua / Avenida, Número"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Bairro / Região
                </label>
                <input
                  id="store-neighborhood-input"
                  type="text"
                  placeholder="Ex: Jardins, Vila Madalena, Centro..."
                  value={neighborhood}
                  onChange={e => setNeighborhood(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  WhatsApp / Telefone de Pedidos
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    id="store-phone-input"
                    type="text"
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Horário de Funcionamento
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    id="store-hours-input"
                    type="text"
                    placeholder="Terça a Domingo: 18h às 23h45"
                    value={openingHours}
                    onChange={e => setOpeningHours(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Delivery & Configurações Operacionais */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-extrabold text-base text-stone-900">Operação de Delivery & Taxas</h3>
                <p className="text-xs text-stone-500">Configure tempos estimados e valores de entrega para seus clientes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Tempo Estimado (Minutos)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={15}
                    max={90}
                    value={deliveryTimeMin}
                    onChange={e => setDeliveryTimeMin(Number(e.target.value))}
                    className="w-1/2 px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 text-center font-bold"
                  />
                  <span className="text-stone-400 text-xs">até</span>
                  <input
                    type="number"
                    min={20}
                    max={120}
                    value={deliveryTimeMax}
                    onChange={e => setDeliveryTimeMax(Number(e.target.value))}
                    className="w-1/2 px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 text-center font-bold"
                  />
                </div>
                <span className="text-[11px] text-stone-500 mt-1 block">Ex: 35 a 50 minutos</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Taxa de Entrega Padrão (R$)
                </label>
                <div className="relative">
                  <span className="text-stone-400 text-sm font-bold absolute left-3 top-3">R$</span>
                  <input
                    id="store-delivery-fee-input"
                    type="text"
                    value={deliveryFee}
                    onChange={e => setDeliveryFee(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <span className="text-[11px] text-stone-500 mt-1 block">Insira 0 para Entrega Grátis</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Pedido Mínimo (R$)
                </label>
                <div className="relative">
                  <span className="text-stone-400 text-sm font-bold absolute left-3 top-3">R$</span>
                  <input
                    id="store-min-order-input"
                    type="text"
                    value={minOrderValue}
                    onChange={e => setMinOrderValue(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <span className="text-[11px] text-stone-500 mt-1 block">Valor mínimo para finalizar</span>
              </div>
            </div>
          </div>

          {/* Card 5: Identidade Visual e Capa */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <h3 className="font-extrabold text-base text-stone-900">Identidade Visual & Fotos</h3>
                <p className="text-xs text-stone-500">Fotos de capa e logotipo de alta qualidade para atrair clientes</p>
              </div>
            </div>

            {/* Visual Preview */}
            <div className="relative rounded-2xl overflow-hidden h-36 sm:h-48 border border-stone-200 shadow-inner">
              <img
                src={coverUrl}
                alt="Banner de Capa"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={logoUrl}
                    alt="Logo da Loja"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
                  />
                  <div>
                    <h4 className="text-white font-extrabold text-lg leading-tight">
                      {name || 'Nome da sua Lanchonete'}
                    </h4>
                    <p className="text-amber-300 text-xs font-semibold">
                      {slogan || currentPreset.label}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  URL da Imagem de Capa (Banner)
                </label>
                <input
                  type="text"
                  value={coverUrl}
                  onChange={e => setCoverUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  URL do Logotipo / Foto do Perfil
                </label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Card 6: Cardápio Inicial Automático (Boas-vindas) */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-start gap-3.5">
              <input
                id="auto-seed-checkbox"
                type="checkbox"
                checked={autoSeedProducts}
                onChange={e => setAutoSeedProducts(e.target.checked)}
                className="mt-1 w-5 h-5 rounded-lg text-orange-600 border-amber-300 focus:ring-orange-500 cursor-pointer"
              />
              <div className="space-y-1">
                <label htmlFor="auto-seed-checkbox" className="font-extrabold text-stone-900 text-sm cursor-pointer flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  Gerar automaticamente 3 produtos iniciais modelo no cardápio desta loja
                </label>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Recomendado: cria 3 itens com fotos em alta definição, preços e estoque já cadastrados para você testar pedidos e gerenciamento imediatamente. Você poderá editar ou apagar no Painel Admin a qualquer momento.
                </p>
              </div>
            </div>

            {autoSeedProducts && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {currentPreset.sampleItems.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-2xl border border-amber-200 flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">{item.name}</p>
                      <p className="text-xs font-black text-orange-600">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                      <span className="text-[10px] text-stone-400">Estoque: {item.stock} un</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Compatibilidade total: as mesmas ferramentas de gestão para todas as lojas cadastradas</span>
            </div>

            <button
              id="submit-restaurant-registration-btn"
              type="submit"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Store className="w-5 h-5" />
              Finalizar Cadastro & Abrir Loja
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
