import { useEffect, useRef, useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { motion } from 'motion/react'
import Hls from 'hls.js'
import { Gift, Percent, UserPlus } from '@phosphor-icons/react'
import DashboardApp from './DashboardApp'
import {
  ArrowRight,
  Car,
  CarTaxiFront,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Beef,
  Bike,
  Brain,
  Building2,
  Camera,
  Clapperboard,
  Cookie,
  CupSoda,
  Droplet,
  Dumbbell,
  Egg,
  Hammer,
  PawPrint,
  ShoppingBag,
  Store,
  Video,
  Sandwich,
  Snowflake,
  Fingerprint,
  Fuel,
  GraduationCap,
  MapPin,
  Menu,
  Leaf,
  Scissors,
  ShoppingBasket,
  ShoppingCart,
  Sparkles,
  Flame,
  Stethoscope,
  Pill,
  Glasses,
  Utensils,
  Wrench,
  X,
  MessageCircle,
} from 'lucide-react'

const videoSrc =
  'https://stream.mux.com/T6oQJQ02cQ6N01TR6iHwZkKFkbepS34dkkIc9iukgy400g.m3u8'
const posterSrc =
  'https://images.unsplash.com/photo-1647356191320-d7a1f80ca777?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhcmslMjB0ZWNobm9sb2d5JTIwbmV1cmFsJTIwbmV0d29ya3xlbnwxfHx8fDE3Njg5NzIyNTV8MA&ixlib=rb-4.1.0&q=80&w=1080'
const brandLogoSrc =
  'https://image2url.com/r2/default/images/1775681435269-bef1d9c7-a142-4b0a-9221-060f7ee7998c.png'
const studentsPhotoSrc =
  'https://image2url.com/r2/default/images/1775684693650-831239a0-e6da-447d-916e-e3f9e05c5be6.png'
const functionsBase = import.meta.env.DEV
  ? 'http://localhost:8888/.netlify/functions'
  : '/.netlify/functions'

type PartnerCategory = {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
  color: string
  active: boolean
  comingSoon?: boolean
  highlighted?: boolean
}

const partnerCategories: PartnerCategory[] = [
  { id: 'manicure', label: 'Manicure', icon: Sparkles, color: 'text-pink-300', active: true },
  { id: 'eletricista', label: 'Eletricista', icon: Wrench, color: 'text-amber-300', active: true },
  { id: 'lavacar', label: 'Lavacar', icon: CarTaxiFront, color: 'text-cyan-300', active: true },
  { id: 'restaurante', label: 'Restaurante', icon: Utensils, color: 'text-tertiary', active: true },
  { id: 'posto-combustivel', label: 'Posto de combustível', icon: Fuel, color: 'text-secondary', active: true },
  { id: 'sorveteria', label: 'Sorveteria', icon: Snowflake, color: 'text-sky-300', active: true },
  { id: 'motorista', label: 'Motoristas', icon: Car, color: 'text-sky-300', active: true },
  { id: 'gas', label: 'Gás', icon: Flame, color: 'text-yellow-300', active: true },
  { id: 'salao-beleza-cs', label: 'Salão de beleza', icon: Sparkles, color: 'text-pink-300', active: true },
  { id: 'academia', label: 'Academia', icon: Dumbbell, color: 'text-orange-300', active: true },
  { id: 'construtora', label: 'Construtora', icon: Building2, color: 'text-stone-300', active: true },
  { id: 'barbearia', label: 'Barbearia', icon: Scissors, color: 'text-violet-300', active: true },
  { id: 'cfc', label: 'CFC (Centro de Formação de Condutores)', icon: GraduationCap, color: 'text-amber-300', active: true },
  { id: 'mercado', label: 'Mercado', icon: ShoppingBasket, color: 'text-lime-300', active: true },
  { id: 'odontologia', label: 'Consultório Odontológico', icon: Stethoscope, color: 'text-cyan-300', active: true },
  { id: 'hortifruti', label: 'Hortifruti', icon: ShoppingBasket, color: 'text-emerald-300', active: true },
  { id: 'produtos-naturais', label: 'Produtos naturais', icon: Leaf, color: 'text-emerald-300', active: true },
  { id: 'espetinho', label: 'Espetinho', icon: Utensils, color: 'text-orange-300', active: true },
  { id: 'esfiharia', label: 'Esfiharia e Hamburgueria', icon: Sandwich, color: 'text-amber-300', active: true },
  { id: 'otica', label: 'Ótica', icon: Glasses, color: 'text-indigo-300', active: true },
  { id: 'farmacia', label: 'Farmácia', icon: Pill, color: 'text-rose-300', active: true },
  { id: 'petshop', label: 'Petshop', icon: PawPrint, color: 'text-lime-300', active: true },
  { id: 'fotografia', label: 'Fotografia', icon: Camera, color: 'text-slate-300', active: true },
  { id: 'video-maker', label: 'Vídeo maker', icon: Video, color: 'text-red-300', active: true },
  { id: 'trufaia', label: 'Trufas', icon: Cookie, color: 'text-amber-300', active: true },
  { id: 'caldo-de-cana', label: 'Caldo de cana', icon: CupSoda, color: 'text-lime-300', active: true },
  { id: 'variedades', label: 'Variedades', icon: ShoppingBag, color: 'text-pink-300', active: true },
  { id: 'social-midia', label: 'Social mídia', icon: Clapperboard, color: 'text-indigo-300', active: true },
  { id: 'psicanalista', label: 'Psicanalista', icon: Brain, color: 'text-sky-300', active: true },
  { id: 'cachorro-quente', label: 'Cachorro-quente', icon: Beef, color: 'text-amber-300', active: true },
  { id: 'mel', label: 'Mel', icon: Droplet, color: 'text-yellow-300', active: true },
  { id: 'bike-eletrica', label: 'Aluguel de bike elétrica', icon: Bike, color: 'text-lime-300', active: true },
  { id: 'mercado-universitario', label: 'Novo mercado no universitário', icon: Store, color: 'text-lime-300', active: true },
  { id: 'entrega-ovos', label: 'Entrega de ovos', icon: Egg, color: 'text-amber-300', active: true },
  { id: 'materiais-construcao', label: 'Materiais de construção', icon: Hammer, color: 'text-stone-300', active: true },
  { id: 'sucos', label: 'Sucos para eventos', icon: CupSoda, color: 'text-orange-300', active: true },
]

const categoryAliases: Record<string, string[]> = {
  manicure: ['manicure', 'nails'],
  eletricista: ['eletricista', 'pintura e eletrica', 'eletrica'],
  lavacar: ['lavacar', 'lava car', 'lavagem'],
  restaurante: ['restaurante', 'gastronomia'],
  'posto-combustivel': ['posto', 'posto de combustivel', 'combustivel', 'auto posto', 'posto br'],
  sorveteria: ['sorveteria', 'sorvete'],
  motorista: ['motorista', 'moto taxi', 'mototaxi'],
  mercado: ['mercado'],
  hortifruti: ['hortifruti', 'horti fruti', 'horti', 'fruti'],
  'produtos-naturais': ['produtos naturais', 'emporio canto verde', 'empório canto verde', 'canto verde', 'natural'],
  espetinho: ['espetinho', 'rotula', 'rótula'],
  esfiharia: ['esfiharia', 'esfiha', 'hamburgueria', 'hamburger', 'lanche', 'toka do tio'],
  otica: ['otica', 'ótica', 'optica', 'optica'],
  farmacia: ['farmacia', 'farmácia', 'drogaria'],
  barbearia: ['barbearia'],
  gas: ['gas'],
  construtora: ['construtora', 'construcao', 'construção', 'projeto', 'pinheiros'],
  odontologia: ['odontologia'],
  'salao-beleza-cs': ['salao de beleza', 'salao beleza', 'beleza'],
  academia: ['academia', 'roosters', 'atletica'],
  cfc: ['cfc', 'condutores', 'autoescola', 'auto escola'],
  petshop: ['petshop', 'pet shop', 'keagro', 'ke agro'],
  fotografia: ['fotografia', 'fotografo', 'bonani'],
  'video-maker': ['video maker', 'videomaker', 'filmagem'],
  trufaia: ['trufaia', 'trufa'],
  'caldo-de-cana': ['caldo de cana', 'caldo cana'],
  variedades: ['variedades', 'multi vendas'],
  'social-midia': ['social midia', 'impulse', 'edicao de video'],
  psicanalista: ['psicanalista', 'psicanalise'],
  'cachorro-quente': ['cachorro-quente', 'cachorro quente', 'dogao', 'hot dog'],
  mel: ['mel do', 'apicultura'],
  'bike-eletrica': ['bike eletrica', 'bicicleta eletrica'],
  'mercado-universitario': ['novo mercado no universitario'],
  'entrega-ovos': ['entrega de ovos'],
  'materiais-construcao': ['materiais de construcao'],
  sucos: ['sucos para eventos', 'gold sucos'],
}

type PublicPartner = {
  id: string
  name: string
  category: string
  phone: string
  address: string
  city: string
  region: string
  status: string
  showOnMap: boolean
  mapQuery?: string
  discount?: string
  note?: string
  // ponytail: encarte semanal como imagem — o mercado já entrega a arte pronta toda semana.
  // Trocar 1 arquivo > redigitar 20+ preços (e errar preço é erro caro).
  flyer?: string
  // Parceiro fechado mas sem condição divulgável ainda: aparece sem dados e sem contato.
  comingSoon?: boolean
}

const fallbackPartners: PublicPartner[] = [
  { id: 'fp-1', name: 'DS Nails Secrets', category: 'Manicure', phone: '19 99986 6909', address: '', city: 'Cidade Universitária', region: 'UNASP', status: 'ATIVO', showOnMap: false, discount: '10%' },
  { id: 'fp-2', name: 'JM Elétrica', category: 'Eletricista', phone: '19 99317 9673', address: '', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: false, discount: '10%' },
  // ponytail: telefone igual ao do registro no banco (prt-4) de propósito — é a chave do
  // mergePartnersWithFallback. Sem ela vira card duplicado e o endereço novo não sobrescreve o antigo.
  { id: 'fp-5', name: "Panato's Restaurante LTDA", category: 'Restaurante', phone: '19 99645 3980', address: 'Rua Um, Engenheiro Coelho - SP, 13165-000', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: true, mapQuery: 'Rua Um, Engenheiro Coelho - SP, 13165-000', discount: '7%' },
  // ponytail: mapQuery sem "sala 51" — o número da sala derruba o pin do Google Maps.
  { id: 'fp-6', name: 'Nova Ótica Vitaliz', category: 'Ótica', phone: '19 99782 6744', address: 'Rua 7 de Setembro, 381, sala 51, Centro', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: true, mapQuery: 'Rua 7 de Setembro, 381, Engenheiro Coelho', discount: '5% a 20%', note: 'Descontos especiais formalizados:\n5% — apenas armação OU apenas lente.\n10% — na compra de lente + armações de grife.\n20% — na compra de lente + armação da nossa marca própria Vitaliz.\nExame de vista GRATUITO com profissional qualificada, com atendimento de qualidade e cuidado com a sua visão.' },
  { id: 'fp-7', name: 'Lava rápido Nick', category: 'Lavacar', phone: '19 99844 0616', address: 'Rua1 N: 76 bairro Recanto Portinari (Conhecido como rua João Cardoso Filho N:76)', city: 'Artur Nogueira', region: 'UNASP', status: 'ATIVO', showOnMap: true, mapQuery: 'Rua João Cardoso Filho, 76, Artur Nogueira', discount: '5%' },
  { id: 'fp-8', name: 'Unigás E.C', category: 'Gás', phone: '19 99171 8015', address: 'Rua Hosana Cristina de Souza, 267, Bairro Universitário', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: true, discount: '4%' },
  { id: 'fp-10', name: 'Supermercado Guidotti', category: 'Mercado', phone: '', address: 'Rua Celina Cavalheiro Francischetti, 319, Jardim Luiz Favero', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: true, note: 'Observação: você já está cadastrado e os descontos são automáticos no caixa do mercado, não havendo necessidade de identificação.', flyer: '/IMG/guidotti-descontos-rotativos.jpg' },
  { id: 'fp-10b', name: 'Thalynson — O Menino da Horta', category: 'Hortifruti', phone: '19 99954 5292', address: '', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: false, discount: '10%' },
  { id: 'fp-11', name: 'Brilha Odontologia', category: 'Consultório Odontológico', phone: '11 97530 2618', address: 'Rua Minas Gerais, 254, Jardim Amalia', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: true, discount: '10% à vista e 5% no crédito' },
  { id: 'fp-12', name: 'Autoescola José Lopes', category: 'CFC', phone: '19 99958 3241', address: 'Rua Antônio Raphaelli, 575, Pq. das Indústrias', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: true, discount: '5%' },
  { id: 'fp-13', name: 'Drogaria Total Popular', category: 'Farmácia', phone: '19 99714 2695', address: 'Rua Minas Gerais, 167, Jardim América', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: true, discount: 'De 5 a 15%', note: 'Tele-entrega na região do UNASP, pedido mínimo de R$ 20,00.\nSegunda a quinta: 12:30 às 20:00 · Sexta: 12:30 às 17:00.' },
  { id: 'fp-14', name: 'Posto de combustível BR', category: 'Posto de combustível', phone: '19 97146 0709', address: 'Rua Amadeu Jorge Teresani, 230', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: true, discount: 'R$0,10/L' },
  { id: 'fp-15', name: 'Salão de beleza', category: 'Salão de beleza', phone: '19 99921 7647', address: 'Rua Lery de Souza Duarte, 349', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: true, discount: '5 a 10%', note: 'Unhas e sobrancelhas.' },
  { id: 'fp-16', name: 'Moto táxi', category: 'Motorista', phone: '19 99968 0621', address: '', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: false, discount: '5%' },
  { id: 'fp-17', name: 'Motorista carro', category: 'Motorista', phone: '11 98224 5890', address: '', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: false, discount: '5%' },
  { id: 'fp-18', name: 'Sorveteria', category: 'Sorveteria', phone: '', address: '', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: false, comingSoon: true },
  { id: 'fp-produtos-naturais', name: 'Produtos naturais', category: 'Produtos naturais', phone: '19 99120 8014', address: 'Rua Maria Simões de Andrade, 1768, esquina Rua Rui Barbosa, entrada principal cidade, Jardim Amaro', city: 'Artur Nogueira', region: 'UNASP', status: 'ATIVO', showOnMap: true, discount: '15%' },
  { id: 'fp-espetinho-rotula', name: 'Espetinho da Rotatória', category: 'Espetinho', phone: '19 99608 9626', address: '', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: false, discount: '5%' },
  { id: 'fp-pinheiros-construtora', name: "Pinheiro's Construtora", category: 'Construtora', phone: '19 99834 3441', address: '', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: false, discount: '10% em projetos e 2,5% em construção/execução' },
  { id: 'fp-barbearia', name: 'Barbearia', category: 'Barbearia', phone: '', address: '', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: false, comingSoon: true },
  { id: 'fp-roosters-academy', name: 'Roosters Academy', category: 'Academia', phone: '', address: '', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: false, comingSoon: true },
  { id: 'fp-salao-unasp', name: 'Salão de beleza do UNASP', category: 'Salão de beleza', phone: '15 99612 8875', address: '', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: false, discount: '5%' },
  { id: 'fp-esfiharia', name: 'Toka do Tio', category: 'Esfiharia e Hamburgueria', phone: '19 98142 8275', address: '', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: false, discount: '5%' },
  { id: 'fp-keagro', name: 'Ke Agro Petshop', category: 'Petshop', phone: '19 99634 6512', address: 'Rua Antônio Rosa Silva Filho, Lagoa Bonita', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: true, mapQuery: 'Keagro Pet Shop e Banho e Tosa, Rua Antônio Rosa Silva Filho, Lagoa Bonita, Engenheiro Coelho - SP', discount: '7%', flyer: '/IMG/keagro-petshop-criativo.jpeg' },
  { id: 'fp-bonani', name: 'Adriano Bonani Fotografia', category: 'Fotografia', phone: '19 99702 0908', address: '', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: false, discount: '10%' },
  { id: 'fp-video-maker', name: 'Vídeo maker', category: 'Vídeo maker', phone: '19 99651 6358', address: '', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: false, discount: '10%', note: 'Cobertura de eventos, entrevistas, filmagens, vídeos institucionais e propaganda.' },
  { id: 'fp-trufaia', name: 'Trufaia', category: 'Trufas', phone: '19 98135 5054', address: '', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: false, discount: '13,33% no app (R$ 1,30 a trufa)' },
  { id: 'fp-gold-sucos', name: 'Gold Sucos', category: 'Sucos para eventos', phone: '19 99809 5753', address: '', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: false },
  { id: 'fp-simone', name: 'Simone Variedades', category: 'Variedades', phone: '19 98307 4058', address: 'Rua Arlindo Ferreira de Camargo', city: 'Cidade Universitária', region: 'UNASP', status: 'ATIVO', showOnMap: false, discount: '5 a 10%' },
  { id: 'fp-aej-impulse', name: 'A&J Impulse', category: 'Social mídia', phone: '19 99865 4794', address: '', city: 'Cidade Universitária', region: 'UNASP', status: 'ATIVO', showOnMap: false, discount: '15% em edição de vídeos' },
  // ponytail: a arte so traz e-mail, sem telefone — o card sai sem botao de conversar.
  { id: 'fp-psicanalista', name: 'Samuel Augusto — Psicanalista', category: 'Psicanalista', phone: '', address: 'Av. Ipê Roxo, 164, Lagoa Bonita', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: true, discount: '10%', note: 'Contato por e-mail: psicanalistasamuelaugusto@gmail.com' },
  { id: 'fp-dogao', name: 'Dogão de Rua', category: 'Cachorro-quente', phone: '19 99803 1880', address: 'Rua Aparecido Bueno de Moraes, 966', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: true, discount: '5%' },
  // ponytail: a arte do mel nao traz telefone, so o ponto (frente da Lagoa Bonita).
  { id: 'fp-mel', name: 'Mel do Marcos', category: 'Mel', phone: '', address: 'Em frente à Lagoa Bonita', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: true, discount: '5%' },
  { id: 'fp-bike', name: 'Aluguel de bike elétrica', category: 'Bike elétrica', phone: '62 99364 9805', address: '', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: false, discount: '10% com o app (diária R$ 40 em vez de R$ 50)' },
  { id: 'fp-mercado-univ', name: 'Novo mercado no universitário', category: 'Novo mercado no universitário', phone: '', address: '', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: false, comingSoon: true },
  { id: 'fp-ovos', name: 'Entrega de ovos', category: 'Entrega de ovos', phone: '', address: '', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: false, comingSoon: true },
  { id: 'fp-construcao', name: 'Materiais de construção', category: 'Materiais de construção', phone: '', address: '', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: false, comingSoon: true },
  { id: 'fp-caldo-cana', name: 'Caldo de Cana do Marcos', category: 'Caldo de cana', phone: '19 98849 1797', address: '', city: 'Engenheiro Coelho', region: 'UNASP', status: 'ATIVO', showOnMap: false, discount: '5%' },
]

// `oldPrice` é opcional de propósito: só entra onde existe um "de/por" real.
// Riscar um texto que não é preço (era o caso antes) só polui o card.
type Offer = {
  title: string
  tag: string
  oldPrice?: string
  price: string
  badge: string
  badgeClass: string
  image: string
}

const offers: Offer[] = [
  {
    title: 'Drogaria Total Popular',
    tag: 'Farmácia',
    price: 'De 5% a 15% · entrega no UNASP',
    badge: 'ATÉ 15% OFF',
    badgeClass: 'bg-error text-white',
    image: '/IMG/drogaria-total-popular.jpg',
  },
  {
    title: 'Aluguel de bike elétrica',
    tag: 'Mobilidade',
    oldPrice: 'Diária R$ 50,00',
    price: 'R$ 40,00 com o app',
    badge: '10% OFF',
    badgeClass: 'bg-tertiary text-on-tertiary',
    image: '/IMG/bike-eletrica.jpg',
  },
  {
    title: 'A&J Impulse',
    tag: 'Social mídia',
    price: '15% em edição de vídeos',
    badge: '15% OFF',
    badgeClass: 'bg-primary text-on-primary',
    image: '/IMG/aej-impulse.jpg',
  },
  {
    title: 'Samuel Augusto — Psicanalista',
    tag: 'Saúde mental',
    price: '10% de desconto',
    badge: '10% OFF',
    badgeClass: 'bg-secondary text-on-secondary',
    image: '/IMG/samuel-augusto-psicanalista.jpg',
  },
  {
    title: 'Dogão de Rua',
    tag: 'Cachorro-quente',
    price: '5% de desconto',
    badge: '5% OFF',
    badgeClass: 'bg-primary text-on-primary',
    image: '/IMG/dogao-de-rua.jpg',
  },
  {
    title: 'Mel do Marcos',
    tag: 'Mel',
    price: '5% de desconto',
    badge: '5% OFF',
    badgeClass: 'bg-tertiary text-on-tertiary',
    image: '/IMG/mel-do-marcos.jpg',
  },
  {
    title: 'Simone Variedades',
    tag: 'Variedades',
    price: '5% a 10% de desconto',
    badge: 'ATÉ 10% OFF',
    badgeClass: 'bg-secondary text-on-secondary',
    image: '/IMG/simone-variedades.jpg',
  },
  {
    title: 'Gold Sucos',
    tag: 'Sucos para eventos',
    price: 'Condição para assinantes',
    badge: 'PARCEIRO',
    badgeClass: 'bg-primary text-on-primary',
    image: '/IMG/gold-sucos.jpg',
  },
  {
    title: 'Ke Agro Petshop',
    tag: 'Petshop',
    price: '7% de desconto',
    badge: '7% OFF',
    badgeClass: 'bg-secondary text-on-secondary',
    image: '/IMG/keagro-petshop.jpeg',
  },
  {
    title: 'Adriano Bonani Fotografia',
    tag: 'Fotografia',
    price: '10% de desconto',
    badge: '10% OFF',
    badgeClass: 'bg-primary text-on-primary',
    image: '/IMG/adriano-bonani-fotografia.jpeg',
  },
  {
    title: 'Trufaia',
    tag: 'Trufas',
    oldPrice: 'R$ 1,50 por trufa',
    price: 'R$ 1,30 no app',
    badge: '13,33% OFF',
    badgeClass: 'bg-tertiary text-on-tertiary',
    image: '/IMG/trufaia.jpeg',
  },
  {
    title: 'Caldo de Cana do Marcos',
    tag: 'Caldo de cana',
    price: '5% de desconto',
    badge: '5% OFF',
    badgeClass: 'bg-secondary text-on-secondary',
    image: '/IMG/caldo-de-cana-marcos.jpeg',
  },
  {
    title: 'JM Elétrica',
    tag: 'Eletricista',
    price: '10% de desconto',
    badge: '10% OFF',
    badgeClass: 'bg-primary text-on-primary',
    image: '/IMG/jm-eletrica.jpeg',
  },
  {
    title: 'Thalynson — O Menino da Horta',
    tag: 'Hortifruti',
    price: '10% de desconto',
    badge: '10% OFF',
    badgeClass: 'bg-secondary text-on-secondary',
    image: '/IMG/thalynson-hortifruti.jpeg',
  },
  {
    title: 'DS Nails Secrets',
    tag: 'Manicure',
    price: '10% de desconto',
    badge: '10% OFF',
    badgeClass: 'bg-primary text-on-primary',
    image: '/IMG/ds-nails-secrets.jpeg',
  },
  {
    title: 'Brilha Odontologia',
    tag: 'Consultório Odontológico',
    price: '10% à vista · 5% no crédito',
    badge: '10% OFF',
    badgeClass: 'bg-tertiary text-on-tertiary',
    image: '/IMG/brilha-odontologia.jpeg',
  },
  {
    title: 'Autoescola José Lopes',
    tag: 'CFC',
    price: '5% de desconto',
    badge: '5% OFF',
    badgeClass: 'bg-secondary text-on-secondary',
    image: '/IMG/autoescola-jose-lopes.jpeg',
  },
  {
    title: 'Unigás E.C',
    tag: 'Gás',
    price: '4% de desconto',
    badge: '4% OFF',
    badgeClass: 'bg-primary text-on-primary',
    image: '/IMG/unigas-ec.jpeg',
  },
  {
    title: 'Espetinho da Rotatória',
    tag: 'Espetinho',
    price: '5% de desconto',
    badge: '5% OFF',
    badgeClass: 'bg-secondary text-on-secondary',
    image: '/IMG/espetinho-da-rotatoria.jpeg',
  },
  {
    title: "Panato's Restaurante",
    tag: 'Restaurante',
    price: '7% de desconto',
    badge: '7% OFF',
    badgeClass: 'bg-primary text-on-primary',
    image: '/IMG/panatos-restaurante.jpeg',
  },
  {
    title: 'Nick Lava Rápido',
    tag: 'Lavacar',
    price: '5% de desconto',
    badge: '5% OFF',
    badgeClass: 'bg-primary text-on-primary',
    image: '/IMG/nick-lava-rapido.jpeg',
  },
  {
    title: 'Empório Canto Verde',
    tag: 'Produtos naturais',
    price: '15% de desconto',
    badge: '15% OFF',
    badgeClass: 'bg-tertiary text-on-tertiary',
    image: '/IMG/emporio-canto-verde.jpeg',
  },
  {
    title: "Pinheiro's Construtora",
    tag: 'Construtora',
    price: '10% em projetos · 2,5% na execução',
    badge: '10% OFF',
    badgeClass: 'bg-secondary text-on-secondary',
    image: '/IMG/pinheiros-construtora.jpeg',
  },
  {
    title: 'Toka do Tio',
    tag: 'Esfiharia e Hamburgueria',
    price: '5% de desconto',
    badge: '5% OFF',
    badgeClass: 'bg-primary text-on-primary',
    image: '/IMG/toka-do-tio-euplus.jpeg',
  },
  {
    title: 'Posto BR',
    tag: 'Posto de combustível',
    price: 'R$ 0,10 por litro',
    badge: 'ASSINANTES',
    badgeClass: 'bg-secondary text-on-secondary',
    image: '/IMG/posto-br.jpeg',
  },
  {
    title: 'Nova Ótica VitaLiz',
    tag: 'Ótica',
    price: 'Até 20% de desconto',
    badge: 'CLIENTE EUPLUS',
    badgeClass: 'bg-tertiary text-on-tertiary',
    image: '/IMG/nova-otica-vitaliz.jpeg',
  },
  {
    title: 'TC Beauty Studio',
    tag: 'Salão de beleza',
    price: '5% de desconto',
    badge: '5% OFF',
    badgeClass: 'bg-primary text-on-primary',
    image: '/IMG/tc-beauty-studio.jpeg',
  },
  {
    title: 'Mercado Guidotti',
    tag: 'Mercado',
    price: 'Descontos automáticos no caixa',
    badge: 'CLIENTE EUPLUS',
    badgeClass: 'bg-secondary text-on-secondary',
    image: '/IMG/mercado-guidotti-euplus.jpeg',
  },
  {
    title: 'ODS-7 Cosméticos',
    tag: 'Cosméticos',
    price: 'Descontos exclusivos',
    badge: 'PARCEIRO',
    badgeClass: 'bg-primary text-on-primary',
    image: '/IMG/ods7-cosmeticos.jpeg',
  },
  {
    title: 'Assine a Euplus',
    tag: 'Preço de lançamento',
    oldPrice: 'De R$ 29,90 por mês',
    price: 'R$ 14,90/mês ou R$ 99,90',
    badge: 'LANÇAMENTO',
    badgeClass: 'bg-error text-white',
    image: '/IMG/euplus-plano-lancamento.jpeg',
  },
  {
    title: 'Faça parte da Euplus',
    tag: 'Meta de 599 inscritos',
    price: 'Concorra a R$ 999 a cada 4 meses',
    badge: 'META 599',
    badgeClass: 'bg-error text-white',
    image: '/IMG/euplus-meta-599.jpeg',
  },
  {
    title: 'Drogaria Total Popular',
    tag: 'Farmácia',
    price: 'De 5% a 15% · entrega no UNASP',
    badge: 'ATÉ 15% OFF',
    badgeClass: 'bg-error text-white',
    image: '/IMG/drogaria-total-popular.jpg',
  },
]

// Quem recebe o comprovante do Pix. Os números viram link de WhatsApp na seção de cadastro.
const MENSAGEM_COMPROVANTE = 'Olá! Acabei de fazer meu cadastro na EuPlus e estou enviando o comprovante do pagamento.'
const contatosPagamento = [
  { name: 'Obe Daniel', phone: '62 99364-9805' },
  { name: 'Clarisse', phone: '19 98224-6821' },
]

const navLinks = [
  { label: 'Inicio', href: '#' },
  { label: 'Promoção', href: '#' },
  { label: 'Cadastro', href: '#cadastro' },
  { label: 'Benefícios', href: '#' },
  { label: 'Simulador', href: '#simulador' },
]

const partnerRegions = [
  {
    id: 'unasp',
    label: 'UNASP',
    embedUrl:
      'https://www.google.com/maps?q=UNASP%20Engenheiro%20Coelho&output=embed',
    listUrl:
      'https://www.google.com/maps/search/?api=1&query=UNASP%20Engenheiro%20Coelho',
  },
]

type RevealDirection = 'left' | 'right' | 'up' | 'down'

const onlyDigits = (value: string) => value.replace(/\D/g, '')
const normalizeLabel = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const mergePartnersWithFallback = (incomingPartners: PublicPartner[]) => {
  if (!incomingPartners.length) return fallbackPartners

  const buildPartnerKey = (partner: PublicPartner) => {
    const phoneDigits = onlyDigits(partner.phone || '')
    const categoryKey = normalizeLabel(partner.category || '')
    if (phoneDigits && categoryKey) return `${categoryKey}|${phoneDigits}`
    if (phoneDigits) return phoneDigits
    return normalizeLabel(partner.name || '')
  }

  const fallbackByKey = new Map(
    fallbackPartners.map((partner) => [buildPartnerKey(partner), partner]),
  )

  const mergedIncoming = incomingPartners.map((partner) => {
    const fallback = fallbackByKey.get(buildPartnerKey(partner))
    if (!fallback) return partner
    return {
      ...partner,
      name: fallback.name || partner.name,
      category: fallback.category || partner.category,
      phone: fallback.phone || partner.phone,
      address: fallback.address || partner.address,
      city: fallback.city || partner.city,
      region: fallback.region || partner.region,
      showOnMap: fallback.showOnMap,
      mapQuery: fallback.mapQuery || partner.mapQuery,
      discount: fallback.discount || partner.discount,
      note: fallback.note || partner.note,
      flyer: fallback.flyer || partner.flyer,
    }
  })

  const incomingKeySet = new Set(
    mergedIncoming.map((partner) => buildPartnerKey(partner)),
  )
  const missingFallback = fallbackPartners.filter(
    (partner) => !incomingKeySet.has(buildPartnerKey(partner)),
  )

  return [...mergedIncoming, ...missingFallback]
}

const toRegionId = (regionValue: string) => {
  const normalized = normalizeLabel(regionValue)
  if (normalized.includes('unasp')) return 'unasp'
  if (normalized.includes('uniaene')) return 'uniaene'
  if (normalized === 'iap' || normalized.includes('fap')) return 'iap'
  return ''
}

// Vence o alias mais LONGO, nao o primeiro da lista. Com `find` puro, a ordem do
// array decidia: "materiais de construcao" caía em construtora (alias 'construcao'),
// "bike eletrica" em eletricista ('eletrica') e "novo mercado no universitario" em
// mercado. Categoria nova generica passaria a roubar parceiro alheio de novo.
const getPartnerCategoryId = (partner: PublicPartner) => {
  const haystack = normalizeLabel(`${partner.category} ${partner.name}`)
  let melhor: { id: string; tamanho: number } | null = null

  for (const category of partnerCategories) {
    for (const alias of categoryAliases[category.id]) {
      if (!haystack.includes(alias)) continue
      if (!melhor || alias.length > melhor.tamanho) melhor = { id: category.id, tamanho: alias.length }
    }
  }

  return melhor?.id ?? null
}

const getWhatsAppLink = (phone: string, message = 'Olá, vim pela EuPlus') => {
  const digits = onlyDigits(phone)
  if (!digits) return null
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`
}

const formatPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

const NO_TRANSLATE_BEAUTY_TEXT = 'Manicure'
const isBeautyText = (value: string) => normalizeLabel(value) === normalizeLabel(NO_TRANSLATE_BEAUTY_TEXT)

const formatCpf = (value: string) =>
  onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

const readApiBody = async (response: Response, htmlFallbackMessage: string) => {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  const preview = text.trim().slice(0, 120).toLowerCase()
  if (preview.startsWith('<!doctype') || preview.startsWith('<html')) {
    throw new Error(htmlFallbackMessage)
  }

  throw new Error('Resposta inválida do servidor.')
}

function Reveal({
  children,
  from = 'up',
  delay = 0,
  className,
  id,
}: {
  children: ReactNode
  from?: RevealDirection
  delay?: number
  className?: string
  id?: string
}) {
  const offset = {
    left: { x: -60, y: 0 },
    right: { x: 60, y: 0 },
    up: { x: 0, y: -60 },
    down: { x: 0, y: 60 },
  }[from]

  return (
    <motion.div
      id={id}
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

function TopNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <motion.nav
      className="fixed top-0 z-50 w-full bg-slate-950/70 shadow-2xl shadow-blue-900/20 backdrop-blur-xl"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6">
        <div className="flex items-center">
          <img
            src={brandLogoSrc}
            alt="Euplus"
            className="h-12 w-auto object-contain sm:h-14"
            loading="eager"
          />
        </div>

        <div className="hidden items-center gap-8 font-['Epilogue'] tracking-tight md:flex">
          {navLinks.map((link, idx) => (
            <a
              key={link.label}
              className={
                idx === 0
                  ? 'border-b-2 border-emerald-500 pb-1 font-bold text-emerald-400'
                  : 'text-slate-300 transition-colors hover:text-white'
              }
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <a
            className="rounded-full border border-white/20 px-3 py-1.5 text-[11px] font-semibold text-white/80 transition hover:text-white sm:hidden"
            href="#/login-admin"
          >
            Área interna
          </a>
          <a
            className="hidden rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:text-white sm:block"
            href="#/login-admin"
          >
            Área interna
          </a>
          <a
            className="hidden scale-95 rounded-full bg-secondary-container px-6 py-2 font-bold text-on-secondary transition-all duration-200 active:scale-90 hover:brightness-110 sm:block"
            href="#cadastro"
          >
            Cadastro
          </a>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-200 transition hover:bg-white/5 md:hidden"
            aria-label="Abrir menu"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-slate-950/95 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 font-['Epilogue']">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#/login-admin"
              className="rounded-full border border-white/20 px-4 py-2 text-center text-sm font-semibold text-white/90"
              onClick={() => setMobileMenuOpen(false)}
            >
              Área interna
            </a>
            <a
              href="#cadastro"
              className="mt-1 rounded-full bg-secondary-container px-4 py-2 text-center text-sm font-bold text-on-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cadastro
            </a>
          </div>
        </div>
      )}
    </motion.nav>
  )
}

function AnimatedBanner() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(videoSrc)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((e) => console.log('Auto-play prevented:', e))
      })
      return () => hls.destroy()
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      const playVideo = () => {
        video.play().catch((e) => console.log('Auto-play prevented:', e))
      }
      video.src = videoSrc
      video.addEventListener('loadedmetadata', playVideo)
      return () => video.removeEventListener('loadedmetadata', playVideo)
    }

    return undefined
  }, [])

  return (
    <section className="relative mt-16 min-h-[calc(100svh-4rem)] w-full overflow-hidden bg-[#000000] text-white sm:mt-20 sm:min-h-screen">
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          poster={posterSrc}
          className="h-full w-full object-cover opacity-60"
        />
      </div>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      <div className="pointer-events-none absolute left-[20%] top-[-20%] h-[600px] w-[600px] bg-blue-900/20 blur-[120px] mix-blend-screen" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[20%] h-[500px] w-[500px] bg-indigo-900/20 blur-[120px] mix-blend-screen" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-sm items-center justify-center px-4 py-12 sm:min-h-screen sm:max-w-5xl sm:px-6">
        <div className="flex w-full flex-col items-center space-y-8 text-center sm:space-y-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-instrumentSerif text-2xl leading-[1.1] text-white sm:text-5xl lg:text-[48px]"
          >
            UM HUB DE
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-[11ch] bg-gradient-to-b from-white via-white to-[#b4c0ff] bg-clip-text font-instrumentSans text-5xl font-semibold leading-[0.9] tracking-tighter text-transparent sm:text-7xl lg:text-[120px]"
          >
            Inteligência Financeira
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="max-w-[28ch] font-instrumentSans text-base leading-[1.65] text-white sm:text-[20px]"
          >
            Que recupera o dinheiro que já é seu
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="max-w-[22ch] font-instrumentSans text-2xl font-bold uppercase leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[44px]"
          >
            Adquira seu crédito uma única vez{' '}
            <span className="text-secondary">e economize+ de R$ 2.000,00 no ano todo!</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row sm:gap-6"
          >
            <a
              href="#simulador"
              className="group inline-flex w-full scale-100 items-center justify-between gap-4 rounded-full bg-white pl-6 pr-2 py-2 font-instrumentSans text-base font-medium text-[#0a0400] transition duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] sm:w-auto sm:justify-start sm:text-lg"
            >
              Simulador de Economia
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3054ff] transition group-hover:bg-[#2040e0]">
                <ArrowRight className="h-5 w-5 text-white" />
              </span>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.55 }}
            className="w-full max-w-[980px]"
          >
            <div className="rounded-3xl border border-white/10 bg-slate-900/30 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
              <div className="mb-2 flex items-center justify-between px-1 sm:hidden">
                <p className="text-[11px] font-medium tracking-wide text-white/60">Deslize para ver mais atalhos</p>
                <ArrowRight className="h-3.5 w-3.5 text-white/50" />
              </div>
              <div className="relative sm:hidden">
                <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-20 w-10 bg-gradient-to-l from-slate-950/95 to-transparent" />
                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                  {[
                    {
                      label: 'Criar conta',
                      description: 'Cadastre-se agora mesmo',
                      href: '#cadastro',
                      icon: UserPlus,
                      accent: 'text-[#3b82f6]',
                      glow: 'from-[#3b82f633]',
                    },
                    {
                      label: 'Benefícios',
                      description: 'Veja vantagens exclusivas',
                      href: '#beneficios',
                      icon: Gift,
                      accent: 'text-[#a855f7]',
                      glow: 'from-[#a855f735]',
                    },
                    {
                      label: 'Ofertas',
                      description: 'Promoções e descontos',
                      href: '#promocoes',
                      icon: Percent,
                      accent: 'text-[#fb923c]',
                      glow: 'from-[#fb923c33]',
                    },
                  ].map((item) => (
                    <a
                      key={`mobile-${item.label}`}
                      href={item.href}
                      className={`group relative min-w-[158px] rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(8,20,46,0.95),rgba(6,12,28,0.98))] p-3 text-left shadow-[0_16px_34px_-26px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-[1px] hover:border-white/20 active:scale-[0.98] before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:to-transparent before:opacity-100 ${item.glow}`}
                    >
                      <div className={`relative z-10 mb-2.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-800/80 ring-1 ring-white/10 transition group-hover:scale-105 ${item.accent}`}>
                        <item.icon size={18} weight="duotone" />
                      </div>
                      <p className="relative z-10 text-base font-semibold leading-tight tracking-tight text-white">
                        {item.label}
                      </p>
                      <p className="relative z-10 mt-1.5 max-w-[16ch] text-xs leading-snug text-white/70">
                        {item.description}
                      </p>
                      <span className="relative z-10 mt-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-slate-800/80 text-white/70 transition group-hover:translate-x-0.5 group-hover:text-white">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
              <div className="hidden grid-cols-3 gap-2.5 sm:grid">
                {[
                  {
                    label: 'Criar conta',
                    description: 'Cadastre-se agora mesmo',
                    href: '#cadastro',
                    icon: UserPlus,
                    accent: 'text-[#3b82f6]',
                    glow: 'from-[#3b82f633]',
                  },
                  {
                    label: 'Benefícios',
                    description: 'Veja vantagens exclusivas',
                    href: '#beneficios',
                    icon: Gift,
                    accent: 'text-[#a855f7]',
                    glow: 'from-[#a855f735]',
                  },
                  {
                    label: 'Ofertas',
                    description: 'Promoções e descontos',
                    href: '#promocoes',
                    icon: Percent,
                    accent: 'text-[#fb923c]',
                    glow: 'from-[#fb923c33]',
                  },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`group relative rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(8,20,46,0.95),rgba(6,12,28,0.98))] p-4 text-left shadow-[0_16px_34px_-26px_rgba(15,23,42,0.9)] transition-all duration-300 hover:-translate-y-[1px] hover:border-white/20 active:scale-[0.98] before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:to-transparent before:opacity-100 ${item.glow}`}
                  >
                    <div className={`relative z-10 mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-800/80 ring-1 ring-white/10 transition group-hover:scale-105 ${item.accent}`}>
                      <item.icon size={22} weight="duotone" />
                    </div>
                    <p className="relative z-10 text-[26px] font-semibold leading-[1.05] tracking-tight text-white">
                      {item.label}
                    </p>
                    <p className="relative z-10 mt-2 max-w-[17ch] text-sm leading-snug text-white/70">
                      {item.description}
                    </p>
                    <span className="relative z-10 mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-800/80 text-white/70 transition group-hover:translate-x-0.5 group-hover:text-white">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function WelcomeBand() {
  return (
    <section className="border-y border-white/5 bg-surface-container-low py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <Reveal from="down">
          <h2 className="font-headline text-xl font-semibold leading-snug text-on-surface sm:text-2xl md:text-3xl">
            Seja bem-vindo(a) à revolução da sua <span className="text-primary">inteligência financeira</span>.
          </h2>
        </Reveal>
      </div>
    </section>
  )
}

function SimulatorSection() {
  const [monthlyExpense, setMonthlyExpense] = useState(2000)
  const [accumulationYears, setAccumulationYears] = useState(5)

  const eligibleCategories = [
    { label: 'Alimentação ( mercado )', share: 0.35 },
    { label: 'Combustível', share: 0.24 },
    { label: 'Salao de beleza', share: 0.1 },
    { label: 'Barbearia', share: 0.08 },
    { label: 'Farmácia e outros', share: 0.13 },
  ]
  const excludedCategories = ['água', 'luz']

  const eligibleShare = eligibleCategories.reduce((sum, category) => sum + category.share, 0)
  const eligibleMonthly = monthlyExpense * eligibleShare

  // Taxa média de retorno/desconto aplicada aos gastos elegíveis no simulador.
  const discountRate = 0.08
  const discountPercentage = Math.round(discountRate * 100)
  const calculateRecovery = (years: number) =>
    Math.round(eligibleMonthly * 12 * years * discountRate)

  const totalRecoverable = calculateRecovery(accumulationYears)
  const selectedPeriodProjection = calculateRecovery(accumulationYears)
  const nextYearProjection = calculateRecovery(Math.min(10, accumulationYears + 1))

  const currencyWithCents = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const currencyNoCents = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return (
    <section id="simulador" className="bg-surface px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto w-full max-w-md sm:max-w-7xl">
        <Reveal from="up" className="mb-12 space-y-4 text-center sm:mb-16">
          <h2 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Simulador do game de inteligência financeira
          </h2>
          <p className="mx-auto max-w-2xl text-on-surface-variant">
            Veja como transformar gastos essenciais em acumulação real com gestão financeira inteligente, considerando uma média de{' '}
            <span translate="no" className="notranslate inline-block font-semibold text-white">
              {discountPercentage}%
            </span>{' '}
            de retorno sobre categorias elegíveis.
          </p>
          <p className="mx-auto max-w-2xl rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 font-body text-base font-semibold leading-relaxed text-primary sm:text-lg">
            A Euplus vai te ajudar a criar, de forma disciplinada, uma reserva financeira para urgências, imprevistos e emergências,
            utilizando a economia gerada na nossa rede.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-5">
          <Reveal
            from="left"
            className="space-y-10 rounded-3xl border border-white/5 bg-surface-container-low p-5 shadow-lg shadow-black/20 sm:p-8 md:p-12 lg:col-span-3"
          >
            <div className="space-y-6">
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between">
                <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
                  Gasto Mensal Estimado
                </label>
                <span className="font-headline text-3xl font-bold text-secondary">
                  {currencyWithCents.format(monthlyExpense)}
                </span>
              </div>
              <input
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-container-highest accent-secondary"
                min="500"
                max="10000"
                step="100"
                type="range"
                value={monthlyExpense}
                onChange={(event) => setMonthlyExpense(Number(event.target.value))}
              />
              <div className="flex justify-between text-xs font-medium text-outline">
                <span>{currencyNoCents.format(500)}</span>
                <span>R$ 10.000+</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between">
                <label className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
                  Período de Acúmulo
                </label>
              </div>
              <input
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-container-highest accent-primary"
                min="1"
                max="10"
                step="1"
                type="range"
                value={accumulationYears}
                onChange={(event) => setAccumulationYears(Number(event.target.value))}
              />
              <div className="flex justify-between text-xs font-medium text-outline">
                <span>1 ano</span>
                <span>10 anos</span>
              </div>
            </div>
          </Reveal>

          <Reveal from="right" className="space-y-6 lg:col-span-2">
            <div className="group relative overflow-hidden rounded-3xl bg-primary-container p-6 sm:p-10">
              <div className="absolute right-0 top-0 p-4 opacity-10 transition-transform group-hover:scale-110">
                <CircleDollarSign className="h-20 w-20 sm:h-24 sm:w-24" />
              </div>
              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-on-primary-container">
                Total Recuperável
              </p>
              <h3 className="mb-6 font-headline text-5xl font-black text-white md:text-6xl">
                {currencyNoCents.format(totalRecoverable)}
              </h3>
              <p className="mb-8 text-sm leading-relaxed text-on-primary-container/80">
                Este é o valor aproximado que você está deixando de ganhar utilizando métodos tradicionais.
              </p>
              <a
                href="#cadastro"
                className="block w-full rounded-xl bg-secondary-container py-4 text-center font-bold text-on-secondary shadow-lg transition-all hover:brightness-110"
              >
                Quero fazer parte do Hub
              </a>
            </div>
            <div className="rounded-2xl border border-white/15 bg-surface-container-low p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-outline">Projeções rápidas</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface-container-high p-3">
                  <p className="text-xs text-outline">No período selecionado</p>
                  <p className="mt-1 font-headline text-2xl font-bold text-white">
                    {currencyNoCents.format(selectedPeriodProjection)}
                  </p>
                </div>
                <div className="rounded-xl bg-surface-container-high p-3">
                  <p className="text-xs text-outline">
                    No próximo ano ({Math.min(10, accumulationYears + 1)} anos)
                  </p>
                  <p className="mt-1 font-headline text-2xl font-bold text-secondary">
                    {currencyNoCents.format(nextYearProjection)}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-outline">Categorias elegíveis no cálculo</p>
                <ul className="space-y-1 text-sm text-on-surface-variant">
                  {eligibleCategories.map((category) => (
                    <li key={category.label}>
                      •{' '}
                      {isBeautyText(category.label) ? (
                        <span translate="no" className="notranslate">
                          {NO_TRANSLATE_BEAUTY_TEXT}
                        </span>
                      ) : (
                        category.label
                      )}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-outline">Fora do cálculo: {excludedCategories.join(' e ')}.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function PartnerSection() {
  const mobileCarouselRef = useRef<HTMLDivElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const flyerDialogRef = useRef<HTMLDialogElement>(null)
  const [activeRegion, setActiveRegion] = useState(partnerRegions[0])
  const [activeCategory, setActiveCategory] = useState(partnerCategories[0])
  const [livePartners, setLivePartners] = useState<PublicPartner[]>([])

  useEffect(() => {
    const loadLivePartners = async () => {
      try {
        const response = await fetch(`${functionsBase}/dashboard`)
        const data = await readApiBody(response, 'Não foi possível carregar parceiros agora.')
        if (!response.ok || !data.ok) return
        const incomingPartners = Array.isArray(data.partners) ? data.partners : []
        setLivePartners(mergePartnersWithFallback(incomingPartners))
      } catch {
        setLivePartners(fallbackPartners)
      }
    }

    loadLivePartners()
  }, [])

  const activePartners = livePartners.filter((partner) => partner.status === 'ATIVO')

  const partnersWithCategory = activePartners
    .map((partner) => ({ partner, categoryId: getPartnerCategoryId(partner) }))
    .filter((item): item is { partner: PublicPartner; categoryId: (typeof partnerCategories)[number]['id'] } => Boolean(item.categoryId))

  const availableCategorySet = new Set(
    partnersWithCategory.map((item) => item.categoryId),
  )

  const visibleCategories = partnerCategories.filter((item, index, array) => {
    if (!item.active) return false
    if (!availableCategorySet.has(item.id)) return false
    return (
      array.findIndex((candidate) => candidate.id === item.id) === index
    )
  })

  const visibleRegions = partnerRegions.filter((region) =>
    activePartners.some((partner) => toRegionId(partner.region) === region.id),
  )

  const selectedCategory = visibleCategories.find((category) => category.id === activeCategory.id) ?? visibleCategories[0] ?? activeCategory
  const selectedRegion = visibleRegions.find((region) => region.id === activeRegion.id) ?? visibleRegions[0] ?? activeRegion

  useEffect(() => {
    const container = mobileCarouselRef.current
    if (!container || visibleCategories.length <= 1) return

    let animationFrameId = 0
    let lastTime = performance.now()
    let pauseUntil = 0
    let resizeObserver: ResizeObserver | null = null
    let oneSegment = 0
    let virtualScrollLeft = 0

    const recalc = () => {
      oneSegment = container.scrollWidth / 3
      if (!oneSegment) return
      if (container.scrollLeft === 0) {
        container.scrollLeft = oneSegment
      }
      virtualScrollLeft = container.scrollLeft || oneSegment
    }

    const pauseAuto = () => {
      pauseUntil = performance.now() + 1400
      virtualScrollLeft = container.scrollLeft
    }

    recalc()

    const step = (time: number) => {
      const elapsed = Math.min(time - lastTime, 32)
      lastTime = time

      if (!oneSegment) {
        recalc()
        animationFrameId = requestAnimationFrame(step)
        return
      }

      if (time > pauseUntil) {
        virtualScrollLeft += elapsed * 0.03
        container.scrollLeft = virtualScrollLeft
      } else {
        virtualScrollLeft = container.scrollLeft
      }

      if (container.scrollLeft >= oneSegment * 2) {
        virtualScrollLeft -= oneSegment
        container.scrollLeft = virtualScrollLeft
      } else if (container.scrollLeft <= 0) {
        virtualScrollLeft += oneSegment
        container.scrollLeft = virtualScrollLeft
      }

      animationFrameId = requestAnimationFrame(step)
    }

    const events = ['touchstart', 'touchmove', 'pointerdown', 'wheel', 'mousedown']
    events.forEach((name) => container.addEventListener(name, pauseAuto, { passive: true }))
    window.addEventListener('resize', recalc)
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(recalc)
      resizeObserver.observe(container)
    }

    animationFrameId = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(animationFrameId)
      if (resizeObserver) resizeObserver.disconnect()
      window.removeEventListener('resize', recalc)
      events.forEach((name) => container.removeEventListener(name, pauseAuto))
    }
  }, [visibleCategories.length])

  const comingSoonCategories = partnerCategories.filter((item) => item.comingSoon || item.highlighted)
  const displayCategories = [...visibleCategories, ...comingSoonCategories].filter((item, index, array) => (
    array.findIndex((candidate) => candidate.id === item.id) === index
  ))
  const mobileLoopItems = [
    ...displayCategories.map((item) => ({ ...item, loopId: `a-${item.id}` })),
    ...displayCategories.map((item) => ({ ...item, loopId: `b-${item.id}` })),
    ...displayCategories.map((item) => ({ ...item, loopId: `c-${item.id}` })),
  ]
  const categoryPartners = partnersWithCategory
    .filter((item) => item.categoryId === selectedCategory.id && toRegionId(item.partner.region) === selectedRegion.id)
    .map((item) => item.partner)
  const primaryPartner = categoryPartners[0] ?? null
  const forceContactOnly = selectedCategory.id === 'eletricista' || selectedCategory.id === 'manicure'
  const hasPrimaryAddress = Boolean(primaryPartner?.address?.trim())
  const canShowPrimaryMap = Boolean(primaryPartner?.showOnMap) && hasPrimaryAddress && !forceContactOnly
  const primaryLocationQuery = primaryPartner
    ? `${primaryPartner.mapQuery || `${primaryPartner.address || ''}, ${primaryPartner.city || ''}`}, São Paulo, Brasil`
    : `Engenheiro Coelho, São Paulo, Brasil`
  const fallbackCategoryQuery = `${selectedCategory.label} em Engenheiro Coelho, São Paulo, Brasil`
  const mapsQuery = primaryPartner?.address ? primaryLocationQuery : fallbackCategoryQuery
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapsQuery)}&output=embed`
  const mapListUrl = primaryPartner
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(primaryLocationQuery)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackCategoryQuery)}`

  const handleCategorySelect = (category: (typeof partnerCategories)[number]) => {
    setActiveCategory(category)
    mapContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <section id="beneficios" className="bg-surface-container-lowest px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto w-full max-w-md sm:max-w-7xl">
        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <Reveal from="left" className="space-y-4">
            <h2 className="font-headline text-3xl font-bold sm:text-4xl">Rede de Parceiros</h2>
            <p className="max-w-md text-on-surface-variant">
              Ganhe descontos em nossos estabelecimentos credenciados na região.
            </p>
          </Reveal>
          <Reveal from="right" className="flex flex-wrap items-center gap-2">
            {visibleRegions.map((region) => (
              <button
                key={region.id}
                type="button"
                onClick={() => setActiveRegion(region)}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition sm:text-sm ${
                    selectedRegion.id === region.id
                    ? 'bg-primary text-on-primary'
                    : 'border border-white/15 bg-surface-container-high text-on-surface-variant hover:text-white'
                }`}
              >
                {region.label}
              </button>
            ))}
          </Reveal>
        </div>

        {!visibleCategories.length ? (
          <Reveal
            from="up"
            className="rounded-2xl border border-white/10 bg-surface-container-low p-5 text-center text-sm text-on-surface-variant"
          >
            Nenhuma categoria ativa com parceiro no momento. Assim que os primeiros parceiros forem cadastrados, elas aparecerão aqui.
          </Reveal>
        ) : null}

        {displayCategories.length ? (
          <>
            <div
              ref={mobileCarouselRef}
              className="no-scrollbar flex w-full touch-pan-x gap-3 overflow-x-auto overscroll-x-contain pb-2 md:hidden"
            >
              {mobileLoopItems.map((item, index) => (
                <motion.button
                  key={item.loopId}
                  type="button"
                  onClick={() => {
                    if (item.active && !item.comingSoon) handleCategorySelect(item)
                  }}
                  disabled={!item.active || Boolean(item.comingSoon)}
                  className={`group flex min-w-[148px] snap-start flex-col items-center justify-center gap-3 rounded-2xl border p-4 text-center transition-colors ${
                    item.highlighted
                      ? 'relative border-lime-300/70 bg-lime-300/15 pt-6 shadow-[0_0_28px_rgba(190,242,100,0.22)]'
                      : item.comingSoon
                      ? 'relative border-white/10 bg-surface-container-low/70 opacity-90 pt-6'
                      : selectedCategory.id === item.id
                      ? 'border-primary/70 bg-primary/10'
                      : 'border-white/10 bg-surface-container-low hover:bg-surface-container-high'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: (index % 6) * 0.05 }}
                >
                  {item.comingSoon || item.highlighted ? (
                    <span className={`absolute left-2 top-2 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                      item.highlighted
                        ? 'border-lime-300/70 bg-lime-300/20 text-lime-200'
                        : 'border-yellow-400/40 bg-yellow-400/10 text-yellow-300'
                    }`}>
                      {item.highlighted ? 'Em implantação' : 'Em julho'}
                    </span>
                  ) : null}
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-highest transition-transform group-hover:scale-110">
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <span translate="no" className="notranslate text-xs font-semibold tracking-wide">
                    {item.id === 'eletricista' ? (
                      'Eletricista'
                    ) : isBeautyText(item.label) ? (
                      <span translate="no" className="notranslate">
                        {NO_TRANSLATE_BEAUTY_TEXT}
                      </span>
                    ) : (
                      item.label
                    )}
                  </span>
                </motion.button>
              ))}
            </div>
            <div className="hidden grid-cols-2 gap-6 md:grid md:grid-cols-4 lg:grid-cols-6">
              {displayCategories.map((item, index) => (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.active && !item.comingSoon) handleCategorySelect(item)
                  }}
                  disabled={!item.active || Boolean(item.comingSoon)}
                  className={`group relative flex flex-col items-center gap-4 rounded-2xl border p-4 text-center transition-colors disabled:cursor-not-allowed sm:p-6 ${
                    item.highlighted
                      ? 'border-lime-300/70 bg-lime-300/15 pt-8 shadow-[0_0_30px_rgba(190,242,100,0.24)] hover:bg-lime-300/20'
                    : item.comingSoon
                      ? 'border-white/10 bg-surface-container-low/70 opacity-90 pt-8'
                    : selectedCategory.id === item.id
                      ? 'border-primary/70 bg-primary/10'
                      : 'border-white/5 bg-surface-container-low hover:bg-surface-container-high'
                  }`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                >
                  {item.comingSoon || item.highlighted ? (
                    <span className={`absolute left-3 top-3 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      item.highlighted
                        ? 'border-lime-300/70 bg-lime-300/20 text-lime-200'
                        : 'border-yellow-400/40 bg-yellow-400/10 text-yellow-300'
                    }`}>
                      {item.highlighted ? 'Em implantação' : 'Em julho'}
                    </span>
                  ) : null}
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-highest transition-transform group-hover:scale-110">
                    <item.icon className={`h-8 w-8 ${item.color}`} />
                  </div>
                  <span translate="no" className="notranslate text-sm font-semibold">
                    {item.id === 'eletricista' ? (
                      'Eletricista'
                    ) : isBeautyText(item.label) ? (
                      <span translate="no" className="notranslate">
                        {NO_TRANSLATE_BEAUTY_TEXT}
                      </span>
                    ) : (
                      item.label
                    )}
                  </span>
                </motion.button>
              ))}
            </div>
          </>
        ) : null}

        {visibleCategories.length && visibleRegions.length && canShowPrimaryMap ? (
          <Reveal
            from="up"
            className="relative mt-12 h-[320px] overflow-hidden rounded-3xl border border-white/10 shadow-2xl sm:h-[400px]"
          >
            <div ref={mapContainerRef} className="absolute inset-0" />
            <iframe
              key={`${selectedRegion.id}-${selectedCategory.id}`}
              src={mapEmbedUrl}
              title={`Mapa de parceiros - ${selectedCategory.label} em ${selectedRegion.label}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full"
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-xl bg-surface-container/80 px-4 py-3 backdrop-blur-md">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/80 sm:text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                {selectedCategory.label} em {selectedRegion.label}
              </div>
              <a
                href={mapListUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-white transition hover:text-primary"
              >
                <MapPin className="h-4 w-4 text-primary" />
                Ver lista completa
              </a>
            </div>
          </Reveal>
        ) : null}

        {/* Encarte/criativo fica DEPOIS do mapa: pedido do parceiro ("criativo abaixo do GPS"). */}
        {primaryPartner?.flyer ? (
          <>
            <Reveal from="up" className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-surface-container-low shadow-2xl">
              <button type="button" onClick={() => flyerDialogRef.current?.showModal()} className="block w-full">
                <img
                  src={primaryPartner.flyer}
                  alt={`Encarte de ofertas do ${primaryPartner.name}`}
                  className="w-full"
                />
              </button>
              <p className="px-4 py-3 text-center text-xs text-outline">Toque para ampliar</p>
            </Reveal>

            {/* <dialog> nativo: Esc para fechar e focus trap sem código extra */}
            <dialog
              ref={flyerDialogRef}
              onClick={(event) => {
                if (event.target === flyerDialogRef.current) flyerDialogRef.current.close()
              }}
              className="relative max-w-none bg-transparent p-0 backdrop:bg-black/85"
            >
              <button
                type="button"
                onClick={() => flyerDialogRef.current?.close()}
                aria-label="Fechar encarte"
                className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/75 text-white ring-1 ring-white/25 transition hover:bg-black"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="max-h-[92vh] max-w-[96vw] overflow-auto rounded-2xl">
                <img
                  src={primaryPartner.flyer}
                  alt={`Encarte de ofertas do ${primaryPartner.name}`}
                  className="block max-w-none"
                />
              </div>
            </dialog>
          </>
        ) : null}

        {visibleCategories.length && visibleRegions.length && primaryPartner && !canShowPrimaryMap ? (
          <Reveal from="up" className="mt-8 rounded-3xl border border-secondary/30 bg-secondary/10 p-5 text-center">
            <p className="text-sm text-white/80">
              Este parceiro atende com contato direto. Fale pelo telefone ou WhatsApp para combinar seu atendimento.
            </p>
          </Reveal>
        ) : null}

        {categoryPartners.length ? (
          <div className="mt-6 flex flex-col gap-4">
            {categoryPartners.map((partner) => {
              const whatsappLink = getWhatsAppLink(partner.phone)
              const hasAddress = !forceContactOnly && Boolean(partner.address?.trim())
              const partnerMapQuery = partner.mapQuery || `${partner.address || ''} ${partner.city || ''}`.trim()
              const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partnerMapQuery)}`
              const title = partner.name
              const serviceTag = partner.category || 'Atendimento'
              const discountText = partner.discount ? `Desconto: ${partner.discount}` : null
              return (
                <article
                  key={partner.id}
                  className={`rounded-2xl border p-3 sm:p-4 ${
                    hasAddress ? 'col-span-2' : 'col-span-1'
                  } ${
                    hasAddress
                      ? 'border-white/10 bg-surface-container-low'
                      : 'border-emerald-400/25 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.2),transparent_45%),linear-gradient(145deg,#0b1323_0%,#0a1422_100%)] shadow-[0_0_24px_rgba(16,185,129,0.12)]'
                  }`}
                >
                  {hasAddress ? (
                    <>
                      <p translate="no" className="notranslate text-sm font-bold text-white">{title}</p>
                      <p translate="no" className="notranslate mt-1 text-xs text-slate-300">{serviceTag}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {discountText ? (
                          <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-300">
                            {discountText}
                          </span>
                        ) : null}
                      </div>
                      {partner.note ? (
                        <p className="mt-2 whitespace-pre-line rounded-lg border border-yellow-400/25 bg-yellow-400/10 px-3 py-2 text-xs leading-relaxed text-yellow-200">
                          {partner.note}
                        </p>
                      ) : null}
                      <div className="mt-3 space-y-2 text-xs">
                        <a
                          href={mapsLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-slate-200 transition hover:text-primary"
                        >
                          <MapPin className="h-4 w-4 text-primary" />
                          {partner.address}
                        </a>
                        {whatsappLink ? (
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-lg px-3 py-2 text-secondary transition hover:brightness-110"
                          >
                            WhatsApp: {partner.phone}
                          </a>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-300/25 sm:h-14 sm:w-14">
                          <Car className="h-5 w-5 text-emerald-300 sm:h-7 sm:w-7" />
                        </div>
                        <div className="min-w-0">
                          <p translate="no" className="notranslate truncate text-lg font-semibold leading-none text-white/95 sm:text-2xl">{title}</p>
                          <p translate="no" className="notranslate mt-1 text-xs text-white/70 sm:text-sm">{serviceTag}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {partner.comingSoon ? null : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-300">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                Online
                              </span>
                            )}
                            {discountText ? (
                              <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-300">
                                {discountText}
                              </span>
                            ) : null}
                            {partner.note ? (
                              <span className="rounded-full bg-yellow-400/15 px-2 py-1 text-xs font-semibold text-yellow-300">
                                {partner.note}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      {partner.comingSoon ? (
                        <span className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-base font-semibold text-on-surface-variant sm:px-4 sm:py-3 sm:text-lg">
                          Em breve
                        </span>
                      ) : whatsappLink ? (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/45 bg-emerald-500/10 px-3 py-2.5 text-base font-semibold text-emerald-300 transition hover:bg-emerald-500/20 sm:px-4 sm:py-3 sm:text-lg"
                        >
                          <MessageCircle className="h-5 w-5" />
                          Conversar
                        </a>
                      ) : null}
                    </>
                  )}
                </article>
              )
            })}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function RegistrationSection({
  onRegistrationSuccess,
}: {
  onRegistrationSuccess: (session: UserSession) => void
}) {
  const [mainForm, setMainForm] = useState({
    fullName: '',
    cpf: '',
    email: '',
    phone: '',
    cep: '',
    city: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [statusCpf, setStatusCpf] = useState('')
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [statusValue, setStatusValue] = useState('PENDENTE')

  const statusColorClass =
    statusValue === 'ATIVO'
      ? 'bg-secondary shadow-[0_0_8px_#4ae183]'
      : statusValue === 'BLOQUEADO'
        ? 'bg-error shadow-[0_0_8px_#ff6b6b]'
        : 'bg-tertiary shadow-[0_0_8px_#fabd00]'

  const submitRegistration = async () => {
    setSaveError(null)
    setSaveMessage(null)
    setIsSaving(true)

    const cpfDigits = onlyDigits(mainForm.cpf)
    if (!mainForm.fullName.trim() || cpfDigits.length !== 11 || !mainForm.email.trim() || !mainForm.phone.trim()) {
      setSaveError('Preencha nome, CPF válido, e-mail e telefone.')
      setIsSaving(false)
      return
    }

    try {
      const response = await fetch(`${functionsBase}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: mainForm.fullName.trim(),
          cpf: cpfDigits,
          email: mainForm.email.trim().toLowerCase(),
          phone: mainForm.phone.trim(),
          cep: mainForm.cep.trim(),
          city: mainForm.city.trim(),
        }),
      })

      const data = await readApiBody(
        response,
        'Servidor indisponível no momento. Tente novamente em instantes.',
      )

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar cadastro.')
      }

      setSaveMessage('Cadastro realizado com sucesso. Redirecionando para seu acesso...')
      setStatusCpf(formatCpf(cpfDigits))
      setStatusValue(data.registration?.status || 'PENDENTE')
      const session: UserSession = {
        cpf: cpfDigits,
        fullName: mainForm.fullName.trim(),
        status: data.registration?.status || 'PENDENTE',
        createdAt: Date.now(),
      }
      window.localStorage.setItem('euplus-user-session', JSON.stringify(session))
      onRegistrationSuccess(session)
      setTimeout(() => {
        window.location.hash = '/boas-vindas'
      }, 600)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Erro ao salvar cadastro.')
    } finally {
      setIsSaving(false)
    }
  }

  const checkStatus = async () => {
    setStatusError(null)
    setIsCheckingStatus(true)

    try {
      const response = await fetch(`${functionsBase}/status?cpf=${encodeURIComponent(statusCpf)}`)
      const data = await readApiBody(
        response,
        'Não foi possível consultar o status agora. Recarregue a página e tente novamente.',
      )

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao consultar status.')
      }

      setStatusValue(data.registration?.status || 'PENDENTE')
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Erro ao consultar status.')
    } finally {
      setIsCheckingStatus(false)
    }
  }

  return (
    <section id="cadastro" className="relative overflow-hidden bg-surface px-4 py-16 sm:px-6 sm:py-24">
      <div className="absolute right-0 top-0 hidden h-full w-1/3 translate-x-1/2 -skew-x-12 transform bg-primary-container/10 md:block" />

      <div className="relative z-10 mx-auto w-full max-w-md sm:max-w-6xl xl:max-w-7xl">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)] xl:gap-12 2xl:gap-16">
          <Reveal from="left" className="min-w-0 space-y-12">
            <div className="space-y-4">
              <h2 className="font-headline text-3xl font-bold sm:text-4xl md:text-5xl">Inicie sua Jornada</h2>
              <div className="space-y-4 text-base leading-relaxed text-on-surface-variant sm:text-lg">
                <p>Após preencher o cadastro, clique em 'Finalizar Cadastro' e realize o pagamento.</p>
                <p>
                  Via Pix: 67.135.611/0001-18 (Obe Daniel Silemcieux). Envie o comprovante para um destes contatos:
                </p>
                {/* Números clicáveis: abrem o WhatsApp já com o assunto certo (comprovante). */}
                <ul className="space-y-2">
                  {contatosPagamento.map((contato) => (
                    <li key={contato.phone}>
                      <a
                        href={getWhatsAppLink(contato.phone, MENSAGEM_COMPROVANTE) ?? undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-2 font-semibold text-secondary transition hover:bg-secondary/20"
                      >
                        <MessageCircle className="h-4 w-4" />
                        {contato.name} — {contato.phone}
                      </a>
                    </li>
                  ))}
                </ul>
                <p>Parcelado em 12x de R$ 14,90 · à vista R$ 99,90</p>
                <p>Pagamento confirmado, em até 4 horas já poderá usar a plataforma no comércio cadastrado.</p>
              </div>
            </div>

            <form className="space-y-5">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-outline">
                    Nome do Titular
                  </label>
                  <input
                    className="w-full rounded-xl border-none bg-surface-container-highest p-4 text-on-surface transition-all focus:ring-2 focus:ring-primary/30"
                    placeholder="Nome Completo"
                    type="text"
                    value={mainForm.fullName}
                    onChange={(event) => setMainForm((prev) => ({ ...prev, fullName: event.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-outline">CPF</label>
                  <input
                    className="w-full rounded-xl border-none bg-surface-container-highest p-4 text-on-surface transition-all focus:ring-2 focus:ring-primary/30"
                    placeholder="000.000.000-00"
                    type="text"
                    value={mainForm.cpf}
                    onChange={(event) =>
                      setMainForm((prev) => ({ ...prev, cpf: formatCpf(event.target.value) }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-outline">E-mail</label>
                  <input
                    className="w-full rounded-xl border-none bg-surface-container-highest p-4 text-on-surface transition-all focus:ring-2 focus:ring-primary/30"
                    placeholder="seu@email.com"
                    type="email"
                    value={mainForm.email}
                    onChange={(event) => setMainForm((prev) => ({ ...prev, email: event.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-outline">Telefone</label>
                  <input
                    className="w-full rounded-xl border-none bg-surface-container-highest p-4 text-on-surface transition-all focus:ring-2 focus:ring-primary/30"
                    placeholder="(00) 00000-0000"
                    type="tel"
                    value={mainForm.phone}
                    onChange={(event) => setMainForm((prev) => ({ ...prev, phone: formatPhone(event.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-outline">CEP</label>
                  <input
                    className="w-full rounded-xl border-none bg-surface-container-highest p-4 text-on-surface transition-all focus:ring-2 focus:ring-primary/30"
                    placeholder="00000-000"
                    type="text"
                    value={mainForm.cep}
                    onChange={(event) => setMainForm((prev) => ({ ...prev, cep: event.target.value }))}
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-outline">Cidade</label>
                  <input
                    className="w-full rounded-xl border-none bg-surface-container-highest p-4 text-on-surface transition-all focus:ring-2 focus:ring-primary/30"
                    placeholder="Sua Cidade"
                    type="text"
                    value={mainForm.city}
                    onChange={(event) => setMainForm((prev) => ({ ...prev, city: event.target.value }))}
                  />
                </div>
              </div>

              <button
                type="button"
                className="w-full rounded-xl bg-secondary-container py-4 font-bold text-on-secondary shadow-lg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={submitRegistration}
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : 'Finalizar Cadastro'}
              </button>
            </form>
            {saveMessage && <p className="text-sm font-medium text-secondary">{saveMessage}</p>}
            {saveError && <p className="text-sm font-medium text-error">{saveError}</p>}
          </Reveal>

          <Reveal id="alunos" from="right" className="min-w-0 space-y-12">
            <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-low p-6 shadow-xl shadow-black/20 sm:p-8">
              <h4 className="mb-6 font-headline font-bold">Consulta de Status</h4>
              <div className="flex flex-col gap-4 sm:flex-row">
                <input
                  className="flex-1 rounded-xl border-none bg-surface-container-highest p-4 text-on-surface focus:ring-2 focus:ring-primary/20"
                  placeholder="Consultar CPF"
                  type="text"
                  value={statusCpf}
                  onChange={(event) => setStatusCpf(formatCpf(event.target.value))}
                />
                <button
                  type="button"
                  className="rounded-xl bg-primary-container px-6 py-3 font-bold text-primary transition-colors hover:bg-primary-container/80 disabled:cursor-not-allowed disabled:opacity-70 sm:py-0"
                  onClick={checkStatus}
                  disabled={isCheckingStatus}
                >
                  {isCheckingStatus ? 'Consultando...' : 'Verificar'}
                </button>
              </div>
              {statusError && <p className="mt-3 text-xs text-error">{statusError}</p>}

              <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl bg-surface-container-highest p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Fingerprint className="h-4 w-4 text-outline" />
                  <span className="text-sm font-medium">Situação do Cadastro</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${statusColorClass}`} />
                  <span className="text-xs font-black tracking-widest text-secondary">{statusValue}</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function OfferSection() {
  const carouselRef = useRef<HTMLDivElement | null>(null)
  const [activeOfferIndex, setActiveOfferIndex] = useState(0)

  const scrollToOffer = (index: number) => {
    const nextIndex = (index + offers.length) % offers.length
    setActiveOfferIndex(nextIndex)

    const carousel = carouselRef.current
    const nextCard = carousel?.children.item(nextIndex) as HTMLElement | null
    nextCard?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
  }

  const handleOfferScroll = () => {
    const carousel = carouselRef.current
    if (!carousel) return

    const cards = Array.from(carousel.children) as HTMLElement[]
    const closestCard = cards.reduce(
      (closest, card, index) => {
        const distance = Math.abs(card.offsetLeft - carousel.scrollLeft)
        return distance < closest.distance ? { index, distance } : closest
      },
      { index: 0, distance: Number.POSITIVE_INFINITY },
    )

    setActiveOfferIndex(closestCard.index)
  }

  return (
    <section id="promocoes" className="bg-surface-container-lowest px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto w-full max-w-md sm:max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span className="text-3xl sm:text-4xl">🔥</span>
            <h2 className="font-headline text-3xl font-black uppercase italic tracking-tighter sm:text-4xl">OFERTA DO DIA</h2>
            <div className="hidden h-px flex-1 bg-gradient-to-r from-error/50 to-transparent sm:block" />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              aria-label="Oferta anterior"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-surface-container text-on-surface transition-colors hover:bg-secondary-container hover:text-on-secondary"
              onClick={() => scrollToOffer(activeOfferIndex - 1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Próxima oferta"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-surface-container text-on-surface transition-colors hover:bg-secondary-container hover:text-on-secondary"
              onClick={() => scrollToOffer(activeOfferIndex + 1)}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="no-scrollbar flex w-full snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 sm:gap-5 md:gap-6"
          onScroll={handleOfferScroll}
        >
          {offers.map((offer, index) => (
            <div
              key={`${offer.title}-${index}`}
              aria-label={`${index + 1} de ${offers.length}: ${offer.title}`}
              className="group relative min-w-full snap-start rounded-[1.5rem] border border-white/10 bg-surface-container p-3.5 sm:min-w-[calc(50%-0.625rem)] md:min-w-[calc(50%-0.75rem)] md:p-4 lg:min-w-[calc(33.333%-1rem)] xl:min-w-[calc(25%-1.125rem)]"
            >
              <div className="mb-6 aspect-square overflow-hidden rounded-2xl bg-surface-container-highest">
                <img
                  alt={offer.title}
                  className="h-full w-full object-contain"
                  src={offer.image}
                />
              </div>

              <div className={`absolute right-5 top-5 rounded-full px-3 py-1.5 text-xs font-black shadow-lg md:right-6 md:top-6 md:px-4 md:py-2 md:text-base ${offer.badgeClass}`}>
                {offer.badge}
              </div>

              <div className="px-4 pb-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-outline">{offer.tag}</p>
                <h3 className="mb-4 font-headline text-xl font-bold text-on-surface">{offer.title}</h3>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    {offer.oldPrice ? (
                      <p className="text-xs text-outline line-through">{offer.oldPrice}</p>
                    ) : null}
                    <p className="text-2xl font-black leading-tight text-secondary">{offer.price}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Ver oferta ${offer.title}`}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container-highest transition-colors hover:bg-secondary-container hover:text-on-secondary"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {offers.map((offer, index) => (
            <button
              key={`indicator-${offer.title}-${index}`}
              type="button"
              aria-label={`Ir para oferta ${offer.title}`}
              className={`h-2.5 rounded-full transition-all ${
                index === activeOfferIndex ? 'w-8 bg-secondary' : 'w-2.5 bg-outline/40 hover:bg-outline'
              }`}
              onClick={() => scrollToOffer(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function StudyMessageSection() {
  return (
    <section className="bg-[#151a21] px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto grid w-full max-w-md items-center gap-8 sm:max-w-7xl lg:grid-cols-2">
        <Reveal from="up" className="space-y-5">
          <h3 className="font-headline text-3xl font-bold text-white sm:text-4xl">
            Enquanto você ganha, nós estudamos.
          </h3>
          <p className="max-w-xl text-on-surface-variant">
            Cruzamos comportamento de consumo, categorias essenciais e oportunidades reais para transformar economia diária
            em construção de patrimônio.
          </p>
        </Reveal>

        <Reveal from="right" className="relative">
          <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-emerald-400/20 blur-2xl" />
          <img
            src={studentsPhotoSrc}
            alt="Casal de estudantes em ambiente universitário"
            className="relative z-10 h-[280px] w-full rounded-3xl border border-white/10 object-cover shadow-2xl sm:h-[360px]"
            loading="lazy"
          />
        </Reveal>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-slate-950 to-[#010718] pb-10 pt-14 sm:pt-20">
      <div className="mx-auto max-w-7xl border-t border-white/5 px-4 pt-10 sm:px-6 sm:pt-12">
        <Reveal from="up" className="mx-auto mb-4 flex max-w-2xl flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/40 p-5 text-sm text-slate-300 sm:text-base">
          <div className="flex items-center">
            <img
              src={brandLogoSrc}
              alt="Euplus"
              className="h-12 w-auto object-contain sm:h-14"
              loading="lazy"
            />
          </div>
          <p>
            E-mail: <a className="text-primary hover:underline" href="mailto:sac@euplus.com.br">sac@euplus.com.br</a>
          </p>
          <p>CNPJ: 65.688.963/0001-75</p>
          <p className="text-xs text-slate-400">© 2024 Euplus Inteligência Financeira. Todos os direitos reservados.</p>
        </Reveal>
      </div>
    </footer>
  )
}

type UserSession = {
  cpf: string
  fullName: string
  status: string
  createdAt: number
}

const getStoredUserSession = (): UserSession | null => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem('euplus-user-session')
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserSession
  } catch {
    return null
  }
}

function WelcomePage() {
  return (
    <div translate="no" className="notranslate min-h-screen bg-surface px-4 py-20 text-on-surface sm:px-6">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-surface-container p-8 text-center shadow-2xl shadow-black/25 sm:p-12">
        <h1 className="font-headline text-4xl font-bold text-white sm:text-5xl">Aí sim!</h1>
        <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
          Cadastro concluído com sucesso. Em até 4 horas você já pode utilizar seus benefícios.
        </p>
      </div>
    </div>
  )
}

function App() {
  const [, setUserSession] = useState<UserSession | null>(() => getStoredUserSession())
  const [hashPath, setHashPath] = useState(() => {
    if (typeof window === 'undefined') return ''
    const raw = window.location.hash.replace(/^#/, '')
    return raw.startsWith('/') ? raw : ''
  })

  useEffect(() => {
    const onHashChange = () => {
      const raw = window.location.hash.replace(/^#/, '')
      setHashPath(raw.startsWith('/') ? raw : '')
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const isAdminOrInternalPath =
    hashPath === '/login-admin' ||
    hashPath === '/consulta-status-cpf' ||
    hashPath.startsWith('/admin')

  if (isAdminOrInternalPath) {
    return <DashboardApp />
  }
  if (hashPath === '/boas-vindas') {
    return <WelcomePage />
  }

  return (
    <div translate="no" className="notranslate scroll-smooth">
      <TopNavbar />
      <AnimatedBanner />
      <WelcomeBand />
      <SimulatorSection />
      <PartnerSection />
      <RegistrationSection onRegistrationSuccess={setUserSession} />
      <OfferSection />
      <StudyMessageSection />
      <Footer />
    </div>
  )
}

export default App
