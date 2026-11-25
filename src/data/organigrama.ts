export interface Unidade {
  nome: string;
  unidades?: Unidade[];
}

const unidade = (nome: string, ...unidades: Unidade[]): Unidade => ({ nome, unidades });
const servicos = (...nomes: string[]): Unidade[] => nomes.map((nome) => unidade(nome));

export const apoio = [
  "Conselho de Direcção",
  "Assessoria Jurídica",
  "Secretariado de Direcção",
  "Gabinete do Utente",
  "Relações Públicas",
  "Pastoral da Saúde",
];

export const comissoes = [
  "Comissão Científica / Formação",
  "Comissão de Ética e Deontologia",
  "Comissão de Infecções Hospitalares",
  "Padronização de Medicamentos",
  "Comissão Comunitária",
  "Comissão de Prevenção de Acidentes",
  "Comissão de Óbitos Hospitalares",
  "Auditoria Clínica",
];

export const direccoes = [
  {
    nome: "Direcção Clínica",
    director: "Director Clínico",
    apoio: ["Conselho Clínico"],
    unidades: [
      unidade("Departamento de Serviços de Internamento",
        unidade("Medicina e Especialidades Médicas", unidade("Cuidados Intensivos")),
        unidade("Infecciologia"),
        unidade("Pediatria", unidade("Cuidados Intermediários")),
        unidade("Centro Nutricional Terapêutico"),
      ),
      unidade("Departamento de Serviços de Emergência e Ambulatório",
        unidade("Consultas Externas", unidade("Unidade de Observação")),
        ...servicos("Consultas Externas de Especialidade", "Centro Nutricional de Seguimento", "Pequena Cirurgia"),
      ),
      unidade("Departamento de Serviços de Diagnóstico",
        ...servicos("Conselho Técnico", "Laboratórios", "Exames Gráficos", "Farmácia — Supervisão Técnica", "Hemoterapia"),
        unidade("Imagiologia", ...servicos("Ecografia", "Radiologia")),
      ),
      unidade("Centro de Tratamento de TBC"),
      unidade("Centro de Tratamento de HIV/SIDA"),
      unidade("Serviços Ambulatórios Periféricos",
        ...servicos(
          "Centro Médico São Marcos",
          "Centro de Saúde São João Calábria",
          "Centro de Saúde Nossa Senhora da Paz",
          "Centro de Saúde Santa Catarina",
          "Centro de Saúde Santa Teresinha",
        ),
      ),
    ],
  },
  {
    nome: "Direcção de Enfermagem",
    director: "Director de Enfermagem",
    apoio: ["Conselho de Enfermagem", "Secretariado Operativo"],
    unidades: [
      unidade("Superintendência",
        ...servicos(
          "Ambulatório HDP",
          "Ambulatório dos Centros de Saúde",
          "Consultas Externas de Especialidade",
          "Internamentos",
          "Pequena Cirurgia",
          "Ambulatório TB",
          "Ambulatório HIV/SIDA",
          "Acção Social",
          "Formação",
        ),
      ),
    ],
  },
  {
    nome: "Direcção Administrativa",
    director: "Director Administrativo",
    apoio: ["Conselho Administrativo", "Secretariado Operativo"],
    unidades: [
      unidade("Departamento de Recursos Humanos", ...servicos("Pessoal", "Processamento de Efectividades e Salários")),
      unidade("Departamento de Planeamento e Gestão Financeira",
        ...servicos("Contabilidade / Orçamento", "Tesouraria", "Processamento de Pagamento de Salários"),
      ),
      unidade("Serviço de Admissão e Estatística Médica", ...servicos("Registo de Pacientes", "Arquivo")),
      unidade("Dados Estatísticos"),
      unidade("Secretaria Geral"),
      unidade("Assistência Social"),
      unidade("Departamento de Equipamento e Instalações", ...servicos("Património", "Manutenção")),
      unidade("CED — Centro Informático", ...servicos("Helpdesk", "Comunicações")),
      unidade("Logística / Aprovisionamento", ...servicos("Compras — Fornecedores", "Armazéns", "Farmácias")),
      unidade("Serviços Gerais",
        ...servicos("Limpeza", "Transporte", "Segurança", "Morgue", "Nutrição e Dietética", "Lavandaria / Rouparia"),
      ),
      unidade("Projectos e Desenvolvimento"),
    ],
  },
];
