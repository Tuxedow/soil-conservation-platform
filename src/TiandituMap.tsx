import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 修复 Leaflet 默认图标问题
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface TiandituMapProps {
  center?: [number, number];
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
  markers?: Array<{
    position: [number, number];
    popup?: string;
    color?: string;
  }>;
}

type MapLayer = 'vector' | 'satellite' | 'terrain';

// 天地图 API Key
const API_KEY = '7e50a104042279ced9f7b86a037c4d70';

// 图层配置 - 恢复之前能工作的版本
const LAYER_CONFIGS = {
  vector: {
    base: 'https://t0.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' + API_KEY,
    label: 'https://t0.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' + API_KEY,
    name: '矢量图',
  },
  satellite: {
    base: 'https://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' + API_KEY,
    label: 'https://t0.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' + API_KEY,
    name: '卫星图',
  },
  terrain: {
    base: 'https://t0.tianditu.gov.cn/ter_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' + API_KEY,
    label: 'https://t0.tianditu.gov.cn/cta_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' + API_KEY,
    name: '地形图',
  },
};

// 中国范围边界（北纬3°-54°，东经73°-135°）
const CHINA_BOUNDS: L.LatLngBoundsExpression = [
  [3, 73],   // 西南角：北纬3°，东经73°
  [54, 135]  // 东北角：北纬54°，东经135°
];

export default function TiandituMap({
  center = [35.8617, 104.1954],
  zoom = 5,
  onMapClick,
  markers = [],
}: TiandituMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const labelLayerRef = useRef<L.TileLayer | null>(null);

  const [currentLayer, setCurrentLayer] = useState<MapLayer>('satellite');

  // 初始化地图
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      const map = L.map(mapRef.current, {
        center,
        zoom,
        zoomControl: false,
        minZoom: 3,
        maxZoom: 18,
        maxBounds: CHINA_BOUNDS,
        maxBoundsViscosity: 1.0,
      });

      // 添加底图和注记图层
      const config = LAYER_CONFIGS[currentLayer];
      baseLayerRef.current = L.tileLayer(config.base, {
        attribution: '© 天地图',
        maxZoom: 18,
      }).addTo(map);

      labelLayerRef.current = L.tileLayer(config.label, {
        attribution: '© 天地图',
        maxZoom: 18,
      }).addTo(map);

      // 添加缩放控件
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // 点击事件
      if (onMapClick) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          onMapClick(e.latlng.lat, e.latlng.lng);
        });
      }

      mapInstanceRef.current = map;
    } catch (error) {
      console.error('Map initialization error:', error);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 切换图层
  useEffect(() => {
    if (!mapInstanceRef.current || !baseLayerRef.current || !labelLayerRef.current) return;

    const config = LAYER_CONFIGS[currentLayer];

    mapInstanceRef.current.removeLayer(baseLayerRef.current);
    mapInstanceRef.current.removeLayer(labelLayerRef.current);

    baseLayerRef.current = L.tileLayer(config.base, {
      attribution: '© 天地图',
      maxZoom: 18,
    }).addTo(mapInstanceRef.current);

    labelLayerRef.current = L.tileLayer(config.label, {
      attribution: '© 天地图',
      maxZoom: 18,
    }).addTo(mapInstanceRef.current);
  }, [currentLayer]);

  // 更新标记点
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    markers.forEach((marker) => {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${marker.color || '#3b82f6'}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const m = L.marker(marker.position, { icon }).addTo(mapInstanceRef.current!);
      if (marker.popup) {
        m.bindPopup(marker.popup);
      }
    });
  }, [markers]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 地图容器 */}
      <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />

      {/* 工具栏 */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
      }}>
        {/* 图层切换 */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>地图类型</div>
          {(['satellite', 'vector', 'terrain'] as MapLayer[]).map((layer) => (
            <button
              key={layer}
              onClick={() => setCurrentLayer(layer)}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                background: currentLayer === layer ? '#3b82f6' : '#f1f5f9',
                color: currentLayer === layer ? 'white' : '#333',
                transition: 'all 0.2s',
              }}
            >
              {LAYER_CONFIGS[layer].name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
