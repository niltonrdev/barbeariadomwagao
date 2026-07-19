// Dados fictícios da demonstração da Dom Wagão Barbearia.
// Tudo aqui é apenas para apresentação — nenhum dado real é usado.

const AGORA = Date.now();
const DIA = 24 * 60 * 60 * 1000;

const iso = (ms) => new Date(ms).toISOString();
// Data de nascimento com um mês/dia específicos (ano fixo só ilustrativo).
const nasc = (ano, mes, dia) => iso(new Date(ano, mes - 1, dia).getTime());

const hoje = new Date();
const MES_ATUAL = hoje.getMonth() + 1;

export const BARBEIROS = [
  {
    id: "b-wagao",
    nome: "Wagão",
    papel: "dono",
    apelido: "Dom Wagão",
    comissao: 1, // dono fica com 100%
    cor: "#d4af37",
  },
  {
    id: "b-leozinho",
    nome: "Leozinho",
    papel: "funcionario",
    apelido: "Léo",
    comissao: 0.5,
    cor: "#7aa2f7",
  },
  {
    id: "b-walisson",
    nome: "Walisson",
    papel: "funcionario",
    apelido: "Wal",
    comissao: 0.5,
    cor: "#7bd88f",
  },
];

export const SERVICOS = [
  { id: "s-corte", nome: "Degradê", preco: 30, duracao: 30 },
  { id: "s-maquina", nome: "Corte na Máquina", preco: 20, duracao: 20 },
  { id: "s-barba", nome: "Barba", preco: 20, duracao: 20 },
  { id: "s-combo", nome: "Degradê + Barba", preco: 45, duracao: 45 },
  { id: "s-pezinho", nome: "Pézinho / Acabamento", preco: 10, duracao: 10 },
  { id: "s-sobrancelha", nome: "Sobrancelha", preco: 10, duracao: 10 },
  { id: "s-infantil", nome: "Corte Infantil", preco: 25, duracao: 30 },
];

export const PRODUTOS = [
  { id: "p-pomada", nome: "Pomada Modeladora", preco: 35 },
  { id: "p-oleo", nome: "Óleo para Barba", preco: 40 },
  { id: "p-shampoo", nome: "Shampoo Premium", preco: 30 },
  { id: "p-minoxidil", nome: "Minoxidil", preco: 60 },
];

export const PLANOS = [
  {
    id: "plano-mensal",
    nome: "Mensal",
    periodo: "mensal",
    preco: 120,
    descricao: "Cortes ilimitados no mês + 1 barba por semana.",
    cobranca: "Cobrado todo mês no cartão.",
  },
  {
    id: "plano-semestral",
    nome: "Semestral",
    periodo: "semestral",
    preco: 650,
    descricao: "6 meses de cortes ilimitados. Economize 2 meses.",
    cobranca: "Pode pagar à vista (PIX) ou parcelado no cartão.",
  },
  {
    id: "plano-anual",
    nome: "Anual",
    periodo: "anual",
    preco: 1200,
    descricao: "1 ano de cortes ilimitados + brindes exclusivos.",
    cobranca: "Valor anual dividido em 12x no cartão.",
  },
];

// Clientes fictícios
export const CLIENTES = [
  {
    id: "c-1",
    nome: "Carlos Mendes",
    telefone: "11987650001",
    email: "carlos.mendes@email.com",
    nascimento: nasc(1990, MES_ATUAL, hoje.getDate()), // aniversariante de hoje
    frequenciaDias: 15,
    criadoEm: iso(AGORA - 200 * DIA),
    ultimoCorte: iso(AGORA - 12 * DIA),
    cortesTotais: 14,
    fidelidade: 4,
    planoId: "plano-anual",
    barbeiroPreferido: "b-wagao",
    cartaoSalvo: { bandeira: "Visa", final: "4321" },
  },
  {
    id: "c-2",
    nome: "Rafael Souza",
    telefone: "11987650002",
    email: "rafael.souza@email.com",
    nascimento: nasc(1995, MES_ATUAL, 22),
    frequenciaDias: 7,
    criadoEm: iso(AGORA - 320 * DIA),
    ultimoCorte: iso(AGORA - 6 * DIA),
    cortesTotais: 41,
    fidelidade: 9,
    planoId: "plano-mensal",
    barbeiroPreferido: "b-leozinho",
    cartaoSalvo: { bandeira: "Mastercard", final: "7788" },
  },
  {
    id: "c-3",
    nome: "Bruno Almeida",
    telefone: "11987650003",
    email: "bruno.almeida@email.com",
    nascimento: nasc(1988, 3, 5),
    frequenciaDias: 30,
    criadoEm: iso(AGORA - 90 * DIA),
    ultimoCorte: iso(AGORA - 51 * DIA), // atrasado
    cortesTotais: 3,
    fidelidade: 3,
    planoId: null,
    barbeiroPreferido: "b-walisson",
    cartaoSalvo: null,
  },
  {
    id: "c-4",
    nome: "Diego Ferreira",
    telefone: "11987650004",
    email: "diego.ferreira@email.com",
    nascimento: nasc(1992, MES_ATUAL, 28),
    frequenciaDias: 15,
    criadoEm: iso(AGORA - 410 * DIA),
    ultimoCorte: iso(AGORA - 30 * DIA), // atrasado (freq 15)
    cortesTotais: 22,
    fidelidade: 2,
    planoId: "plano-semestral",
    barbeiroPreferido: "b-wagao",
    cartaoSalvo: { bandeira: "Elo", final: "1199" },
  },
  {
    id: "c-5",
    nome: "Thiago Ramos",
    telefone: "11987650005",
    email: "thiago.ramos@email.com",
    nascimento: nasc(2000, 9, 14),
    frequenciaDias: 7,
    criadoEm: iso(AGORA - 45 * DIA),
    ultimoCorte: iso(AGORA - 4 * DIA),
    cortesTotais: 6,
    fidelidade: 6,
    planoId: null,
    barbeiroPreferido: "b-leozinho",
    cartaoSalvo: null,
  },
  {
    id: "c-6",
    nome: "Lucas Pereira",
    telefone: "11987650006",
    email: "lucas.pereira@email.com",
    nascimento: nasc(1985, 12, 1),
    frequenciaDias: 30,
    criadoEm: iso(AGORA - 600 * DIA),
    ultimoCorte: iso(AGORA - 20 * DIA),
    cortesTotais: 33,
    fidelidade: 3,
    planoId: "plano-anual",
    barbeiroPreferido: "b-wagao",
    cartaoSalvo: { bandeira: "Visa", final: "9090" },
  },
  {
    id: "c-7",
    nome: "André Lima",
    telefone: "11987650007",
    email: "andre.lima@email.com",
    nascimento: nasc(1998, MES_ATUAL, 3),
    frequenciaDias: 15,
    criadoEm: iso(AGORA - 30 * DIA),
    ultimoCorte: iso(AGORA - 45 * DIA), // atrasado
    cortesTotais: 2,
    fidelidade: 2,
    planoId: null,
    barbeiroPreferido: "b-walisson",
    cartaoSalvo: null,
  },
  {
    id: "c-8",
    nome: "Felipe Nogueira",
    telefone: "11987650008",
    email: "felipe.nogueira@email.com",
    nascimento: nasc(1993, 5, 19),
    frequenciaDias: 7,
    criadoEm: iso(AGORA - 150 * DIA),
    ultimoCorte: iso(AGORA - 5 * DIA),
    cortesTotais: 19,
    fidelidade: 9,
    planoId: "plano-mensal",
    barbeiroPreferido: "b-leozinho",
    cartaoSalvo: { bandeira: "Mastercard", final: "3030" },
  },
];

// Fila inicial (quem já está esperando)
export const FILA = [
  {
    id: "f-1",
    clienteId: "c-2",
    barbeiroId: "b-leozinho",
    servicoId: "s-combo",
    entrouEm: iso(AGORA - 18 * 60 * 1000),
    status: "aguardando",
  },
  {
    id: "f-2",
    clienteId: "c-5",
    barbeiroId: null, // qualquer barbeiro
    servicoId: "s-corte",
    entrouEm: iso(AGORA - 9 * 60 * 1000),
    status: "aguardando",
  },
  {
    id: "f-3",
    clienteId: "c-6",
    barbeiroId: "b-wagao",
    servicoId: "s-corte",
    entrouEm: iso(AGORA - 3 * 60 * 1000),
    status: "aguardando",
  },
];

// Histórico de cortes (inclui alguns de hoje para alimentar os relatórios)
export const CORTES = [
  {
    id: "ct-1",
    clienteId: "c-1",
    barbeiroId: "b-wagao",
    servicoId: "s-combo",
    produtos: ["p-pomada"],
    valor: 80,
    formaPagamento: "pix",
    criadoEm: iso(AGORA - 2 * 60 * 60 * 1000),
    avaliacao: { nota: 5, comentario: "Sempre impecável!" },
    cortesiaFidelidade: false,
  },
  {
    id: "ct-2",
    clienteId: "c-8",
    barbeiroId: "b-leozinho",
    servicoId: "s-corte",
    produtos: [],
    valor: 30,
    formaPagamento: "cartao",
    criadoEm: iso(AGORA - 3 * 60 * 60 * 1000),
    avaliacao: { nota: 5, comentario: "" },
    cortesiaFidelidade: false,
  },
  {
    id: "ct-3",
    clienteId: "c-4",
    barbeiroId: "b-walisson",
    servicoId: "s-corte",
    produtos: ["p-shampoo"],
    valor: 60,
    formaPagamento: "dinheiro",
    criadoEm: iso(AGORA - 5 * 60 * 60 * 1000),
    avaliacao: null,
    cortesiaFidelidade: false,
  },
  {
    id: "ct-4",
    clienteId: "c-6",
    barbeiroId: "b-wagao",
    servicoId: "s-barba",
    produtos: [],
    valor: 20,
    formaPagamento: "pix",
    criadoEm: iso(AGORA - 26 * 60 * 60 * 1000),
    avaliacao: { nota: 4, comentario: "Bom atendimento." },
    cortesiaFidelidade: false,
  },
];

// Assinaturas ativas (planos)
export const ASSINATURAS = [
  {
    id: "as-1",
    clienteId: "c-1",
    planoId: "plano-anual",
    inicio: iso(AGORA - 120 * DIA),
    proximaCobranca: iso(AGORA + 10 * DIA),
    valorParcela: 100,
    status: "ativa",
    metodo: "cartao",
  },
  {
    id: "as-2",
    clienteId: "c-4",
    planoId: "plano-semestral",
    inicio: iso(AGORA - 40 * DIA),
    proximaCobranca: iso(AGORA + 20 * DIA),
    valorParcela: 108.33,
    status: "ativa",
    metodo: "cartao",
  },
  {
    id: "as-3",
    clienteId: "c-6",
    planoId: "plano-anual",
    inicio: iso(AGORA - 300 * DIA),
    proximaCobranca: iso(AGORA + 5 * DIA),
    valorParcela: 100,
    status: "ativa",
    metodo: "cartao",
  },
  {
    id: "as-4",
    clienteId: "c-2",
    planoId: "plano-mensal",
    inicio: iso(AGORA - 60 * DIA),
    proximaCobranca: iso(AGORA + 2 * DIA),
    valorParcela: 120,
    status: "ativa",
    metodo: "cartao",
  },
  {
    id: "as-5",
    clienteId: "c-8",
    planoId: "plano-mensal",
    inicio: iso(AGORA - 25 * DIA),
    proximaCobranca: iso(AGORA + 6 * DIA),
    valorParcela: 120,
    status: "ativa",
    metodo: "cartao",
  },
];

export const MENSAGENS = [
  {
    id: "m-1",
    clienteId: "c-1",
    tipo: "aniversario",
    canal: "whatsapp",
    texto:
      "Parabéns, Carlos! 🎉 A Dom Wagão Barbearia deseja um feliz aniversário. Venha comemorar com um corte por nossa conta neste mês!",
    criadoEm: iso(AGORA - 1 * 60 * 60 * 1000),
    status: "simulada",
  },
];

export function estadoInicial() {
  return {
    barbeiros: BARBEIROS,
    servicos: SERVICOS,
    produtos: PRODUTOS,
    planos: PLANOS,
    clientes: CLIENTES,
    fila: FILA,
    cortes: CORTES,
    assinaturas: ASSINATURAS,
    mensagens: MENSAGENS,
    versao: 1,
  };
}
