export interface UnidadeDaRede {
  nome: string;
  abreviatura: string;
  slug: string;
  posicao: [number, number];
  nota?: string;
  encerrada?: boolean;
}

export const unidadeCentral: UnidadeDaRede = {
  nome: "Hospital Divina Providência",
  abreviatura: "HDP",
  slug: "hospital-divina-providencia",
  posicao: [-8.876395147435874, 13.268005165664476],
};

export const unidadesPerifericas: UnidadeDaRede[] = [
  { nome: "Centro Médico São João Calábria", abreviatura: "SJC", slug: "centro-medico-sao-joao-calabria", posicao: [-8.860727032755117, 13.244776270329032], nota: "Laboratório e farmácia" },
  { nome: "Posto Médico Nossa Senhora da Paz", abreviatura: "NSP", slug: "posto-medico-nossa-senhora-da-paz", posicao: [-8.880599132795126, 13.253043275127462], nota: "Laboratório e farmácia" },
  { nome: "Posto Médico Santa Catarina", abreviatura: "SC", slug: "posto-medico-santa-catarina", posicao: [-8.875285596648588, 13.277176285266185] },
  { nome: "Posto Médico Santa Teresinha", abreviatura: "ST", slug: "posto-medico-santa-terezinha", posicao: [-8.87164302174692, 13.26155238429675], nota: "Encerrado por falta de recursos e pessoal", encerrada: true },
  { nome: "Centro Médico São Marcos", abreviatura: "SM", slug: "centro-medico-sao-marcos", posicao: [-8.879338459923051, 13.29719267520468], nota: "Laboratório, farmácia e oftalmologia" },
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
