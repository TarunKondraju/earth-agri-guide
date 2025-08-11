import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Layers, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface MapViewProps {
  selectedRegion?: {
    coordinates?: [number, number][];
    name: string;
    type?: 'coordinates' | 'upload' | 'draw';
  };
  analysisResults?: any;
  isLoading?: boolean;
}

export const MapView = ({ selectedRegion, analysisResults, isLoading }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLayers, setMapLayers] = useState<string[]>(['satellite']);
  const [zoomLevel, setZoomLevel] = useState(10);

  // Simulate map initialization
  useEffect(() => {
    if (mapRef.current && selectedRegion) {
      // Here you would initialize your actual map (Google Maps, Leaflet, etc.)
      console.log('Initializing map for region:', selectedRegion);
    }
  }, [selectedRegion]);

  const toggleLayer = (layer: string) => {
    setMapLayers(prev => 
      prev.includes(layer) 
        ? prev.filter(l => l !== layer)
        : [...prev, layer]
    );
  };

  return (
    <div className="relative h-full">
      {/* Map Container */}
      <div 
        ref={mapRef}
        className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 rounded-lg relative overflow-hidden"
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
            <div className="bg-white rounded-lg p-4 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing satellite data...</span>
            </div>
          </div>
        )}

        {/* Simulated Map Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-64 h-48 bg-green-200 rounded-lg mb-4 relative overflow-hidden">
              {/* Simulated satellite imagery */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-300 via-yellow-200 to-brown-200 opacity-70"></div>
              <div className="absolute top-4 left-4 w-8 h-8 bg-green-500 rounded opacity-80"></div>
              <div className="absolute bottom-4 right-4 w-12 h-6 bg-brown-400 rounded opacity-60"></div>
              {selectedRegion && (
                <div className="absolute inset-4 border-2 border-red-500 border-dashed rounded"></div>
              )}
            </div>
            {selectedRegion ? (
              <p className="text-sm text-muted-foreground">
                Viewing: {selectedRegion.name}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a region to view satellite data
              </p>
            )}
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button size="sm" variant="outline" className="bg-white/90">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className="bg-white/90">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" className="bg-white/90">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Layer Controls */}
        <div className="absolute bottom-4 left-4">
          <Card className="bg-white/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Layers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { id: 'satellite', name: 'Satellite', color: 'bg-blue-500' },
                { id: 'ndvi', name: 'NDVI', color: 'bg-green-500' },
                { id: 'moisture', name: 'Soil Moisture', color: 'bg-brown-500' },
                { id: 'temperature', name: 'Temperature', color: 'bg-red-500' }
              ].map(layer => (
                <div key={layer.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={mapLayers.includes(layer.id)}
                    onChange={() => toggleLayer(layer.id)}
                    className="rounded"
                  />
                  <div className={`w-3 h-3 rounded ${layer.color}`}></div>
                  <span className="text-xs">{layer.name}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results Overlay */}
        {analysisResults && (
          <div className="absolute top-4 left-4 max-w-xs">
            <Card className="bg-white/90">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Avg NDVI:</span>
                  <Badge variant="outline">{analysisResults.avgNDVI}</Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Soil Moisture:</span>
                  <Badge variant="outline">{analysisResults.soilMoisture}%</Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Health Status:</span>
                  <Badge className={
                    analysisResults.healthStatus === 'healthy' ? 'bg-green-100 text-green-800' :
                    analysisResults.healthStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {analysisResults.healthStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};