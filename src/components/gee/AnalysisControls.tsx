import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Play, PauseCircle } from "lucide-react";

export type ParameterKey = "Cw" | "Ccc" | "Lai";

export interface AnalysisControlsValues {
  parameter: ParameterKey;
  start_date: string;
  end_date: string;
  cloud_cover: number;
}

interface AnalysisControlsProps {
  onRun: (values: AnalysisControlsValues, aoiFile: File) => void;
  loading?: boolean;
  aoiFile?: File | null;
  onAoiUpload?: (file: File) => void;
}

export const AnalysisControls: React.FC<AnalysisControlsProps> = ({ onRun, loading, aoiFile, onAoiUpload }) => {
  const [sensor, setSensor] = useState("sentinel-2");
  const [analysisType, setAnalysisType] = useState("biophysical");
  const [parameter, setParameter] = useState<ParameterKey>("Cw");
  const [startDate, setStartDate] = useState<string>(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0,10));
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [cloudCover, setCloudCover] = useState<number>(10);
  const [autoRun, setAutoRun] = useState(true);

  const canRun = useMemo(() => !!aoiFile && !!startDate && !!endDate && sensor === "sentinel-2", [aoiFile, startDate, endDate, sensor]);

  useEffect(() => {
    if (autoRun && canRun && aoiFile) {
      onRun({ parameter, start_date: startDate, end_date: endDate, cloud_cover: cloudCover }, aoiFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parameter, startDate, endDate, cloudCover, sensor, analysisType, aoiFile, autoRun]);

  return (
    <Card className="h-full">
      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="text-lg font-semibold">GEE Analysis</h3>
          <p className="text-sm text-muted-foreground">Define inputs and run analysis</p>
        </div>

        {/* Sensor */}
        <div className="space-y-2">
          <Label>Sensor</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button variant={sensor === "sentinel-2" ? "default" : "outline"} onClick={() => setSensor("sentinel-2")}>Sentinel-2</Button>
            <Button variant="outline" disabled>Sentinel-1 <Badge variant="secondary" className="ml-2">Coming soon</Badge></Button>
            <Button variant="outline" disabled>MODIS <Badge variant="secondary" className="ml-2">Coming soon</Badge></Button>
            <Button variant="outline" disabled>LANDSAT 8/9 <Badge variant="secondary" className="ml-2">Coming soon</Badge></Button>
          </div>
        </div>

        {/* Analysis */}
        <div className="space-y-2">
          <Label>Analysis</Label>
          <Select value={analysisType} onValueChange={setAnalysisType}>
            <SelectTrigger>
              <SelectValue placeholder="Select analysis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="indices">Indices</SelectItem>
              <SelectItem value="biophysical">Biophysical variables</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Parameter mapping to backend */}
        <div className="space-y-2">
          <Label>Parameter</Label>
          <Select value={parameter} onValueChange={(v) => setParameter(v as ParameterKey)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cw">CWC</SelectItem>
              <SelectItem value="Ccc">CCC</SelectItem>
              <SelectItem value="Lai">LAI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Start date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>End date</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        {/* Cloud cover */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Max cloud cover</Label>
            <span className="text-sm text-muted-foreground">{cloudCover}%</span>
          </div>
          <Slider value={[cloudCover]} max={100} step={1} onValueChange={(v) => setCloudCover(v[0])} />
        </div>

        {/* AOI status & Upload */}
        <div className="space-y-2">
          <Label>Area of Interest</Label>
          <div className="flex items-center gap-2 text-sm">
            <Upload className="h-4 w-4" />
            <span className="text-muted-foreground">Upload .kml, .geojson or .zip (shapefile)</span>
          </div>
          <Input 
            type="file" 
            accept=".kml,.geojson,.zip"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              if (f && onAoiUpload) onAoiUpload(f);
            }}
          />
          <div className="text-xs text-muted-foreground">
            {aoiFile ? `Selected: ${aoiFile.name}` : "No AOI selected yet (draw on map or upload)"}
          </div>
        </div>

        {/* Auto run toggle */}
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div className="font-medium">Auto run</div>
            <div className="text-muted-foreground">Run when inputs change</div>
          </div>
          <Button variant={autoRun ? "default" : "outline"} size="sm" onClick={() => setAutoRun((s) => !s)}>
            {autoRun ? <><Play className="h-4 w-4 mr-2" /> On</> : <><PauseCircle className="h-4 w-4 mr-2" /> Off</>}
          </Button>
        </div>

        <Button 
          className="w-full"
          disabled={!canRun || loading}
          onClick={() => aoiFile && onRun({ parameter, start_date: startDate, end_date: endDate, cloud_cover: cloudCover }, aoiFile)}
        >
          <Play className="h-4 w-4 mr-2" /> Run analysis
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnalysisControls;
