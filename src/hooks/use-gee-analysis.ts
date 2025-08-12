import { useState } from "react";

export type SensorOption = "sentinel-2" | "sentinel-1" | "modis" | "landsat-8" | "landsat-9";
export type AnalysisKind = "indices" | "biophysical";

export interface RunModelPayload {
  parameter: "Cw" | "Ccc" | "Lai"; // backend expects these
  start_date: string; // yyyy-mm-dd
  end_date: string;   // yyyy-mm-dd
  cloud_cover: number; // 0-100
  aoi_file: File; // KML | GeoJSON | ZIP(SHP)
}

export interface RunModelResult {
  parameter: string;
  mean: number;
}

export function useGEEAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunModelResult | null>(null);

  const runModel = async (payload: RunModelPayload) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append("parameter", payload.parameter);
      form.append("start_date", payload.start_date);
      form.append("end_date", payload.end_date);
      form.append("cloud_cover", String(payload.cloud_cover));
      form.append("aoi_file", payload.aoi_file);

      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${API_URL}/run-model`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`Request failed ${res.status}`);
      const data = (await res.json()) as RunModelResult;
      setResult(data);
      return data;
    } catch (e: any) {
      setError(e?.message || "Unknown error");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, result, runModel };
}
