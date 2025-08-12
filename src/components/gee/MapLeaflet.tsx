import React, { useMemo, useRef } from "react";
import { MapContainer, TileLayer, FeatureGroup, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
// @ts-ignore - types provided by package
import { EditControl } from "react-leaflet-draw";
import L, { LatLngBoundsExpression } from "leaflet";

export interface MapLeafletProps {
  aoi?: GeoJSON.Geometry | null;
  onAOIChange?: (geometry: GeoJSON.Geometry | null, file?: File) => void;
  resultSummary?: { parameter: string; mean: number } | null;
}

const IndiaBounds: LatLngBoundsExpression = [
  [6.5546079, 68.1113787],
  [35.6745457, 97.395561]
];

function FitToAOI({ geometry }: { geometry?: GeoJSON.Geometry | null }) {
  const map = useMap();
  React.useEffect(() => {
    if (!geometry) return;
    const layer = L.geoJSON(geometry as any);
    const bounds = layer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.2));
  }, [geometry, map]);
  return null;
}

export const MapLeaflet: React.FC<MapLeafletProps> = ({ aoi, onAOIChange, resultSummary }) => {
  const fgRef = useRef<L.FeatureGroup>(null);

  const drawOptions = useMemo(() => ({
    draw: {
      marker: false,
      circle: false,
      circlemarker: false,
      polyline: false,
      rectangle: true,
      polygon: {
        allowIntersection: false,
        showArea: true,
      },
    },
    edit: {
      edit: true,
      remove: true,
    },
  }), []);

  const handleCreated = (e: any) => {
    const layer = e.layer as L.Layer;
    const geojson = (layer as any).toGeoJSON() as GeoJSON.Feature;
    const geometry = geojson.geometry;
    const file = new File([JSON.stringify({ type: "FeatureCollection", features: [geojson] })], "aoi.geojson", { type: "application/geo+json" });
    onAOIChange?.(geometry, file);
  };

  const handleEdited = (e: any) => {
    const layers = e.layers as L.LayerGroup;
    let geometry: GeoJSON.Geometry | null = null;
    layers.eachLayer((layer: any) => {
      const gj = layer.toGeoJSON() as GeoJSON.Feature;
      geometry = gj.geometry;
    });
    if (geometry) {
      const file = new File([JSON.stringify({ type: "FeatureCollection", features: [{ type: "Feature", properties: {}, geometry }] })], "aoi.geojson", { type: "application/geo+json" });
      onAOIChange?.(geometry, file);
    }
  };

  const handleDeleted = () => onAOIChange?.(null, undefined);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        bounds={IndiaBounds}
        style={{ width: "100%", height: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FeatureGroup ref={fgRef as any}>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            onEdited={handleEdited}
            onDeleted={handleDeleted}
            draw={drawOptions.draw}
            edit={drawOptions.edit}
          />
        </FeatureGroup>

        {aoi && <GeoJSON data={aoi as any} />}
        <FitToAOI geometry={aoi} />
      </MapContainer>

      {resultSummary && (
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur border rounded-md p-3 text-sm shadow">
          <div className="font-medium">Result</div>
          <div className="text-muted-foreground">{resultSummary.parameter} Mean</div>
          <div className="text-lg font-bold">{Number(resultSummary.mean).toFixed(3)}</div>
        </div>
      )}
    </div>
  );
};

export default MapLeaflet;
