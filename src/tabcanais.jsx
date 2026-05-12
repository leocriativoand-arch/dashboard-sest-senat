import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, Users, Eye, Heart, MessageCircle,
  Share2, BookOpen, Play, ThumbsUp, Repeat2, BarChart2,
  ChevronLeft, ChevronRight, Plus, Save, FileText
} from 'lucide-react';

// --- CONFIGURAÇÃO DE CANAIS E KPIs ---
const CANAIS_CONFIG = {
  instagram: {
    label: 'Instagram',
    cor: 'bg-pink-500',
    corClaro: 'bg-pink-50',
    corBorda: 'border-pink-200',
    corTexto: 'text-pink-700',
    emoji: '📸',
    kpis: [
      { id: 'seguidores', label: 'Seguidores', icon: Users, formato: 'numero' },
      { id: 'alcance', label: 'Alcance', icon: Eye, formato: 'numero' },
      { id: 'impressoes', label: 'Impressões', icon: BarChart2, formato: 'numero' },
      { id: 'engajamento', label: 'Taxa de Engajamento', icon: Heart, formato: 'percentual' },
      { id: 'stories_views', label: 'Views em Stories', icon: Play, formato: 'numero' },
    ]
  },
  tiktok: {
    label: 'TikTok',
    cor: 'bg-slate-900',
    corClaro: 'bg-slate-50',
    corBorda: 'border-slate-200',
    corTexto: 'text-slate-700',
    emoji: '🎵',
    kpis: [
      { id: 'seguidores', label: 'Seguidores', icon: Users, formato: 'numero' },
      { id: 'visualizacoes', label: 'Visualizações', icon: Play, formato: 'numero' },
      { id: 'curtidas', label: 'Curtidas', icon: Heart, formato: 'numero' },
      { id: 'compartilhamentos', label: 'Compartilhamentos', icon: Share2, formato: 'numero' },
      { id: 'engajamento', label: 'Taxa de Engajamento', icon: BarChart2, formato: 'percentual' },
    ]
  },
  facebook: {
    label: 'Facebook',
    cor: 'bg-blue-600',
    corClaro: 'bg-blue-50',
    corBorda: 'border-blue-200',
    corTexto: 'text-blue-700',
    emoji: '👤',
    kpis: [
      { id: 'seguidores', label: 'Seguidores', icon: Users, formato: 'numero' },
      { id: 'alcance', label: 'Alcance Orgânico', icon: Eye, formato: 'numero' },
      { id: 'impressoes', label: 'Impressões', icon: BarChart2, formato: 'numero' },
      { id: 'engajamento', label: 'Engajamento', icon: Heart, formato: 'numero' },
      { id: 'cliques', label: 'Cliques no Link', icon: Share2, formato: 'numero' },
    ]
  },
  youtube: {
    label: 'YouTube',
    cor: 'bg-red-600',
    corClaro: 'bg-red-50',
    corBorda: 'border-red-200',
    corTexto: 'text-red-700',
    emoji: '▶️',
    kpis: [
      { id: 'inscritos', label: 'Inscritos', icon: Users, formato: 'numero' },
      { id: 'visualizacoes', label: 'Visualizações', icon: Play, formato: 'numero' },
      { id: 'horas_assistidas', label: 'Horas Assistidas', icon: BookOpen, formato: 'numero' },
      { id: 'likes', label: 'Likes', icon: ThumbsUp, formato: 'numero' },
      { id: 'comentarios', label: 'Comentários', icon: MessageCircle, formato: 'numero' },
    ]
  },
  linkedin: {
    label: 'LinkedIn',
    cor: 'bg-blue-800',
    corClaro: 'bg-blue-50',
    corBorda: 'border-blue-200',
    corTexto: 'text-blue-800',
    emoji: '💼',
    kpis: [
      { id: 'seguidores', label: 'Seguidores', icon: Users, formato: 'numero' },
      { id: 'impressoes', label: 'Impressões', icon: Eye, formato: 'numero' },
      { id: 'alcance', label: 'Alcance Único', icon: BarChart2, formato: 'numero' },
      { id: 'engajamento', label: 'Taxa de Engajamento', icon: Heart, formato: 'percentual' },
      { id: 'cliques', label: 'Cliques', icon: Share2, formato: 'numero' },
    ]
  },
  twitter: {
    label: 'X / Twitter',
    cor: 'bg-slate-800',
    corClaro: 'bg-slate-50',
    corBorda: 'border-slate-200',
    corTexto: 'text-slate-700',
    emoji: '𝕏',
    kpis: [
      { id: 'seguidores', label: 'Seguidores', icon: Users, formato: 'numero' },
      { id: 'impressoes', label: 'Impressões', icon: Eye, formato: 'numero' },
      { id: 'engajamento', label: 'Engajamentos', icon: Heart, formato: 'numero' },
      { id: 'retweets', label: 'Reposts', icon: Repeat2, formato: 'numero' },
      { id: 'cliques', label: 'Cliques no Link', icon: Share2, formato: 'numero' },
    ]
  }
};

const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const formatarNumero = (num) => {
  if (!num && num !== 0) return '—';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString('pt-BR');
};

const calcularVariacao = (atual, anterior) => {
  if (!anterior || anterior === 0) return null;
  return ((atual - anterior) / anterior * 100).toFixed(1);
};

// --- CARD DE KPI ---
const KpiCard = ({ kpi, valorAtual, valorAnterior }) => {
  const Icon = kpi.icon;
  const variacao = calcularVariacao(valorAtual, valorAnterior);
  const positivo = variacao > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{kpi.label}</span>
        <Icon size={16} className="text-slate-400" />
      </div>
      <div className="text-2xl font-bold text-slate-800 mb-1">
        {kpi.formato === 'percentual'
          ? `${valorAtual || '—'}%`
          : formatarNumero(valorAtual)}
      </div>
      {variacao !== null && (
        <div className={`flex items-center gap-1 text-xs font-medium ${positivo ? 'text-emerald-600' : 'text-red-500'}`}>
          {positivo ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {positivo ? '+' : ''}{variacao}% vs mês anterior
        </div>
      )}
      {variacao === null && (
        <div className="text-xs text-slate-400">Sem dados anteriores</div>
      )}
    </div>
  );
};

// --- MODAL DE MÉTRICAS ---
const ModalMetricas = ({ canal, config, mes, ano, dadosAtuais, onSave, onClose }) => {
  const [valores, setValores] = useState(dadosAtuais || {});
  const [notas, setNotas] = useState(dadosAtuais?.notas || '');

  const handleSave = () => {
    onSave({ ...valores, notas, mes, ano, canal });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className={`${config.cor} text-white px-6 py-4 flex justify-between items-center flex-shrink-0`}>
          <h3 className="font-bold text-lg">
            {config.emoji} {config.label} — {monthNames[mes - 1]} {ano}
          </h3>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          {config.kpis.map(kpi => (
            <div key={kpi.id}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{kpi.label}</label>
              <input
                type="number"
                placeholder={kpi.formato === 'percentual' ? 'Ex: 3.5' : 'Ex: 12500'}
                value={valores[kpi.id] || ''}
                onChange={e => setValores(prev => ({ ...prev, [kpi.id]: parseFloat(e.target.value) || '' }))}
                className="w-full border border-slate-300 rounded p-2 text-sm focus:border-blue-500 outline-none"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Notas / Observações</label>
            <textarea
              rows={3}
              placeholder="Ex: Campanha do dia das mães impulsionou o alcance..."
              value={notas}
              onChange={e => setNotas(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 text-sm focus:border-blue-500 outline-none resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-6 pt-2 border-t border-slate-100 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-medium">Cancelar</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 flex items-center gap-2">
            <Save size={16} /> Salvar Métricas
          </button>
        </div>
      </div>
    </div>
  );
};

// --- PAINEL DE CANAL ---
const PainelCanal = ({ canalId, config, metricas, onSaveMetricas, isAuth, events }) => {
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(2026);
  const [modalAberto, setModalAberto] = useState(false);

  const chave = `${canalId}_${anoAtual}_${mesAtual}`;
  const chaveAnterior = mesAtual === 1
    ? `${canalId}_${anoAtual - 1}_12`
    : `${canalId}_${anoAtual}_${mesAtual - 1}`;

  const dadosAtuais = metricas[chave] || {};
  const dadosAnteriores = metricas[chaveAnterior] || {};

  const prevMes = () => {
    if (mesAtual === 1) { setMesAtual(12); setAnoAtual(a => a - 1); }
    else setMesAtual(m => m - 1);
  };
  const nextMes = () => {
    if (mesAtual === 12) { setMesAtual(1); setAnoAtual(a => a + 1); }
    else setMesAtual(m => m + 1);
  };

  // Posts do calendário deste canal
  const postsDoCanal = (events || []).filter(ev =>
    ev.channels && ev.channels.some(ch => ch.toLowerCase().includes(canalId === 'twitter' ? 'x' : canalId))
  );

  const postsDoMes = postsDoCanal.filter(ev => {
    if (!ev.date) return false;
    const d = new Date(ev.date);
    return d.getMonth() + 1 === mesAtual && d.getFullYear() === anoAtual;
  });

  return (
    <div className="space-y-6">
      {/* Navegação de mês */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMes} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
            <ChevronLeft size={18} />
          </button>
          <h3 className="text-xl font-bold text-slate-800">
            {monthNames[mesAtual - 1]} {anoAtual}
          </h3>
          <button onClick={nextMes} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
        {isAuth && (
          <button
            onClick={() => setModalAberto(true)}
            className={`flex items-center gap-2 px-4 py-2 ${config.cor} text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity`}
          >
            <Plus size={16} /> Lançar Métricas
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {config.kpis.map(kpi => (
          <KpiCard
            key={kpi.id}
            kpi={kpi}
            valorAtual={dadosAtuais[kpi.id]}
            valorAnterior={dadosAnteriores[kpi.id]}
          />
        ))}
      </div>

      {/* Notas e Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notas do mês */}
        <div className={`${config.corClaro} border ${config.corBorda} rounded-xl p-5`}>
          <h4 className={`font-bold ${config.corTexto} mb-3 flex items-center gap-2`}>
            <FileText size={16} /> Notas de {monthNames[mesAtual - 1]}
          </h4>
          {dadosAtuais.notas ? (
            <p className="text-slate-700 text-sm leading-relaxed">{dadosAtuais.notas}</p>
          ) : (
            <p className="text-slate-400 text-sm italic">
              {isAuth ? 'Clique em "Lançar Métricas" para adicionar observações do mês.' : 'Nenhuma observação registrada para este mês.'}
            </p>
          )}
        </div>

        {/* Posts do mês neste canal */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
            <BarChart2 size={16} /> Posts em {monthNames[mesAtual - 1]} ({postsDoMes.length})
          </h4>
          {postsDoMes.length === 0 ? (
            <p className="text-slate-400 text-sm italic">Nenhum post planejado para este canal neste mês.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {postsDoMes.map(ev => (
                <div key={ev.id} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500 font-medium w-12 flex-shrink-0 mt-0.5">
                    {ev.date?.split('-')[2]}/{ev.date?.split('-')[1]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{ev.title}</p>
                    <p className="text-xs text-slate-400">{ev.editoria}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    ev.status === 'Publicado' ? 'bg-emerald-100 text-emerald-700' :
                    ev.status === 'Agendado' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>{ev.status || 'Planejado'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Histórico de métricas */}
      {Object.keys(metricas).filter(k => k.startsWith(canalId)).length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h4 className="font-bold text-slate-700 mb-4">Histórico de Métricas</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 pr-4 text-slate-500 font-semibold">Período</th>
                  {config.kpis.map(kpi => (
                    <th key={kpi.id} className="text-right py-2 px-2 text-slate-500 font-semibold">{kpi.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(metricas)
                  .filter(([k]) => k.startsWith(canalId))
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 6)
                  .map(([chave, dados]) => {
                    const parts = chave.split('_');
                    const ano = parts[parts.length - 2];
                    const mes = parts[parts.length - 1];
                    return (
                      <tr key={chave} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 pr-4 text-slate-700 font-medium">
                          {monthNames[parseInt(mes) - 1]?.substring(0, 3)} {ano}
                        </td>
                        {config.kpis.map(kpi => (
                          <td key={kpi.id} className="py-2 px-2 text-right text-slate-600">
                            {kpi.formato === 'percentual'
                              ? `${dados[kpi.id] || '—'}%`
                              : formatarNumero(dados[kpi.id])}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalAberto && (
        <ModalMetricas
          canal={canalId}
          config={config}
          mes={mesAtual}
          ano={anoAtual}
          dadosAtuais={dadosAtuais}
          onSave={(dados) => onSaveMetricas(chave, dados)}
          onClose={() => setModalAberto(false)}
        />
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const TabCanais = ({ isAuth, events, metricas = {}, onSaveMetricas }) => {
  const [canalAtivo, setCanalAtivo] = useState('instagram');
  const config = CANAIS_CONFIG[canalAtivo];

  return (
    <div className="space-y-6">
      {/* Abas de canal */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {Object.entries(CANAIS_CONFIG).map(([id, cfg]) => (
          <button
            key={id}
            onClick={() => setCanalAtivo(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              canalAtivo === id
                ? `${cfg.cor} text-white shadow-sm`
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{cfg.emoji}</span>
            <span>{cfg.label}</span>
          </button>
        ))}
      </div>

      {/* Painel do canal ativo */}
      <PainelCanal
        key={canalAtivo}
        canalId={canalAtivo}
        config={config}
        metricas={metricas}
        onSaveMetricas={onSaveMetricas}
        isAuth={isAuth}
        events={events}
      />
    </div>
  );
};

export default TabCanais;