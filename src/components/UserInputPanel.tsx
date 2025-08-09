import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarIcon, 
  MapPin, 
  Satellite, 
  Play, 
  Download,
  Settings,
  Info
} from "lucide-react";
import { format } from "date-fns";

interface UserInputPanelProps {
  onAnalysisStart: (params: AnalysisParameters) => void;
  isLoading?: boolean;
}

export interface AnalysisParameters {
  region: {
    type: 'coordinates' | 'upload' | 'draw';
    coordinates?: [number, number][];
    name: string;
  };
  dateRange: {
    start: Date;
    end: Date;
  };
  analysisType: string[];
  cropType?: string;
  resolution: number;
  cloudCoverage: number;
  additionalParams: Record<string, any>;
}

export const UserInputPanel = ({ onAnalysisStart, isLoading }: UserInputPanelProps) => {
  const [region, setRegion] = useState<AnalysisParameters['region']>({
    type: 'coordinates',
    name: ''
  });
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [analysisTypes, setAnalysisTypes] = useState<string[]>(['ndvi']);
  const [cropType, setCropType] = useState<string>('');
  const [resolution, setResolution] = useState<number>(30);
  const [cloudCoverage, setCloudCoverage] = useState<number>(20);
  const [coordinates, setCoordinates] = useState<string>('');

  const handleAnalysisTypeToggle = (type: string) => {
    setAnalysisTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleStartAnalysis = () => {
    if (!startDate || !endDate || !region.name) {
      alert('Please fill in all required fields');
      return;
    }

    const params: AnalysisParameters = {
      region: {
        ...region,
        coordinates: coordinates ? parseCoordinates(coordinates) : undefined
      },
      dateRange: {
        start: startDate,
        end: endDate
      },
      analysisType: analysisTypes,
      cropType: cropType || undefined,
      resolution,
      cloudCoverage,
      additionalParams: {}
    };

    onAnalysisStart(params);
  };

  const parseCoordinates = (coordString: string): [number, number][] => {
    try {
      // Simple parsing for lat,lng pairs separated by semicolons
      return coordString.split(';').map(pair => {
        const [lat, lng] = pair.trim().split(',').map(Number);
        return [lng, lat] as [number, number];
      });
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Region Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Study Area Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Region Input Method</Label>
            <Select value={region.type} onValueChange={(value: any) => setRegion(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coordinates">Manual Coordinates</SelectItem>
                <SelectItem value="upload">Upload Shapefile</SelectItem>
                <SelectItem value="draw">Draw on Map</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Region Name *</Label>
            <Input
              placeholder="e.g., Farm Field A, Study Area 1"
              value={region.name}
              onChange={(e) => setRegion(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {region.type === 'coordinates' && (
            <div className="space-y-2">
              <Label>Coordinates (lat,lng; lat,lng; ...)</Label>
              <Textarea
                placeholder="37.7749,-122.4194; 37.7849,-122.4194; 37.7849,-122.4094; 37.7749,-122.4094"
                value={coordinates}
                onChange={(e) => setCoordinates(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Enter coordinates as latitude,longitude pairs separated by semicolons
              </p>
            </div>
          )}

          {region.type === 'upload' && (
            <div className="space-y-2">
              <Label>Upload Shapefile</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: .shp, .kml, .geojson
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Date Range Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Time Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            Analysis Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Analysis Types</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'ndvi', name: 'NDVI', desc: 'Vegetation Index' },
                { id: 'evi', name: 'EVI', desc: 'Enhanced Vegetation Index' },
                { id: 'moisture', name: 'Soil Moisture', desc: 'Surface Moisture' },
                { id: 'temperature', name: 'LST', desc: 'Land Surface Temperature' },
                { id: 'precipitation', name: 'Precipitation', desc: 'Rainfall Data' },
                { id: 'drought', name: 'Drought Index', desc: 'Drought Monitoring' }
              ].map(analysis => (
                <Badge
                  key={analysis.id}
                  variant={analysisTypes.includes(analysis.id) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => handleAnalysisTypeToggle(analysis.id)}
                >
                  {analysis.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Crop Type (Optional)</Label>
              <Select value={cropType} onValueChange={setCropType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select crop type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wheat">Wheat</SelectItem>
                  <SelectItem value="corn">Corn</SelectItem>
                  <SelectItem value="soybean">Soybean</SelectItem>
                  <SelectItem value="rice">Rice</SelectItem>
                  <SelectItem value="cotton">Cotton</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Spatial Resolution (m)</Label>
              <Select value={resolution.toString()} onValueChange={(value) => setResolution(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10m (Sentinel-2)</SelectItem>
                  <SelectItem value="30">30m (Landsat)</SelectItem>
                  <SelectItem value="250">250m (MODIS)</SelectItem>
                  <SelectItem value="500">500m (MODIS)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Max Cloud Coverage (%)</Label>
            <div className="flex items-center gap-4">
              <Input
                type="range"
                min="0"
                max="100"
                value={cloudCoverage}
                onChange={(e) => setCloudCoverage(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium w-12">{cloudCoverage}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Satellite Collection</Label>
              <Select defaultValue="landsat8">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landsat8">Landsat 8</SelectItem>
                  <SelectItem value="landsat9">Landsat 9</SelectItem>
                  <SelectItem value="sentinel2">Sentinel-2</SelectItem>
                  <SelectItem value="modis">MODIS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Processing Level</Label>
              <Select defaultValue="l2">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="l1">Level 1 (Raw)</SelectItem>
                  <SelectItem value="l2">Level 2 (Surface Reflectance)</SelectItem>
                  <SelectItem value="l3">Level 3 (Processed)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Info className="h-4 w-4 text-blue-600" />
            <p className="text-xs text-blue-800">
              Analysis will be performed using Google Earth Engine Python API. Processing time depends on area size and date range.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={handleStartAnalysis} 
          disabled={isLoading || !startDate || !endDate || !region.name}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Analysis
            </>
          )}
        </Button>
        
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Save Config
        </Button>
      </div>
    </div>
  );
};