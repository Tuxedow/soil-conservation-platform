import { useState, useEffect } from 'react';
import {
  BookOpen, Map, Shield, Briefcase,
  FileImage, CheckCircle, Search, Home,
  Database, Download, Upload, Star,
  ChevronRight, Bell, User, Settings,
  Zap, Globe, Layers, Target, Menu,
  X, Plus, Filter, Calendar, MapPin,
  CreditCard, HelpCircle, LogOut,
  FileText, Image, ChevronDown, Eye,
  File, Send, Loader2, Play, Circle,
  Menu as MenuIcon, ChevronLeft, FileCode,
  Sun, Moon, Share2, History, Bookmark, Download as DownloadIcon, Save, Trash2,
  LayoutGrid, List, AlertTriangle, XCircle, MessageSquare, FileInput, Copy, RefreshCw, Target as TargetIcon, ShieldCheck, ClipboardList, Wrench, Mountain, Route, Leaf, BarChart3, Network, SquarePlus
} from 'lucide-react';
import TiandituMap from './TiandituMap';
import { useTheme } from './ThemeContext';
import { useQueryHistory } from './useQueryHistory';
import { useChatRecords } from './useChatRecords';
import RAGFlowChat from './RAGFlowChat';
import SpatialQueryPage from './SpatialQueryPage';
import './App.css';

// 类型定义
interface SearchResult {
  id: number;
  title: string;
  type: string;
  relevance: number;
  content: string;
}

interface CaseItem {
  id: number;
  title: string;
  industry: string;
  score: number;
  downloads: number;
  features: string[];
}

interface ReviewResult {
  id: number;
  item: string;
  status: 'pass' | 'warning' | 'error';
  message: string;
}

interface Regulation {
  id: number;
  title: string;
  code: string;
  type: string;
  category: string;
  date: string;
  issuer: string;
  status: string;
  tags: string[];
}

// 导航菜单
const navItems = [
  { id: 'home', name: '首页', icon: <Home size={20} /> },
  { id: 'regulations', name: '法规与标准', icon: <BookOpen size={20} /> },
  { id: 'spatial', name: '空间核查', icon: <Map size={20} /> },
  { id: 'cases', name: '行业图谱', icon: <Briefcase size={20} /> },
  { id: 'mapping', name: '制图与数据', icon: <Image size={20} /> },
  { id: 'review', name: '方案审查', icon: <CheckCircle size={20} /> },
];

// 模块页面标题和副标题
const modulePageTitles: Record<string, { title: string; subtitle: string }> = {
  regulations: { title: '法规与标准', subtitle: '法规检索与智能问答' },
  spatial: { title: '空间核查', subtitle: '选址选线避让与指标查询' },
  cases: { title: '行业图谱', subtitle: '行业认知与决策工具' },
  mapping: { title: '制图与数据', subtitle: '专题图定制与数据订阅' },
  review: { title: '方案审查', subtitle: 'AI辅助方案审查' },
};

// 快捷功能
const quickActions = [
  { id: 'review', title: '方案审查', icon: <CheckCircle size={24} />, color: '#ef4444', desc: 'AI辅助审查', action: 'navigate' },
  { id: 'ai', title: 'AI助手', icon: <Zap size={24} />, color: '#8b5cf6', desc: '智能问答', action: 'modal' },
  { id: 'mapping', title: '制图订阅', icon: <Image size={24} />, color: '#10b981', desc: '定制化制图', action: 'modal' },
  { id: 'data', title: '数据下载', icon: <Download size={24} />, color: '#0ea5e9', desc: 'API数据接口', action: 'modal' },
];

// 法规标准数据
const regulations: Regulation[] = [
  { id: 1, title: '中华人民共和国水土保持法', code: '', type: '法律', category: '基础法律/综合管理', date: '2010年12月25日', issuer: '全国人大常委会', status: '有效', tags: ['基础法律', '综合管理'] },
  { id: 2, title: '生产建设项目水土保持方案管理办法', code: '水利部令第53号', type: '部门规章', category: '行政许可/方案管理', date: '2023年1月17日', issuer: '水利部', status: '有效', tags: ['行政许可', '方案管理'] },
  { id: 3, title: '生产建设项目水土保持技术标准', code: 'GB 50434-2018', type: '国家标准', category: '技术标准/工程设计', date: '2018年11月01日', issuer: '住建部/市场监管总局', status: '有效', tags: ['技术标准', '工程设计'] },
  { id: 4, title: '生产建设项目水土流失防治标准', code: 'GB 50433-2018', type: '国家标准', category: '技术标准/防治指标', date: '2018年11月01日', issuer: '住建部/市场监管总局', status: '有效', tags: ['技术标准', '防治指标'] },
  { id: 5, title: '生产建设项目水土保持监测与评价标准', code: 'GB/T 51240-2018', type: '国家标准', category: '监测评价', date: '2018年05月01日', issuer: '住建部/市场监管总局', status: '有效', tags: ['监测评价'] },
  { id: 6, title: '水土保持工程调查与勘测标准', code: 'GB/T 51297-2018', type: '国家标准', category: '调查勘测', date: '2018年05月01日', issuer: '住建部/市场监管总局', status: '有效', tags: ['调查勘测'] },
  { id: 7, title: '水土保持术语', code: 'GB/T 20465-2006', type: '国家标准', category: '基础通用/术语定义', date: '2006年11月01日', issuer: '国家标准化管理委员会', status: '有效', tags: ['基础通用', '术语定义'] },
  { id: 8, title: '生产建设项目水土保持设施验收技术规程', code: 'GB/T 22490-2025', type: '国家标准', category: '验收管理', date: '2025年04月01日', issuer: '市场监管总局/国家标准化管理委员会', status: '即将生效', tags: ['验收管理'] },
  { id: 9, title: '土地利用现状分类', code: 'GB/T 21010-2017', type: '国家标准', category: '调查勘测/土地分类', date: '2017年11月01日', issuer: '国土资源部/国家标准化管理委员会', status: '有效', tags: ['调查勘测', '土地分类'] },
  { id: 10, title: '水土保持工程设计规范', code: 'GB 51018-2014', type: '国家标准', category: '技术标准/工程设计', date: '2015年05月01日', issuer: '住建部/国家标准化管理委员会', status: '有效', tags: ['技术标准', '工程设计'] },
  { id: 11, title: '土壤侵蚀分类分级标准', code: 'SL 190-2007', type: '行业标准', category: '调查勘测/侵蚀评估', date: '2008年03月01日', issuer: '水利部', status: '有效', tags: ['调查勘测', '侵蚀评估'] },
  { id: 12, title: '水土保持遥感监测技术规范', code: 'SL 592-2012', type: '行业标准', category: '监测评价/遥感技术', date: '2013年02月18日', issuer: '水利部', status: '有效', tags: ['监测评价', '遥感技术'] },
];

// 示例案例数据
const cases: CaseItem[] = [
  { id: 1, title: '某高速公路项目水土保持方案', industry: '交通运输', score: 95, downloads: 1234, features: ['防治分区合理', '措施体系完整', '土石方平衡准确'] },
  { id: 2, title: '某风电场项目水土保持方案', industry: '电力能源', score: 92, downloads: 856, features: ['风沙防护措施到位', '植被恢复方案科学'] },
  { id: 3, title: '某铁矿开采项目水土保持方案', industry: '采矿冶金', score: 88, downloads: 654, features: ['排土场布局合理', '水土流失控制有效'] },
  { id: 4, title: '某住宅小区项目水土保持方案', industry: '建筑工程', score: 90, downloads: 432, features: ['雨洪利用设计', '景观结合美观'] },
  { id: 5, title: '某水利枢纽工程水土保持方案', industry: '水利水电', score: 94, downloads: 567, features: ['水土保持措施完善', '生态修复效果好'] },
];

// 指标数据
const indicatorData = [
  { id: 'governance', name: '水土流失治理度', value: '85%', region: '西北黄土高原区', range: '80-90%' },
  { id: 'control', name: '土壤流失控制比', value: '0.8', region: '南方红壤丘陵区', range: '0.7-1.0' },
  { id: 'protection', name: '渣土防护率', value: '90%', region: '东北黑土区', range: '85-95%' },
  { id: 'soil', name: '表土保护率', value: '95%', region: '西南土石山区', range: '90-98%' },
  { id: 'vegetation', name: '林草植被恢复率', value: '80%', region: '北方土石山区', range: '75-85%' },
  { id: 'coverage', name: '林草覆盖率', value: '25%', region: '西北黄土高原区', range: '20-30%' },
];

// ===== 组件 =====

// AI检索结果组件
function AISearchResults({ query, onClose }: { query: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setResults([
        {
          id: 1,
          title: 'GB/T 15772-2022 水土保持综合治理规划通则',
          type: '国标',
          relevance: 95,
          content: `根据您的查询"${query}"，推荐以下条款：\n\n第5.2.1条 防治分区划分应根据地形地貌、土壤侵蚀类型、土地利用现状等因素综合确定。\n\n第6.3.2条 措施布局应遵循"因地制宜、因害设防"的原则。`
        },
        {
          id: 2,
          title: 'SL 575-2012 水土保持工程设计规范',
          type: '行标',
          relevance: 88,
          content: `相关条款：\n\n第4.1.3条 工程设计应充分考虑当地气候条件和土壤特性，合理选择水土保持措施类型和规模。\n\n第5.2.1条 植被措施应选择适生、速生树种，草种应选择耐旱、耐瘠薄品种。`
        },
        {
          id: 3,
          title: '某高速公路项目水土保持方案',
          type: '案例',
          relevance: 82,
          content: `推荐案例特点：\n1. 防治分区划分为4个一级区，12个二级区\n2. 主要措施包括植草护坡、排水沟、沉沙池等\n3. 土石方利用率达到85%\n4. 投资估算约5000万元`
        },
      ]);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="pc-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>AI智能检索结果</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="search-query-display">
            <Zap size={16} className="ai-icon" />
            <span>查询关键词：{query}</span>
          </div>

          {loading ? (
            <div className="loading-container">
              <Loader2 size={40} className="spinning" />
              <p>AI正在分析检索相关法规条款...</p>
            </div>
          ) : (
            <div className="search-results">
              {results.map((result, idx) => (
                <div key={result.id} className="search-result-item">
                  <div className="result-header">
                    <span className="result-type">{result.type}</span>
                    <div className="relevance-bar">
                      <div className="relevance-fill" style={{ width: `${result.relevance}%` }}></div>
                      <span className="relevance-text">{result.relevance}%相关</span>
                    </div>
                  </div>
                  <h4>{result.title}</h4>
                  <p className="result-content">{result.content}</p>
                  <div className="result-actions">
                    <button className="btn btn-secondary btn-sm">
                      <Eye size={14} /> 查看详情
                    </button>
                    <button className="btn btn-primary btn-sm">
                      <Download size={14} /> 下载
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 法规页面
function RegulationsPage({ onOpenModal }: { onOpenModal: (modal: React.ReactNode) => void }) {
  const [activeTab, setActiveTab] = useState<'regulation_list' | 'ai_chat' | 'chat_records'>('regulation_list');
  const [listSearch, setListSearch] = useState('');
  const [listViewMode, setListViewMode] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState<string>('全部');
  const [chatLoading, setChatLoading] = useState(true);
  const [aiQuery, setAiQuery] = useState('');

  // 保存问答相关状态
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveQuestion, setSaveQuestion] = useState('');
  const [saveAnswer, setSaveAnswer] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 问答记录
  const { records, addRecord, toggleFavorite, deleteRecord, clearRecords } = useChatRecords();
  const [recordSearch, setRecordSearch] = useState('');
  const [recordTagFilter, setRecordTagFilter] = useState<string | null>(null);

  const regulationTypes = ['全部', '法律', '部门规章', '国家标准', '行业标准'];
  const tagOptions = ['基础法律', '综合管理', '行政许可', '方案管理', '技术标准', '监测评价', '调查勘测', '验收管理'];

  // 法规列表筛选
  const filteredRegulations = regulations.filter(reg => {
    const matchSearch = !listSearch || reg.title.toLowerCase().includes(listSearch.toLowerCase());
    const matchType = typeFilter === '全部' || reg.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleOpenSaveModal = () => {
    setSaveQuestion(aiQuery || '（从AI问答中保存）');
    setSaveAnswer('');
    setSelectedTags([]);
    setShowSaveModal(true);
  };

  const handleConfirmSave = () => {
    if (saveQuestion.trim()) {
      addRecord({
        type: 'regulation_chat',
        question: saveQuestion,
        answer: saveAnswer || '（AI回答内容保存在RAGFlow中）',
        tags: selectedTags,
        favorite: false,
      });
      setShowSaveModal(false);
      setActiveTab('chat_records');
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // 过滤问答记录
  const filteredRecords = records.filter(record => {
    const matchSearch = !recordSearch ||
      record.question.toLowerCase().includes(recordSearch.toLowerCase()) ||
      record.answer.toLowerCase().includes(recordSearch.toLowerCase());
    const matchTag = !recordTagFilter || record.tags.includes(recordTagFilter);
    return matchSearch && matchTag;
  });

  // 获取所有已使用的标签
  const usedTags = Array.from(new Set(records.flatMap(r => r.tags)));

  return (
    <div className="pc-page">
      <div className="page-header">
        <h1>法规与标准</h1>
        <p>结构化条款库 · 条款级精准检索</p>
      </div>

      {/* 主Tab切换 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--gray-200)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('regulation_list')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'regulation_list' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'regulation_list' ? 'white' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <BookOpen size={16} /> 快速查询
        </button>
        <button
          onClick={() => setActiveTab('ai_chat')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'ai_chat' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'ai_chat' ? 'white' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Zap size={16} /> AI问答
        </button>
        <button
          onClick={() => setActiveTab('chat_records')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'chat_records' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'chat_records' ? 'white' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <History size={16} /> 问答记录
          {records.length > 0 && (
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '12px'
            }}>
              {records.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab1: 快速查询 */}
      {activeTab === 'regulation_list' && (
        <>
          {/* 搜索框和视图切换 */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input
                type="text"
                placeholder="搜索法规名称..."
                value={listSearch}
                onChange={e => setListSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: '8px',
                  border: '1px solid var(--gray-200)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            {/* 视图切换按钮 */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--gray-50)', padding: '4px', borderRadius: '8px' }}>
              <button
                onClick={() => setListViewMode('grid')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: listViewMode === 'grid' ? 'var(--white)' : 'transparent',
                  color: listViewMode === 'grid' ? 'var(--primary)' : 'var(--gray-400)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="网格视图"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setListViewMode('list')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: listViewMode === 'list' ? 'var(--white)' : 'transparent',
                  color: listViewMode === 'list' ? 'var(--primary)' : 'var(--gray-400)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="列表视图"
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* 分类Tab */}
          <div className="tabs-section">
            <div className="tabs-row">
              {regulationTypes.map((tab, idx) => (
                <button
                  key={idx}
                  className={`tab-pill ${typeFilter === tab ? 'active' : ''}`}
                  onClick={() => setTypeFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* 法规列表 - 网格视图 */}
          {listViewMode === 'grid' && (
            <div className="list-grid">
              {filteredRegulations.map(reg => (
                <div key={reg.id} className="list-item">
                  <div className="list-item-header">
                    <span className="item-type">{reg.type}</span>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      background: reg.status === '有效' ? '#d1fae5' : '#fef3c7',
                      color: reg.status === '有效' ? '#059669' : '#d97706',
                    }}>
                      {reg.status}
                    </span>
                  </div>
                  <h3 className="list-item-title">{reg.title}</h3>
                  {reg.code && (
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#dc2626', marginBottom: '4px' }}>
                      {reg.code}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                    {reg.category}
                  </div>
                  <div className="list-item-tags">
                    {reg.tags.map((tag, idx) => (
                      <span key={idx} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginBottom: '8px' }}>
                    {reg.issuer}
                  </div>
                  <div className="list-item-actions">
                    <button className="action-chip">
                      <Eye size={14} /> 预览
                    </button>
                    <button className="action-chip primary" onClick={() => { setAiQuery(`请解读《${reg.title}》的相关规定`); setActiveTab('ai_chat'); }}>
                      <Zap size={14} /> AI快问
                    </button>
                    <button className="action-chip">
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 法规列表 - 列表视图 */}
          {listViewMode === 'list' && (
            <div style={{ background: 'var(--white)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-100)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', width: '15%' }}>文件号</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', width: '25%' }}>法规名称</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', width: '8%' }}>类型</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', width: '15%' }}>业务类型</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', width: '12%' }}>发布部门</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', width: '10%' }}>发布时间</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', width: '7%' }}>状态</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', width: '8%' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegulations.map(reg => (
                    <tr key={reg.id} style={{ borderBottom: '1px solid var(--gray-50)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#dc2626', whiteSpace: 'nowrap' }}>{reg.code || '-'}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '13px' }}>{reg.title}</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: reg.type === '法律' ? '#dbeafe' : reg.type === '部门规章' ? '#fef3c7' : reg.type === '国家标准' ? '#d1fae5' : '#f3e8ff',
                          color: reg.type === '法律' ? '#1d4ed8' : reg.type === '部门规章' ? '#d97706' : reg.type === '国家标准' ? '#059669' : '#9333ea',
                          fontSize: '10px',
                          whiteSpace: 'nowrap'
                        }}>{reg.type}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)' }}>{reg.category}</td>
                      <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-secondary)' }}>{reg.issuer}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>{reg.date}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 6px',
                          borderRadius: '4px',
                          background: reg.status === '有效' ? '#d1fae5' : '#fef3c7',
                          color: reg.status === '有效' ? '#059669' : '#d97706',
                          fontSize: '10px',
                          whiteSpace: 'nowrap'
                        }}>{reg.status}</span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button className="action-chip primary" style={{ padding: '6px 8px' }} title="AI快问" onClick={() => { setAiQuery(`请解读《${reg.title}》的相关规定`); setActiveTab('ai_chat'); }}>
                            <Zap size={14} />
                          </button>
                          <button className="action-chip" style={{ padding: '6px 8px' }} title="预览">
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Tab2: AI问答 */}
      {activeTab === 'ai_chat' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '100%',
            maxWidth: '800px',
            padding: '20px',
            background: 'var(--white)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--primary-lighter)', color: 'var(--primary)' }}>
                <Zap size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>AI智能问答助手</h3>
                <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '4px 0 0 0' }}>基于水土保持法规知识库，为你提供专业解答</p>
              </div>
            </div>

            {/* RAGFlow iframe */}
            <div style={{
              width: '100%',
              height: '500px',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              background: 'var(--gray-50)'
            }}>
              {chatLoading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--gray-50)',
                  zIndex: 10,
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                  }}>
                    <Zap size={24} color="white" />
                  </div>
                  <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>正在加载 AI 助手...</p>
                </div>
              )}
              <iframe
                src="http://dtgis.com.cn:55558/next-chats/share?shared_id=fc9971fa1ddb11f195020242ac140006&from=chat&auth=bKG1WNOGTPHDAfY5mdu5SJclO_v4ZIYn&theme=light"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  transform: 'scale(1.08)',
                  transformOrigin: 'top left',
                  fontSize: '16px',
                  opacity: chatLoading ? 0 : 1,
                  transition: 'opacity 0.3s ease',
                }}
                frameBorder="0"
                allow="clipboard-read; clipboard-write"
                title="土土AI问答"
                onLoad={() => setChatLoading(false)}
              />
              {/* 遮挡顶部logo */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '90px',
                backgroundColor: '#ffffff',
                zIndex: 1,
                pointerEvents: 'none',
                borderBottom: '1px solid #e2e8f0'
              }} />
            </div>

            {/* 保存按钮 */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <button
                onClick={handleOpenSaveModal}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                }}
              >
                <Save size={16} />
                保存此问答
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab3: 问答记录 */}
      {activeTab === 'chat_records' && (
        <div className="chat-records-section">
          {/* 搜索和筛选 */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
              <input
                type="text"
                placeholder="搜索问答记录..."
                value={recordSearch}
                onChange={e => setRecordSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: '8px',
                  border: '1px solid var(--gray-200)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            {/* 标签筛选 */}
            {usedTags.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setRecordTagFilter(null)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '16px',
                    border: !recordTagFilter ? 'none' : '1px solid var(--gray-200)',
                    background: !recordTagFilter ? 'var(--primary)' : 'var(--white)',
                    color: !recordTagFilter ? 'white' : 'var(--text-primary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  全部
                </button>
                {usedTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setRecordTagFilter(tag)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      border: recordTagFilter === tag ? 'none' : '1px solid var(--gray-200)',
                      background: recordTagFilter === tag ? 'var(--primary)' : 'var(--white)',
                      color: recordTagFilter === tag ? 'white' : 'var(--text-primary)',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 记录列表 */}
          <div className="records-list">
            {filteredRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gray-400)' }}>
                <History size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p style={{ fontSize: '14px' }}>暂无问答记录</p>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>在AI问答中进行搜索并保存即可生成记录</p>
              </div>
            ) : (
              filteredRecords.map(record => (
                <div key={record.id} style={{
                  padding: '16px',
                  background: 'var(--white)',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  border: '1px solid var(--gray-100)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>
                      {new Date(record.timestamp).toLocaleString('zh-CN')}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => toggleFavorite(record.id)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: 'none',
                          background: record.favorite ? '#fef3c7' : 'var(--gray-50)',
                          color: record.favorite ? '#d97706' : 'var(--gray-400)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px'
                        }}
                      >
                        <Bookmark size={14} fill={record.favorite ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => deleteRecord(record.id)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: 'none',
                          background: 'var(--gray-50)',
                          color: 'var(--gray-400)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--primary)', marginRight: '4px' }}>Q:</span>
                      {record.question}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <span style={{ color: 'var(--gray-400)', marginRight: '4px' }}>A:</span>
                      {record.answer.length > 150 ? record.answer.substring(0, 150) + '...' : record.answer}
                    </div>
                  </div>
                  {record.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {record.tags.map(tag => (
                        <span key={tag} style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: 'var(--primary-lighter)',
                          color: 'var(--primary)',
                          fontSize: '11px'
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 清空按钮 */}
          {records.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--gray-100)' }}>
              <button
                onClick={clearRecords}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid var(--gray-200)',
                  background: 'var(--white)',
                  color: 'var(--gray-500)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={14} />
                清空全部记录
              </button>
            </div>
          )}
        </div>
      )}

      {/* 保存问答模态框 */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            padding: '24px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Save size={20} color='var(--primary)' />
                保存此问答
              </h2>
              <button
                onClick={() => setShowSaveModal(false)}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--gray-50)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                问题
              </label>
              <textarea
                value={saveQuestion}
                onChange={e => setSaveQuestion(e.target.value)}
                placeholder="输入问题..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--gray-200)',
                  fontSize: '14px',
                  lineHeight: 1.5,
                  resize: 'vertical',
                  minHeight: '80px',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                添加标签（可选）
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {tagOptions.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      border: selectedTags.includes(tag) ? 'none' : '1px solid var(--gray-200)',
                      background: selectedTags.includes(tag) ? 'var(--primary)' : 'var(--white)',
                      color: selectedTags.includes(tag) ? 'white' : 'var(--text-primary)',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => setShowSaveModal(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid var(--gray-200)',
                  background: 'var(--white)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                取消
              </button>
              <button
                onClick={handleConfirmSave}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Save size={16} />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 指标地图页面
function MapPage({ onOpenModal, onAddHistory }: { onOpenModal: (modal: React.ReactNode) => void; onAddHistory?: (item: any) => void }) {
  const [coordInput, setCoordInput] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [markers, setMarkers] = useState<Array<{ position: [number, number]; popup?: string; color?: string }>>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');

  const handleShare = () => {
    if (queryResult && queryResult.location) {
      const link = `${window.location.origin}?type=map&location=${encodeURIComponent(queryResult.location)}`;
      setShareLink(link);
      setShowShareModal(true);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!queryResult) return;

    if (format === 'excel') {
      const headers = ['指标名称', '数值', '状态'];
      const rows = queryResult.indicators.map((ind: any) => [ind.name, ind.value, ind.status === 'normal' ? '正常' : '警告']);
      const csv = [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `水土保持指标_${queryResult.location}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleCoordinateQuery = () => {
    if (!coordInput.trim()) return;

    // 解析经纬度
    const coords = coordInput.split(',').map(s => parseFloat(s.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      setMarkers([{ position: [coords[1], coords[0]], popup: coordInput, color: '#3b82f6' }]);
    }

    setIsQuerying(true);
    setQueryResult(null);

    setTimeout(() => {
      const result = {
        location: coordInput,
        indicators: [
          { name: '水土流失治理度', value: '85%', status: 'normal' },
          { name: '土壤流失控制比', value: '0.8', status: 'normal' },
          { name: '林草植被恢复率', value: '78%', status: 'warning' },
        ],
        region: '西北黄土高原区',
      };
      setQueryResult(result);
      if (onAddHistory) {
        onAddHistory({ type: 'map', location: coordInput, result });
      }
      setIsQuerying(false);
    }, 1500);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setIsQuerying(true);
    setQueryResult(null);
    setMarkers([{ position: [lat, lng], popup: `${lng.toFixed(4)}, ${lat.toFixed(4)}`, color: '#3b82f6' }]);

    setTimeout(() => {
      const result = {
        location: `${lng.toFixed(4)}, ${lat.toFixed(4)}`,
        indicators: [
          { name: '水土流失治理度', value: '82%', status: 'normal' },
          { name: '土壤流失控制比', value: '0.75', status: 'warning' },
          { name: '林草覆盖率', value: '22%', status: 'warning' },
        ],
        region: '南方红壤丘陵区',
      };
      setQueryResult(result);
      if (onAddHistory) {
        onAddHistory({ type: 'map', location: `${lng.toFixed(4)}, ${lat.toFixed(4)}`, coordinates: { lat, lng }, result });
      }
      setIsQuerying(false);
    }, 1500);
  };

  return (
    <div className="pc-page">
      <div className="page-header">
        <h1>指标地图</h1>
        <p>全国水土保持指标可视化查询</p>
      </div>

      <div className="map-layout">
        {/* 左侧地图区域 */}
        <div className="map-section">
          <div className="map-container" style={{ position: 'relative' }}>
            <TiandituMap
              onMapClick={handleMapClick}
              markers={markers}
            />
            {/* 图例 */}
            <div className="map-legend" style={{ position: 'absolute', bottom: '20px', left: '10px', zIndex: 1000, background: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '6px' }}>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#1e40af' }}></span>
                高指标区域
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#3b82f6' }}></span>
                中等指标
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#dbeafe' }}></span>
                低指标区域
              </div>
            </div>
          </div>
        </div>

        {/* 右侧查询面板 */}
        <div className="query-panel">
          <div className="query-section">
            <div className="query-header">
              <MapPin size={18} />
              <span>坐标查询</span>
            </div>
            <div className="query-input-row">
              <input
                type="text"
                placeholder="输入经纬度，如：108.5, 34.2"
                value={coordInput}
                onChange={e => setCoordInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleCoordinateQuery()}
              />
              <button className="btn btn-primary" onClick={handleCoordinateQuery}>
                查询
              </button>
            </div>
            <button className="btn btn-secondary btn-full" onClick={() => setMarkers([])}>
              <Play size={16} /> 在地图上点选位置
            </button>
          </div>

          {/* 查询结果 */}
          {(queryResult || isQuerying) && (
            <div className="query-result-section">
              {isQuerying ? (
                <div className="loading-container">
                  <Loader2 size={32} className="spinning" />
                  <p>正在查询...</p>
                </div>
              ) : queryResult && (
                <>
                  <div className="result-header">
                    <h3>查询结果</h3>
                    <span className="result-region">{queryResult.region}</span>
                  </div>
                  <div className="indicator-results">
                    {queryResult.indicators.map((ind: any, idx: number) => (
                      <div key={idx} className={`indicator-result-item ${ind.status}`}>
                        <div className="indicator-name">{ind.name}</div>
                        <div className="indicator-value">
                          <span className="value">{ind.value}</span>
                          {ind.status === 'warning' && <Circle size={16} fill="#f59e0b" className="warning-icon" />}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="result-actions">
                    <button className="btn btn-secondary" onClick={() => handleExport('excel')}>
                      <DownloadIcon size={16} /> 导出Excel
                    </button>
                    <button className="btn btn-secondary" onClick={handleShare}>
                      <Share2 size={16} /> 分享
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 指标列表 */}
          <div className="indicator-list-panel">
            <h3>常用指标</h3>
            <div className="indicator-list">
              {indicatorData.map(ind => (
                <div key={ind.id} className="indicator-item" onClick={() => onOpenModal(
                  <IndicatorDetailModal indicator={ind} onClose={() => onOpenModal(null)} />
                )}>
                  <div className="indicator-info">
                    <h4>{ind.name}</h4>
                    <p>适用区域：{ind.region}</p>
                  </div>
                  <div className="indicator-value">
                    <span>{ind.value}</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 分享模态框 */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="pc-modal-content small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>分享查询结果</h2>
              <button className="close-btn" onClick={() => setShowShareModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '12px' }}>复制以下链接分享查询结果：</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-tertiary)' }}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    alert('链接已复制到剪贴板');
                  }}
                >
                  复制
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 指标详情模态框
function IndicatorDetailModal({ indicator, onClose }: { indicator: any; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="pc-modal-content small" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{indicator.name}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="indicator-detail-value">
            <span className="value">{indicator.value}</span>
            <span className="unit">{indicator.id === 'control' ? '' : '%'}</span>
          </div>
          <div className="indicator-detail-info">
            <div className="info-row">
              <span className="label">适用区域</span>
              <span className="value">{indicator.region}</span>
            </div>
            <div className="info-row">
              <span className="label">指标范围</span>
              <span className="value">{indicator.range}</span>
            </div>
          </div>
          <div className="indicator-detail-desc">
            <h4>指标说明</h4>
            <p>该指标反映了{indicator.name}的具体要求，根据《水土保持综合治理规划通则》GB/T 15772-2022制定。</p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary">
            <MapPin size={16} /> 定位区域
          </button>
          <button className="btn btn-primary">
            查看详情
          </button>
        </div>
      </div>
    </div>
  );
}

// 敏感区查询页面
function SensitivePage({ onAddHistory }: { onAddHistory?: (item: any) => void }) {
  const [coordInput, setCoordInput] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [markers, setMarkers] = useState<Array<{ position: [number, number]; popup?: string; color?: string }>>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');

  const handleShare = () => {
    if (queryResult && queryResult.location) {
      const link = `${window.location.origin}?type=sensitive&location=${encodeURIComponent(queryResult.location)}`;
      setShareLink(link);
      setShowShareModal(true);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    if (!queryResult) return;

    if (format === 'excel') {
      const headers = ['敏感区名称', '状态', '距离'];
      const rows = queryResult.sensitiveAreas.map((area: any) => [
        area.name,
        area.status === 'inside' ? '区域内' : area.status === 'near' ? '临近' : '区域外',
        area.distance
      ]);
      const csv = [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `敏感区查询_${queryResult.location}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleCoordinateQuery = () => {
    if (!coordInput.trim()) return;

    // 解析经纬度
    const coords = coordInput.split(',').map(s => parseFloat(s.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      setMarkers([{ position: [coords[1], coords[0]], popup: coordInput, color: '#f59e0b' }]);
    }

    setIsQuerying(true);
    setQueryResult(null);

    setTimeout(() => {
      const result = {
        location: coordInput,
        sensitiveAreas: [
          { name: '国家级水土流失重点预防区', status: 'outside', distance: '5km' },
          { name: '省级水土流失重点治理区', status: 'near', distance: '2km' },
          { name: '饮用水水源保护区', status: 'outside', distance: '10km' },
          { name: '国家级自然保护区', status: 'outside', distance: '15km' },
        ],
        suggestion: '项目选址需注意避开省级水土流失重点治理区，建议调整选址或采取加强防护措施。',
      };
      setQueryResult(result);
      if (onAddHistory) {
        onAddHistory({ type: 'sensitive', location: coordInput, result });
      }
      setIsQuerying(false);
    }, 1500);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setIsQuerying(true);
    setQueryResult(null);
    setMarkers([{ position: [lat, lng], popup: `${lng.toFixed(4)}, ${lat.toFixed(4)}`, color: '#f59e0b' }]);

    setTimeout(() => {
      const result = {
        location: `${lng.toFixed(4)}, ${lat.toFixed(4)}`,
        sensitiveAreas: [
          { name: '国家级水土流失重点预防区', status: 'outside', distance: '3km' },
          { name: '省级水土流失重点治理区', status: 'inside', distance: '0km' },
          { name: '饮用水水源保护区', status: 'outside', distance: '8km' },
          { name: '国家级自然保护区', status: 'outside', distance: '20km' },
        ],
        suggestion: '警告：项目选址位于省级水土流失重点治理区内，需要进行水土保持方案专题论证。',
      };
      setQueryResult(result);
      if (onAddHistory) {
        onAddHistory({ type: 'sensitive', location: `${lng.toFixed(4)}, ${lat.toFixed(4)}`, coordinates: { lat, lng }, result });
      }
      setIsQuerying(false);
    }, 1500);
  };

  return (
    <div className="pc-page">
      <div className="page-header">
        <h1>敏感区查询</h1>
        <p>选址选线避让核查 · 敏感区识别</p>
      </div>

      <div className="map-layout">
        {/* 左侧地图 */}
        <div className="map-section">
          <div className="map-container" style={{ position: 'relative' }}>
            <TiandituMap
              onMapClick={handleMapClick}
              markers={markers}
            />
            {/* 图例 */}
            <div className="map-legend" style={{ position: 'absolute', bottom: '20px', left: '10px', zIndex: 1000, background: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '6px' }}>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#dc2626' }}></span>
                国家级敏感区
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></span>
                省级敏感区
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span>
                一般区域
              </div>
            </div>
          </div>
        </div>

        {/* 右侧查询面板 */}
        <div className="query-panel">
          <div className="query-section">
            <div className="query-header">
              <Shield size={18} style={{ color: '#d97706' }} />
              <span>敏感区核查</span>
            </div>
            <div className="query-input-row">
              <input
                type="text"
                placeholder="输入经纬度，如：108.5, 34.2"
                value={coordInput}
                onChange={e => setCoordInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleCoordinateQuery()}
              />
              <button className="btn btn-primary" onClick={handleCoordinateQuery}>
                核查
              </button>
            </div>
            <button className="btn btn-secondary btn-full" onClick={() => setMarkers([])}>
              <MapPin size={16} /> 在地图上点选位置
            </button>
          </div>

          {/* 核查结果 */}
          {(queryResult || isQuerying) && (
            <div className="query-result-section">
              {isQuerying ? (
                <div className="loading-container">
                  <Loader2 size={32} className="spinning" />
                  <p>正在核查敏感区...</p>
                </div>
              ) : queryResult && (
                <>
                  <div className="result-header">
                    <h3>核查结果</h3>
                    <span className="result-region">{queryResult.location}</span>
                  </div>

                  <div className="sensitive-results">
                    {queryResult.sensitiveAreas.map((area: any, idx: number) => (
                      <div key={idx} className={`sensitive-item ${area.status}`}>
                        <div className="sensitive-info">
                          <span className="sensitive-name">{area.name}</span>
                          <span className="sensitive-distance">距项目 {area.distance}</span>
                        </div>
                        <span className={`sensitive-status ${area.status}`}>
                          {area.status === 'inside' && '位于区内'}
                          {area.status === 'near' && '邻近区域'}
                          {area.status === 'outside' && '区域外'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="suggestion-box">
                    <h4>核查建议</h4>
                    <p>{queryResult.suggestion}</p>
                  </div>

                  <div className="result-actions">
                    <button className="btn btn-secondary" onClick={() => handleExport('excel')}>
                      <DownloadIcon size={16} /> 导出Excel
                    </button>
                    <button className="btn btn-secondary" onClick={handleShare}>
                      <Share2 size={16} /> 分享
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 分享模态框 */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="pc-modal-content small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>分享查询结果</h2>
              <button className="close-btn" onClick={() => setShowShareModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '12px' }}>复制以下链接分享查询结果：</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-tertiary)' }}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    alert('链接已复制到剪贴板');
                  }}
                >
                  复制
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 案例页面
// 行业认知数据
const industryKnowledge = {
  road: {
    name: '公路',
    title: '公路行业认知面板（图谱）',
    subtitle: '快速了解公路建设项目水土保持方案编制的整体结构、关键风险与核心要点',
    mainlineTitle: '公路建设项目水土保持方案编制主线',
    basisCount: 15,
    nodes: [
      {id:'project', icon:'Route', title:'项目构成', desc:'路线、桥隧、互通、临时工程等', tag:'基础信息', tone:'blue'},
      {id:'zone', icon:'BookOpen', title:'防治分区', desc:'路线工程区、桥梁工程区、施工生产生活区、弃渣场区等', tag:'高频问题', tone:'green'},
      {id:'earthwork', icon:'Wrench', title:'土石方平衡', desc:'挖填方量计算、调配路径、利用率、运距分析等', tag:'高频问题', tone:'orange'},
      {id:'spoil', icon:'Mountain', title:'弃渣场设置', desc:'选址论证、容量计算、防护与排水设计、稳定性分析等', tag:'高风险', tone:'red'},
      {id:'topsoil', icon:'Leaf', title:'表土保护', desc:'表土剥离、存放、回覆利用方向、表土平衡等', tag:'高频问题', tone:'teal'},
      {id:'measure', icon:'ShieldCheck', title:'措施配置', desc:'工程、植物、临时措施体系设计与布设', tag:'核心环节', tone:'yellow'},
      {id:'prediction', icon:'BarChart3', title:'水土流失预测', desc:'预测范围、时段、方法及防治效果分析', tag:'核心环节', tone:'purple'}
    ],
    risks: ['弃渣场位于居民点影响范围内 → 直接否决','弃渣场未取得合法权属 → 直接否决','未拦先弃、先弃后拦 → 红线问题','弃渣场位于河湖管理范围内 → 不得通过','弃渣场位于地质灾害隐患点或不稳定斜坡上 → 不得通过','借弃并存但未充分论证调配方案 → 高风险','表土未单独平衡或无明确利用方向 → 高风险'],
    decisions: [
      {id:'spoil', title:'弃渣场设置', tag:'高风险', desc:'选址、容量、防护、排水、稳定性论证等'},
      {id:'earthwork', title:'土石方平衡', tag:'高频问题', desc:'挖填、调配、平衡、利用率、运距、经济性等'},
      {id:'zone', title:'防治分区', tag:'高频问题', desc:'分区依据、分区面积计算、典型分区设置等'},
      {id:'topsoil', title:'表土保护与利用', tag:'高频问题', desc:'资源调查、剥离厚度、堆存防护、利用方向等'}
    ],
    chapters: ['1.1 项目概况与水土流失防治工作概况','1.3 水土流失预测结果','2.1 水土流失防治责任范围及分区','2.3 弃渣场设置及防护措施','2.4 表土资源保护与利用','3 水土保持措施体系及工程量','5 防治效果及可行性分析','6 水土保持监测'],
    basis: ['GB 50433-2018 生产建设项目水土保持技术标准','办水保〔2023〕177号 生产建设项目水土保持方案管理办法','水保〔2024〕232号 生产建设项目水土保持方案编制导则（试行）','水利部办公厅〔2023〕177号 审查要点通知']
  },
  wind: {
    name: '风电',
    title: '风电行业认知面板（图谱）',
    subtitle: '快速了解风电项目水土保持方案编制的整体结构、关键风险与核心要点',
    mainlineTitle: '风电项目水土保持方案编制主线',
    basisCount: 16,
    nodes: [
      {id:'project', icon:'Route', title:'项目构成', desc:'风机、箱变、集电线路、升压站、道路等', tag:'基础信息', tone:'blue'},
      {id:'zone', icon:'BookOpen', title:'防治分区', desc:'风机区、道路区、升压站区、集电线路区、施工区等', tag:'高频问题', tone:'green'},
      {id:'earthwork', icon:'Wrench', title:'土石方平衡', desc:'开挖与填方计算、调配路径、利用率、运距分析等', tag:'高频问题', tone:'orange'},
      {id:'spoil', icon:'Mountain', title:'弃渣场设置', desc:'选址论证、容量计算、防护与排水设计、稳定性分析等', tag:'高风险', tone:'red'},
      {id:'topsoil', icon:'Leaf', title:'表土保护与利用', desc:'表土剥离、存放、回覆利用、表土平衡等', tag:'高频问题', tone:'teal'},
      {id:'measure', icon:'ShieldCheck', title:'措施配置', desc:'工程、植物、临时措施体系设计与布设', tag:'核心环节', tone:'yellow'},
      {id:'prediction', icon:'BarChart3', title:'水土流失预测', desc:'预测范围、时段、方法及防治效果分析', tag:'核心环节', tone:'purple'},
      {id:'monitor', icon:'ClipboardList', title:'监测与管理', desc:'监测方案、组织管理、后续设计等', tag:'保障环节', tone:'blue'}
    ],
    risks: ['弃渣场位于风口、强风区 → 直接否决','弃渣场位于滑坡、泥石流等地质灾害高易发区 → 不得通过','未拦先弃 → 红线问题','未设置排水工程或排水不完善 → 高风险','弃渣场未做稳定性分析 → 不得通过','未设置监测措施或监测方案不完善 → 高风险','表土未保护或随意堆放 → 高风险','临时占地未及时恢复或恢复措施不足 → 风险较高'],
    decisions: [
      {id:'spoil', title:'弃渣场设置', tag:'高风险', desc:'选址论证、容量计算、防护与排水、稳定性论证等'},
      {id:'earthwork', title:'土石方平衡', tag:'高频问题', desc:'挖填、调配、利用率、运距、经济性等'},
      {id:'topsoil', title:'表土保护与利用', tag:'高频问题', desc:'资源调查、剥离厚度、堆存防护、利用方向等'},
      {id:'zone', title:'防治分区', tag:'高频问题', desc:'分区依据、分区面积计算、典型分区设置等'}
    ],
    chapters: ['1.1 项目概况与水土流失防治工作概况','1.3 水土流失预测结果','2.1 水土流失防治责任范围及分区','2.2 土石方平衡及流向分析','2.3 弃渣场设置及防护措施','2.4 表土资源保护与利用','3 水土保持措施体系及工程量','5 水土保持监测'],
    basis: ['GB 50433-2018 生产建设项目水土保持技术标准','NB/T 31086-2024 风电场工程水土保持技术规范','水保〔2024〕232号 生产建设项目水土保持方案编制导则（试行）','办水保〔2023〕177号 生产建设项目水土保持方案管理办法']
  }
};

// 土石方决策规则
const earthRules = [
  {id:'RD-EARTH-001', key:'hasBorrowAndSpoil', value:true, type:'Risk', level:'orange', text:'项目同时存在借方和弃方，需证明不能内部调配。'},
  {id:'RD-EARTH-002', key:'provedNoInternalAdjust', value:false, type:'Risk', level:'red', text:'借弃并存但未论证不能内部调配，审查风险高。'},
  {id:'RD-EARTH-003', key:'distanceOver3km', value:true, type:'Risk', level:'orange', text:'平均运距超过3km，应进行经济技术比较。'},
  {id:'RD-EARTH-004', key:'economicCompared', value:false, type:'Risk', level:'orange', text:'运距较大但未做经济性比较，建议补充论证。'},
  {id:'RD-EARTH-005', key:'topsoilSeparateBalance', value:false, type:'Risk', level:'orange', text:'表土未单独平衡，容易被要求补充。'},
  {id:'RD-EARTH-006', key:'excavationRateOk', value:false, type:'Risk', level:'yellow', text:'挖方利用率偏低，需说明原因或优化利用方向。'},
  {id:'RD-EARTH-007', key:'spoilReuseRateOk', value:false, type:'Risk', level:'yellow', text:'弃渣综合利用率未达建议值，需补充优化措施。'},
  {id:'RD-EARTH-008', key:'legalSourceAndDestination', value:false, type:'Risk', level:'red', text:'借方来源或弃方去向缺少合法性说明，存在较高审查风险。'},
  {id:'RD-EARTH-009', key:'remainingDirectionClear', value:false, type:'Risk', level:'orange', text:'剩余表土或弃渣利用方向不明确，需形成去向闭环。'},
  {id:'RD-EARTH-A01', key:'hasBorrowAndSpoil', value:true, type:'Action', level:'none', text:'补充借弃并存原因，说明不能内部调配的工程条件。'},
  {id:'RD-EARTH-A02', key:'distanceOver3km', value:true, type:'Action', level:'none', text:'补充平均运距、运输路线及经济性比较。'},
  {id:'RD-EARTH-A03', key:'topsoilSeparateBalance', value:true, type:'Action', level:'none', text:'保留表土单独平衡表，并说明表土利用方向。'},
  {id:'RD-EARTH-A04', key:'legalSourceAndDestination', value:true, type:'Action', level:'none', text:'附借方来源、弃方去向及接收或处置证明材料。'}
];

// 写法建议
const writingSections = {
  earthwork: {
    title:'土石方平衡与利用',
    paragraph: '本项目土石方平衡应按照优先内部调配、减少外借外弃的原则进行。经核算，项目存在借方与弃方并存情形，需结合施工时序、空间位置、运输条件及材料适用性说明无法完全内部调配的原因。对平均运距较大的调配路径，应补充经济技术比较；对剩余表土和弃渣，应明确综合利用方向及合法去向，并形成利用闭环。'
  }
};

function CasesPage({ onOpenModal }: { onOpenModal: (modal: React.ReactNode) => void }) {
  const [subModule, setSubModule] = useState<'map' | 'decision'>('map');
  const [selectedIndustry, setSelectedIndustry] = useState<'road' | 'wind'>('road');
  const [activeDecision, setActiveDecision] = useState('earthwork');

  const currentKnowledge = industryKnowledge[selectedIndustry];

  return (
    <div className="pc-page">
      <div className="page-header cases-header">
        <div className="cases-header-left">
          <h1>行业图谱</h1>
          <p>行业认知与决策工具</p>
        </div>
        {/* 子模块切换 - 放在标题右侧 */}
        <div className="sub-module-tabs">
          <button
            className={`sub-tab ${subModule === 'map' ? 'active' : ''}`}
            onClick={() => setSubModule('map')}
          >
            <Network size={18} /> 认知地图
          </button>
          <button
            className={`sub-tab ${subModule === 'decision' ? 'active' : ''}`}
            onClick={() => setSubModule('decision')}
          >
            <Target size={18} /> 决策面板
          </button>
        </div>
      </div>

      {/* 行业认知图谱子模块 */}
      {subModule === 'map' && (
        <KnowledgeMapPanel
          industry={selectedIndustry}
          setIndustry={setSelectedIndustry}
          data={currentKnowledge}
          onOpenDecision={(id) => {
            setActiveDecision(id);
            setSubModule('decision');
          }}
        />
      )}

      {/* 决策面板子模块 */}
      {subModule === 'decision' && (
        <DecisionPanel
          industry={selectedIndustry}
          activeDecision={activeDecision}
          setActiveDecision={setActiveDecision}
          onBackToMap={() => setSubModule('map')}
        />
      )}
    </div>
  );
}

// 行业认知图谱组件
function KnowledgeMapPanel({ industry, setIndustry, data, onOpenDecision }: {
  industry: 'road' | 'wind';
  setIndustry: (i: 'road' | 'wind') => void;
  data: typeof industryKnowledge.road;
  onOpenDecision: (id: string) => void;
}) {
  const riskCount = industry === 'road' ? 12 : 14;

  return (
    <div className="knowledge-map-panel">
      {/* 顶部行业切换 */}
      <div className="km-header">
        <div className="km-industry-switch">
          <button className={industry === 'road' ? 'active' : ''} onClick={() => setIndustry('road')}>公路</button>
          <button className={industry === 'wind' ? 'active' : ''} onClick={() => setIndustry('wind')}>风电</button>
        </div>
      </div>

      {/* 主标题 */}
      <div className="km-title-section">
        <h1>{data.title}</h1>
        <p>{data.subtitle}</p>
      </div>

      {/* 主线流程 */}
      <div className="km-mainline-card">
        <div className="km-card-title">
          {data.mainlineTitle}
          <small>点击节点可查看该环节的关键要点与常见问题</small>
        </div>
        <div className="km-nodes">
          {data.nodes.map((n, i) => (
            <div className="km-node" key={n.id} onClick={() => onOpenDecision(n.id)}>
              <span className={`km-num km-${n.tone}`}>{i + 1}</span>
              <div className={`km-ico km-${n.tone}`}>
                {n.icon === 'Route' && <Map size={30} />}
                {n.icon === 'BookOpen' && <BookOpen size={30} />}
                {n.icon === 'Wrench' && <Settings size={30} />}
                {n.icon === 'Mountain' && <MapPin size={30} />}
                {n.icon === 'Leaf' && <Globe size={30} />}
                {n.icon === 'ShieldCheck' && <Shield size={30} />}
                {n.icon === 'BarChart3' && <Target size={30} />}
                {n.icon === 'ClipboardList' && <FileText size={30} />}
              </div>
              <h3>{n.title}</h3>
              <p>{n.desc}</p>
              <em className={`km-tag km-${n.tone}`}>{n.tag}</em>
              {i < data.nodes.length - 1 && <ChevronRight className="km-arrow" size={22} />}
            </div>
          ))}
        </div>
      </div>

      {/* 四格布局 */}
      <div className="km-grid-4">
        {/* 高风险红线 */}
        <div className="km-card km-risk-card">
          <h2><AlertTriangle size={18} />高风险红线（重点关注）</h2>
          {data.risks.map((r, i) => (
            <div className="km-risk" key={i}><XCircle size={15} />{r}</div>
          ))}
          <button className="km-btn km-btn-danger">查看全部红线（{riskCount}条）</button>
        </div>

        {/* 关键决策点 */}
        <div className="km-card km-decision-card">
          <h2><Target size={18} />关键决策点 <small>点击进入决策面板</small></h2>
          <div className="km-decision-grid">
            {data.decisions.map(d => (
              <button key={d.id} className="km-decision-btn" onClick={() => onOpenDecision(d.id)}>
                <div>
                  <b>{d.title}</b>
                  <em>{d.tag}</em>
                </div>
                <p>{d.desc}</p>
                <span>进入决策面板 <ChevronRight size={14} /></span>
              </button>
            ))}
          </div>
        </div>

        {/* 关键章节提示 */}
        <div className="km-card">
          <h2><FileText size={18} />关键章节提示</h2>
          <ul className="km-bullets">
            {data.chapters.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
          <a className="km-link">查看完整章节重点 <ChevronRight size={14} /></a>
        </div>

        {/* 核心依据 */}
        <div className="km-card">
          <h2><FileText size={18} />核心依据</h2>
          {data.basis.map((b, i) => (
            <div className="km-basis" key={i}><FileText size={17} />{b}</div>
          ))}
          <a className="km-link">查看全部依据（{data.basisCount}份） <ChevronRight size={14} /></a>
        </div>
      </div>

      {/* 编制小贴士 */}
      <div className="km-card km-tips-card">
        <h2>编制小贴士</h2>
        <div className="km-tip-grid">
          <div className="km-tip">
            <Shield size={24} />
            <div><b>先识别风险，再定方案</b><p>优先识别红线与高频风险点，降低返工概率</p></div>
          </div>
          <div className="km-tip">
            <Target size={24} />
            <div><b>抓关键点，提效率</b><p>聚焦弃渣场、土石方、表土保护等高频问题</p></div>
          </div>
          <div className="km-tip">
            <FileText size={24} />
            <div><b>数据要可信，可溯源</b><p>计算过程要完整，依据要充分</p></div>
          </div>
          <div className="km-tip">
            <User size={24} />
            <div><b>与审查关注点一致</b><p>提前站在审查角度完善方案内容</p></div>
          </div>
          <div className="km-tip">
            <BookOpen size={24} />
            <div><b>及时更新政策标准</b><p>关注最新文件与技术要求</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 决策面板所有决策项
const decisionItems = [
  { id: 'earthwork', name: '土石方平衡与利用' },
  { id: 'spoil', name: '弃渣场选址与设计' },
  { id: 'topsoil', name: '表土剥离与利用' },
  { id: 'zone', name: '防治分区划分' },
  { id: 'measure', name: '措施设计' },
  { id: 'prediction', name: '水土流失预测' },
  { id: 'highfill', name: '高填深挖与桥隧论证' },
  { id: 'standard', name: '防治标准与指标' }
];

// 决策面板组件
function DecisionPanel({ industry, activeDecision, setActiveDecision, onBackToMap }: {
  industry: 'road' | 'wind';
  activeDecision: string;
  setActiveDecision: (id: string) => void;
  onBackToMap: () => void;
}) {
  const [mode, setMode] = useState<'guide' | 'paste'>('guide');
  const [step, setStep] = useState(0);
  const [facts, setFacts] = useState({
    hasBorrowAndSpoil: true,
    provedNoInternalAdjust: true,
    distanceOver3km: true,
    economicCompared: true,
    topsoilSeparateBalance: true,
    excavationRateOk: true,
    spoilReuseRateOk: true,
    legalSourceAndDestination: true,
    remainingDirectionClear: false
  });

  const matched = earthRules.filter(r => facts[r.key as keyof typeof facts] === r.value);
  const risks = matched.filter(r => r.type === 'Risk' && r.level !== 'none');
  const actions = matched.filter(r => r.type === 'Action');

  const currentDecisionItem = decisionItems.find(d => d.id === activeDecision) || decisionItems[0];

  const conclusion = risks.some(r => r.level === 'red')
    ? ['不可', '当前方案存在红线风险，建议调整后再使用。', 'bad']
    : risks.some(r => r.level === 'orange')
    ? ['有风险', '当前方案存在需补充说明的关键事项。', 'warn']
    : ['可行', '土石方平衡与利用方案基本符合规范要求，建议按以下要点完善后使用。', 'good'];

  const questions = [
    ['hasBorrowAndSpoil', '你的项目是否同时存在借方和弃方？', '指项目既有需要外借的土石方，又有需要外弃的土石方。'],
    ['provedNoInternalAdjust', '是否已经论证不能内部调配？', '借弃并存时，需要说明施工时序、空间位置、材料性质等限制。'],
    ['distanceOver3km', '平均运距是否超过3km？', '运距较大时，应补充经济性比较。'],
    ['topsoilSeparateBalance', '表土是否单独平衡？', '表土不宜混入普通土石方平衡。'],
    ['remainingDirectionClear', '剩余土方是否有明确利用方向？', '剩余表土、弃渣需明确后续去向或接收方。']
  ];

  const currentQ = questions[step];
  const setBool = (key: string, val: boolean) => setFacts(f => ({ ...f, [key]: val }));
  const reset = () => {
    setFacts({
      hasBorrowAndSpoil: false,
      provedNoInternalAdjust: false,
      distanceOver3km: false,
      economicCompared: false,
      topsoilSeparateBalance: false,
      excavationRateOk: false,
      spoilReuseRateOk: false,
      legalSourceAndDestination: false,
      remainingDirectionClear: false
    });
    setStep(0);
  };

  return (
    <div className="decision-panel">
      {/* 面包屑 */}
      <div className="decision-breadcrumbs">
        <button onClick={onBackToMap}>{industryKnowledge[industry].name}行业</button>
        <ChevronRight size={14} />
        <span>决策面板</span>
        <ChevronRight size={14} />
        <b>{currentDecisionItem.name}</b>
      </div>

      {/* 决策项筛选 */}
      <div className="dp-item-tabs">
        {decisionItems.map(item => (
          <button
            key={item.id}
            className={`dp-item-tab ${activeDecision === item.id ? 'active' : ''}`}
            onClick={() => {
              setActiveDecision(item.id);
              reset();
            }}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* 页面标题 */}
      <div className="dp-header">
        <div>
          <h1>{currentDecisionItem.name}决策面板 <em>{industryKnowledge[industry].name}行业</em></h1>
          <p>在编制过程中，帮助您判断{currentDecisionItem.name}方案的合理性与合规性，提供编制依据与写法建议。</p>
        </div>
        <button className="btn btn-secondary">
          <Download size={16} /> 下载结果（PDF）
        </button>
      </div>

      <div className="dp-layout">
        {/* 左侧工作区 */}
        <div className="dp-left-work">
          {/* 方式选择 */}
          <div className="dp-card">
            <h2><span className="dp-step">1</span>选择信息获取方式 <small>两种方式均可获得准确决策建议</small></h2>
            <div className="dp-mode-grid">
              <button
                className={`dp-mode ${mode === 'guide' ? 'active' : ''}`}
                onClick={() => setMode('guide')}
              >
                <MessageSquare size={34} />
                <b>方式一：一步步判断（推荐）</b>
                <p>我来问你几个关键问题，一步步帮你判断</p>
                <span>预计用时：3–5分钟</span>
              </button>
              <button
                className={`dp-mode ${mode === 'paste' ? 'active green' : 'green'}`}
                onClick={() => setMode('paste')}
              >
                <FileInput size={34} />
                <b>方式二：粘贴我的描述</b>
                <p>把你现在写的情况粘过来，我帮你分析判断</p>
                <span>预计用时：1–2分钟</span>
              </button>
            </div>
          </div>

          {/* 引导式判断 */}
          {mode === 'guide' ? (
            <div className="dp-card dp-guide">
              <h2>方式一：引导式判断 <small>问题 {step + 1}/5</small></h2>
              <div className="dp-question">
                <span>{step + 1}</span>
                <h3>{currentQ[1]}</h3>
                <p>{currentQ[2]}</p>
                <button
                  className={`dp-choice ${facts[currentQ[0] as keyof typeof facts] === true ? 'selected' : ''}`}
                  onClick={() => setBool(currentQ[0], true)}
                >
                  是
                </button>
                <button
                  className={`dp-choice ${facts[currentQ[0] as keyof typeof facts] === false ? 'selected' : ''}`}
                  onClick={() => setBool(currentQ[0], false)}
                >
                  否
                </button>
                <div className="dp-q-actions">
                  <button className="btn btn-secondary" disabled={step === 0} onClick={() => setStep(s => Math.max(0, s - 1))}>
                    上一步
                  </button>
                  <button className="btn btn-primary" onClick={() => setStep(s => Math.min(4, s + 1))}>
                    {step === 4 ? '完成判断' : '下一步'} <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              <div className="dp-progress">
                {questions.map((_, i) => (
                  <span className={i <= step ? 'active' : ''} key={i}>{i + 1}</span>
                ))}
              </div>
              <div className="dp-why">
                <b>为什么问这个？</b>
                <p>土石方平衡涉及调配合理性、运距经济性及利用去向闭环。</p>
              </div>
            </div>
          ) : (
            <div className="dp-card dp-paste">
              <h2>方式二：粘贴我的描述 <small>输入范本</small></h2>
              <div className="dp-template">
                <button className="dp-copy-btn"><Copy size={14} />复制范本</button>
                <pre>{`项目存在借方与弃方：是/否
是否已论证不能内部调配：
平均运距（km）：
是否进行经济性比较：
表土是否单独平衡：
挖方利用率（%）：
弃渣综合利用率（%）：
借方来源：
弃方去向：
剩余表土、弃渣是否有明确利用方向：`}</pre>
              </div>
              <textarea placeholder="请在此粘贴或输入你的情况描述..." />
              <button className="btn btn-primary">分析并生成建议</button>
              <small>AI 将提取关键信息，若有缺失将提示补充。</small>
            </div>
          )}
        </div>

        {/* 右侧结果区 */}
        <div className="dp-card dp-result">
          <h2>
            <span className="dp-step">3</span>决策结果 <small>基于当前信息的系统判断</small>
            <button onClick={reset} className="dp-reset-btn"><RefreshCw size={14} />重置</button>
          </h2>

          {/* 总体结论 */}
          <div className={`dp-conclusion dp-${conclusion[2]}`}>
            <CheckCircle size={48} />
            <div>
              <b>总体结论：{conclusion[0]}</b>
              <p>{conclusion[1]}</p>
            </div>
          </div>

          {/* 判断结果 */}
          <div className="dp-result-block">
            <h3>3.1 关键判断结果</h3>
            <div className="dp-ok"><CheckCircle size={15} />借方和弃方同时存在</div>
            <div className="dp-ok"><CheckCircle size={15} />已论证不能内部调配</div>
            <div className="dp-ok"><CheckCircle size={15} />运距超过3km</div>
            <div className="dp-ok"><CheckCircle size={15} />已进行经济性比较</div>
            <div className="dp-ok"><CheckCircle size={15} />表土已单独平衡</div>
            <div className="dp-ok"><CheckCircle size={15} />挖方利用率达标</div>
            <div className="dp-ok"><CheckCircle size={15} />弃渣综合利用率达标</div>
          </div>

          {/* 风险与关注点 */}
          <div className="dp-result-block">
            <h3>3.2 风险与关注点 <small>红色 {risks.filter(r => r.level === 'red').length} 项　橙色 {risks.filter(r => r.level === 'orange').length} 项　黄色 {risks.filter(r => r.level === 'yellow').length} 项</small></h3>
            {risks.length ? risks.map(r => (
              <div className="dp-riskline" key={r.id}>
                {r.text}<em className={r.level}>{r.level === 'red' ? '高风险' : r.level === 'orange' ? '中风险' : '提示'}</em>
              </div>
            )) : <p className="dp-muted">当前未命中红色或橙色风险。</p>}
          </div>

          {/* 建议做法 */}
          <div className="dp-result-block">
            <h3>3.3 建议做法</h3>
            {actions.length ? actions.map(a => (
              <div className="dp-ok" key={a.id}><CheckCircle size={15} />{a.text}</div>
            )) : (
              <>
                <div className="dp-ok"><CheckCircle size={15} />保留土石方平衡表、调配说明与利用率计算过程。</div>
                <div className="dp-ok"><CheckCircle size={15} />完善借方来源、弃方去向及证明材料。</div>
              </>
            )}
          </div>

          {/* 写法建议 */}
          <div className="dp-result-block">
            <h3>3.4 写法建议（可直接引用）</h3>
            <div className="dp-writing">
              <button className="dp-copy-btn"><Copy size={14} />复制</button>
              {writingSections.earthwork.paragraph}
            </div>
          </div>

          {/* 依据文件 */}
          <div className="dp-result-block">
            <h3>3.5 依据文件</h3>
            <ul className="dp-bullets">
              <li>GB 50433-2018 生产建设项目水土保持技术标准</li>
              <li>办水保〔2023〕177号 第三条、第七条</li>
              <li>水保〔2024〕232号 第4.3条、第4.4条</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// 案例详情模态框
function CaseDetailModal({ caseItem, onClose }: { caseItem: CaseItem; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="pc-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>案例详情</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-header">
            <span className="case-industry">{caseItem.industry}</span>
            <span className="case-score">
              <Star size={16} fill="#f59e0b" /> {caseItem.score}分
            </span>
          </div>
          <h3 className="detail-title">{caseItem.title}</h3>
          <div className="detail-meta">
            <span><Download size={16} /> {caseItem.downloads}次下载</span>
          </div>

          <div className="detail-section">
            <h4>项目概况</h4>
            <p>本项目为{caseItem.industry}类项目水土保持方案，方案编制符合国家标准规范要求，措施布局合理，具有较好的参考价值。</p>
          </div>

          <div className="detail-section">
            <h4>主要亮点</h4>
            <ul>
              {caseItem.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          </div>

          <div className="detail-section">
            <h4>方案文件</h4>
            <div className="file-list">
              <div className="file-item">
                <File size={20} />
                <span>水土保持方案报告书.pdf</span>
                <Download size={16} />
              </div>
              <div className="file-item">
                <FileCode size={20} />
                <span>防治责任范围图.shp</span>
                <Download size={16} />
              </div>
              <div className="file-item">
                <FileImage size={20} />
                <span>水土保持措施布局图.dwg</span>
                <Download size={16} />
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary">
            <Eye size={16} /> 预览
          </button>
          <button className="btn btn-primary">
            <Download size={16} /> 下载全部
          </button>
        </div>
      </div>
    </div>
  );
}


// 制图与数据订阅页面
function MappingPage() {
  const [activeTab, setActiveTab] = useState<'thematic' | 'geographic' | 'orders'>('thematic');
  const [thematicForm, setThematicForm] = useState({
    mapType: '',
    requirements: '',
    file: null as File | null,
  });
  const [geographicForm, setGeographicForm] = useState({
    dataType: '',
    region: '',
    date: '',
    resolution: '',
    customFile: null as File | null,
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'submitted'>('idle');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // 模拟订单数据
  const orders = [
    {
      id: 'DT202403150001',
      type: 'thematic',
      typeName: '方案专题数据',
      title: '水土流失现状图',
      region: '陕西省西安市',
      status: 'completed',
      statusName: '已完成',
      orderDate: '2024-03-10',
      completeDate: '2024-03-13',
      price: 500,
      description: '需要项目区水土流失现状图，比例尺1:10000',
      progress: 100,
    },
    {
      id: 'DT202403150003',
      type: 'thematic',
      typeName: '方案专题数据',
      title: '项目区水系图',
      region: '山西省大同市',
      status: 'pending',
      statusName: '待处理',
      orderDate: '2024-03-14',
      completeDate: null,
      price: 500,
      description: '项目区水系图制作，需标注主要支流',
      progress: 0,
    },
  ];

  const filteredOrders = orders.filter(order => {
    const matchKeyword = searchKeyword === '' ||
      order.id.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      order.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      order.region.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchKeyword && matchStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'processing': return '#0ea5e9';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  // 专题图类型选项
  const mapTypes = [
    { value: 'soil_erosion', label: '水土流失现状图（土壤侵蚀强度分布图）' },
    { value: 'water_system', label: '项目区水系图' },
    { value: 'soil_type', label: '土壤类型图' },
    { value: 'land_use', label: '项目区土地利用现状图' },
    { value: 'vegetation', label: '植被类型与覆盖度图' },
    { value: 'sensitive', label: '生态敏感区分布图' },
  ];

  // 数据类型选项
  const dataTypes = [
    { value: 'remote_sensing', label: '高分辨率遥感影像' },
    { value: 'dem', label: 'DEM数据' },
  ];

  // 分辨率选项
  const resolutions = [
    { value: '0.5', label: '0.5米（高清）' },
    { value: '1', label: '1米（高清）' },
    { value: '2', label: '2米（中等）' },
    { value: '10', label: '10米（标准）' },
  ];

  const handleThematicSubmit = () => {
    if (!thematicForm.mapType || !thematicForm.requirements) {
      alert('请填写完整的制图需求');
      return;
    }
    setSubmitStatus('submitting');
    setTimeout(() => {
      setSubmitStatus('submitted');
    }, 1500);
  };

  const handleGeographicSubmit = () => {
    if (!geographicForm.dataType || !geographicForm.region || !geographicForm.date) {
      alert('请填写完整的数据需求');
      return;
    }
    setSubmitStatus('submitting');
    setTimeout(() => {
      setSubmitStatus('submitted');
    }, 1500);
  };

  const resetForm = () => {
    setThematicForm({ mapType: '', requirements: '', file: null });
    setGeographicForm({ dataType: '', region: '', date: '', resolution: '', customFile: null });
    setSubmitStatus('idle');
  };

  return (
    <div className="pc-page">
      <div className="page-header">
        <h1>制图与数据订阅</h1>
        <p>提供符合报批要求的专题图件与基础地理数据</p>
      </div>

      {/* Tab 切换 */}
      <div className="tabs-section">
        <div className="tabs-row" style={{ maxWidth: '900px' }}>
          <button
            className={`tab-pill ${activeTab === 'thematic' ? 'active' : ''}`}
            onClick={() => { setActiveTab('thematic'); resetForm(); }}
          >
            <Image size={16} /> 方案专题数据定制
          </button>
          <button
            className={`tab-pill ${activeTab === 'geographic' ? 'active' : ''}`}
            onClick={() => { setActiveTab('geographic'); resetForm(); }}
          >
            <Globe size={16} /> 地理信息数据定制
          </button>
          <button
            className={`tab-pill ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FileText size={16} /> 我的订单
          </button>
        </div>
      </div>

      {activeTab === 'thematic' && (
        /* 方案专题数据定制 */
        <div style={{ padding: '24px' }}>
          <div style={{
            background: 'var(--white)',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {submitStatus === 'submitted' ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <CheckCircle size={40} color="#16a34a" />
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>提交成功！</h3>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>
                  您的制图需求已提交，预计 <strong>3个工作日</strong> 内完成。<br />
                  我们将通过站内消息通知您预览结果。
                </p>
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px',
                  textAlign: 'left',
                }}>
                  <h4 style={{ fontSize: '14px', color: '#166534', marginBottom: '8px' }}>订单信息</h4>
                  <p style={{ fontSize: '13px', color: '#15803d' }}>专题图类型：{mapTypes.find(m => m.value === thematicForm.mapType)?.label}</p>
                  <p style={{ fontSize: '13px', color: '#15803d' }}>预估费用：<strong>¥500</strong></p>
                </div>
                <button className="btn btn-primary" onClick={resetForm}>
                  提交新需求
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Image size={20} style={{ color: '#10b981' }} />
                  方案专题数据定制
                </h3>

                {/* 专题图类型 */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                    专题图类型 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {mapTypes.map(type => (
                      <label
                        key={type.value}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '14px 16px',
                          border: `2px solid ${thematicForm.mapType === type.value ? '#10b981' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: thematicForm.mapType === type.value ? '#f0fdf4' : 'white',
                          transition: 'all 0.2s',
                        }}
                      >
                        <input
                          type="radio"
                          name="mapType"
                          value={type.value}
                          checked={thematicForm.mapType === type.value}
                          onChange={() => setThematicForm({ ...thematicForm, mapType: type.value })}
                          style={{ accentColor: '#10b981' }}
                        />
                        <span style={{ fontSize: '14px' }}>{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 文字要求 */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                    文字要求 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    value={thematicForm.requirements}
                    onChange={e => setThematicForm({ ...thematicForm, requirements: e.target.value })}
                    placeholder="请详细描述您的制图需求，如：项目名称、地理位置、图件比例尺要求、特定标注内容等"
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* 上传文件 */}
                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                    上传制图支撑矢量文件
                  </label>
                  <div style={{
                    border: '2px dashed #e2e8f0',
                    borderRadius: '8px',
                    padding: '32px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}>
                    <Upload size={32} style={{ color: '#94a3b8', marginBottom: '12px' }} />
                    <p style={{ color: '#64748b', marginBottom: '8px' }}>
                      点击或拖拽文件到此处上传
                    </p>
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                      支持 .shp .dwg .dxf .geojson 格式
                    </p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                      如：项目防治责任范围、区县行政边界等
                    </p>
                  </div>
                </div>

                {/* 提交按钮 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>预估完成时间：<strong>3个工作日</strong></p>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>预估费用：<strong style={{ fontSize: '18px', color: '#10b981' }}>¥500</strong></p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handleThematicSubmit}
                    disabled={submitStatus === 'submitting'}
                    style={{ padding: '12px 32px' }}
                  >
                    {submitStatus === 'submitting' ? (
                      <>
                        <Loader2 size={18} className="spinning" /> 提交中...
                      </>
                    ) : '提交制图需求'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'geographic' && (
        /* 地理信息数据定制 */
        <div style={{ padding: '24px' }}>
          <div style={{
            background: 'var(--white)',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {submitStatus === 'submitted' ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <CheckCircle size={40} color="#16a34a" />
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>提交成功！</h3>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>
                  您的数据需求已提交，预计 <strong>3个工作日</strong> 内完成。<br />
                  我们将通过站内消息通知您预览结果。
                </p>
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px',
                  textAlign: 'left',
                }}>
                  <h4 style={{ fontSize: '14px', color: '#166534', marginBottom: '8px' }}>订单信息</h4>
                  <p style={{ fontSize: '13px', color: '#15803d' }}>数据类型：{dataTypes.find(d => d.value === geographicForm.dataType)?.label}</p>
                  <p style={{ fontSize: '13px', color: '#15803d' }}>区域：{geographicForm.region}</p>
                  <p style={{ fontSize: '13px', color: '#15803d' }}>预估费用：<strong>¥500</strong></p>
                </div>
                <button className="btn btn-primary" onClick={resetForm}>
                  提交新需求
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={20} style={{ color: '#0ea5e9' }} />
                  地理信息数据定制
                </h3>

                {/* 数据类型 */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                    数据类型 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {dataTypes.map(type => (
                      <label
                        key={type.value}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '14px 20px',
                          border: `2px solid ${geographicForm.dataType === type.value ? '#0ea5e9' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: geographicForm.dataType === type.value ? '#f0f9ff' : 'white',
                          transition: 'all 0.2s',
                        }}
                      >
                        <input
                          type="radio"
                          name="dataType"
                          value={type.value}
                          checked={geographicForm.dataType === type.value}
                          onChange={() => setGeographicForm({ ...geographicForm, dataType: type.value })}
                          style={{ accentColor: '#0ea5e9' }}
                        />
                        <span style={{ fontSize: '14px' }}>{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 区域选择 */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                    区域范围 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      value={geographicForm.region}
                      onChange={e => setGeographicForm({ ...geographicForm, region: e.target.value })}
                      placeholder="请输入省、市、县名称，如：陕西省西安市"
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                    <button style={{
                      padding: '12px 20px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <Upload size={16} /> 上传边界
                    </button>
                  </div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                    可手动输入省市县名称，或上传矢量边界文件（.shp/.geojson）
                  </p>
                </div>

                {/* 时间要求 */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                    影像日期 <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="month"
                    value={geographicForm.date}
                    onChange={e => setGeographicForm({ ...geographicForm, date: e.target.value })}
                    style={{
                      width: '200px',
                      padding: '12px 16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </div>

                {/* 分辨率要求 */}
                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                    分辨率要求
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {resolutions.map(res => (
                      <label
                        key={res.value}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          border: `1px solid ${geographicForm.resolution === res.value ? '#0ea5e9' : '#e2e8f0'}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          background: geographicForm.resolution === res.value ? '#f0f9ff' : 'white',
                        }}
                      >
                        <input
                          type="radio"
                          name="resolution"
                          value={res.value}
                          checked={geographicForm.resolution === res.value}
                          onChange={() => setGeographicForm({ ...geographicForm, resolution: res.value })}
                          style={{ accentColor: '#0ea5e9' }}
                        />
                        <span style={{ fontSize: '13px' }}>{res.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 提交按钮 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>预估完成时间：<strong>3个工作日</strong></p>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>预估费用：<strong style={{ fontSize: '18px', color: '#0ea5e9' }}>¥500</strong></p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handleGeographicSubmit}
                    disabled={submitStatus === 'submitting'}
                    style={{ padding: '12px 32px', background: '#0ea5e9' }}
                  >
                    {submitStatus === 'submitting' ? (
                      <>
                        <Loader2 size={18} className="spinning" /> 提交中...
                      </>
                    ) : '提交数据需求'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 我的订单 */}
      {activeTab === 'orders' && (
        <div style={{ padding: '24px' }}>
          {/* 搜索和筛选 */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              background: 'var(--white)',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)}
                    placeholder="搜索订单号、标题、地区..."
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{
                    padding: '10px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white',
                    minWidth: '140px',
                  }}
                >
                  <option value="all">全部状态</option>
                  <option value="pending">待处理</option>
                  <option value="processing">处理中</option>
                  <option value="completed">已完成</option>
                </select>
              </div>
            </div>
          </div>

          {/* 订单列表 */}
          <div style={{
            background: 'var(--white)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>订单号</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>类型</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>标题</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>区域</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>下单时间</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>金额</th>
                  <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>状态</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px', fontSize: '14px', fontFamily: 'monospace', color: '#1e40af' }}>{order.id}</td>
                    <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: order.type === 'thematic' ? '#ecfdf5' : '#eff6ff',
                        color: order.type === 'thematic' ? '#059669' : '#2563eb',
                      }}>
                        {order.typeName}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 500 }}>{order.title}</td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#64748b' }}>{order.region}</td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', color: '#64748b' }}>{order.orderDate}</td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#10b981' }}>¥{order.price}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        background: `${getStatusColor(order.status)}20`,
                        color: getStatusColor(order.status),
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: getStatusColor(order.status),
                        }} />
                        {order.statusName}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        style={{
                          padding: '6px 14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          background: 'white',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <FileText size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                <p style={{ color: '#94a3b8' }}>暂无订单记录</p>
              </div>
            )}
          </div>

          {/* 订单详情弹窗 */}
          {selectedOrder && (
            <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
              <div className="pc-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>订单详情</h2>
                  <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>订单号</label>
                      <p style={{ fontSize: '14px', fontFamily: 'monospace', color: '#1e40af' }}>{selectedOrder.id}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>订单类型</label>
                      <p style={{ fontSize: '14px' }}>{selectedOrder.typeName}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>订单标题</label>
                      <p style={{ fontSize: '14px', fontWeight: 500 }}>{selectedOrder.title}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>区域</label>
                      <p style={{ fontSize: '14px' }}>{selectedOrder.region}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>下单时间</label>
                      <p style={{ fontSize: '14px' }}>{selectedOrder.orderDate}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>完成时间</label>
                      <p style={{ fontSize: '14px' }}>{selectedOrder.completeDate || '-'}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>订单金额</label>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#10b981' }}>¥{selectedOrder.price}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>订单状态</label>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        background: `${getStatusColor(selectedOrder.status)}20`,
                        color: getStatusColor(selectedOrder.status),
                      }}>
                        {selectedOrder.statusName}
                      </span>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>详细描述</label>
                      <p style={{ fontSize: '14px', color: '#475569' }}>{selectedOrder.description}</p>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '8px' }}>处理进度</label>
                      <div style={{ background: '#f1f5f9', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${selectedOrder.progress}%`,
                          height: '100%',
                          background: selectedOrder.progress === 100 ? '#10b981' : '#0ea5e9',
                          borderRadius: '8px',
                          transition: 'width 0.3s',
                        }} />
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', textAlign: 'right' }}>{selectedOrder.progress}%</p>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  {selectedOrder.status === 'completed' && (
                    <button className="btn btn-primary">
                      <Download size={16} /> 下载成果
                    </button>
                  )}
                  <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>
                    关闭
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 方案审查页面
function ReviewPage({ onOpenModal }: { onOpenModal: (modal: React.ReactNode) => void }) {
  const [step, setStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResults, setReviewResults] = useState<ReviewResult[]>([]);

  const handleUpload = () => {
    setIsUploading(true);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setStep(2);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleReview = () => {
    setIsReviewing(true);

    setTimeout(() => {
      setReviewResults([
        { id: 1, item: '防治分区划分', status: 'pass', message: '分区合理，符合GB/T 15772-2022要求' },
        { id: 2, item: '水土流失预测', status: 'warning', message: '预测方法可优化，建议采用RUSLE模型' },
        { id: 3, item: '措施体系布局', status: 'pass', message: '措施体系完整，布局合理' },
        { id: 4, item: '土石方平衡', status: 'error', message: '土石方平衡计算有误，请复核' },
        { id: 5, item: '投资估算', status: 'pass', message: '投资估算符合行业标准' },
        { id: 6, item: '监测方案', status: 'warning', message: '监测点位布设需优化' },
      ]);
      setIsReviewing(false);
      setStep(3);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle size={18} fill="#10b981" />;
      case 'warning': return <Circle size={18} fill="#f59e0b" />;
      case 'error': return <Circle size={18} fill="#ef4444" />;
      default: return null;
    }
  };

  return (
    <div className="pc-page">
      <div className="page-header">
        <h1>方案审查</h1>
        <p>AI辅助审查 · 自动化标注</p>
      </div>

      <div className="review-layout">
        {/* 步骤指示器 */}
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">上传文件</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">AI审查</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">审查结果</span>
          </div>
        </div>

        <div className="review-content">
          {/* 步骤1：上传文件 */}
          {step === 1 && (
            <div className="upload-section">
              <div className="upload-area" onClick={handleUpload}>
                {isUploading ? (
                  <>
                    <Loader2 size={48} className="spinning" />
                    <p>正在上传... {uploadProgress}%</p>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={48} />
                    <p>点击或拖拽上传方案文件</p>
                    <span className="upload-hint">支持 PDF、Word 格式，单个文件不超过50MB</span>
                  </>
                )}
              </div>
              <div className="upload-tips">
                <h4>请同时上传</h4>
                <ul>
                  <li><File size={16} /> 水土保持方案报告书（文本）</li>
                  <li><FileCode size={16} /> 防治责任范围矢量数据（SHP格式）</li>
                </ul>
              </div>
            </div>
          )}

          {/* 步骤2：AI审查 */}
          {step === 2 && (
            <div className="review-section">
              <div className="uploaded-files">
                <h4>已上传文件</h4>
                <div className="file-list">
                  <div className="file-item success">
                    <File size={20} />
                    <span>高速公路项目水土保持方案报告书.pdf</span>
                    <CheckCircle size={16} fill="#10b981" />
                  </div>
                  <div className="file-item success">
                    <FileCode size={20} />
                    <span>防治责任范围矢量数据.shp</span>
                    <CheckCircle size={16} fill="#10b981" />
                  </div>
                </div>
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleReview} disabled={isReviewing}>
                {isReviewing ? (
                  <>
                    <Loader2 size={18} className="spinning" /> AI审查中，请稍候...
                  </>
                ) : (
                  <>
                    <Zap size={18} /> 开始AI审查
                  </>
                )}
              </button>
            </div>
          )}

          {/* 步骤3：审查结果 */}
          {step === 3 && (
            <div className="result-section">
              <div className="result-summary">
                <div className="summary-item pass">
                  <span className="count">3</span>
                  <span className="label">通过</span>
                </div>
                <div className="summary-item warning">
                  <span className="count">2</span>
                  <span className="label">警告</span>
                </div>
                <div className="summary-item error">
                  <span className="count">1</span>
                  <span className="label">错误</span>
                </div>
              </div>

              <div className="review-items">
                {reviewResults.map(item => (
                  <div key={item.id} className={`review-item ${item.status}`}>
                    <div className="review-item-header">
                      {getStatusIcon(item.status)}
                      <span className="item-name">{item.item}</span>
                    </div>
                    <p className="review-message">{item.message}</p>
                  </div>
                ))}
              </div>

              <div className="result-actions">
                <button className="btn btn-secondary">
                  <Download size={16} /> 下载审查报告
                </button>
                <button className="btn btn-primary">
                  查看详细标注
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 首页
function HomePage({ onNavigate, onOpenModal }: { onNavigate: (tab: string) => void; onOpenModal: (modal: React.ReactNode) => void }) {
  const [chatLoading, setChatLoading] = useState(true);

  const stats = [
    { label: '法规标准', value: '1000+', icon: <BookOpen size={24} /> },
    { label: '行业图谱', value: '36个', icon: <Star size={24} /> },
    { label: '决策工具', value: '100+', icon: <FileText size={24} /> },
    { label: '注册用户', value: '5000+', icon: <User size={24} /> },
  ];

  const recentActivities = [
    { type: 'review', title: '高速公路项目水土保持方案审查完成', time: '10分钟前', status: '通过' },
    { type: 'download', title: '下载了风电场项目水土保持方案', time: '30分钟前', status: '' },
    { type: 'search', title: '搜索了"矿山开采水土保持措施"', time: '1小时前', status: '' },
    { type: 'upload', title: '上传了水利枢纽工程方案文件', time: '2小时前', status: '审查中' },
  ];

  return (
    <div className="pc-page home-page">
      <div className="home-header">
        <div className="welcome-section">
          <h1>水土保持方案智能数据库平台</h1>
          <p>打造集法规、数据、经验、工具于一体的综合性智能服务平台</p>
        </div>
        <div className="quick-stats">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-info">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 快捷功能 */}
      <div className="section">
        <h2>快捷功能</h2>
        <div className="quick-actions-grid">
          {quickActions.map(action => (
            <div
              key={action.id}
              className="quick-action-card"
              onClick={() => {
                if (action.id === 'review') {
                  onNavigate('review');
                } else if (action.id === 'ai') {
                  onOpenModal(<AISearchResults query="水土保持方案编制要点" onClose={() => onOpenModal(null)} />);
                } else if (action.id === 'mapping') {
                  alert('制图订阅功能即将上线，敬请期待！');
                } else if (action.id === 'data') {
                  alert('数据下载功能即将上线，敬请期待！');
                }
              }}
            >
              <div className="action-icon" style={{ backgroundColor: `${action.color}15`, color: action.color }}>
                {action.icon}
              </div>
              <h3>{action.title}</h3>
              <p>{action.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 土土AI问答模块 */}
      <div className="section" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '20px 24px 12px', borderBottom: '1px solid var(--gray-200)', background: 'var(--white)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <div style={{ padding: '6px', borderRadius: '8px', background: 'var(--primary-lighter)', color: 'var(--primary)' }}>
              <Zap size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--gray-800)', margin: 0 }}>AI智能问答助手</h3>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)', margin: '2px 0 0 0' }}>基于水土保持法规知识库，为你提供专业解答</p>
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 24px 24px', background: 'var(--gray-50)' }}>
          <div style={{
            width: '100%',
            height: '580px',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
          }}>
            {/* 加载动画 */}
            {chatLoading && (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                zIndex: 10,
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)',
                }}>
                  <Zap size={32} color="white" />
                </div>
                <p style={{ color: '#64748b', fontSize: '14px' }}>正在加载 AI 助手...</p>
              </div>
            )}
            <iframe
              src="http://dtgis.com.cn:55558/next-chats/share?shared_id=fc9971fa1ddb11f195020242ac140006&from=chat&auth=bKG1WNOGTPHDAfY5mdu5SJclO_v4ZIYn&theme=light"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                transform: 'scale(1.08)',
                transformOrigin: 'top left',
                fontSize: '16px',
                opacity: chatLoading ? 0 : 1,
                transition: 'opacity 0.3s ease',
              }}
              frameBorder="0"
              allow="clipboard-read; clipboard-write"
              title="土土AI问答"
              onLoad={() => setChatLoading(false)}
            />
            {/* 遮挡顶部logo */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '90px',
              backgroundColor: '#ffffff',
              zIndex: 1,
              pointerEvents: 'none',
              borderBottom: '1px solid #e2e8f0'
            }} />
          </div>
        </div>
      </div>

      {/* 核心功能入口 */}
      <div className="section">
        <h2>核心功能</h2>
        <div className="feature-grid">
          {[
            { id: 'regulations', name: '法规与标准', desc: '结构化条款库 · AI智能检索', icon: <BookOpen size={28} />, color: '#1e40af' },
            { id: 'map', name: '指标地图', desc: '全国水土保持指标可视化查询', icon: <Map size={28} />, color: '#06b6d4' },
            { id: 'sensitive', name: '敏感区查询', desc: '选址选线避让核查 · 敏感区识别', icon: <Shield size={28} />, color: '#8b5cf6' },
            { id: 'cases', name: '行业图谱', desc: '认知地图 · 决策面板', icon: <Briefcase size={28} />, color: '#f97316' },
          ].map((feature, idx) => (
            <div key={idx} className="feature-card" onClick={() => onNavigate(feature.id)}>
              <div className="feature-icon" style={{ backgroundColor: `${feature.color}15`, color: feature.color }}>
                {feature.icon}
              </div>
              <div className="feature-info">
                <h3>{feature.name}</h3>
                <p>{feature.desc}</p>
              </div>
              <ChevronRight size={20} />
            </div>
          ))}
        </div>
      </div>

      {/* 最近活动 */}
      <div className="section">
        <h2>最近活动</h2>
        <div className="activity-list">
          {recentActivities.map((activity, idx) => (
            <div key={idx} className="activity-item">
              <div className={`activity-icon ${activity.type}`}>
                {activity.type === 'review' && <CheckCircle size={16} />}
                {activity.type === 'download' && <Download size={16} />}
                {activity.type === 'search' && <Search size={16} />}
                {activity.type === 'upload' && <Upload size={16} />}
              </div>
              <div className="activity-content">
                <span className="activity-title">{activity.title}</span>
                <span className="activity-time">{activity.time}</span>
              </div>
              {activity.status && (
                <span className={`activity-status ${activity.status === '通过' ? 'pass' : 'pending'}`}>
                  {activity.status}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 主应用
function App() {
  const { theme, toggleTheme } = useTheme();
  const { history, favorites, addHistory, toggleFavorite, deleteHistory, clearHistory } = useQueryHistory();
  const [activeNav, setActiveNav] = useState('home');
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyTab, setHistoryTab] = useState<'history' | 'favorites'>('history');
  const [showAIChat, setShowAIChat] = useState(false);

  const openModal = (modal: React.ReactNode) => {
    setModalContent(modal);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const renderContent = () => {
    switch (activeNav) {
      case 'home':
        return <HomePage onNavigate={setActiveNav} onOpenModal={openModal} />;
      case 'regulations':
        return <RegulationsPage onOpenModal={openModal} />;
      case 'spatial':
        return <SpatialQueryPage onAddHistory={addHistory} />;
      case 'cases':
        return <CasesPage onOpenModal={openModal} />;
      case 'mapping':
        return <MappingPage />;
      case 'review':
        return <ReviewPage onOpenModal={openModal} />;
      default:
        return <HomePage onNavigate={setActiveNav} onOpenModal={openModal} />;
    }
  };

  return (
    <div className="pc-app">
      {/* 左侧导航栏 */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <Database size={28} />
            <span>水土保持</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">管</div>
            <div className="user-details">
              <span className="user-name">管理员</span>
              <span className="user-role">VIP会员</span>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧主内容区 */}
      <div className="main-content">
        {/* 顶部栏 */}
        <header className="top-header">
          <div className="header-left">
            {activeNav === 'home' ? <h2>首页</h2> : <h2>工作台</h2>}
          </div>
          <div className="header-right">
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder="搜索法规、案例、模板..." />
            </div>
            <button className="icon-btn" onClick={() => setShowHistoryModal(true)} title="历史记录">
              <History size={20} />
            </button>
            <button className="icon-btn" onClick={toggleTheme} title={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button className="icon-btn">
              <Bell size={20} />
              <span className="badge">3</span>
            </button>
            <button className="icon-btn">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* 页面内容 */}
        <div className="page-content">
          {renderContent()}
        </div>
      </div>

      {/* 历史记录模态框 */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content history-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>查询历史</h2>
              <button className="close-btn" onClick={() => setShowHistoryModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="history-tabs">
              <button
                className={`tab-btn ${historyTab === 'history' ? 'active' : ''}`}
                onClick={() => setHistoryTab('history')}
              >
                <History size={16} /> 历史记录
              </button>
              <button
                className={`tab-btn ${historyTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setHistoryTab('favorites')}
              >
                <Bookmark size={16} /> 收藏夹
              </button>
            </div>
            <div className="history-list">
              {(historyTab === 'history' ? history : favorites).length === 0 ? (
                <div className="empty-state">
                  <FileText size={48} style={{ opacity: 0.3 }} />
                  <p>{historyTab === 'history' ? '暂无查询历史' : '暂无收藏'}</p>
                </div>
              ) : (
                (historyTab === 'history' ? history : favorites).map(item => (
                  <div key={item.id} className="history-item">
                    <div className="history-item-header">
                      <span className="history-type">{item.type === 'map' ? '指标地图' : '敏感区查询'}</span>
                      <span className="history-time">
                        {new Date(item.timestamp).toLocaleString('zh-CN')}
                      </span>
                    </div>
                    <div className="history-location">{item.location}</div>
                    <div className="history-actions">
                      <button
                        className={`action-btn ${item.favorite ? 'active' : ''}`}
                        onClick={() => toggleFavorite(item.id)}
                        title={item.favorite ? '取消收藏' : '添加收藏'}
                      >
                        <Bookmark size={14} fill={item.favorite ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => deleteHistory(item.id)}
                        title="删除"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {historyTab === 'history' && history.length > 0 && (
              <div className="history-footer">
                <button className="btn btn-secondary" onClick={clearHistory}>
                  清空历史
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 模态框 */}
      {modalContent}

      {/* AI 助手悬浮按钮 */}
      {!showAIChat && (
        <button
          onClick={() => setShowAIChat(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            border: 'none',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            zIndex: 1000,
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(139, 92, 246, 0.5)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4)';
          }}
        >
          <Zap size={28} />
        </button>
      )}

      {/* AI 助手窗口 */}
      {showAIChat && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '420px',
            height: '600px',
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'slideUp 0.3s ease',
          }}
        >
          <RAGFlowChat onClose={() => setShowAIChat(false)} />
        </div>
      )}
    </div>
  );
}

export default App;
