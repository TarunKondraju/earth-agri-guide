import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AnalysisParameters } from "@/components/UserInputPanel";
import type { Geometry } from "geojson";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Satellite, 
  Map, 
  BarChart3, 
  Download,
  Share,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { AnalysisControls } from "@/components/gee/AnalysisControls";
import MapLeaflet from "@/components/gee/MapLeaflet";
import { useGEEAnalysis } from "@/hooks/use-gee-analysis";
const GEEAnalysis = () => {
  const [analysisParams, setAnalysisParams] = useState<AnalysisParameters | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [aoiFile, setAoiFile] = useState<File | null>(null);
  const [aoiGeometry, setAoiGeometry] = useState<Geometry | null>(null);
  const { loading: geeLoading, result: geeResult, runModel } = useGEEAnalysis();

  const handleAnalysisStart = async (params: AnalysisParameters) => {
    setAnalysisParams(params);
    setIsLoading(true);
    setAnalysisStatus('processing');

    try {
      // Simulate API call to Google Earth Engine
      console.log('Starting GEE analysis with parameters:', params);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock results
      const mockResults = {
        avgNDVI: 0.72,
        soilMoisture: 45,
        healthStatus: 'healthy',
        temperature: 28.5,
        precipitation: 125.3,
        analysisDate: new Date().toISOString(),
        imageCount: 15,
        cloudCoverage: 12,
        recommendations: [
          'Vegetation health is optimal for this time of year',
          'Soil moisture levels are adequate',
          'Consider monitoring for potential drought stress in the coming weeks'
        ]
      };

      setAnalysisResults(mockResults);
      setAnalysisStatus('completed');
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (analysisStatus) {
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Satellite className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (analysisStatus) {
      case 'processing':
        return 'Processing satellite data...';
      case 'completed':
        return 'Analysis completed successfully';
      case 'error':
        return 'Analysis failed - please try again';
      default:
        return 'Ready to start analysis';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earth Engine Analysis</h1>
          <p className="text-muted-foreground">
            Google Earth Engine powered agricultural analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm">{getStatusText()}</span>
        </div>
      </div>

      {/* Status Bar */}
      {analysisParams && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  Region: {analysisParams.region.name}
                </Badge>
                <Badge variant="outline">
                  Period: {analysisParams.dateRange.start.toLocaleDateString()} - {analysisParams.dateRange.end.toLocaleDateString()}
                </Badge>
                <Badge variant="outline">
                  Analysis: {analysisParams.analysisType.join(', ')}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel - User Inputs */}
        <div className="lg:col-span-1 overflow-y-auto">
          <Card className="h-full">
            <CardContent className="p-6">
              <AnalysisControls
                aoiFile={aoiFile}
                onAoiUpload={(file) => setAoiFile(file)}
                loading={geeLoading}
                onRun={(values, file) => {
                  runModel({
                    parameter: values.parameter,
                    start_date: values.start_date,
                    end_date: values.end_date,
                    cloud_cover: values.cloud_cover,
                    aoi_file: file,
                  });
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Map and Results */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="map" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Map View
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Charts
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2">
                <Satellite className="h-4 w-4" />
                Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="h-[calc(100%-60px)]">
              <Card className="h-full">
                <CardContent className="p-0 h-full">
                  <MapLeaflet
                    aoi={aoiGeometry as any}
                    onAOIChange={(geom, file) => {
                      setAoiGeometry(geom as any);
                      if (file) setAoiFile(file);
                    }}
                    resultSummary={geeResult ? { parameter: geeResult.parameter, mean: geeResult.mean } : null}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="charts" className="h-[calc(100%-60px)]">
              <Card className="h-full">
                <CardContent className="p-6 h-full flex items-center justify-center">
                  {analysisResults ? (
                    <div className="text-center space-y-4">
                      <h3 className="text-lg font-semibold">Analysis Charts</h3>
                      <p className="text-muted-foreground">
                        Time series charts and statistical analysis will be displayed here
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium">NDVI Trend</h4>
                          <div className="h-32 bg-green-100 rounded mt-2 flex items-center justify-center">
                            <span className="text-sm text-muted-foreground">Chart placeholder</span>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium">Moisture Levels</h4>
                          <div className="h-32 bg-blue-100 rounded mt-2 flex items-center justify-center">
                            <span className="text-sm text-muted-foreground">Chart placeholder</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Run an analysis to view charts</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="h-[calc(100%-60px)]">
              <Card className="h-full">
                <CardContent className="p-6 overflow-y-auto">
                  {analysisResults ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Analysis Summary</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium text-sm text-muted-foreground">Average NDVI</h4>
                            <p className="text-2xl font-bold text-green-600">{analysisResults.avgNDVI}</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium text-sm text-muted-foreground">Soil Moisture</h4>
                            <p className="text-2xl font-bold text-blue-600">{analysisResults.soilMoisture}%</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium text-sm text-muted-foreground">Temperature</h4>
                            <p className="text-2xl font-bold text-orange-600">{analysisResults.temperature}°C</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium text-sm text-muted-foreground">Images Used</h4>
                            <p className="text-2xl font-bold">{analysisResults.imageCount}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                        <div className="space-y-2">
                          {analysisResults.recommendations.map((rec: string, index: number) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Technical Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Analysis Date:</span>
                            <span>{new Date(analysisResults.analysisDate).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Cloud Coverage:</span>
                            <span>{analysisResults.cloudCoverage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Processing Time:</span>
                            <span>3.2 seconds</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                      <div>
                        <Satellite className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Run an analysis to view detailed results</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default GEEAnalysis;