import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import { 
  Satellite, 
  Calendar, 
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { mockFields, generateSatelliteData } from "@/services/mockData";

const SatelliteAnalysis = () => {
  const [selectedField, setSelectedField] = useState(mockFields[0].id);
  const [analysisType, setAnalysisType] = useState("ndvi");
  const [timeRange, setTimeRange] = useState("12months");

  const satelliteData = generateSatelliteData(selectedField);
  const selectedFieldData = mockFields.find(field => field.id === selectedField);

  const getDataKey = () => {
    switch (analysisType) {
      case "ndvi": return "ndvi";
      case "evi": return "evi";
      case "moisture": return "soilMoisture";
      case "temperature": return "temperature";
      default: return "ndvi";
    }
  };

  const getAnalysisColor = () => {
    switch (analysisType) {
      case "ndvi": return "hsl(var(--healthy))";
      case "evi": return "hsl(var(--primary))";
      case "moisture": return "hsl(var(--accent))";
      case "temperature": return "hsl(var(--warning))";
      default: return "hsl(var(--primary))";
    }
  };

  const getCurrentValue = () => {
    const latest = satelliteData[satelliteData.length - 1];
    if (!latest) return 0;
    
    switch (analysisType) {
      case "ndvi": return latest.ndvi.toFixed(3);
      case "evi": return latest.evi.toFixed(3);
      case "moisture": return `${latest.soilMoisture.toFixed(1)}%`;
      case "temperature": return `${latest.temperature.toFixed(1)}°C`;
      default: return "0";
    }
  };

  const getTrend = () => {
    if (satelliteData.length < 2) return "stable";
    
    const current = satelliteData[satelliteData.length - 1];
    const previous = satelliteData[satelliteData.length - 2];
    
    const currentValue = current[getDataKey() as keyof typeof current] as number;
    const previousValue = previous[getDataKey() as keyof typeof previous] as number;
    
    const difference = currentValue - previousValue;
    
    if (Math.abs(difference) < 0.01) return "stable";
    return difference > 0 ? "increasing" : "decreasing";
  };

  const trend = getTrend();

  const getTrendIcon = () => {
    switch (trend) {
      case "increasing": return <TrendingUp className="h-4 w-4 text-healthy" />;
      case "decreasing": return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAnalysisTitle = () => {
    switch (analysisType) {
      case "ndvi": return "Normalized Difference Vegetation Index";
      case "evi": return "Enhanced Vegetation Index";
      case "moisture": return "Soil Moisture Content";
      case "temperature": return "Surface Temperature";
      default: return "Analysis";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Satellite Analysis</h1>
          <p className="text-muted-foreground">
            Remote sensing data analysis and monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Field</label>
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockFields.map(field => (
                    <SelectItem key={field.id} value={field.id}>
                      {field.name} ({field.cropType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Analysis Type</label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ndvi">NDVI</SelectItem>
                  <SelectItem value="evi">EVI</SelectItem>
                  <SelectItem value="moisture">Soil Moisture</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 months</SelectItem>
                  <SelectItem value="6months">Last 6 months</SelectItem>
                  <SelectItem value="12months">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <Satellite className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCurrentValue()}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon()}
              <span>{trend}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Field Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={
              selectedFieldData?.healthStatus === 'healthy' ? 'bg-healthy/10 text-healthy border-healthy/20' :
              selectedFieldData?.healthStatus === 'warning' ? 'bg-warning/10 text-warning border-warning/20' :
              'bg-destructive/10 text-destructive border-destructive/20'
            }>
              {selectedFieldData?.healthStatus || 'Unknown'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedFieldData?.area} hectares
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {new Date(selectedFieldData?.lastAnalysis || '').toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Satellite pass
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-healthy">95%</div>
            <p className="text-xs text-muted-foreground">
              Cloud-free coverage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{getAnalysisTitle()}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {selectedFieldData?.name} - {selectedFieldData?.cropType}
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={satelliteData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value: number) => [
                  analysisType === 'moisture' ? `${value.toFixed(1)}%` :
                  analysisType === 'temperature' ? `${value.toFixed(1)}°C` :
                  value.toFixed(3),
                  getAnalysisTitle()
                ]}
              />
              <Area 
                type="monotone" 
                dataKey={getDataKey()} 
                stroke={getAnalysisColor()} 
                fill={getAnalysisColor()} 
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Analysis Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-medium text-primary mb-2">Vegetation Health Assessment</h4>
              <p className="text-sm text-muted-foreground">
                {analysisType === 'ndvi' ? 
                  `Current NDVI value of ${getCurrentValue()} indicates ${
                    parseFloat(getCurrentValue().toString()) > 0.6 ? 'healthy vegetation with good chlorophyll content' :
                    parseFloat(getCurrentValue().toString()) > 0.3 ? 'moderate vegetation health, monitoring recommended' :
                    'poor vegetation health, immediate attention required'
                  }.` :
                  `Current ${getAnalysisTitle().toLowerCase()} shows ${trend} trend over the monitoring period.`
                }
              </p>
            </div>
            
            {selectedFieldData?.healthStatus !== 'healthy' && (
              <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                <h4 className="font-medium text-warning mb-2">Recommendations</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Investigate irrigation system efficiency</li>
                  <li>• Consider soil nutrient analysis</li>
                  <li>• Monitor for pest or disease indicators</li>
                  <li>• Schedule field inspection within 48 hours</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SatelliteAnalysis;