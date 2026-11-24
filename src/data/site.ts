// Dati generali del sito: modificali qui, valgono per tutte le pagine.

export const site = {
  nome: "Hospital Divina Providência",
  sigla: "HDP",
  descricao:
    "Hospital da Obra da Divina Providência em Luanda: urgência 24 horas, internamento, consultas de especialidade e uma rede de centros de saúde no Município de Kilamba Kiaxi.",
  morada: "Avenida Pedro de Castro Van Dunem, S/N, Bairro Golf, Município de Kilamba Kiaxi, Luanda, Angola",
  mapa: "https://maps.app.goo.gl/MUC1PeFY3kJiVYa28",
  telefone: "+244 916 025 301",
  email: "geral@hospitaldivinaprovidencia.net",
  horario: [
    { local: "Unidade Central (urgência)", horas: "Todos os dias, 24 horas" },
    { local: "Postos periféricos", horas: "Segunda a sexta, 7:30 – 15:00" },
  ],
  contactos: [
    { nome: "Atendimento e Secretaria Geral", telefone: "+244 916 025 301", email: "geral@hospitaldivinaprovidencia.net" },
    { nome: "Centro Nutricional Terapêutico", telefone: "+244 914 256 499 / 929 424 311" },
    { nome: "Centro HIV", telefone: "+244 911 144 634" },
    { nome: "Centro de Tuberculose", telefone: "+244 997 825 346 / 935 568 545" },
  ],
};

// Menu principale: le voci con `section` mostrano anche le sottopagine
export const menu = [
  { label: "Início", href: "/" },
  { label: "Quem Somos", href: "/quem-somos/" },
  { label: "Rede Sanitária", href: "/rede-sanitaria/" },
  { label: "Serviços", href: "/servicos/" },
  { label: "Como Colaborar", href: "/como-colaborar/" },
  { label: "Contactos", href: "/contactos/" },
];
