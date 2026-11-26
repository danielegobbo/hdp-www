export interface UnidadeDaRede {
  nome: string;
  abreviatura: string;
  slug: string;
  posicao: [number, number];
  posicaoAproximada?: boolean;
  nota?: string;
  encerrada?: boolean;
}

export const unidadeCentral: UnidadeDaRede = {
  nome: "Hospital Divina Providência",
  abreviatura: "HDP",
  slug: "hospital-divina-providencia",
  posicao: [-8.876806, 13.268453],
};

// As posições assinaladas como aproximadas foram medidas no mapa histórico (88-1.png).
export const unidadesPerifericas: UnidadeDaRede[] = [
  { nome: "Centro Médico São João Calábria", abreviatura: "SJC", slug: "centro-medico-sao-joao-calabria", posicao: [-8.864, 13.249], posicaoAproximada: true, nota: "Laboratório e farmácia" },
  { nome: "Posto Médico Nossa Senhora da Paz", abreviatura: "NSP", slug: "posto-medico-nossa-senhora-da-paz", posicao: [-8.880599132795126, 13.253043275127462], nota: "Laboratório e farmácia" },
  { nome: "Posto Médico Santa Catarina", abreviatura: "SC", slug: "posto-medico-santa-catarina", posicao: [-8.876, 13.276], posicaoAproximada: true },
  { nome: "Posto Médico Santa Teresinha", abreviatura: "ST", slug: "posto-medico-santa-terezinha", posicao: [-8.87164302174692, 13.26155238429675], nota: "Encerrado por falta de recursos e pessoal", encerrada: true },
  { nome: "Centro Médico São Marcos", abreviatura: "SM", slug: "centro-medico-sao-marcos", posicao: [-8.879, 13.293], posicaoAproximada: true, nota: "Laboratório, farmácia e oftalmologia" },
];

export const unidadesDaRede = [unidadeCentral, ...unidadesPerifericas];

export const servicosCentrais = [
  "Ambulatórios",
  "Centro de HIV/SIDA",
  "Centro de Tuberculose",
  "Centro Nutricional de Seguimento (CNS)",
  "Laboratório de Análises",
  "Farmácia",
  "Imagiologia",
  "Consultas de Especialidade",
  "Hemoterapia",
  "Internamento de Pediatria",
  "Internamento de Medicina e Doenças Infecciosas",
  "Centro Nutricional Terapêutico (CNT)",
];
