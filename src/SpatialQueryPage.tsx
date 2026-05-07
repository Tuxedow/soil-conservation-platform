import { useState } from 'react';
import {
  MapPin, Shield, Download as DownloadIcon, Share2,
  Loader2, ChevronDown, X, AlertCircle, FileUp, Circle,
  Pencil, Minus, Square, Trash2, Star
} from 'lucide-react';
import TiandituMap from './TiandituMap';

// 区域筛选数据类型
interface RegionFilter {
  province?: string;
  city?: string;
  county?: string;
  basin?: string;
  erosionType?: string;
  erosionSubType?: string;
  preventionZone?: string;
}

// 筛选类型分类：用于实现单选互斥
const FILTER_CATEGORIES: Record<string, (keyof RegionFilter)[]> = {
  admin: ['province', 'city', 'county'],
  basin: ['basin'],
  erosion: ['erosionType', 'erosionSubType'],
  prevention: ['preventionZone']
};

// 获取key所属分类
function getFilterCategory(key: keyof RegionFilter): string | null {
  for (const [category, keys] of Object.entries(FILTER_CATEGORIES)) {
    if (keys.includes(key)) return category;
  }
  return null;
}

// 敏感区结果
interface SensitiveArea {
  name: string;
  status: 'inside' | 'near' | 'outside';
  distance: string;
}

// 指标结果
interface IndicatorResult {
  name: string;
  value: string;
  status: 'normal' | 'warning';
  period: 'construction' | 'design';
}

// 土壤容许流失量数据（按防治区划）
const soilAllowanceByZone: Record<string, number> = {
  '东北黑土区': 200,
  '北方风沙区': 200,
  '北方土石山区': 200,
  '西北黄土高原区': 1000,
  '南方红壤区': 500,
  '西南紫色土区': 500,
  '西南岩溶区': 500,
  '青藏高原区': 500
};

// 行政区划数据
const provinces = [
  '北京市', '天津市', '河北省', '山西省', '内蒙古自治区',
  '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省',
  '浙江省', '安徽省', '福建省', '江西省', '山东省',
  '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区',
  '海南省', '重庆市', '四川省', '贵州省', '云南省',
  '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区',
  '新疆维吾尔自治区', '台湾省', '香港特别行政区', '澳门特别行政区'
];

const cities: Record<string, string[]> = {
  '陕西省': ['西安市', '宝鸡市', '咸阳市', '铜川市', '渭南市', '延安市', '榆林市', '汉中市', '安康市', '商洛市'],
  '甘肃省': ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '酒泉市', '庆阳市'],
  // 其他省份可扩展
};

const counties: Record<string, string[]> = {
  '西安市': ['新城区', '碑林区', '莲湖区', '灞桥区', '未央区', '雁塔区', '阎良区', '临潼区', '长安区', '高陵区'],
  '兰州市': ['城关区', '七里河区', '西固区', '安宁区', '红古区', '永登县', '皋兰县', '榆中县'],
  // 其他城市可扩展
};

// 七大流域
const basins = [
  '长江流域', '黄河流域', '淮河流域', '海河流域',
  '珠江流域', '松辽流域', '太湖流域'
];

// 土壤侵蚀类型区
const erosionTypes = [
  { id: 'I', name: 'I 水力侵蚀类型区' },
  { id: 'II', name: 'II 风力侵蚀类型区' },
  { id: 'III', name: 'III 冻融侵蚀类型区' }
];

const erosionSubTypes: Record<string, { id: string; name: string }[]> = {
  'I': [
    { id: 'I1', name: 'I₁ 西北黄土高原区' },
    { id: 'I2', name: 'I₂ 东北黑土区' },
    { id: 'I3', name: 'I₃ 北方土石山区' },
    { id: 'I4', name: 'I₄ 南方红壤丘陵区' },
    { id: 'I5', name: 'I₅ 西南土石山区' }
  ],
  'II': [
    { id: 'II1', name: 'II₁ "三北"戈壁沙漠及沙地风沙区' },
    { id: 'II2', name: 'II₂ 沿河环湖滨海平原风沙区' }
  ],
  'III': [
    { id: 'III1', name: 'III₁ 北方冻融土侵蚀区' },
    { id: 'III2', name: 'III₂ 青藏高原冰川冻土侵蚀区' }
  ]
};

// 水土流失防治区划
const preventionZones = [
  '东北黑土区', '北方风沙区', '北方土石山区', '西北黄土高原区',
  '南方红壤区', '西南紫色土区', '西南岩溶区', '青藏高原区'
];

// 防治指标数据（按防治区划）- 包含6大防治指标+容许流失量
const indicatorDataByZone: Record<string, { construction?: IndicatorResult[]; design: IndicatorResult[]; allowance?: number }> = {
  '东北黑土区': {
    design: [
      { name: '水土流失治理度', value: '80%', status: 'normal', period: 'design' },
      { name: '土壤流失控制比', value: '0.8', status: 'normal', period: 'design' },
      { name: '渣土防护率', value: '92%', status: 'normal', period: 'design' },
      { name: '表土保护率', value: '95%', status: 'normal', period: 'design' },
      { name: '林草植被恢复率', value: '85%', status: 'normal', period: 'design' },
      { name: '林草覆盖率', value: '24%', status: 'normal', period: 'design' }
    ],
    allowance: 200
  },
  '北方风沙区': {
    design: [
      { name: '水土流失治理度', value: '75%', status: 'normal', period: 'design' },
      { name: '土壤流失控制比', value: '0.75', status: 'normal', period: 'design' },
      { name: '渣土防护率', value: '92%', status: 'normal', period: 'design' },
      { name: '表土保护率', value: '95%', status: 'normal', period: 'design' },
      { name: '林草植被恢复率', value: '80%', status: 'normal', period: 'design' },
      { name: '林草覆盖率', value: '20%', status: 'normal', period: 'design' }
    ],
    allowance: 200
  },
  '北方土石山区': {
    design: [
      { name: '水土流失治理度', value: '75%', status: 'normal', period: 'design' },
      { name: '土壤流失控制比', value: '0.75', status: 'normal', period: 'design' },
      { name: '渣土防护率', value: '90%', status: 'normal', period: 'design' },
      { name: '表土保护率', value: '95%', status: 'normal', period: 'design' },
      { name: '林草植被恢复率', value: '82%', status: 'normal', period: 'design' },
      { name: '林草覆盖率', value: '25%', status: 'normal', period: 'design' }
    ],
    allowance: 200
  },
  '西北黄土高原区': {
    design: [
      { name: '水土流失治理度', value: '70%', status: 'normal', period: 'design' },
      { name: '土壤流失控制比', value: '0.7', status: 'normal', period: 'design' },
      { name: '渣土防护率', value: '90%', status: 'normal', period: 'design' },
      { name: '表土保护率', value: '92%', status: 'normal', period: 'design' },
      { name: '林草植被恢复率', value: '80%', status: 'normal', period: 'design' },
      { name: '林草覆盖率', value: '22%', status: 'normal', period: 'design' }
    ],
    allowance: 1000
  },
  '南方红壤区': {
    design: [
      { name: '水土流失治理度', value: '85%', status: 'normal', period: 'design' },
      { name: '土壤流失控制比', value: '0.85', status: 'normal', period: 'design' },
      { name: '渣土防护率', value: '95%', status: 'normal', period: 'design' },
      { name: '表土保护率', value: '98%', status: 'normal', period: 'design' },
      { name: '林草植被恢复率', value: '90%', status: 'normal', period: 'design' },
      { name: '林草覆盖率', value: '28%', status: 'normal', period: 'design' }
    ],
    allowance: 500
  },
  '西南紫色土区': {
    design: [
      { name: '水土流失治理度', value: '85%', status: 'normal', period: 'design' },
      { name: '土壤流失控制比', value: '0.85', status: 'normal', period: 'design' },
      { name: '渣土防护率', value: '95%', status: 'normal', period: 'design' },
      { name: '表土保护率', value: '98%', status: 'normal', period: 'design' },
      { name: '林草植被恢复率', value: '90%', status: 'normal', period: 'design' },
      { name: '林草覆盖率', value: '28%', status: 'normal', period: 'design' }
    ],
    allowance: 500
  },
  '西南岩溶区': {
    design: [
      { name: '水土流失治理度', value: '80%', status: 'normal', period: 'design' },
      { name: '土壤流失控制比', value: '0.8', status: 'normal', period: 'design' },
      { name: '渣土防护率', value: '92%', status: 'normal', period: 'design' },
      { name: '表土保护率', value: '95%', status: 'normal', period: 'design' },
      { name: '林草植被恢复率', value: '85%', status: 'normal', period: 'design' },
      { name: '林草覆盖率', value: '26%', status: 'normal', period: 'design' }
    ],
    allowance: 500
  },
  '青藏高原区': {
    design: [
      { name: '水土流失治理度', value: '75%', status: 'normal', period: 'design' },
      { name: '土壤流失控制比', value: '0.75', status: 'normal', period: 'design' },
      { name: '渣土防护率', value: '90%', status: 'normal', period: 'design' },
      { name: '表土保护率', value: '95%', status: 'normal', period: 'design' },
      { name: '林草植被恢复率', value: '80%', status: 'normal', period: 'design' },
      { name: '林草覆盖率', value: '20%', status: 'normal', period: 'design' }
    ],
    allowance: 500
  }
};

// 默认指标数据
const defaultIndicators: IndicatorResult[] = [
  { name: '水土流失治理度', value: '80%', status: 'normal', period: 'design' },
  { name: '土壤流失控制比', value: '0.8', status: 'normal', period: 'design' },
  { name: '渣土防护率', value: '90%', status: 'normal', period: 'design' },
  { name: '表土保护率', value: '95%', status: 'normal', period: 'design' },
  { name: '林草植被恢复率', value: '85%', status: 'normal', period: 'design' },
  { name: '林草覆盖率', value: '25%', status: 'normal', period: 'design' }
];

// 文本生成函数
function generateSection1_5_1(
  location: string,
  preventionZone?: string,
  sensitiveAreas?: SensitiveArea[]
): { auto: string; manual: string[] } {
  const sensitiveInside = sensitiveAreas?.filter(s => s.status === 'inside') || [];
  const sensitiveNear = sensitiveAreas?.filter(s => s.status === 'near') || [];

  const auto = `根据《生产建设项目水土流失防治标准》（GB/T50434-2018）、《全国水土保持规划（2015-2030年）》等相关规定，结合项目地理位置${location ? `（${location}）` : ''}，分析项目区所属的水土保持区划为${preventionZone || '待确定'}。

综合上述分析，依据"就高不就低"的原则，确定本项目水土流失防治标准执行${preventionZone || '相应区划'}一级标准。`;

  const manual: string[] = [];
  if (sensitiveInside.length > 0) {
    manual.push(`涉及敏感区：${sensitiveInside.map(s => s.name).join('、')}，需补充说明具体避让措施或加强防护方案。`);
  }
  if (sensitiveNear.length > 0) {
    manual.push(`邻近敏感区：${sensitiveNear.map(s => s.name).join('、')}，需补充说明与敏感区的相对位置关系及影响分析。`);
  }

  return { auto, manual };
}

function generateSection4_1(
  location: string,
  erosionType?: string,
  erosionSubType?: string,
  soilAllowance?: number
): { auto: string; manual: string[] } {
  const auto = `根据《土壤侵蚀分类分级标准》（SL190-2007），项目区属于${erosionType || '水力侵蚀类型区'}的${erosionSubType || '相应二级区划'}。

项目区水土流失类型主要为水力侵蚀，侵蚀强度以轻度为主，局部地区存在中度侵蚀。项目区现状水土流失的主要影响因素包括：降雨时空分布不均、地形起伏较大、植被覆盖率偏低等。

项目区土壤容许流失量为${soilAllowance || 500}t/(km²·a)，土壤侵蚀模数背景值为${Math.floor(Math.random() * 2000 + 1000)}t/km²·a，作为水土流失预测的基础值。`;

  return { auto, manual: [] };
}

// 主组件
export default function SpatialQueryPage({ onAddHistory }: { onAddHistory?: (item: any) => void }) {
  // 坐标输入
  const [coordInput, setCoordInput] = useState('');
  const [queryResult, setQueryResult] = useState<{
    location: string;
    sensitiveAreas: SensitiveArea[];
    indicators: IndicatorResult[];
    preventionZone?: string;
    erosionType?: string;
    erosionSubType?: string;
    soilAllowance?: number; // 土壤容许流失量
  } | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  // 地图标记
  const [markers, setMarkers] = useState<Array<{ position: [number, number]; popup?: string; color?: string }>>([]);

  // 绘制模式：'none' | 'point' | 'line' | 'polygon'
  const [drawMode, setDrawMode] = useState<'none' | 'point' | 'line' | 'polygon'>('none');
  // 绘制的几何图形
  const [drawnFeatures, setDrawnFeatures] = useState<{
    type: 'point' | 'line' | 'polygon';
    coordinates: [number, number][];
  }[]>([]);

  // 分享模态框
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');

  // 区域筛选 - 单选模式
  const [regionFilter, setRegionFilter] = useState<RegionFilter>({});
  const [activeFilterCategory, setActiveFilterCategory] = useState<'admin' | 'basin' | 'erosion' | 'prevention' | null>(null);

  // 成果输出
  const [generatedText, setGeneratedText] = useState<{
    section1_5_1?: { auto: string; manual: string[] };
    section4_1?: { auto: string; manual: string[] };
  } | null>(null);
  const [showOutputPanel, setShowOutputPanel] = useState(false);

  // 处理筛选变更（单选模式）
  const handleFilterChange = (key: keyof RegionFilter, value: string) => {
    const category = getFilterCategory(key);

    setRegionFilter(prev => {
      // 如果选择的是空值，只清除子级联，不清除其他分类
      if (!value) {
        const newFilter = { ...prev, [key]: value };
        if (key === 'province') {
          newFilter.city = undefined;
          newFilter.county = undefined;
        }
        if (key === 'city') {
          newFilter.county = undefined;
        }
        if (key === 'erosionType') {
          newFilter.erosionSubType = undefined;
        }
        return newFilter;
      }

      // 非空值：清除其他分类的筛选，实现单选互斥
      const clearOthers: Partial<RegionFilter> = {};
      if (category) {
        Object.entries(FILTER_CATEGORIES).forEach(([cat, keys]) => {
          if (cat !== category) {
            keys.forEach(k => clearOthers[k] = undefined);
          }
        });
      }

      const newFilter = { ...prev, ...clearOthers, [key]: value };

      // 清除子级联选择
      if (key === 'province') {
        newFilter.city = undefined;
        newFilter.county = undefined;
      }
      if (key === 'city') {
        newFilter.county = undefined;
      }
      if (key === 'erosionType') {
        newFilter.erosionSubType = undefined;
      }

      return newFilter;
    });
  };

  // 重置筛选
  const handleResetFilter = () => {
    setRegionFilter({});
  };

  // 处理坐标查询
  const handleCoordinateQuery = () => {
    if (!coordInput.trim()) return;

    const coords = coordInput.split(',').map(s => parseFloat(s.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      setMarkers([{ position: [coords[1], coords[0]], popup: coordInput, color: '#3b82f6' }]);
    }

    setIsQuerying(true);
    setQueryResult(null);
    setGeneratedText(null);

    setTimeout(() => {
      // 根据筛选的防治区划获取指标数据
      const zoneKey = regionFilter.preventionZone || '西北黄土高原区';
      const zoneData = indicatorDataByZone[zoneKey] || { design: defaultIndicators, allowance: 500 };

      const result = {
        location: coordInput,
        sensitiveAreas: [
          { name: '国家级水土流失重点预防区', status: 'outside' as const, distance: `${Math.floor(Math.random() * 10 + 3)}km` },
          { name: '省级水土流失重点治理区', status: regionFilter.province ? 'inside' as const : 'outside' as const, distance: regionFilter.province ? '0km' : `${Math.floor(Math.random() * 5 + 2)}km` },
          { name: '饮用水水源保护区', status: 'outside' as const, distance: `${Math.floor(Math.random() * 15 + 5)}km` },
          { name: '国家级自然保护区', status: 'outside' as const, distance: `${Math.floor(Math.random() * 20 + 10)}km` },
        ],
        indicators: zoneData.design,
        preventionZone: regionFilter.preventionZone,
        erosionType: regionFilter.erosionType || 'I水力侵蚀类型区',
        erosionSubType: regionFilter.erosionSubType || 'I₁西北黄土高原区',
        soilAllowance: zoneData.allowance || 500
      };
      setQueryResult(result);
      if (onAddHistory) {
        onAddHistory({ type: 'spatial', location: coordInput, result });
      }
      setIsQuerying(false);
    }, 1500);
  };

  // 处理地图点击
  const handleMapClick = (lat: number, lng: number) => {
    setIsQuerying(true);
    setQueryResult(null);
    setGeneratedText(null);
    setMarkers([{ position: [lat, lng], popup: `${lng.toFixed(4)}, ${lat.toFixed(4)}`, color: '#3b82f6' }]);

    setTimeout(() => {
      const zoneKey = regionFilter.preventionZone || '西北黄土高原区';
      const zoneData = indicatorDataByZone[zoneKey] || { design: defaultIndicators, allowance: 500 };

      const result = {
        location: `${lng.toFixed(4)}, ${lat.toFixed(4)}`,
        sensitiveAreas: [
          { name: '国家级水土流失重点预防区', status: 'outside' as const, distance: `${Math.floor(Math.random() * 10 + 3)}km` },
          { name: '省级水土流失重点治理区', status: regionFilter.province ? 'inside' as const : 'outside' as const, distance: regionFilter.province ? '0km' : `${Math.floor(Math.random() * 5 + 2)}km` },
          { name: '饮用水水源保护区', status: 'outside' as const, distance: `${Math.floor(Math.random() * 15 + 5)}km` },
          { name: '国家级自然保护区', status: 'outside' as const, distance: `${Math.floor(Math.random() * 20 + 10)}km` },
        ],
        indicators: zoneData.design,
        preventionZone: regionFilter.preventionZone,
        erosionType: regionFilter.erosionType || 'I水力侵蚀类型区',
        erosionSubType: regionFilter.erosionSubType || 'I₁西北黄土高原区',
        soilAllowance: zoneData.allowance || 500
      };
      setQueryResult(result);
      if (onAddHistory) {
        onAddHistory({ type: 'spatial', location: `${lng.toFixed(4)}, ${lat.toFixed(4)}`, coordinates: { lat, lng }, result });
      }
      setIsQuerying(false);
    }, 1500);
  };

  // 分享
  const handleShare = () => {
    if (queryResult && queryResult.location) {
      const link = `${window.location.origin}?type=spatial&location=${encodeURIComponent(queryResult.location)}`;
      setShareLink(link);
      setShowShareModal(true);
    }
  };

  // 导出Excel
  const handleExport = () => {
    if (!queryResult) return;

    const headers = ['类型', '名称', '数值/状态', '备注'];
    const rows: string[][] = [];

    // 敏感区结果
    queryResult.sensitiveAreas.forEach(area => {
      rows.push([
        '敏感区',
        area.name,
        area.status === 'inside' ? '区域内' : area.status === 'near' ? '临近' : '区域外',
        area.distance
      ]);
    });

    // 指标结果
    queryResult.indicators.forEach(ind => {
      rows.push(['指标', ind.name, ind.value, ind.period === 'construction' ? '施工期' : '设计水平年']);
    });

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `空间核查_${queryResult.location}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 生成方案文本
  const handleGenerateText = () => {
    if (!queryResult) return;

    const section1_5_1 = generateSection1_5_1(
      queryResult.location,
      queryResult.preventionZone,
      queryResult.sensitiveAreas
    );
    const section4_1 = generateSection4_1(
      queryResult.location,
      queryResult.erosionType,
      queryResult.erosionSubType,
      queryResult.soilAllowance
    );

    setGeneratedText({ section1_5_1, section4_1 });
    setShowOutputPanel(true);
  };

  // 复制文本
  const handleCopyText = () => {
    if (!generatedText) return;

    const text = `
1.5.1 执行标准等级
${generatedText.section1_5_1?.auto}
${generatedText.section1_5_1?.manual.map(m => `\n*${m}*`).join('')}

4.1 水土流失现状
${generatedText.section4_1?.auto}
    `.trim();

    navigator.clipboard.writeText(text);
    alert('文本已复制到剪贴板');
  };

  return (
    <div className="pc-page">
      <div className="page-header">
        <h1>空间核查</h1>
        <p>选址选线避让与指标查询</p>
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
            <div className="map-legend" style={{
              position: 'absolute',
              bottom: '20px',
              left: '10px',
              zIndex: 1000,
              background: 'rgba(255,255,255,0.95)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '13px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>图例</div>
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
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#3b82f6' }}></span>
                项目位置
              </div>
            </div>
          </div>
        </div>

        {/* 中间列：项目输入 + 区域筛选 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>

        {/* ① 项目输入面板 */}
          <div className="query-section">
            <div className="query-header">
              <MapPin size={18} />
              <span>项目输入</span>
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

            {/* 绘制工具栏 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '6px' }}>绘制项目边界</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  className={`btn ${drawMode === 'point' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDrawMode(drawMode === 'point' ? 'none' : 'point')}
                  style={{ flex: 1, minWidth: '70px', padding: '6px 8px', fontSize: '12px' }}
                  title="绘制点"
                >
                  <MapPin size={14} /> 点
                </button>
                <button
                  className={`btn ${drawMode === 'line' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDrawMode(drawMode === 'line' ? 'none' : 'line')}
                  style={{ flex: 1, minWidth: '70px', padding: '6px 8px', fontSize: '12px' }}
                  title="绘制线"
                >
                  <Minus size={14} /> 线
                </button>
                <button
                  className={`btn ${drawMode === 'polygon' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDrawMode(drawMode === 'polygon' ? 'none' : 'polygon')}
                  style={{ flex: 1, minWidth: '70px', padding: '6px 8px', fontSize: '12px' }}
                  title="绘制面"
                >
                  <Square size={14} /> 面
                </button>
                {drawnFeatures.length > 0 && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => { setDrawnFeatures([]); setMarkers([]); }}
                    style={{ padding: '6px 8px', color: '#ef4444' }}
                    title="清除绘制"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              {drawMode !== 'none' && (
                <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '4px' }}>
                  {drawMode === 'point' && '点击地图添加点'}
                  {drawMode === 'line' && '点击地图添加线的节点，双击结束'}
                  {drawMode === 'polygon' && '点击地图添加面的节点，双击结束'}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-full" onClick={() => { setDrawMode('none'); setMarkers([]); }} style={{ flex: 1 }}>
                <MapPin size={16} /> 坐标点选
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '8px 12px' }}
                onClick={() => alert('功能开发中，支持 SHP/KML 文件导入')}
                title="导入矢量文件"
              >
                <FileUp size={16} />
              </button>
            </div>

            {/* 已绘制的图形列表 */}
            {drawnFeatures.length > 0 && (
              <div style={{ marginTop: '12px', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>已绘制图形</div>
                {drawnFeatures.map((feature, idx) => (
                  <div key={idx} style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      {feature.type === 'point' && `点 ${idx + 1}`}
                      {feature.type === 'line' && `线 ${idx + 1} (${feature.coordinates.length}个节点)`}
                      {feature.type === 'polygon' && `面 ${idx + 1} (${feature.coordinates.length}个节点)`}
                    </span>
                    <button
                      onClick={() => setDrawnFeatures(prev => prev.filter((_, i) => i !== idx))}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ② 区域筛选面板 - 单选模式 */}
          <div className="query-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
            <div className="query-header">
              <AlertCircle size={18} style={{ color: '#8b5cf6' }} />
              <span>区域筛选</span>
            </div>

            <div style={{ marginTop: '12px' }}>
              {/* 横向Tab选择器 */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                <button
                  className={`filter-tab ${activeFilterCategory === 'admin' ? 'active' : ''}`}
                  onClick={() => setActiveFilterCategory(activeFilterCategory === 'admin' ? null : 'admin')}
                >
                  行政区划
                </button>
                <button
                  className={`filter-tab ${activeFilterCategory === 'basin' ? 'active' : ''}`}
                  onClick={() => setActiveFilterCategory(activeFilterCategory === 'basin' ? null : 'basin')}
                >
                  七大流域
                </button>
                <button
                  className={`filter-tab ${activeFilterCategory === 'erosion' ? 'active' : ''}`}
                  onClick={() => setActiveFilterCategory(activeFilterCategory === 'erosion' ? null : 'erosion')}
                >
                  土壤侵蚀类型区
                </button>
                <button
                  className={`filter-tab ${activeFilterCategory === 'prevention' ? 'active' : ''}`}
                  onClick={() => setActiveFilterCategory(activeFilterCategory === 'prevention' ? null : 'prevention')}
                >
                  水土流失防治区划
                </button>
              </div>

              {/* 筛选内容区域 */}
              {activeFilterCategory === 'admin' && (
                <div className="filter-content">
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <select
                      value={regionFilter.province || ''}
                      onChange={e => handleFilterChange('province', e.target.value)}
                      style={{ flex: 1, minWidth: '100px' }}
                    >
                      <option value="">选择省份</option>
                      {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select
                      value={regionFilter.city || ''}
                      onChange={e => handleFilterChange('city', e.target.value)}
                      disabled={!regionFilter.province}
                      style={{ flex: 1, minWidth: '100px' }}
                    >
                      <option value="">选择城市</option>
                      {(cities[regionFilter.province || ''] || []).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {activeFilterCategory === 'basin' && (
                <div className="filter-content">
                  <select
                    value={regionFilter.basin || ''}
                    onChange={e => handleFilterChange('basin', e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">选择流域</option>
                    {basins.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}

              {activeFilterCategory === 'erosion' && (
                <div className="filter-content">
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <select
                      value={regionFilter.erosionType || ''}
                      onChange={e => handleFilterChange('erosionType', e.target.value)}
                      style={{ flex: 1 }}
                    >
                      <option value="">选择一级区</option>
                      {erosionTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                    </select>
                    <select
                      value={regionFilter.erosionSubType || ''}
                      onChange={e => handleFilterChange('erosionSubType', e.target.value)}
                      disabled={!regionFilter.erosionType}
                      style={{ flex: 1 }}
                    >
                      <option value="">选择二级区</option>
                      {(erosionSubTypes[regionFilter.erosionType?.charAt(0) || ''] || []).map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {activeFilterCategory === 'prevention' && (
                <div className="filter-content">
                  <select
                    value={regionFilter.preventionZone || ''}
                    onChange={e => handleFilterChange('preventionZone', e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">选择防治区划</option>
                    {preventionZones.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </div>
              )}

              {/* 重置按钮 */}
              <button className="btn btn-secondary btn-full" onClick={handleResetFilter} style={{ marginTop: '12px' }}>
                重置筛选
              </button>
            </div>
          </div>
        </div>

        {/* 右侧列：核查结果 + 成果输出 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>

          {/* ③ 核查结果面板 - 常驻显示 */}
          <div className="query-section">
            {isQuerying ? (
              <div className="loading-container">
                <Loader2 size={32} className="spinning" />
                <p>正在核查...</p>
              </div>
            ) : queryResult ? (
              <>
                <div className="result-header">
                  <h3>核查结果</h3>
                  <span className="result-region">{queryResult.location}</span>
                </div>

                {/* 敏感区结果 */}
                <div className="sensitive-results" style={{ marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>敏感区核查</h4>
                  {queryResult.sensitiveAreas.map((area, idx) => (
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

                {/* 执行标准等级 */}
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>执行标准等级</h4>
                  <div style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderLeft: '3px solid #8b5cf6',
                    padding: '10px 12px',
                    borderRadius: '6px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Shield size={18} style={{ color: '#8b5cf6' }} />
                      <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {queryResult.preventionZone || '北方土石山区'}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '26px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={14} style={{ color: '#f59e0b' }} fill="#f59e0b" />
                      一级标准
                    </div>
                  </div>
                </div>

                {/* 指标结果 */}
                <div className="indicator-results" style={{ marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    防治指标
                    <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-tertiary)' }}>设计水平年</span>
                  </h4>
                  {queryResult.indicators.map((ind, idx) => (
                    <div key={idx} className={`indicator-result-item ${ind.status}`}>
                      <div className="indicator-name">{ind.name}</div>
                      <div className="indicator-value">
                        <span className="value">{ind.value}</span>
                        {ind.status === 'warning' && <Circle size={16} fill="#f59e0b" className="warning-icon" />}
                      </div>
                    </div>
                  ))}
                  {/* 土壤容许流失量 */}
                  {queryResult.soilAllowance && (
                    <div className="indicator-result-item" style={{ background: 'rgba(59, 130, 246, 0.1)', borderLeft: '3px solid #3b82f6' }}>
                      <div className="indicator-name" style={{ fontWeight: 600 }}>土壤容许流失量</div>
                      <div className="indicator-value">
                        <span className="value" style={{ color: '#3b82f6', fontWeight: 600 }}>{queryResult.soilAllowance} t/(km²·a)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="result-actions">
                  <button className="btn btn-secondary" onClick={handleExport}>
                    <DownloadIcon size={16} /> 导出Excel
                  </button>
                  <button className="btn btn-secondary" onClick={handleShare}>
                    <Share2 size={16} /> 分享
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="result-header">
                  <h3>核查结果</h3>
                </div>
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-tertiary)' }}>
                  <MapPin size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                  <p style={{ fontSize: '14px' }}>请在左侧地图选择位置或输入坐标</p>
                </div>
              </>
            )}
          </div>

          {/* ④ 成果输出面板 - 常驻显示 */}
          <div className="query-section">
            <div className="query-header">
              <FileUp size={18} style={{ color: '#10b981' }} />
              <span>成果输出</span>
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={handleGenerateText}
              disabled={!queryResult}
              style={{
                marginTop: '12px',
                background: queryResult ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--bg-tertiary)',
                cursor: queryResult ? 'pointer' : 'not-allowed',
                opacity: queryResult ? 1 : 0.6
              }}
            >
              <FileUp size={16} /> 生成方案文本
            </button>

              {showOutputPanel && generatedText && (
                <div style={{ marginTop: '16px' }}>
                  {/* 1.5.1 执行标准等级 */}
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-primary)' }}>1.5.1 执行标准等级</h4>
                    <div style={{
                      background: 'var(--bg-tertiary)',
                      padding: '12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}>
                      <p style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>{generatedText.section1_5_1?.auto}</p>
                      {generatedText.section1_5_1?.manual.map((m, i) => (
                        <p key={i} style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', marginBottom: '4px' }}>* {m}</p>
                      ))}
                    </div>
                  </div>

                  {/* 4.1 水土流失现状 */}
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-primary)' }}>4.1 水土流失现状</h4>
                    <div style={{
                      background: 'var(--bg-tertiary)',
                      padding: '12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}>
                      <p style={{ color: 'var(--text-primary)' }}>{generatedText.section4_1?.auto}</p>
                    </div>
                  </div>

                  <button className="btn btn-secondary btn-full" onClick={handleCopyText}>
                    复制全部文本
                  </button>
                </div>
              )}
            </div>
        </div>
      </div>

      {/* 分享模态框 */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="pc-modal-content small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>分享核查结果</h2>
              <button className="close-btn" onClick={() => setShowShareModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '12px' }}>复制以下链接分享核查结果：</p>
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

// 需要添加 Circle 图标导入
