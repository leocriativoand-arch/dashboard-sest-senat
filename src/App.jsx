import './index.css';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { 
  BarChart3, Users, FileText, Target, Map, Calendar as CalendarIcon, 
  AlertTriangle, CheckCircle, Info, ChevronDown, Plus, Trash2, Filter,
  ChevronLeft, ChevronRight, ExternalLink, Lock, Unlock, Eye, EyeOff, Save, Undo2, Loader2, Cloud, CloudOff
} from 'lucide-react';

// --- CONFIGURAÇÃO DA NUVEM (FIREBASE) ---
let app, auth, db;
const appId = 'estrategia-digital-app';

// AS SUAS CHAVES REAIS DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCesSfd79Lz16O56V-urPvCxRm9gk-AUH4",
  authDomain: "dashboard-sest-senat.firebaseapp.com",
  projectId: "dashboard-sest-senat",
  storageBucket: "dashboard-sest-senat.firebasestorage.app",
  messagingSenderId: "848076376377",
  appId: "1:848076376377:web:b4abfe39f4f69f028000e8",
  measurementId: "G-9LMYWZQ3R5"
};

app = initializeApp(firebaseConfig);
auth = getAuth(app);
db = getFirestore(app);

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn("Erro ao ligar à nuvem:", e);
}

// --- DADOS INICIAIS (PADRÃO) ---
const editoriasData = {
  CNT: [
    { title: "Representatividade e atuação", desc: "A CNT como voz legítima junto ao poder público. Posicionamentos, eventos, pautas estratégicas.", redes: "Insta, LinkedIn", personas: "Magerson, Marcos" },
    { title: "Dados, estudos e inteligência", desc: "CNT como fonte confiável. Pesquisas, painéis, estudos econômicos.", redes: "Insta, LinkedIn", personas: "Magerson, Fernanda, Ana" },
    { title: "Infraestrutura e competitividade", desc: "Debate sobre gargalos e soluções. Condições das rodovias, investimentos, custos.", redes: "Insta, LinkedIn", personas: "Magerson, Marcos, Fernanda, Ana, Mariana" },
    { title: "Economia e cenários", desc: "Leitura do presente para antecipar o futuro. Análises macroeconômicas e tendências.", redes: "Insta, LinkedIn", personas: "Magerson, Fernanda, Ana" },
    { title: "Pessoas que movem o transporte", desc: "Humanização do setor. Histórias reais, lideranças, impacto no dia a dia.", redes: "Insta, LinkedIn", personas: "Ana, Mariana" }
  ],
  'SEST SENAT': [
    { title: "Emprega Transporte", desc: "Vagas disponíveis, currículos, agendas de feiras. (Mensal)", redes: "LinkedIn, Insta, Face" },
    { title: "Prevenção de Acidentes", desc: "Dicas preventivas e contato para empresas. (Mensal)", redes: "LinkedIn, Insta, Face" },
    { title: "Proteção", desc: "Enfrentamento à exploração sexual de crianças/adolescentes. (Mensal)", redes: "LinkedIn, Insta, Face" },
    { title: "Transporte ESG", desc: "Iniciativas ESG, sustentabilidade, transporte público. (Mensal)", redes: "LinkedIn, Insta, Face" },
    { title: "Saúde em Foco", desc: "Serviços específicos de saúde (facetas, bioimpedância, RPG). (Mensal)", redes: "Insta, Face" },
    { title: "Rota da Qualificação", desc: "Serviços de qualificação e importância de atualização. (Mensal)", redes: "LinkedIn, Insta, Face" },
    { title: "Nós, Elas & Todo Mundo", desc: "Divulgação de episódios da série. (Mensal)", redes: "LinkedIn, Insta, Face" },
    { title: "Transporte e Arte", desc: "Relação entre arte e transporte (música, cinema, literatura). (Mensal)", redes: "LinkedIn, Insta, Face" },
    { title: "Transporte na Mídia", desc: "Notícias externas sobre o setor de transporte. (Mensal)", redes: "LinkedIn, Insta, Face" }
  ],
  ITL: [
    { title: "Inovação na prática", desc: "Como projetos beneficiaram empresas (com imagens/cases). (Mensal)", redes: "LinkedIn, Insta, Face" },
    { title: "ITL Integra", desc: "Atualizações, trabalhos científicos e discussões da plataforma. (Mensal)", redes: "LinkedIn, Insta, Face" },
    { title: "Agenda ITL", desc: "Inscrições, turmas, eventos. (Mensal)", redes: "LinkedIn, Insta, Face" },
    { title: "Biblioteca / Repositório Digital", desc: "Acervo, horários, empréstimos à distância. (Mensal)", redes: "LinkedIn, Insta, Face" },
    { title: "Alumni ITL", desc: "Provas sociais, transformação de carreira, cases de sucesso. (Mensal)", redes: "LinkedIn, Insta, Face" },
    { title: "Transporte na Mídia", desc: "Notícias de outros veículos sobre logística e modais. (Mensal)", redes: "LinkedIn, Insta, Face" }
  ],
  'SISTEMA TRANSPORTE': [
    { title: "Institucional", desc: "Pautas unificadas e estratégicas do Sistema Transporte.", redes: "Todas", personas: "Todas" },
    { title: "Datas Comemorativas", desc: "Feriados e datas relevantes do setor.", redes: "Todas", personas: "Todas" }
  ]
};

const defaultInitialEvents = [
  { id: 1, date: '2026-01-15', orgs: ['CNT'], channels: ['LinkedIn'], editoria: 'Economia e cenários', title: 'Análise do Cenário Econômico Q1', link: 'https://cnt.org.br', status: 'Planejado' },
  { id: 2, date: '2026-01-20', orgs: ['SEST SENAT'], channels: ['Instagram', 'Facebook', 'TikTok'], editoria: 'Saúde em Foco', title: 'Dicas de Postura para Motoristas', link: '', status: 'Planejado' },
  { id: 3, date: '2026-02-10', orgs: ['ITL', 'CNT'], channels: ['LinkedIn'], editoria: 'Inovação na prática', title: 'Case de Sucesso: Logística 4.0', link: '', status: 'Planejado' },
  { id: 4, date: '2026-03-05', orgs: ['SISTEMA TRANSPORTE'], channels: ['YouTube', 'LinkedIn', 'Instagram'], editoria: 'Institucional', title: 'Webinar: O Futuro do Transporte', link: 'https://youtube.com', status: 'Planejado' }
];

const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const weekDays = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
const orgOptions = ['CNT', 'SEST SENAT', 'ITL', 'SISTEMA TRANSPORTE'];
const channelOptions = ['Instagram', 'LinkedIn', 'YouTube', 'Facebook', 'X', 'TikTok'];

// --- COMPONENTES AUXILIARES DE ESTILIZAÇÃO ---
const PlatformCard = ({ idPrefix, defaultName, colorTheme, defaultDesc, isAuthenticated, getEditableProps }) => {
  const themeColors = {
    pink: "bg-pink-200 text-pink-900 border-pink-300", 
    blue: "bg-blue-100 text-blue-900 border-blue-200",
    green: "bg-green-100 text-green-900 border-green-200",
    red: "bg-red-100 text-red-900 border-red-200",
    yellow: "bg-yellow-100 text-yellow-900 border-yellow-300"
  };
  const currentTheme = themeColors[colorTheme] || "bg-slate-100 text-slate-800 border-slate-200";
  return (
    <div className={`p-4 rounded-lg border ${currentTheme}`}>
      <h4 {...getEditableProps(isAuthenticated, `plat_${idPrefix}_title`, defaultName, "font-bold text-lg mb-1")} />
      <p {...getEditableProps(isAuthenticated, `plat_${idPrefix}_desc`, defaultDesc, "text-sm opacity-90 leading-relaxed")} />
    </div>
  );
};

const InstitutionCard = ({ idPrefix, defaultName, defaultDesc, isAuthenticated, getEditableProps }) => (
  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-4">
    <div {...getEditableProps(isAuthenticated, `inst_${idPrefix}_logo`, defaultName.replace(' ', '<br/>'), "bg-blue-600 text-white p-2 rounded w-16 text-center font-bold text-sm flex-shrink-0 leading-tight")} />
    <div>
      <h4 {...getEditableProps(isAuthenticated, `inst_${idPrefix}_title`, defaultName, "font-bold text-slate-800 mb-1")} />
      <p {...getEditableProps(isAuthenticated, `inst_${idPrefix}_desc`, defaultDesc, "text-sm text-slate-600")} />
    </div>
  </div>
);

const CompassIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
);

// --- COMPONENTES DE ABAS ---
const TabPanorama = ({ isAuthenticated, getEditableProps }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <h2 {...getEditableProps(isAuthenticated, "pan_title", "O Cenário Atual", "text-2xl font-bold text-slate-800 mb-4")} />
      <p {...getEditableProps(isAuthenticated, "pan_desc", "A presença digital do Sistema Transporte (CNT, SEST SENAT e ITL) está consolidada em múltiplas plataformas, porém apresenta desempenho desigual e limitações estratégicas relevantes. O engajamento está muito concentrado em um único canal (Instagram), subutilizando o potencial estratégico das outras redes.", "text-slate-600 mb-6 text-lg leading-relaxed")} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex items-start gap-3">
          <Target className="text-purple-600 mt-1 flex-shrink-0" size={24} />
          <div>
            <h4 {...getEditableProps(isAuthenticated, "pan_obj_title", "Objetivos por Canal", "font-semibold text-purple-900")} />
            <p {...getEditableProps(isAuthenticated, "pan_obj_desc", "Necessidade urgente de definir papéis claros para cada rede social.", "text-sm text-purple-800 mt-1")} />
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex items-start gap-3">
          <FileText className="text-purple-600 mt-1 flex-shrink-0" size={24} />
          <div>
            <h4 {...getEditableProps(isAuthenticated, "pan_adapt_title", "Adaptação de Conteúdo", "font-semibold text-purple-900")} />
            <p {...getEditableProps(isAuthenticated, "pan_adapt_desc", "Fim da replicação. Cada plataforma exige um formato e profundidade diferentes.", "text-sm text-purple-800 mt-1")} />
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex items-start gap-3">
          <Users className="text-purple-600 mt-1 flex-shrink-0" size={24} />
          <div>
            <h4 {...getEditableProps(isAuthenticated, "pan_align_title", "Alinhamento de Público", "font-semibold text-purple-900")} />
            <p {...getEditableProps(isAuthenticated, "pan_align_desc", "Ajustar o tom de voz e a linguagem para quem realmente consome a rede.", "text-sm text-purple-800 mt-1")} />
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 className="text-slate-400 flex-shrink-0" /> <span {...getEditableProps(isAuthenticated, "pan_an_plat", "Análise por Plataforma")} />
        </h3>
        <div className="space-y-4">
          <PlatformCard idPrefix="ig" defaultName="Instagram" colorTheme="pink" defaultDesc="Principal canal de desempenho. SEST SENAT lidera com conteúdo prático. CNT com foco institucional (mediano) e ITL com baixo engajamento." isAuthenticated={isAuthenticated} getEditableProps={getEditableProps} />
          <PlatformCard idPrefix="fb" defaultName="Facebook" colorTheme="blue" defaultDesc="Baixo retorno. Usado majoritariamente para replicação de conteúdos sem adaptação." isAuthenticated={isAuthenticated} getEditableProps={getEditableProps} />
          <PlatformCard idPrefix="li" defaultName="LinkedIn" colorTheme="green" defaultDesc="Desempenho baixo frente ao potencial. Foco atual em replicação ao invés de exploração institucional e profissional." isAuthenticated={isAuthenticated} getEditableProps={getEditableProps} />
          <PlatformCard idPrefix="yt" defaultName="YouTube" colorTheme="red" defaultDesc="Baixíssimo retorno. Funciona apenas como repositório pontual de vídeos, sem estratégia de crescimento." isAuthenticated={isAuthenticated} getEditableProps={getEditableProps} />
          <PlatformCard idPrefix="tw" defaultName="X / Twitter" colorTheme="yellow" defaultDesc="Apenas CNT possui perfil ativo, porém inexpressivo. Não cumpre papel estratégico hoje." isAuthenticated={isAuthenticated} getEditableProps={getEditableProps} />
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Map className="text-slate-400 flex-shrink-0" /> <span {...getEditableProps(isAuthenticated, "pan_an_inst", "Análise por Instituição")} />
          </h3>
          <div className="space-y-4">
            <InstitutionCard idPrefix="sest" defaultName="SEST SENAT" defaultDesc="Melhor desempenho geral. Conteúdos acessíveis, úteis e alinhados ao interesse do público. Alta frequência." isAuthenticated={isAuthenticated} getEditableProps={getEditableProps} />
            <InstitutionCard idPrefix="cnt" defaultName="CNT" defaultDesc="Presença consolidada, foco institucional e dados. Desempenho mediano devido à natureza técnica do conteúdo." isAuthenticated={isAuthenticated} getEditableProps={getEditableProps} />
            <InstitutionCard idPrefix="itl" defaultName="ITL" defaultDesc="Menor desempenho. Conteúdo segmentado e técnico (formação/inovação) resulta em menor alcance na estratégia atual." isAuthenticated={isAuthenticated} getEditableProps={getEditableProps} />
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
          <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-orange-500 flex-shrink-0" /> <span {...getEditableProps(isAuthenticated, "pan_crit_title", "Principais Pontos Críticos")} />
          </h3>
          <ul className="space-y-2 text-orange-800">
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" /> <span {...getEditableProps(isAuthenticated, "pan_crit_1", "Baixo engajamento geral, concentrado em poucos canais.", "flex-1")} /></li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" /> <span {...getEditableProps(isAuthenticated, "pan_crit_2", "Ausência de estratégia específica por plataforma.", "flex-1")} /></li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" /> <span {...getEditableProps(isAuthenticated, "pan_crit_3", "Predominância de replicação de conteúdo entre redes.", "flex-1")} /></li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" /> <span {...getEditableProps(isAuthenticated, "pan_crit_4", "Subutilização de LinkedIn e YouTube.", "flex-1")} /></li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" /> <span {...getEditableProps(isAuthenticated, "pan_crit_5", "Desalinhamento entre linguagem, formato e público.", "flex-1")} /></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const TabPersonas = ({ isAuthenticated, getEditableProps }) => {
  const [activeOrg, setActiveOrg] = useState('CNT');

  const personas = {
    CNT: [
      { name: "Magerson", role: "O Líder do Transporte", age: "45-60 anos", desc: "Presidente/diretor de empresa", pain: "Insegurança regulatória, custos elevados, previsibilidade.", seeks: "Representatividade, dados, defesa institucional.", content: "Posicionamentos, estudos, análises de cenário.", tone: "Institucional, estratégico, seguro." },
      { name: "Marcos Andrade", role: "O Político", age: "40-60 anos", desc: "Deputado, senador ou ministro", pain: "Falta de dados técnicos para votos, cobrança da sociedade.", seeks: "Informações técnicas confiáveis, apoio institucional legítimo.", content: "Notas técnicas, impacto econômico, análises legislativas.", tone: "Institucional, técnico mas acessível." },
      { name: "Fernanda", role: "A Gestora Pública", age: "35-55 anos", desc: "Técnica/gestora em órgãos públicos", pain: "Falta de dados integrados, pressão política.", seeks: "Dados confiáveis, boas práticas, diálogo com setor.", content: "Pesquisas, infográficos, casos de impacto.", tone: "Técnico, claro, didático e respeitoso." },
      { name: "Ana", role: "A Comunicadora", age: "28-45 anos", desc: "Jornalista, assessora", pain: "Falta de fontes, linguagem difícil de traduzir.", seeks: "Conteúdos claros, dados oficiais, pautas relevantes.", content: "Releases, dados organizados, posicionamentos.", tone: "Claro, informativo e preciso." },
      { name: "Mariana", role: "A Usuária Conectada", age: "20-40 anos", desc: "Interessada em mobilidade e sustentabilidade", pain: "Transporte precário, impactos ambientais.", seeks: "Entender impactos, informação clara, compromisso social.", content: "Conteúdos educativos, sustentabilidade, inovação.", tone: "Didático, próximo e humano." }
    ],
    'SEST SENAT': [
      { name: "João", role: "O Motorista Profissional", age: "30-55 anos", desc: "Caminhoneiro, motorista de ônibus", pain: "Cansaço, dores, estresse, falta de tempo.", seeks: "Atendimento rápido, soluções práticas, respeito.", content: "Saúde física/mental, alimentação simples, direitos.", tone: "Direto, acolhedor e sem termos técnicos." },
      { name: "Ana", role: "Trabalhadora Administrativa", age: "25-45 anos", desc: "RH, financeiro, logística", pain: "Estresse, sedentarismo, falta de equilíbrio.", seeks: "Bem-estar, desenvolvimento, qualidade de vida.", content: "Saúde mental, atividade física, organização.", tone: "Empático, informativo e inspirador." },
      { name: "Carlos", role: "O Gestor de Transporte", age: "35-60 anos", desc: "Dono ou gestor com equipes", pain: "Absenteísmo, acidentes, baixo engajamento.", seeks: "Equipes saudáveis, redução de custos, produtividade.", content: "Programas do SEST SENAT, indicadores, qualificação.", tone: "Institucional, objetivo e estratégico." },
      { name: "Mariana", role: "Familiar do Trabalhador", age: "28-65 anos", desc: "Esposa, cuidadora", pain: "Preocupação com saúde, dificuldade de acesso a serviços.", seeks: "Atendimento de saúde, orientação preventiva.", content: "Saúde preventiva, serviços gratuitos, bem-estar familiar.", tone: "Acolhedor, próximo e claro." },
      { name: "Rafael", role: "O Jovem em Formação", age: "14-24 anos", desc: "Estudante ou início de carreira", pain: "Insegurança profissional, falta de experiência.", seeks: "Cursos, orientação, primeiro emprego.", content: "Cursos gratuitos, orientação de carreira, futuro do trabalho.", tone: "Motivador, simples e atual." }
    ],
    ITL: [
      { name: "Eduardo", role: "O Sucessor", age: "30-40 anos", desc: "Diretor sucessor em empresa familiar", pain: "Pressão geracional, preparo para decisões estratégicas.", seeks: "Segurança para liderar, visão de longo prazo, networking.", content: "Sucessão, governança, liderança, casos reais.", tone: "Inspirador, estratégico, provocador." },
      { name: "Helena", role: "Líder em Transformação", age: "35-50 anos", desc: "Executiva do setor", pain: "Ambientes tradicionais, pouca representatividade feminina.", seeks: "Desenvolvimento como líder, ferramentas de gestão.", content: "Liderança contemporânea, cultura organizacional.", tone: "Inspirador, humano, confiante." },
      { name: "Roberto", role: "O Gestor Experiente", age: "55-70 anos", desc: "CEO, sócio", pain: "Preparar sucessão, cenários instáveis, falta de tempo.", seeks: "Visão estratégica, preparar próxima geração.", content: "Estratégia, governança, cenários setoriais.", tone: "Institucional, estratégico, seguro." },
      { name: "Lucas", role: "Profissional em Ascensão", age: "25-35 anos", desc: "Coordenador/Gestor inicial", pain: "Insegurança em liderança, pouca vivência estratégica.", seeks: "Acelerar carreira, visão ampla do setor.", content: "Desenvolvimento de carreira, tendências do setor.", tone: "Educativo, acessível e motivador." }
    ]
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex space-x-2 border-b border-slate-200">
        {Object.keys(personas).map(org => (
          <button
            key={org}
            onClick={() => setActiveOrg(org)}
            className={`px-6 py-3 font-semibold text-sm rounded-t-lg transition-colors ${activeOrg === org ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-transparent border-b-0'}`}
          >
            <span {...getEditableProps(isAuthenticated, `pers_tab_${org.replace(/\s/g, '')}`, org)} />
          </button>
        ))}
      </div>

      {Object.keys(personas).map(org => (
        <div key={`grid-${org}`} style={{ display: activeOrg === org ? 'grid' : 'none' }} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {personas[org].map((p, i) => {
            const prx = `pers_${org.replace(/\s/g, '')}_${i}`;
            return (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="bg-slate-50 p-4 border-b border-slate-100">
                  <div className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">
                    <span {...getEditableProps(isAuthenticated, `${prx}_lbl`, `Persona ${i+1}`)} />
                  </div>
                  <h3 {...getEditableProps(isAuthenticated, `${prx}_name`, p.name, "text-xl font-bold text-slate-800")} />
                  <p {...getEditableProps(isAuthenticated, `${prx}_role`, p.role, "text-slate-600 italic font-medium")} />
                </div>
                <div className="p-5 flex-1 space-y-4 text-sm">
                  <div>
                    <strong {...getEditableProps(isAuthenticated, `${prx}_t1`, "Perfil:", "text-slate-700 mr-1")} /> 
                    <span {...getEditableProps(isAuthenticated, `${prx}_v1`, `${p.age} | ${p.desc}`)} />
                  </div>
                  <div>
                    <strong {...getEditableProps(isAuthenticated, `${prx}_t2`, "Dores:", "text-slate-700 block mb-1")} /> 
                    <p {...getEditableProps(isAuthenticated, `${prx}_v2`, p.pain, "text-slate-600")} />
                  </div>
                  <div>
                    <strong {...getEditableProps(isAuthenticated, `${prx}_t3`, "O que busca:", "text-slate-700 block mb-1")} /> 
                    <p {...getEditableProps(isAuthenticated, `${prx}_v3`, p.seeks, "text-slate-600")} />
                  </div>
                  <div>
                    <strong {...getEditableProps(isAuthenticated, `${prx}_t4`, "Conteúdo ideal:", "text-slate-700 block mb-1")} /> 
                    <p {...getEditableProps(isAuthenticated, `${prx}_v4`, p.content, "text-slate-600")} />
                  </div>
                </div>
                <div className="bg-blue-50 p-3 text-sm border-t border-blue-100">
                  <strong {...getEditableProps(isAuthenticated, `${prx}_t5`, "Tom de voz:", "text-blue-900 mr-1")} /> 
                  <span {...getEditableProps(isAuthenticated, `${prx}_v5`, p.tone, "text-blue-800")} />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const TabEditorias = ({ isAuthenticated, getEditableProps }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {Object.entries(editoriasData).map(([org, items]) => (
        <div key={org} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2 flex items-center gap-2">
            <span {...getEditableProps(isAuthenticated, `ed_org_t_${org.replace(/\s/g, '')}`, org)} /> 
            <span {...getEditableProps(isAuthenticated, `ed_org_sub_${org.replace(/\s/g, '')}`, "| Linhas Editoriais", "text-slate-400 font-normal text-lg")} />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((ed, i) => {
              const prx = `ed_c_${org.replace(/\s/g, '')}_${i}`;
              return (
                <div key={i} className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white transition-colors">
                  <h4 {...getEditableProps(isAuthenticated, `${prx}_title`, ed.title, "font-bold text-blue-900 mb-2")} />
                  <p {...getEditableProps(isAuthenticated, `${prx}_desc`, ed.desc, "text-sm text-slate-600 mb-3")} />
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span {...getEditableProps(isAuthenticated, `${prx}_redes`, ed.redes, "bg-blue-100 text-blue-800 px-2 py-1 rounded")} />
                    {ed.personas && <span {...getEditableProps(isAuthenticated, `${prx}_alvo`, `Alvo: ${ed.personas}`, "bg-emerald-100 text-emerald-800 px-2 py-1 rounded truncate max-w-full")} title={ed.personas} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const TabObjetivos = ({ isAuthenticated, getEditableProps }) => {
  const objetivos = [
    {
      org: "CNT",
      items: [
        { title: "Fortalecer autoridade institucional", desc: "Consolidar a CNT como principal representante do transporte evidenciando atuação junto ao poder público.", result: "Aumentar percepção de relevância entre stakeholders.", eds: "Representatividade, Infraestrutura, Economia" },
        { title: "Fonte confiável de informação", desc: "Reforçar papel como referência em dados, estudos e inteligência setorial.", result: "Gerar reconhecimento técnico e estimular uso dos conteúdos.", eds: "Dados/Inteligência, Economia, Segurança" },
        { title: "Ampliar conexão com a sociedade", desc: "Aproximar a CNT traduzindo temas complexos e humanizando o setor.", result: "Aumentar alcance e identificação com a marca.", eds: "Pessoas que movem, Segurança, Infraestrutura (didática)" }
      ]
    },
    {
      org: "SEST SENAT",
      items: [
        { title: "Acesso a trabalho e qualificação", desc: "Posicionar redes como canal de conexão entre profissionais e mercado.", result: "Mais candidatos encaminhados e interesse em cursos.", eds: "Emprega Transporte, Rota da Qualificação" },
        { title: "Promover saúde, segurança e ESG", desc: "Difundir práticas de impacto na qualidade de vida e segurança.", result: "Conscientização, maior procura por saúde e reforço de imagem.", eds: "Prevenção, Saúde, Proteção, ESG" },
        { title: "Fortalecer vínculo com sociedade", desc: "Humanizar comunicação com conteúdos informativos e culturais.", result: "Mais engajamento e proximidade com diferentes públicos.", eds: "Nós Elas, Arte, Mídia" }
      ]
    },
    {
      org: "ITL",
      items: [
        { title: "Referência em inovação", desc: "Evidenciar como projetos do ITL geram impacto real nas empresas.", result: "Aumento da percepção de valor dos programas.", eds: "Inovação na prática, ITL Integra" },
        { title: "Atração para programas educacionais", desc: "Usar redes para divulgar oportunidades e estimular inscrições.", result: "Crescimento de inscritos e uso de recursos.", eds: "Agenda ITL, Biblioteca/Repositório" },
        { title: "Engajamento via provas sociais", desc: "Demonstrar resultados na formação de líderes com casos de sucesso.", result: "Maior confiança na instituição como referência.", eds: "Alumni ITL, Transporte na Mídia" }
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-blue-900 text-white p-8 rounded-xl shadow-md text-center">
        <Target size={48} className="mx-auto mb-4 text-blue-300" />
        <h2 {...getEditableProps(isAuthenticated, "obj_hero_title", "Objetivos Estratégicos 2026-2028", "text-3xl font-bold mb-2")} />
        <p {...getEditableProps(isAuthenticated, "obj_hero_desc", "Diretrizes que norteiam toda a produção de conteúdo do Sistema Transporte no próximo triênio.", "text-blue-100 max-w-2xl mx-auto text-lg")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {objetivos.map((group) => (
          <div key={group.org} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 p-4 border-b border-slate-200 text-center">
              <h3 {...getEditableProps(isAuthenticated, `obj_org_title_${group.org.replace(/\s/g, '')}`, group.org, "text-2xl font-bold text-slate-800")} />
            </div>
            <div className="p-4 space-y-4">
              {group.items.map((obj, i) => {
                const prx = `obj_c_${group.org.replace(/\s/g, '')}_${i}`;
                return (
                  <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <h4 {...getEditableProps(isAuthenticated, `${prx}_title`, `${i+1}. ${obj.title}`, "font-bold text-blue-700 mb-2")} />
                    <p {...getEditableProps(isAuthenticated, `${prx}_desc`, obj.desc, "text-sm text-slate-700 mb-3")} />
                    <div className="mb-2">
                      <strong {...getEditableProps(isAuthenticated, `${prx}_lbl_ed`, "Editorias Conectadas:", "text-xs text-slate-500 uppercase tracking-wide block mb-1")} />
                      <span {...getEditableProps(isAuthenticated, `${prx}_val_ed`, obj.eds, "text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded inline-block")} />
                    </div>
                    <div>
                      <strong {...getEditableProps(isAuthenticated, `${prx}_lbl_res`, "Resultado Esperado:", "text-xs text-emerald-600 uppercase tracking-wide block mb-1")} />
                      <p {...getEditableProps(isAuthenticated, `${prx}_val_res`, obj.result, "text-sm font-medium text-emerald-800")} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TabEstrategia = ({ isAuthenticated, getEditableProps }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-8 rounded-xl shadow-md flex items-center gap-6">
      <CompassIcon className="w-16 h-16 text-blue-200 opacity-80 flex-shrink-0 hidden md:block" />
      <div>
        <h2 {...getEditableProps(isAuthenticated, "est_hero_title", "Mudança de Paradigma", "text-3xl font-bold mb-2")} />
        <p {...getEditableProps(isAuthenticated, "est_hero_desc", "Migração de um modelo de \"presença digital\" para uma <strong class=\"text-white\">comunicação orientada pelo papel estratégico</strong> de cada canal e casa. O fim da replicação genérica de conteúdo.", "text-blue-100 text-lg leading-relaxed")} />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 {...getEditableProps(isAuthenticated, "est_de_title", "Como é Hoje (De)", "text-xl font-bold text-slate-800 mb-4 text-center border-b pb-2")} />
        <ul className="space-y-3 text-slate-600">
          <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" /> <span {...getEditableProps(isAuthenticated, "est_de_1", "Foco puramente institucional", "flex-1")} /></li>
          <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" /> <span {...getEditableProps(isAuthenticated, "est_de_2", "Replicação idêntica entre canais", "flex-1")} /></li>
          <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" /> <span {...getEditableProps(isAuthenticated, "est_de_3", "Linguagem única para todos", "flex-1")} /></li>
          <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" /> <span {...getEditableProps(isAuthenticated, "est_de_4", "Foco isolado no Instagram", "flex-1")} /></li>
        </ul>
      </div>
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
        <h3 {...getEditableProps(isAuthenticated, "est_para_title", "Onde Vamos Chegar (Para)", "text-xl font-bold text-blue-900 mb-4 text-center border-b border-blue-200 pb-2")} />
        <ul className="space-y-3 text-blue-800 font-medium">
          <li className="flex items-center gap-2"><CheckCircle size={18} className="text-emerald-500 flex-shrink-0" /> <span {...getEditableProps(isAuthenticated, "est_para_1", "Conteúdo orientado por Persona + Canal", "flex-1")} /></li>
          <li className="flex items-center gap-2"><CheckCircle size={18} className="text-emerald-500 flex-shrink-0" /> <span {...getEditableProps(isAuthenticated, "est_para_2", "Objetivo claro por post (engajamento? conversão?)", "flex-1")} /></li>
          <li className="flex items-center gap-2"><CheckCircle size={18} className="text-emerald-500 flex-shrink-0" /> <span {...getEditableProps(isAuthenticated, "est_para_3", "LinkedIn como motor de influência", "flex-1")} /></li>
          <li className="flex items-center gap-2"><CheckCircle size={18} className="text-emerald-500 flex-shrink-0" /> <span {...getEditableProps(isAuthenticated, "est_para_4", "YouTube gerando autoridade real", "flex-1")} /></li>
        </ul>
      </div>
    </div>

    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <h3 {...getEditableProps(isAuthenticated, "est_cam_title", "As 3 Camadas de Conteúdo (Estrutura Triênio)", "text-2xl font-bold text-slate-800 mb-6 text-center")} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        <div className="p-6 bg-pink-50 border border-pink-100 rounded-xl text-center relative z-10">
          <div {...getEditableProps(isAuthenticated, "est_cam1_num", "1", "w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl")} />
          <h4 {...getEditableProps(isAuthenticated, "est_cam1_title", "Impacto (Instagram)", "text-xl font-bold text-pink-900 mb-2")} />
          <p {...getEditableProps(isAuthenticated, "est_cam1_desc", "Alcance, conexão, tradução do transporte para a sociedade.", "text-pink-800 text-sm mb-4")} />
          <ul className="text-sm text-pink-700 text-left space-y-1">
            <li {...getEditableProps(isAuthenticated, "est_cam1_l1", "• Dados simplificados")} />
            <li {...getEditableProps(isAuthenticated, "est_cam1_l2", "• Mensagem direta")} />
            <li {...getEditableProps(isAuthenticated, "est_cam1_l3", "• Alto apelo visual")} />
          </ul>
        </div>
        
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl text-center relative z-10">
          <div {...getEditableProps(isAuthenticated, "est_cam2_num", "2", "w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl")} />
          <h4 {...getEditableProps(isAuthenticated, "est_cam2_title", "Aprofundamento (LinkedIn)", "text-xl font-bold text-blue-900 mb-2")} />
          <p {...getEditableProps(isAuthenticated, "est_cam2_desc", "Posicionamento, influência, foco em gestores e governo.", "text-blue-800 text-sm mb-4")} />
          <ul className="text-sm text-blue-700 text-left space-y-1">
            <li {...getEditableProps(isAuthenticated, "est_cam2_l1", "• Contexto e análise")} />
            <li {...getEditableProps(isAuthenticated, "est_cam2_l2", "• Implicações e dados completos")} />
            <li {...getEditableProps(isAuthenticated, "est_cam2_l3", "• Posicionamento de liderança")} />
          </ul>
        </div>

        <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-center relative z-10">
          <div {...getEditableProps(isAuthenticated, "est_cam3_num", "3", "w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl")} />
          <h4 {...getEditableProps(isAuthenticated, "est_cam3_title", "Autoridade (YouTube)", "text-xl font-bold text-red-900 mb-2")} />
          <p {...getEditableProps(isAuthenticated, "est_cam3_desc", "Profundidade de temas estratégicos. Fim do repositório.", "text-red-800 text-sm mb-4")} />
          <ul className="text-sm text-red-700 text-left space-y-1">
            <li {...getEditableProps(isAuthenticated, "est_cam3_l1", "• Explicação completa")} />
            <li {...getEditableProps(isAuthenticated, "est_cam3_l2", "• Debates estruturados")} />
            <li {...getEditableProps(isAuthenticated, "est_cam3_l3", "• Séries e entrevistas")} />
          </ul>
        </div>
      </div>
    </div>
    
    <div className="bg-slate-800 text-white p-6 rounded-xl text-center shadow-lg">
      <h3 {...getEditableProps(isAuthenticated, "est_papel_main", "O Papel Ideal de Cada Casa", "text-xl font-bold mb-4 text-emerald-400")} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg">
        <div>
          <strong {...getEditableProps(isAuthenticated, "est_pap_t1", "CNT", "block text-xl")} /> 
          <span {...getEditableProps(isAuthenticated, "est_pap_d1", "Pauta e direciona o debate")} />
        </div>
        <div className="md:border-x border-slate-600">
          <strong {...getEditableProps(isAuthenticated, "est_pap_t2", "SEST SENAT", "block text-xl")} /> 
          <span {...getEditableProps(isAuthenticated, "est_pap_d2", "Mostra impacto real (Motor de alcance)")} />
        </div>
        <div>
          <strong {...getEditableProps(isAuthenticated, "est_pap_t3", "ITL", "block text-xl")} /> 
          <span {...getEditableProps(isAuthenticated, "est_pap_d3", "Mostra evolução e futuro (Indispensável)")} />
        </div>
      </div>
    </div>
  </div>
);

const TabCalendario = ({ isAuthenticated, getEditableProps, events, onUpdateEvents }) => {
  const [filters, setFilters] = useState({ orgs: [], channels: [] }); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); 
  const [itemToDelete, setItemToDelete] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newOrgs, setNewOrgs] = useState(['CNT']);
  const [newChannels, setNewChannels] = useState(['Instagram']);
  const [newEditoria, setNewEditoria] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newLink, setNewLink] = useState('');

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleYearChange = (e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1));
  const handleMonthChange = (e) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1));

  const toggleFilterOrg = (org) => setFilters(f => ({...f, orgs: f.orgs.includes(org) ? f.orgs.filter(o => o !== org) : [...f.orgs, org]}));
  const toggleFilterChannel = (ch) => setFilters(f => ({...f, channels: f.channels.includes(ch) ? f.channels.filter(c => c !== ch) : [...f.channels, ch]}));
  
  const toggleNewOrg = (org) => {
    setNewOrgs(prev => {
      const next = prev.includes(org) ? prev.filter(o => o !== org) : [...prev, org];
      setNewEditoria(''); 
      return next;
    });
  };
  const toggleNewChannel = (ch) => setNewChannels(prev => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]);

  const generateGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay(); 
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    const days = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      days.push({ day: d, isCurrentMonth: false, dateString: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
    }
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({ day: i, isCurrentMonth: true, dateString: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}` });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const m = month === 11 ? 1 : month + 2;
      const y = month === 11 ? year + 1 : year;
      days.push({ day: i, isCurrentMonth: false, dateString: `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}` });
    }
    return days;
  };

  const calendarDays = generateGrid();

  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];
    return events.filter(e => {
      const matchOrg = filters.orgs.length === 0 || e.orgs.some(org => filters.orgs.includes(org));
      const matchChannel = filters.channels.length === 0 || e.channels.some(ch => filters.channels.includes(ch));
      return matchOrg && matchChannel;
    });
  }, [events, filters]);

  const openAddModal = () => {
    setEditingId(null);
    setNewDate(currentDate.toISOString().split('T')[0].substring(0, 8) + '01');
    setNewOrgs(['CNT']);
    setNewChannels(['Instagram']);
    setNewEditoria('');
    setNewTitle('');
    setNewLink('');
    setIsModalOpen(true);
  };

  const handleEditClick = (ev) => {
    setEditingId(ev.id);
    setNewDate(ev.date);
    setNewOrgs([...ev.orgs]);
    setNewChannels([...ev.channels]);
    setNewEditoria(ev.editoria);
    setNewTitle(ev.title);
    setNewLink(ev.link || '');
    setIsModalOpen(true);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if(!newDate || !newEditoria || !newTitle || newOrgs.length === 0 || newChannels.length === 0) return;
    
    let formattedLink = newLink.trim();
    if (formattedLink && !formattedLink.startsWith('http')) {
      formattedLink = `https://${formattedLink}`;
    }
    
    let updatedEvents;
    if (editingId) {
      updatedEvents = events.map(ev => ev.id === editingId ? {
        ...ev, date: newDate, orgs: newOrgs, channels: newChannels, editoria: newEditoria, title: newTitle, link: formattedLink
      } : ev);
    } else {
      const newEvent = {
        id: Date.now(),
        date: newDate,
        orgs: newOrgs,
        channels: newChannels,
        editoria: newEditoria,
        title: newTitle,
        link: formattedLink,
        status: 'Planejado'
      };
      updatedEvents = [...events, newEvent];
    }
    
    onUpdateEvents(updatedEvents);
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (itemToDelete !== null) {
      const updatedEvents = events.filter(e => e.id !== itemToDelete);
      onUpdateEvents(updatedEvents);
      setItemToDelete(null);
    }
  };

  const getOrgColor = (org) => {
    switch(org) {
      case 'CNT': return '#16a34a'; 
      case 'SEST SENAT': return '#2563eb'; 
      case 'ITL': return '#ec4899'; 
      case 'SISTEMA TRANSPORTE': return '#c084fc'; 
      default: return '#475569'; 
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-100 pb-6">
        
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-blue-600 border border-slate-200">
            <ChevronLeft size={20} />
          </button>
          
          <select 
            className="text-2xl font-bold text-blue-700 bg-transparent outline-none cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors"
            value={currentDate.getMonth()}
            onChange={handleMonthChange}
          >
            {monthNames.map((m, i) => (
              <option key={m} value={i}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
            ))}
          </select>

          <select 
            className="text-2xl font-bold text-blue-500 bg-transparent outline-none cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors"
            value={currentDate.getFullYear()}
            onChange={handleYearChange}
          >
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
          </select>

          <button onClick={nextMonth} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-blue-600 border border-slate-200">
            <ChevronRight size={20} />
          </button>
        </div>
        
        {isAuthenticated && (
          <button 
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors w-full xl:w-auto justify-center"
          >
            <Plus size={18} /> Incluir Pauta
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 text-slate-500 font-medium mb-1 border-b border-slate-200 pb-2">
          <Filter size={18} className="flex-shrink-0" /> 
          <span {...getEditableProps(isAuthenticated, "cal_flt_title", "Filtros Dinâmicos (Múltipla Seleção):", "flex-1")} />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <span {...getEditableProps(isAuthenticated, "cal_flt_casas", "Casas:", "text-xs font-bold text-slate-500 uppercase tracking-wider w-16 flex-shrink-0")} />
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilters(f => ({...f, orgs: []}))} className={`px-3 py-1 text-xs rounded-full border transition-colors ${filters.orgs.length === 0 ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>Todas</button>
            {orgOptions.map(org => (
              <button key={`filter-org-${org}`} onClick={() => toggleFilterOrg(org)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${filters.orgs.includes(org) ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>{org}</button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <span {...getEditableProps(isAuthenticated, "cal_flt_canais", "Canais:", "text-xs font-bold text-slate-500 uppercase tracking-wider w-16 flex-shrink-0")} />
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilters(f => ({...f, channels: []}))} className={`px-3 py-1 text-xs rounded-full border transition-colors ${filters.channels.length === 0 ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>Todos</button>
            {channelOptions.map(ch => (
              <button key={`filter-ch-${ch}`} onClick={() => toggleFilterChannel(ch)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${filters.channels.includes(ch) ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>{ch}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full border border-slate-300 rounded-lg overflow-hidden bg-slate-100 shadow-sm">
        <div className="grid grid-cols-7 bg-blue-700 text-white text-center">
          {weekDays.map((day, i) => (
            <div key={day} className="py-2 text-xs sm:text-sm font-semibold border-r border-blue-600 last:border-0 truncate px-1">
              <span {...getEditableProps(isAuthenticated, `cal_wd_${i}`, day)} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-t border-slate-300">
          {calendarDays.map((dayObj, index) => {
            const dayEvents = filteredEvents.filter(e => e.date === dayObj.dateString);
            
            return (
              <div key={index} className={`min-h-[140px] p-1.5 sm:p-2 border-r border-b border-slate-300 ${dayObj.isCurrentMonth ? 'bg-white' : 'bg-slate-50'} ${(index + 1) % 7 === 0 ? 'border-r-0' : ''}`}>
                <div className={`text-sm font-bold mb-2 ${dayObj.isCurrentMonth ? 'text-slate-800' : 'text-slate-400'}`}>
                  {dayObj.day}
                </div>
                <div className="space-y-1.5">
                  {dayEvents.map(ev => (
                    <div key={ev.id} className="group relative flex items-start justify-between bg-white border border-slate-200 rounded p-1.5 shadow-sm hover:shadow-md transition-shadow">
                      <div className={`flex-1 min-w-0 mr-1 ${isAuthenticated ? 'cursor-pointer' : 'cursor-default'}`} onClick={() => isAuthenticated && handleEditClick(ev)}>
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <div className="flex gap-0.5">
                            {ev.orgs.map(org => (
                              <span key={org} className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{backgroundColor: getOrgColor(org)}} title={org}></span>
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase truncate leading-none flex-1" title={ev.channels.join(', ')}>
                            {ev.channels.join(', ')}
                          </span>
                        </div>
                        {ev.link ? (
                          <a 
                            href={ev.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={(e) => e.stopPropagation()}
                            className={`text-xs text-blue-600 font-bold block leading-tight hover:underline flex items-start gap-1`} 
                            title={`Acessar link: ${ev.link}\n\n${ev.title} (${ev.editoria})`}
                          >
                            <span className="truncate">{ev.title}</span>
                            <ExternalLink size={12} className="flex-shrink-0 mt-0.5" />
                          </a>
                        ) : (
                          <span className={`text-xs text-slate-700 font-medium block leading-tight ${isAuthenticated ? 'hover:text-blue-600' : ''}`} title={`${ev.title} (${ev.editoria})`}>
                            {ev.title}
                          </span>
                        )}
                      </div>
                      
                      {isAuthenticated && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setItemToDelete(ev.id); }} 
                          className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 flex-shrink-0" 
                          title="Remover Pauta"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-600 justify-center">
        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-600"></div> <span {...getEditableProps(isAuthenticated, "cal_leg_1", "CNT")} /></span>
        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-600"></div> <span {...getEditableProps(isAuthenticated, "cal_leg_2", "SEST SENAT")} /></span>
        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-pink-500"></div> <span {...getEditableProps(isAuthenticated, "cal_leg_3", "ITL")} /></span>
        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-purple-400"></div> <span {...getEditableProps(isAuthenticated, "cal_leg_4", "SISTEMA TRANSPORTE")} /></span>
      </div>
      {isAuthenticated && <p {...getEditableProps(isAuthenticated, "cal_inst_msg", "Clique sobre uma pauta para editar ou exclui-la.", "text-xs text-slate-500 text-center mt-2")} />}

      {/* MODAIS DE CALENDÁRIO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
              <h3 className="font-bold text-lg">{editingId ? 'Editar Pauta' : 'Nova Pauta Editorial'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-blue-200 hover:text-white">&times;</button>
            </div>
            
            <form onSubmit={handleSaveForm} className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Data</label>
                <input type="date" required value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm focus:border-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Selecione a(s) Casa(s)</label>
                <div className="flex flex-wrap gap-2">
                  {orgOptions.map(org => (
                    <button 
                      type="button" 
                      key={`modal-org-${org}`} 
                      onClick={() => toggleNewOrg(org)}
                      className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${newOrgs.includes(org) ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                    >
                      {org}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Editoria (Tema)</label>
                <select 
                  required 
                  value={newEditoria} 
                  onChange={e => setNewEditoria(e.target.value)} 
                  className="w-full border border-slate-300 rounded p-2 text-sm focus:border-blue-500 outline-none"
                  disabled={newOrgs.length === 0}
                >
                  <option value="" disabled>Selecione uma editoria...</option>
                  {newOrgs.map(org => {
                    if (!editoriasData[org]) return null;
                    return (
                      <optgroup key={org} label={`Editorias: ${org}`}>
                        {editoriasData[org].map(ed => (
                          <option key={`${org}-${ed.title}`} value={ed.title}>
                            {ed.title}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
                {newOrgs.length === 0 && <p className="text-xs text-red-500 mt-1">Selecione pelo menos uma casa primeiro.</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Selecione o(s) Canal(is)</label>
                <div className="flex flex-wrap gap-2">
                  {channelOptions.map(ch => (
                    <button 
                      type="button" 
                      key={`modal-ch-${ch}`} 
                      onClick={() => toggleNewChannel(ch)}
                      className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${newChannels.includes(ch) ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Título / Assunto</label>
                <input type="text" required placeholder="Ex: Divulgação Relatório Anual" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm focus:border-blue-500 outline-none" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Link do Briefing (Opcional)</label>
                <input type="text" placeholder="Ex: https://cnt.org.br" value={newLink} onChange={e => setNewLink(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm focus:border-blue-500 outline-none" />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-medium transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50" disabled={newOrgs.length === 0 || newChannels.length === 0 || !newEditoria}>
                  {editingId ? 'Salvar Pauta' : 'Criar Pauta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {itemToDelete !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Pauta?</h3>
              <p className="text-sm text-slate-600 mb-6">Esta ação apagará a pauta localmente.</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setItemToDelete(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-medium transition-colors">Cancelar</button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors">Sim, excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL (GESTÃO DE ESTADO MESTRE) ---
export default function App() {
  const [activeTab, setActiveTab] = useState('panorama');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  
  // Estados Centrais
  const [user, setUser] = useState(null);
  const [cloudConnection, setCloudConnection] = useState('connecting');
  const [events, setEvents] = useState(defaultInitialEvents);
  const [customTexts, setCustomTexts] = useState({});
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveModalState, setSaveModalState] = useState(null); 

  // Refs de segurança para lidar com o ciclo de vida do React
  const eventsRef = useRef(events);
  const customTextsRef = useRef(customTexts);
  const isAuthRef = useRef(isAuthenticated);
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
  
  // Guardião da versão Oficial da Nuvem
  const cloudStateRef = useRef({ events: defaultInitialEvents, customTexts: {} });

  useEffect(() => { eventsRef.current = events; }, [events]);
  useEffect(() => { customTextsRef.current = customTexts; }, [customTexts]);
  useEffect(() => { isAuthRef.current = isAuthenticated; }, [isAuthenticated]);
  useEffect(() => { hasUnsavedChangesRef.current = hasUnsavedChanges; }, [hasUnsavedChanges]);

  // 1. Inicializa Conexão e Autenticação (A prova de falhas)
  useEffect(() => {
    if (!auth || !db) {
      setCloudConnection('offline');
      return;
    }

    let unsubscribeAuth;
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.error("Falha na autenticação da nuvem:", e);
        setCloudConnection('offline');
      }
    };
    
    initAuth();
    
    unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setCloudConnection(u ? 'online' : 'offline');
    });
    
    return () => { if (unsubscribeAuth) unsubscribeAuth(); };
  }, []);

  // 2. Download da Nuvem e Sincronização em Tempo Real
  useEffect(() => {
    if (!user || !db) return;
    
    const collRef = collection(db, 'artifacts', appId, 'public', 'data', 'appState');
    const docRef = doc(collRef, 'main');
    
    const unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const fetchedEvents = data.events || defaultInitialEvents;
        const fetchedTexts = data.customTexts || {};

        // Guarda a versão imaculada que veio da Nuvem
        cloudStateRef.current = { events: fetchedEvents, customTexts: fetchedTexts };
        
        // Aplica à interface SOMENTE se o utilizador não tiver edições não salvas.
        if (!hasUnsavedChangesRef.current) {
          setEvents(fetchedEvents);
          setCustomTexts(fetchedTexts);
          updateDOM(fetchedTexts); 
        }
      }
    }, (error) => {
      console.error("Erro na leitura da nuvem:", error);
      setCloudConnection('offline');
    });

    return () => unsubscribeSnapshot();
  }, [user]);

  // Força as caixas de texto a exibirem o valor correto do estado
  const updateDOM = (textsObj) => {
    document.querySelectorAll('[data-edit-id]').forEach(el => {
      const id = el.getAttribute('data-edit-id');
      const defaultText = el.getAttribute('data-default-text') || "";
      
      let val = defaultText;
      const savedData = textsObj[id];
      if (savedData !== undefined) {
         val = typeof savedData === 'string' ? savedData : (savedData.text || defaultText);
      }
      
      if (el.innerHTML !== val) el.innerHTML = val;
    });
  };

  // 3. Salvar na Nuvem de Forma Absoluta
  const handleSaveToCloud = async (newEvents, newTexts) => {
    if (!user || !db) {
      setSaveModalState('error');
      setTimeout(() => setSaveModalState(null), 3000);
      return;
    }
    
    setSaveModalState('saving');
    try {
      const collRef = collection(db, 'artifacts', appId, 'public', 'data', 'appState');
      const docRef = doc(collRef, 'main');
      await setDoc(docRef, {
        events: newEvents,
        customTexts: newTexts,
        updatedAt: new Date().toISOString()
      });
      
      cloudStateRef.current = { events: newEvents, customTexts: newTexts };
      setHasUnsavedChanges(false);
      setSaveModalState('success');
    } catch (e) {
      console.error("Erro ao salvar na nuvem:", e);
      setSaveModalState('error');
    }
    setTimeout(() => setSaveModalState(null), 3000);
  };

  // Botão "Salvar" (Master)
  const forceSave = () => {
    if (document.activeElement && document.activeElement.hasAttribute('data-edit-id')) {
        document.activeElement.blur();
    }

    const latestTexts = { ...customTextsRef.current };
    
    document.querySelectorAll('[data-edit-id]').forEach(el => {
      const id = el.getAttribute('data-edit-id');
      latestTexts[id] = el.innerHTML; 
    });
    
    setCustomTexts(latestTexts);
    handleSaveToCloud(eventsRef.current, latestTexts);
  };

  // 4. Botão Desfazer
  const handleUndo = () => {
    const officialState = cloudStateRef.current;
    
    setEvents(officialState.events);
    setCustomTexts(officialState.customTexts);
    setHasUnsavedChanges(false);
    
    updateDOM(officialState.customTexts);
  };

  // Login e Saída do Modo de Edição
  const handleLoginClick = () => {
    if (isAuthenticated) {
      if (hasUnsavedChangesRef.current) {
         forceSave(); 
      }
      setIsAuthenticated(false);
    } else {
      setPasswordInput('');
      setLoginError(false);
      setShowPassword(false); 
      setIsLoginModalOpen(true);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput.trim().toUpperCase() === "XOXO") {
      setIsAuthenticated(true);
      setIsLoginModalOpen(false);
    } else {
      setLoginError(true);
    }
  };

  const handleUpdateEvents = (newEvents) => {
    setEvents(newEvents);
    handleSaveToCloud(newEvents, customTextsRef.current);
  };

  const handleTextBlur = (e, id) => {
    if (!isAuthenticated) return;
    const newHtml = e.target.innerHTML;
    
    const currentText = customTextsRef.current[id];
    const isDifferent = typeof currentText === 'string' ? (currentText !== newHtml) : (currentText?.text !== newHtml);
    
    if (isDifferent) {
      setCustomTexts(prev => ({ ...prev, [id]: newHtml }));
      setHasUnsavedChanges(true); 
    }
  };

  const getEditableProps = (isAuth, id, defaultText, baseClass = "") => {
    let textToShow = defaultText;
    const savedData = customTexts[id];
    
    if (savedData !== undefined) {
       textToShow = typeof savedData === 'string' ? savedData : (savedData.text || defaultText);
    }

    return {
      'data-edit-id': id,
      'data-default-text': defaultText,
      contentEditable: isAuth ? "true" : "false",
      suppressContentEditableWarning: true,
      onClick: (e) => { if (isAuth) e.stopPropagation(); }, 
      onBlur: (e) => handleTextBlur(e, id),
      onInput: () => { if (isAuth && !hasUnsavedChangesRef.current) setHasUnsavedChanges(true); },
      className: `${baseClass} ${isAuth ? "outline-none hover:shadow-[0_0_0_2px_rgba(96,165,250,0.5)] focus:bg-white focus:shadow-[0_0_0_2px_rgba(59,130,246,0.8)] rounded transition-all cursor-text min-h-[1em] min-w-[20px] inline-block" : ""}`,
      dangerouslySetInnerHTML: { __html: textToShow }
    };
  };

  const tabs = [
    { id: 'panorama', label: 'Panorama', icon: BarChart3 },
    { id: 'personas', label: 'Personas', icon: Users },
    { id: 'editorias', label: 'Editorias', icon: FileText },
    { id: 'objetivos', label: 'Objetivos', icon: Target },
    { id: 'estrategia', label: 'Estratégia', icon: CompassIcon },
    { id: 'calendario', label: 'Calendário 2026+', icon: CalendarIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative">
      <header className="bg-blue-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center font-black text-blue-900 text-xl tracking-tighter">
                <span {...getEditableProps(isAuthenticated, "hdr_logo", "ST")} />
              </div>
              <div className="hidden sm:block">
                <h1 {...getEditableProps(isAuthenticated, "hdr_title", "Estratégia de Redes Sociais", "text-lg font-bold leading-tight")} />
                <p {...getEditableProps(isAuthenticated, "hdr_subtitle", "SISTEMA TRANSPORTE | TRIÊNIO 2026-2028", "text-xs text-blue-200 font-medium tracking-wide")} />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleLoginClick} 
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-800 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                title={isAuthenticated ? "Sair do modo de edição e gravar" : "Entrar no modo de edição"}
              >
                {isAuthenticated ? <Unlock size={16} className="text-emerald-400" /> : <Lock size={16} className="text-blue-300" />}
                <span className="hidden md:inline">{isAuthenticated ? "Modo Edição: ON" : "Editar"}</span>
              </button>
              
              {isAuthenticated && (
                <>
                  <button 
                    onClick={handleUndo} 
                    disabled={!hasUnsavedChanges}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors shadow-sm"
                    title="Descartar alterações e voltar à versão guardada na nuvem"
                  >
                    <Undo2 size={16} className="text-white" />
                    <span className="hidden md:inline">Desfazer</span>
                  </button>
                  
                  <button 
                    onClick={forceSave}
                    disabled={saveModalState === 'saving' || !hasUnsavedChanges}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors shadow-sm"
                    title="Gravar permanentemente para que todos vejam"
                  >
                    {saveModalState === 'saving' ? <Loader2 size={16} className="text-white animate-spin" /> : <Save size={16} className="text-white" />}
                    <span className="hidden md:inline">Salvar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar">
          <div className="flex space-x-1 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive 
                      ? 'bg-slate-50 text-blue-700 border-t-2 border-blue-500' 
                      : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span {...getEditableProps(isAuthenticated, `tab_lbl_${tab.id}`, tab.label)} />
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div style={{ display: activeTab === 'panorama' ? 'block' : 'none' }}>
          <TabPanorama isAuthenticated={isAuthenticated} getEditableProps={getEditableProps} />
        </div>
        <div style={{ display: activeTab === 'personas' ? 'block' : 'none' }}>
          <TabPersonas isAuthenticated={isAuthenticated} getEditableProps={getEditableProps} />
        </div>
        <div style={{ display: activeTab === 'editorias' ? 'block' : 'none' }}>
          <TabEditorias isAuthenticated={isAuthenticated} getEditableProps={getEditableProps} />
        </div>
        <div style={{ display: activeTab === 'objetivos' ? 'block' : 'none' }}>
          <TabObjetivos isAuthenticated={isAuthenticated} getEditableProps={getEditableProps} />
        </div>
        <div style={{ display: activeTab === 'estrategia' ? 'block' : 'none' }}>
          <TabEstrategia isAuthenticated={isAuthenticated} getEditableProps={getEditableProps} />
        </div>
        <div style={{ display: activeTab === 'calendario' ? 'block' : 'none' }}>
          <TabCalendario isAuthenticated={isAuthenticated} getEditableProps={getEditableProps} events={events} onUpdateEvents={handleUpdateEvents} />
        </div>
      </main>

      {/* ÍCONE DE ESTADO DA LIGAÇÃO À NUVEM */}
      <div className="fixed bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-full text-xs font-semibold text-slate-500 z-40">
        {cloudConnection === 'online' ? (
          <><Cloud size={14} className="text-emerald-500" /> Ligado à Nuvem</>
        ) : cloudConnection === 'connecting' ? (
          <><Loader2 size={14} className="text-blue-500 animate-spin" /> A ligar...</>
        ) : (
          <><CloudOff size={14} className="text-red-500" /> Offline (Modo Leitura)</>
        )}
      </div>

      {/* FEEDBACK DE SALVAMENTO */}
      {saveModalState && (
        <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-xl border border-slate-200 p-4 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
           {saveModalState === 'saving' && <><Loader2 className="animate-spin text-blue-600" size={20} /><span className="text-slate-700 font-medium">A gravar na nuvem...</span></>}
           {saveModalState === 'success' && <><CheckCircle className="text-emerald-500" size={20} /><span className="text-slate-700 font-medium">Alterações Guardadas e Publicadas!</span></>}
           {saveModalState === 'error' && <><AlertTriangle className="text-red-500" size={20} /><span className="text-slate-700 font-medium">Falha de ligação. Verifique a rede.</span></>}
        </div>
      )}

      {/* MODAL DE LOGIN */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><Lock size={18} /> Acesso Restrito</h3>
              <button onClick={() => setIsLoginModalOpen(false)} className="text-blue-200 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Digite a senha de edição:</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  autoFocus
                  value={passwordInput} 
                  onChange={e => {setPasswordInput(e.target.value); setLoginError(false);}} 
                  className={`w-full border rounded p-2 pr-10 text-sm outline-none transition-colors ${loginError ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-slate-300 focus:border-blue-500'}`}
                  placeholder="Senha..."
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-slate-400 italic text-left mt-1">gossip girl</p>
              {loginError && <p className="text-xs text-red-500 mt-2 font-medium">Senha incorreta. Tente novamente.</p>}
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsLoginModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-medium transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors">Desbloquear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}