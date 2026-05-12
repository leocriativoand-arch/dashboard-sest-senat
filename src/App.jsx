import './index.css';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from './supabase.js';
import TabCanais from './TabCanais.jsx';
import {
  BarChart3, Users, FileText, Target, Map, Calendar as CalendarIcon,
  AlertTriangle, CheckCircle, ChevronDown, Plus, Trash2, Filter,
  ChevronLeft, ChevronRight, ExternalLink, Lock, Unlock, Eye, EyeOff,
  Save, Undo2, Loader2, Cloud, CloudOff
} from 'lucide-react';

// --- DADOS INICIAIS ---
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

const SUPABASE_TABLE = 'app_state';
const SUPABASE_ROW_ID = 'painel-sest-senado';

// --- COMPONENTE EDITÁVEL (CORRIGIDO PARA REACT 19) ---
// Usa ref + DOM direto para evitar conflito entre dangerouslySetInnerHTML e contentEditable
const EditableSpan = ({ id, defaultText, className, isAuth, onBlur }) => {
  const ref = useRef(null);
  const lastSaved = useRef(defaultText);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== lastSaved.current) {
      ref.current.innerHTML = lastSaved.current;
    }
  }, []);

  const handleBlur = () => {
    if (!isAuth || !ref.current) return;
    const newVal = ref.current.innerHTML;
    if (newVal !== lastSaved.current) {
      lastSaved.current = newVal;
      onBlur(id, newVal);
    }
  };

  return (
    <span
      ref={ref}
      data-edit-id={id}
      contentEditable={isAuth}
      suppressContentEditableWarning
      onBlur={handleBlur}
      className={`${className || ''} ${isAuth ? 'outline-none hover:ring-2 hover:ring-blue-300 focus:ring-2 focus:ring-blue-500 focus:bg-white rounded cursor-text min-h-[1em] inline-block' : ''}`}
    />
  );
};

// Função que retorna props para elementos que NÃO precisam de contentEditable
// (mantém compatibilidade com o código original onde possível)
const makeEditable = (isAuth, id, text, className, onTextBlur) => {
  if (!isAuth) {
    return { className, dangerouslySetInnerHTML: { __html: text } };
  }
  // em modo edição, retorna o componente EditableSpan via ref de dados
  return {
    'data-edit-id': id,
    className: `${className || ''} outline-none hover:ring-2 hover:ring-blue-300 focus:ring-2 focus:ring-blue-500 focus:bg-white rounded cursor-text`,
    contentEditable: true,
    suppressContentEditableWarning: true,
    onBlur: (e) => onTextBlur(id, e.currentTarget.innerHTML),
    dangerouslySetInnerHTML: undefined,
  };
};

// --- ÍCONE COMPASS ---
const CompassIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
  </svg>
);

// --- COMPONENTE DE TEXTO EDITÁVEL SIMPLES ---
// Resolve o conflito React 19: nunca usa dangerouslySetInnerHTML + contentEditable juntos
const ET = ({ isAuth, id, defaultText, tag: Tag = 'span', className, onTextBlur }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = defaultText || '';
    }
  }, [defaultText, isAuth]);

  const handleBlur = useCallback(() => {
    if (!isAuth || !ref.current) return;
    onTextBlur(id, ref.current.innerHTML);
  }, [isAuth, id, onTextBlur]);

  if (!isAuth) {
    return <Tag className={className} dangerouslySetInnerHTML={{ __html: defaultText || '' }} />;
  }

  return (
    <Tag
      ref={ref}
      data-edit-id={id}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      className={`${className || ''} outline-none hover:ring-2 hover:ring-blue-300 focus:ring-2 focus:ring-blue-500 focus:bg-white rounded cursor-text`}
    />
  );
};

// --- HOOK DE TEXTOS CUSTOMIZADOS ---
const useCustomText = (customTexts, id, defaultText) => {
  const saved = customTexts[id];
  return saved !== undefined ? saved : defaultText;
};

// --- COMPONENTES DE CARDS ---
const PlatformCard = ({ idPrefix, defaultName, colorTheme, defaultDesc, isAuth, customTexts, onTextBlur }) => {
  const themeColors = {
    pink: "bg-pink-200 text-pink-900 border-pink-300",
    blue: "bg-blue-100 text-blue-900 border-blue-200",
    green: "bg-green-100 text-green-900 border-green-200",
    red: "bg-red-100 text-red-900 border-red-200",
    yellow: "bg-yellow-100 text-yellow-900 border-yellow-300"
  };
  const theme = themeColors[colorTheme] || "bg-slate-100 text-slate-800 border-slate-200";
  return (
    <div className={`p-4 rounded-lg border ${theme}`}>
      <ET isAuth={isAuth} id={`plat_${idPrefix}_title`} defaultText={useCustomText(customTexts, `plat_${idPrefix}_title`, defaultName)} tag="h4" className="font-bold text-lg mb-1" onTextBlur={onTextBlur} />
      <ET isAuth={isAuth} id={`plat_${idPrefix}_desc`} defaultText={useCustomText(customTexts, `plat_${idPrefix}_desc`, defaultDesc)} tag="p" className="text-sm opacity-90 leading-relaxed" onTextBlur={onTextBlur} />
    </div>
  );
};

const InstitutionCard = ({ idPrefix, defaultName, defaultDesc, isAuth, customTexts, onTextBlur }) => {
  const stripHTML = (html) => html?.replace(/<[^>]*>/g, '') || '';
  const titleText = stripHTML(customTexts[`inst_${idPrefix}_title`] || defaultName);
  const descText = stripHTML(customTexts[`inst_${idPrefix}_desc`] || defaultDesc);
  return (
    <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-4">
      <div className="bg-blue-600 text-white p-2 rounded w-16 text-center font-bold text-sm flex-shrink-0 leading-tight">
        {titleText.split(' ').map((word, i) => (
          <span key={i} className="block">{word}</span>
        ))}
      </div>
      <div>
        <ET isAuth={isAuth} id={`inst_${idPrefix}_title`} defaultText={titleText} tag="h4" className="font-bold text-slate-800 mb-1" onTextBlur={onTextBlur} />
        <ET isAuth={isAuth} id={`inst_${idPrefix}_desc`} defaultText={descText} tag="p" className="text-sm text-slate-600" onTextBlur={onTextBlur} />
      </div>
    </div>
  );
};

// --- ABAS ---
const TabPanorama = ({ isAuth, customTexts, onTextBlur }) => {
  const t = (id, def) => useCustomText(customTexts, id, def);
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <ET isAuth={isAuth} id="pan_title" defaultText={t("pan_title","O Cenário Atual")} tag="h2" className="text-2xl font-bold text-slate-800 mb-4" onTextBlur={onTextBlur} />
        <ET isAuth={isAuth} id="pan_desc" defaultText={t("pan_desc","A presença digital do Sistema Transporte (CNT, SEST SENAT e ITL) está consolidada em múltiplas plataformas, porém apresenta desempenho desigual e limitações estratégicas relevantes. O engajamento está muito concentrado em um único canal (Instagram), subutilizando o potencial estratégico das outras redes.")} tag="p" className="text-slate-600 mb-6 text-lg leading-relaxed" onTextBlur={onTextBlur} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { icon: Target, idT: "pan_obj_title", defT: "Objetivos por Canal", idD: "pan_obj_desc", defD: "Necessidade urgente de definir papéis claros para cada rede social." },
            { icon: FileText, idT: "pan_adapt_title", defT: "Adaptação de Conteúdo", idD: "pan_adapt_desc", defD: "Fim da replicação. Cada plataforma exige um formato e profundidade diferentes." },
            { icon: Users, idT: "pan_align_title", defT: "Alinhamento de Público", idD: "pan_align_desc", defD: "Ajustar o tom de voz e a linguagem para quem realmente consome a rede." },
          ].map(({ icon: Icon, idT, defT, idD, defD }) => (
            <div key={idT} className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex items-start gap-3">
              <Icon className="text-purple-600 mt-1 flex-shrink-0" size={24} />
              <div>
                <ET isAuth={isAuth} id={idT} defaultText={t(idT, defT)} tag="h4" className="font-semibold text-purple-900" onTextBlur={onTextBlur} />
                <ET isAuth={isAuth} id={idD} defaultText={t(idD, defD)} tag="p" className="text-sm text-purple-800 mt-1" onTextBlur={onTextBlur} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="text-slate-400 flex-shrink-0" />
            <ET isAuth={isAuth} id="pan_an_plat" defaultText={t("pan_an_plat","Análise por Plataforma")} tag="span" onTextBlur={onTextBlur} />
          </h3>
          <div className="space-y-4">
            <PlatformCard idPrefix="ig" defaultName={t("plat_ig_title","Instagram")} colorTheme="pink" defaultDesc={t("plat_ig_desc","Principal canal de desempenho. SEST SENAT lidera com conteúdo prático. CNT com foco institucional (mediano) e ITL com baixo engajamento.")} isAuth={isAuth} customTexts={customTexts} onTextBlur={onTextBlur} />
            <PlatformCard idPrefix="fb" defaultName={t("plat_fb_title","Facebook")} colorTheme="blue" defaultDesc={t("plat_fb_desc","Baixo retorno. Usado majoritariamente para replicação de conteúdos sem adaptação.")} isAuth={isAuth} customTexts={customTexts} onTextBlur={onTextBlur} />
            <PlatformCard idPrefix="li" defaultName={t("plat_li_title","LinkedIn")} colorTheme="green" defaultDesc={t("plat_li_desc","Desempenho baixo frente ao potencial. Foco atual em replicação ao invés de exploração institucional e profissional.")} isAuth={isAuth} customTexts={customTexts} onTextBlur={onTextBlur} />
            <PlatformCard idPrefix="yt" defaultName={t("plat_yt_title","YouTube")} colorTheme="red" defaultDesc={t("plat_yt_desc","Baixíssimo retorno. Funciona apenas como repositório pontual de vídeos, sem estratégia de crescimento.")} isAuth={isAuth} customTexts={customTexts} onTextBlur={onTextBlur} />
            <PlatformCard idPrefix="tw" defaultName={t("plat_tw_title","X / Twitter")} colorTheme="yellow" defaultDesc={t("plat_tw_desc","Apenas CNT possui perfil ativo, porém inexpressivo. Não cumpre papel estratégico hoje.")} isAuth={isAuth} customTexts={customTexts} onTextBlur={onTextBlur} />
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Map className="text-slate-400 flex-shrink-0" />
              <ET isAuth={isAuth} id="pan_an_inst" defaultText={t("pan_an_inst","Análise por Instituição")} tag="span" onTextBlur={onTextBlur} />
            </h3>
            <div className="space-y-4">
              <InstitutionCard idPrefix="sest" defaultName="SEST SENAT" defaultDesc={t("inst_sest_desc","Melhor desempenho geral. Conteúdos acessíveis, úteis e alinhados ao interesse do público. Alta frequência.")} isAuth={isAuth} customTexts={customTexts} onTextBlur={onTextBlur} />
              <InstitutionCard idPrefix="cnt" defaultName="CNT" defaultDesc={t("inst_cnt_desc","Presença consolidada, foco institucional e dados. Desempenho mediano devido à natureza técnica do conteúdo.")} isAuth={isAuth} customTexts={customTexts} onTextBlur={onTextBlur} />
              <InstitutionCard idPrefix="itl" defaultName="ITL" defaultDesc={t("inst_itl_desc","Menor desempenho. Conteúdo segmentado e técnico (formação/inovação) resulta em menor alcance na estratégia atual.")} isAuth={isAuth} customTexts={customTexts} onTextBlur={onTextBlur} />
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
            <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-orange-500 flex-shrink-0" />
              <ET isAuth={isAuth} id="pan_crit_title" defaultText={t("pan_crit_title","Principais Pontos Críticos")} tag="span" onTextBlur={onTextBlur} />
            </h3>
            <ul className="space-y-2 text-orange-800">
              {["Baixo engajamento geral, concentrado em poucos canais.","Ausência de estratégia específica por plataforma.","Predominância de replicação de conteúdo entre redes.","Subutilização de LinkedIn e YouTube.","Desalinhamento entre linguagem, formato e público."].map((def, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                  <ET isAuth={isAuth} id={`pan_crit_${i+1}`} defaultText={t(`pan_crit_${i+1}`, def)} tag="span" className="flex-1" onTextBlur={onTextBlur} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabPersonas = ({ isAuth, customTexts, onTextBlur }) => {
  const [activeOrg, setActiveOrg] = useState('CNT');
  const t = (id, def) => useCustomText(customTexts, id, def);

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
    <div className="space-y-6">
      <div className="flex space-x-2 border-b border-slate-200">
        {Object.keys(personas).map(org => (
          <button key={org} onClick={() => setActiveOrg(org)}
            className={`px-6 py-3 font-semibold text-sm rounded-t-lg transition-colors ${activeOrg === org ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
            {org}
          </button>
        ))}
      </div>
      {Object.keys(personas).map(org => (
        <div key={org} style={{ display: activeOrg === org ? 'grid' : 'none' }} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4" style={{ display: activeOrg === org ? 'grid' : 'none', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {personas[org].map((p, i) => {
            const prx = `pers_${org.replace(/\s/g,'')}_${i}`;
            return (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="bg-slate-50 p-4 border-b border-slate-100">
                  <div className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Persona {i+1}</div>
                  <ET isAuth={isAuth} id={`${prx}_name`} defaultText={t(`${prx}_name`, p.name)} tag="h3" className="text-xl font-bold text-slate-800" onTextBlur={onTextBlur} />
                  <ET isAuth={isAuth} id={`${prx}_role`} defaultText={t(`${prx}_role`, p.role)} tag="p" className="text-slate-600 italic font-medium" onTextBlur={onTextBlur} />
                </div>
                <div className="p-5 flex-1 space-y-3 text-sm">
                  {[
                    { label: "Perfil:", id: `${prx}_v1`, def: `${p.age} | ${p.desc}` },
                    { label: "Dores:", id: `${prx}_v2`, def: p.pain },
                    { label: "O que busca:", id: `${prx}_v3`, def: p.seeks },
                    { label: "Conteúdo ideal:", id: `${prx}_v4`, def: p.content },
                  ].map(({ label, id, def }) => (
                    <div key={id}>
                      <strong className="text-slate-700 block mb-0.5">{label}</strong>
                      <ET isAuth={isAuth} id={id} defaultText={t(id, def)} tag="p" className="text-slate-600" onTextBlur={onTextBlur} />
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 p-3 text-sm border-t border-blue-100">
                  <strong className="text-blue-900">Tom de voz: </strong>
                  <ET isAuth={isAuth} id={`${prx}_v5`} defaultText={t(`${prx}_v5`, p.tone)} tag="span" className="text-blue-800" onTextBlur={onTextBlur} />
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const TabEditorias = ({ isAuth, customTexts, onTextBlur }) => {
  const t = (id, def) => useCustomText(customTexts, id, def);
  return (
    <div className="space-y-8">
      {Object.entries(editoriasData).map(([org, items]) => (
        <div key={org} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">{org} <span className="text-slate-400 font-normal text-lg">| Linhas Editoriais</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((ed, i) => {
              const prx = `ed_c_${org.replace(/\s/g,'')}_${i}`;
              return (
                <div key={i} className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white transition-colors">
                  <ET isAuth={isAuth} id={`${prx}_title`} defaultText={t(`${prx}_title`, ed.title)} tag="h4" className="font-bold text-blue-900 mb-2" onTextBlur={onTextBlur} />
                  <ET isAuth={isAuth} id={`${prx}_desc`} defaultText={t(`${prx}_desc`, ed.desc)} tag="p" className="text-sm text-slate-600 mb-3" onTextBlur={onTextBlur} />
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{ed.redes}</span>
                    {ed.personas && <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded truncate max-w-full" title={ed.personas}>Alvo: {ed.personas}</span>}
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

const TabObjetivos = ({ isAuth, customTexts, onTextBlur }) => {
  const t = (id, def) => useCustomText(customTexts, id, def);
  const objetivos = [
    { org: "CNT", items: [
      { title: "Fortalecer autoridade institucional", desc: "Consolidar a CNT como principal representante do transporte evidenciando atuação junto ao poder público.", result: "Aumentar percepção de relevância entre stakeholders.", eds: "Representatividade, Infraestrutura, Economia" },
      { title: "Fonte confiável de informação", desc: "Reforçar papel como referência em dados, estudos e inteligência setorial.", result: "Gerar reconhecimento técnico e estimular uso dos conteúdos.", eds: "Dados/Inteligência, Economia, Segurança" },
      { title: "Ampliar conexão com a sociedade", desc: "Aproximar a CNT traduzindo temas complexos e humanizando o setor.", result: "Aumentar alcance e identificação com a marca.", eds: "Pessoas que movem, Segurança, Infraestrutura (didática)" }
    ]},
    { org: "SEST SENAT", items: [
      { title: "Acesso a trabalho e qualificação", desc: "Posicionar redes como canal de conexão entre profissionais e mercado.", result: "Mais candidatos encaminhados e interesse em cursos.", eds: "Emprega Transporte, Rota da Qualificação" },
      { title: "Promover saúde, segurança e ESG", desc: "Difundir práticas de impacto na qualidade de vida e segurança.", result: "Conscientização, maior procura por saúde e reforço de imagem.", eds: "Prevenção, Saúde, Proteção, ESG" },
      { title: "Fortalecer vínculo com sociedade", desc: "Humanizar comunicação com conteúdos informativos e culturais.", result: "Mais engajamento e proximidade com diferentes públicos.", eds: "Nós Elas, Arte, Mídia" }
    ]},
    { org: "ITL", items: [
      { title: "Referência em inovação", desc: "Evidenciar como projetos do ITL geram impacto real nas empresas.", result: "Aumento da percepção de valor dos programas.", eds: "Inovação na prática, ITL Integra" },
      { title: "Atração para programas educacionais", desc: "Usar redes para divulgar oportunidades e estimular inscrições.", result: "Crescimento de inscritos e uso de recursos.", eds: "Agenda ITL, Biblioteca/Repositório" },
      { title: "Engajamento via provas sociais", desc: "Demonstrar resultados na formação de líderes com casos de sucesso.", result: "Maior confiança na instituição como referência.", eds: "Alumni ITL, Transporte na Mídia" }
    ]}
  ];

  return (
    <div className="space-y-8">
      <div className="bg-blue-900 text-white p-8 rounded-xl shadow-md text-center">
        <Target size={48} className="mx-auto mb-4 text-blue-300" />
        <ET isAuth={isAuth} id="obj_hero_title" defaultText={t("obj_hero_title","Objetivos Estratégicos 2026-2028")} tag="h2" className="text-3xl font-bold mb-2" onTextBlur={onTextBlur} />
        <ET isAuth={isAuth} id="obj_hero_desc" defaultText={t("obj_hero_desc","Diretrizes que norteiam toda a produção de conteúdo do Sistema Transporte no próximo triênio.")} tag="p" className="text-blue-100 max-w-2xl mx-auto text-lg" onTextBlur={onTextBlur} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {objetivos.map((group) => (
          <div key={group.org} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 p-4 border-b border-slate-200 text-center">
              <h3 className="text-2xl font-bold text-slate-800">{group.org}</h3>
            </div>
            <div className="p-4 space-y-4">
              {group.items.map((obj, i) => {
                const prx = `obj_c_${group.org.replace(/\s/g,'')}_${i}`;
                return (
                  <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <ET isAuth={isAuth} id={`${prx}_title`} defaultText={t(`${prx}_title`, `${i+1}. ${obj.title}`)} tag="h4" className="font-bold text-blue-700 mb-2" onTextBlur={onTextBlur} />
                    <ET isAuth={isAuth} id={`${prx}_desc`} defaultText={t(`${prx}_desc`, obj.desc)} tag="p" className="text-sm text-slate-700 mb-3" onTextBlur={onTextBlur} />
                    <div className="mb-2">
                      <span className="text-xs text-slate-500 uppercase tracking-wide block mb-1">Editorias:</span>
                      <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded inline-block">{obj.eds}</span>
                    </div>
                    <div>
                      <span className="text-xs text-emerald-600 uppercase tracking-wide block mb-1">Resultado Esperado:</span>
                      <ET isAuth={isAuth} id={`${prx}_val_res`} defaultText={t(`${prx}_val_res`, obj.result)} tag="p" className="text-sm font-medium text-emerald-800" onTextBlur={onTextBlur} />
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

const TabEstrategia = ({ isAuth, customTexts, onTextBlur }) => {
  const t = (id, def) => useCustomText(customTexts, id, def);
  return (
    <div className="space-y-8">
      <div className="bg-blue-900 text-white p-8 rounded-xl shadow-md flex items-center gap-6">
        <CompassIcon className="w-16 h-16 text-blue-200 opacity-80 flex-shrink-0 hidden md:block" />
        <div>
          <ET isAuth={isAuth} id="est_hero_title" defaultText={t("est_hero_title","Mudança de Paradigma")} tag="h2" className="text-3xl font-bold mb-2" onTextBlur={onTextBlur} />
          <ET isAuth={isAuth} id="est_hero_desc" defaultText={t("est_hero_desc","Migração de um modelo de presença digital para uma comunicação orientada pelo papel estratégico de cada canal e casa. O fim da replicação genérica de conteúdo.")} tag="p" className="text-blue-100 text-lg leading-relaxed" onTextBlur={onTextBlur} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <ET isAuth={isAuth} id="est_de_title" defaultText={t("est_de_title","Como é Hoje (De)")} tag="h3" className="text-xl font-bold text-slate-800 mb-4 text-center border-b pb-2" onTextBlur={onTextBlur} />
          <ul className="space-y-3 text-slate-600">
            {["Foco puramente institucional","Replicação idêntica entre canais","Linguagem única para todos","Foco isolado no Instagram"].map((def, i) => (
              <li key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                <ET isAuth={isAuth} id={`est_de_${i+1}`} defaultText={t(`est_de_${i+1}`, def)} tag="span" className="flex-1" onTextBlur={onTextBlur} />
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm">
          <ET isAuth={isAuth} id="est_para_title" defaultText={t("est_para_title","Onde Vamos Chegar (Para)")} tag="h3" className="text-xl font-bold text-blue-900 mb-4 text-center border-b border-blue-200 pb-2" onTextBlur={onTextBlur} />
          <ul className="space-y-3 text-blue-800 font-medium">
            {["Conteúdo orientado por Persona + Canal","Objetivo claro por post (engajamento? conversão?)","LinkedIn como motor de influência","YouTube gerando autoridade real"].map((def, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                <ET isAuth={isAuth} id={`est_para_${i+1}`} defaultText={t(`est_para_${i+1}`, def)} tag="span" className="flex-1" onTextBlur={onTextBlur} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <ET isAuth={isAuth} id="est_cam_title" defaultText={t("est_cam_title","As 3 Camadas de Conteúdo (Estrutura Triênio)")} tag="h3" className="text-2xl font-bold text-slate-800 mb-6 text-center" onTextBlur={onTextBlur} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { num:"1", bg:"pink", titleDef:"Impacto (Instagram)", descDef:"Alcance, conexão, tradução do transporte para a sociedade.", items:["Dados simplificados","Mensagem direta","Alto apelo visual"] },
            { num:"2", bg:"blue", titleDef:"Aprofundamento (LinkedIn)", descDef:"Posicionamento, influência, foco em gestores e governo.", items:["Contexto e análise","Implicações e dados completos","Posicionamento de liderança"] },
            { num:"3", bg:"red", titleDef:"Autoridade (YouTube)", descDef:"Profundidade de temas estratégicos. Fim do repositório.", items:["Explicação completa","Debates estruturados","Séries e entrevistas"] },
          ].map(({ num, bg, titleDef, descDef, items }) => (
            <div key={num} className={`p-6 bg-${bg}-50 border border-${bg}-100 rounded-xl text-center`}>
              <div className={`w-12 h-12 bg-${bg === 'blue' ? 'blue-600' : bg === 'red' ? 'red-600' : 'pink-500'} text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl`}>{num}</div>
              <ET isAuth={isAuth} id={`est_cam${num}_title`} defaultText={t(`est_cam${num}_title`, titleDef)} tag="h4" className={`text-xl font-bold text-${bg}-900 mb-2`} onTextBlur={onTextBlur} />
              <ET isAuth={isAuth} id={`est_cam${num}_desc`} defaultText={t(`est_cam${num}_desc`, descDef)} tag="p" className={`text-${bg}-800 text-sm mb-4`} onTextBlur={onTextBlur} />
              <ul className={`text-sm text-${bg}-700 text-left space-y-1`}>
                {items.map((item, i) => <li key={i}>• {item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 text-white p-6 rounded-xl text-center shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-emerald-400">O Papel Ideal de Cada Casa</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg">
          <div><strong className="block text-xl">CNT</strong><span>Pauta e direciona o debate</span></div>
          <div className="md:border-x border-slate-600"><strong className="block text-xl">SEST SENAT</strong><span>Mostra impacto real (Motor de alcance)</span></div>
          <div><strong className="block text-xl">ITL</strong><span>Mostra evolução e futuro (Indispensável)</span></div>
        </div>
      </div>
    </div>
  );
};

const TabCalendario = ({ isAuth, events, onUpdateEvents }) => {
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
  const toggleFilterOrg = (org) => setFilters(f => ({ ...f, orgs: f.orgs.includes(org) ? f.orgs.filter(o => o !== org) : [...f.orgs, org] }));
  const toggleFilterChannel = (ch) => setFilters(f => ({ ...f, channels: f.channels.includes(ch) ? f.channels.filter(c => c !== ch) : [...f.channels, ch] }));
  const toggleNewOrg = (org) => { setNewOrgs(prev => { const next = prev.includes(org) ? prev.filter(o => o !== org) : [...prev, org]; setNewEditoria(''); return next; }); };
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
      days.push({ day: d, isCurrentMonth: false, dateString: `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}` });
    }
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({ day: i, isCurrentMonth: true, dateString: `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}` });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const m = month === 11 ? 1 : month + 2;
      const y = month === 11 ? year + 1 : year;
      days.push({ day: i, isCurrentMonth: false, dateString: `${y}-${String(m).padStart(2,'0')}-${String(i).padStart(2,'0')}` });
    }
    return days;
  };

  const calendarDays = generateGrid();
  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];
    return events.filter(e => {
      const matchOrg = filters.orgs.length === 0 || e.orgs.some(o => filters.orgs.includes(o));
      const matchCh = filters.channels.length === 0 || e.channels.some(c => filters.channels.includes(c));
      return matchOrg && matchCh;
    });
  }, [events, filters]);

  const openAddModal = () => {
    setEditingId(null);
    setNewDate(`${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-01`);
    setNewOrgs(['CNT']); setNewChannels(['Instagram']); setNewEditoria(''); setNewTitle(''); setNewLink('');
    setIsModalOpen(true);
  };
  const handleEditClick = (ev) => {
    setEditingId(ev.id); setNewDate(ev.date); setNewOrgs([...ev.orgs]); setNewChannels([...ev.channels]);
    setNewEditoria(ev.editoria); setNewTitle(ev.title); setNewLink(ev.link || '');
    setIsModalOpen(true);
  };
  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!newDate || !newEditoria || !newTitle || newOrgs.length === 0 || newChannels.length === 0) return;
    let formattedLink = newLink.trim();
    if (formattedLink && !formattedLink.startsWith('http')) formattedLink = `https://${formattedLink}`;
    let updatedEvents;
    if (editingId) {
      updatedEvents = events.map(ev => ev.id === editingId ? { ...ev, date: newDate, orgs: newOrgs, channels: newChannels, editoria: newEditoria, title: newTitle, link: formattedLink } : ev);
    } else {
      updatedEvents = [...events, { id: Date.now(), date: newDate, orgs: newOrgs, channels: newChannels, editoria: newEditoria, title: newTitle, link: formattedLink, status: 'Planejado' }];
    }
    onUpdateEvents(updatedEvents);
    setIsModalOpen(false);
  };
  const confirmDelete = () => {
    if (itemToDelete !== null) { onUpdateEvents(events.filter(e => e.id !== itemToDelete)); setItemToDelete(null); }
  };
  const getOrgColor = (org) => ({ CNT: '#16a34a', 'SEST SENAT': '#2563eb', ITL: '#ec4899', 'SISTEMA TRANSPORTE': '#c084fc' }[org] || '#475569');

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="flex flex-col xl:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-blue-600 border border-slate-200"><ChevronLeft size={20} /></button>
          <select className="text-2xl font-bold text-blue-700 bg-transparent outline-none cursor-pointer hover:bg-slate-50 p-1 rounded" value={currentDate.getMonth()} onChange={e => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))}>
            {monthNames.map((m, i) => <option key={m} value={i}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
          </select>
          <select className="text-2xl font-bold text-blue-500 bg-transparent outline-none cursor-pointer hover:bg-slate-50 p-1 rounded" value={currentDate.getFullYear()} onChange={e => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}>
            {[2026,2027,2028].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={nextMonth} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-blue-600 border border-slate-200"><ChevronRight size={20} /></button>
        </div>
        {isAuth && (
          <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <Plus size={18} /> Incluir Pauta
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 text-slate-500 font-medium border-b border-slate-200 pb-2"><Filter size={18} /> Filtros Dinâmicos</div>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider w-16 flex-shrink-0">Casas:</span>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilters(f => ({...f, orgs: []}))} className={`px-3 py-1 text-xs rounded-full border transition-colors ${filters.orgs.length === 0 ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>Todas</button>
            {orgOptions.map(org => <button key={org} onClick={() => toggleFilterOrg(org)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${filters.orgs.includes(org) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>{org}</button>)}
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider w-16 flex-shrink-0">Canais:</span>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilters(f => ({...f, channels: []}))} className={`px-3 py-1 text-xs rounded-full border transition-colors ${filters.channels.length === 0 ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>Todos</button>
            {channelOptions.map(ch => <button key={ch} onClick={() => toggleFilterChannel(ch)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${filters.channels.includes(ch) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}`}>{ch}</button>)}
          </div>
        </div>
      </div>

      <div className="w-full border border-slate-300 rounded-lg overflow-hidden bg-slate-100 shadow-sm">
        <div className="grid grid-cols-7 bg-blue-700 text-white text-center">
          {weekDays.map((day, i) => <div key={i} className="py-2 text-xs sm:text-sm font-semibold border-r border-blue-600 last:border-0 truncate px-1">{day}</div>)}
        </div>
        <div className="grid grid-cols-7 border-t border-slate-300">
          {calendarDays.map((dayObj, index) => {
            const dayEvents = filteredEvents.filter(e => e.date === dayObj.dateString);
            return (
              <div key={index} className={`min-h-[140px] p-1.5 sm:p-2 border-r border-b border-slate-300 ${dayObj.isCurrentMonth ? 'bg-white' : 'bg-slate-50'} ${(index+1) % 7 === 0 ? 'border-r-0' : ''}`}>
                <div className={`text-sm font-bold mb-2 ${dayObj.isCurrentMonth ? 'text-slate-800' : 'text-slate-400'}`}>{dayObj.day}</div>
                <div className="space-y-1.5">
                  {dayEvents.map(ev => (
                    <div key={ev.id} className="group relative flex items-start justify-between bg-white border border-slate-200 rounded p-1.5 shadow-sm hover:shadow-md transition-shadow">
                      <div className={`flex-1 min-w-0 mr-1 ${isAuth ? 'cursor-pointer' : ''}`} onClick={() => isAuth && handleEditClick(ev)}>
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <div className="flex gap-0.5">{ev.orgs.map(org => <span key={org} className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{backgroundColor: getOrgColor(org)}} title={org} />)}</div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase truncate leading-none flex-1">{ev.channels.join(', ')}</span>
                        </div>
                        {ev.link ? (
                          <a href={ev.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-xs text-blue-600 font-bold block leading-tight hover:underline flex items-start gap-1">
                            <span className="truncate">{ev.title}</span><ExternalLink size={12} className="flex-shrink-0 mt-0.5" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-700 font-medium block leading-tight">{ev.title}</span>
                        )}
                      </div>
                      {isAuth && <button onClick={e => { e.stopPropagation(); setItemToDelete(ev.id); }} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 flex-shrink-0"><Trash2 size={14} /></button>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-600 justify-center">
        {[['CNT','bg-green-600'],['SEST SENAT','bg-blue-600'],['ITL','bg-pink-500'],['SISTEMA TRANSPORTE','bg-purple-400']].map(([label, color]) => (
          <span key={label} className="flex items-center gap-1.5"><div className={`w-3 h-3 rounded-full ${color}`} />{label}</span>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
              <h3 className="font-bold text-lg">{editingId ? 'Editar Pauta' : 'Nova Pauta Editorial'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-blue-200 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSaveForm} className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Data</label>
                <input type="date" required value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Casa(s)</label>
                <div className="flex flex-wrap gap-2">
                  {orgOptions.map(org => <button type="button" key={org} onClick={() => toggleNewOrg(org)} className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${newOrgs.includes(org) ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>{org}</button>)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Editoria</label>
                <select required value={newEditoria} onChange={e => setNewEditoria(e.target.value)} disabled={newOrgs.length === 0} className="w-full border border-slate-300 rounded p-2 text-sm focus:border-blue-500 outline-none">
                  <option value="" disabled>Selecione uma editoria...</option>
                  {newOrgs.map(org => editoriasData[org] && (
                    <optgroup key={org} label={org}>
                      {editoriasData[org].map(ed => <option key={ed.title} value={ed.title}>{ed.title}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Canal(is)</label>
                <div className="flex flex-wrap gap-2">
                  {channelOptions.map(ch => <button type="button" key={ch} onClick={() => toggleNewChannel(ch)} className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${newChannels.includes(ch) ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>{ch}</button>)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Título / Assunto</label>
                <input type="text" required placeholder="Ex: Divulgação Relatório Anual" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Link do Briefing (Opcional)</label>
                <input type="text" placeholder="https://..." value={newLink} onChange={e => setNewLink(e.target.value)} className="w-full border border-slate-300 rounded p-2 text-sm focus:border-blue-500 outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-medium">Cancelar</button>
                <button type="submit" disabled={newOrgs.length === 0 || newChannels.length === 0 || !newEditoria} className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50">{editingId ? 'Salvar' : 'Criar Pauta'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {itemToDelete !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Pauta?</h3>
              <p className="text-sm text-slate-600 mb-6">Esta ação não pode ser desfeita.</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setItemToDelete(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-medium">Cancelar</button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700">Sim, excluir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- APP PRINCIPAL ---
export default function App() {
  const [activeTab, setActiveTab] = useState('panorama');
  const [isAuth, setIsAuth] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [cloudConnection, setCloudConnection] = useState('connecting');
  const [events, setEvents] = useState(defaultInitialEvents);
  const [metricasCanais, setMetricasCanais] = useState({});
  const [customTexts, setCustomTexts] = useState({});
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [saveState, setSaveState] = useState(null);

  const cloudSnapshot = useRef({ events: defaultInitialEvents, customTexts: {} });

  // --- SUPABASE: carregar dados ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await supabase
          .from('app_state')
          .select('*')
          .eq('id', SUPABASE_ROW_ID)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          const fetchedEvents = data.events || defaultInitialEvents;
          const fetchedTexts = data.custom_texts || {};
          cloudSnapshot.current = { events: fetchedEvents, customTexts: fetchedTexts };
          setEvents(fetchedEvents);
          setCustomTexts(fetchedTexts);
        }
        setCloudConnection('online');
      } catch (e) {
        console.error('Erro ao carregar dados:', e);
        setCloudConnection('offline');
      }
    };
    loadData();
  }, []);

  // --- SUPABASE: salvar dados ---
  // --- SUPABASE: salvar dados ---
const saveToCloud = useCallback(async (newEvents, newTexts) => {
  setSaveState('saving');
  try {
    const { error } = await supabase
      .from('app_state')
      .upsert({
        id: SUPABASE_ROW_ID,
        events: newEvents,
        custom_texts: newTexts,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

      if (error) throw error;

      cloudSnapshot.current = { events: newEvents, customTexts: newTexts };
      setHasUnsaved(false);
      setSaveState('success');
    } catch (e) {
      console.error('Erro ao salvar:', JSON.stringify(e));
      setSaveState('error');
    }
    setTimeout(() => setSaveState(null), 3000);
  }, []);

  const handleTextBlur = useCallback((id, value) => {
    setCustomTexts(prev => {
      if (prev[id] === value) return prev;
      setHasUnsaved(true);
      return { ...prev, [id]: value };
    });
  }, []);

  const handleSave = () => {
    saveToCloud(events, customTexts);
  };

  const handleUndo = () => {
    const snap = cloudSnapshot.current;
    setEvents(snap.events);
    setCustomTexts(snap.customTexts);
    setHasUnsaved(false);
  };

  const handleUpdateEvents = useCallback((newEvents) => {
    setEvents(newEvents);
    saveToCloud(newEvents, customTexts);
  }, [customTexts, saveToCloud]);

  const handleSaveMetricas = useCallback((chave, dados) => {
  setMetricasCanais(prev => {
    const novo = { ...prev, [chave]: dados };
    saveToCloud(events, customTexts, novo);
    return novo;
  });
}, [events, customTexts, saveToCloud]);

  const handleLoginClick = () => {
    if (isAuth) { setIsAuth(false); if (hasUnsaved) handleSave(); }
    else { setPasswordInput(''); setLoginError(false); setIsLoginModalOpen(true); }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput.trim().toUpperCase() === 'XOXO') { setIsAuth(true); setIsLoginModalOpen(false); }
    else setLoginError(true);
  };

  const tabs = [
  { id: 'panorama', label: 'Panorama', icon: BarChart3 },
  { id: 'personas', label: 'Personas', icon: Users },
  { id: 'editorias', label: 'Editorias', icon: FileText },
  { id: 'objetivos', label: 'Objetivos', icon: Target },
  { id: 'estrategia', label: 'Estratégia', icon: CompassIcon },
  { id: 'calendario', label: 'Calendário', icon: CalendarIcon },
  { id: 'canais', label: 'Canais', icon: BarChart3 },
];

  const sharedProps = { isAuth, customTexts, onTextBlur: handleTextBlur };

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative">
      <header className="bg-blue-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center font-black text-blue-900 text-xl">ST</div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold leading-tight">Estratégia de Redes Sociais</h1>
                <p className="text-xs text-blue-200 font-medium tracking-wide">SISTEMA TRANSPORTE | TRIÊNIO 2026-2028</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleLoginClick} className="flex items-center gap-2 px-3 py-1.5 bg-blue-800 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
                {isAuth ? <Unlock size={16} className="text-emerald-400" /> : <Lock size={16} className="text-blue-300" />}
                <span className="hidden md:inline">{isAuth ? 'Modo Edição: ON' : 'Editar'}</span>
              </button>
              {isAuth && (
                <>
                  <button onClick={handleUndo} disabled={!hasUnsaved} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors">
                    <Undo2 size={16} /><span className="hidden md:inline">Desfazer</span>
                  </button>
                  <button onClick={handleSave} disabled={saveState === 'saving' || !hasUnsaved} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors">
                    {saveState === 'saving' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    <span className="hidden md:inline">Salvar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto">
          <div className="flex space-x-1 py-2" style={{scrollbarWidth:'none'}}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-semibold whitespace-nowrap transition-all ${activeTab === id ? 'bg-slate-50 text-blue-700 border-t-2 border-blue-500' : 'text-blue-100 hover:bg-blue-800 hover:text-white'}`}>
                <Icon size={18} />{label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'panorama' && <TabPanorama {...sharedProps} />}
        {activeTab === 'personas' && <TabPersonas {...sharedProps} />}
        {activeTab === 'editorias' && <TabEditorias {...sharedProps} />}
        {activeTab === 'objetivos' && <TabObjetivos {...sharedProps} />}
        {activeTab === 'estrategia' && <TabEstrategia {...sharedProps} />}
        {activeTab === 'calendario' && <TabCalendario isAuth={isAuth} events={events} onUpdateEvents={handleUpdateEvents} />}
        {activeTab === 'canais' && (
  <TabCanais
    isAuth={isAuth}
    events={events}
    metricas={metricasCanais}
    onSaveMetricas={handleSaveMetricas}
  />
)}
      </main>

      <div className="fixed bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-full text-xs font-semibold text-slate-500 z-40">
        {cloudConnection === 'online' ? <span className="flex items-center gap-2"><Cloud size={14} className="text-emerald-500" /><span>Ligado à Nuvem</span></span>
  : cloudConnection === 'connecting' ? <span className="flex items-center gap-2"><Loader2 size={14} className="text-blue-500 animate-spin" /><span>A ligar...</span></span>
  : <span className="flex items-center gap-2"><CloudOff size={14} className="text-red-500" /><span>Offline</span></span>}
      </div>
      {saveState && (
        <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-xl border border-slate-200 p-4 flex items-center gap-3 z-50">
          {saveState === 'saving' && <><Loader2 className="animate-spin text-blue-600" size={20} /><span className="text-slate-700 font-medium">Salvando...</span></>}
          {saveState === 'success' && <><CheckCircle className="text-emerald-500" size={20} /><span className="text-slate-700 font-medium">Salvo com sucesso!</span></>}
          {saveState === 'error' && <><AlertTriangle className="text-red-500" size={20} /><span className="text-slate-700 font-medium">Erro ao salvar. Tente novamente.</span></>}
        </div>
      )}

      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2"><Lock size={18} /> Acesso Restrito</h3>
              <button onClick={() => setIsLoginModalOpen(false)} className="text-blue-200 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Senha de edição:</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} autoFocus value={passwordInput}
                  onChange={e => { setPasswordInput(e.target.value); setLoginError(false); }}
                  className={`w-full border rounded p-2 pr-10 text-sm outline-none ${loginError ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-blue-500'}`}
                  placeholder="Senha..." />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-slate-400 italic mt-1">gossip girl</p>
              {loginError && <p className="text-xs text-red-500 mt-2 font-medium">Senha incorreta.</p>}
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsLoginModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-medium">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">Desbloquear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}