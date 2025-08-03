// Mock data service for testing the agriculture DSS frontend

export interface FieldData {
  id: string;
  name: string;
  coordinates: [number, number][];
  area: number; // in hectares
  cropType: string;
  lastAnalysis: string;
  ndviValue: number;
  soilMoisture: number;
  healthStatus: 'healthy' | 'warning' | 'critical';
}

export interface WeatherData {
  date: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  soilTemperature: number;
}

export interface SatelliteAnalysis {
  date: string;
  ndvi: number;
  evi: number;
  soilMoisture: number;
  temperature: number;
}

export interface CropPrediction {
  date: string;
  predictedYield: number;
  confidence: number;
  factors: string[];
}

// Mock Fields Data
export const mockFields: FieldData[] = [
  {
    id: "field-001",
    name: "North Wheat Field",
    coordinates: [
      [-122.4194, 37.7749],
      [-122.4094, 37.7749],
      [-122.4094, 37.7849],
      [-122.4194, 37.7849]
    ],
    area: 25.5,
    cropType: "Wheat",
    lastAnalysis: "2024-01-15",
    ndviValue: 0.75,
    soilMoisture: 65,
    healthStatus: 'healthy'
  },
  {
    id: "field-002",
    name: "South Corn Field",
    coordinates: [
      [-122.4294, 37.7649],
      [-122.4194, 37.7649],
      [-122.4194, 37.7749],
      [-122.4294, 37.7749]
    ],
    area: 18.3,
    cropType: "Corn",
    lastAnalysis: "2024-01-14",
    ndviValue: 0.62,
    soilMoisture: 45,
    healthStatus: 'warning'
  },
  {
    id: "field-003",
    name: "East Soybean Field",
    coordinates: [
      [-122.4094, 37.7649],
      [-122.3994, 37.7649],
      [-122.3994, 37.7749],
      [-122.4094, 37.7749]
    ],
    area: 32.1,
    cropType: "Soybean",
    lastAnalysis: "2024-01-13",
    ndviValue: 0.45,
    soilMoisture: 35,
    healthStatus: 'critical'
  }
];

// Generate mock weather data for the last 30 days
export const generateWeatherData = (): WeatherData[] => {
  const data: WeatherData[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      temperature: 15 + Math.random() * 20 + Math.sin(i * 0.2) * 5,
      humidity: 40 + Math.random() * 40,
      rainfall: Math.random() > 0.7 ? Math.random() * 15 : 0,
      windSpeed: 5 + Math.random() * 10,
      soilTemperature: 12 + Math.random() * 15 + Math.sin(i * 0.2) * 3
    });
  }
  
  return data;
};

// Generate mock satellite analysis data
export const generateSatelliteData = (fieldId: string): SatelliteAnalysis[] => {
  const data: SatelliteAnalysis[] = [];
  const today = new Date();
  
  const baseNDVI = fieldId === "field-001" ? 0.75 : fieldId === "field-002" ? 0.62 : 0.45;
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    
    const seasonalVariation = Math.sin((i / 12) * 2 * Math.PI) * 0.2;
    
    data.push({
      date: date.toISOString().split('T')[0],
      ndvi: Math.max(0.1, Math.min(0.9, baseNDVI + seasonalVariation + (Math.random() - 0.5) * 0.1)),
      evi: Math.max(0.1, Math.min(0.9, (baseNDVI + seasonalVariation) * 0.8 + (Math.random() - 0.5) * 0.05)),
      soilMoisture: 30 + Math.random() * 50 + seasonalVariation * 20,
      temperature: 20 + Math.random() * 15 + seasonalVariation * 10
    });
  }
  
  return data;
};

// Generate crop predictions
export const generateCropPredictions = (fieldId: string): CropPrediction[] => {
  const data: CropPrediction[] = [];
  const today = new Date();
  
  const baseYield = fieldId === "field-001" ? 4.2 : fieldId === "field-002" ? 8.5 : 2.8;
  
  for (let i = 0; i < 6; i++) {
    const date = new Date(today);
    date.setMonth(date.getMonth() + i);
    
    const trend = i * 0.05; // Slight upward trend
    const confidence = Math.max(60, 95 - i * 5); // Decreasing confidence over time
    
    data.push({
      date: date.toISOString().split('T')[0],
      predictedYield: baseYield + trend + (Math.random() - 0.5) * 0.3,
      confidence,
      factors: [
        'Weather patterns',
        'Soil conditions',
        'Historical yield data',
        'Satellite imagery analysis'
      ]
    });
  }
  
  return data;
};

// Dashboard summary data
export const getDashboardSummary = () => {
  const totalFields = mockFields.length;
  const totalArea = mockFields.reduce((sum, field) => sum + field.area, 0);
  const healthyFields = mockFields.filter(f => f.healthStatus === 'healthy').length;
  const avgNDVI = mockFields.reduce((sum, field) => sum + field.ndviValue, 0) / totalFields;
  
  return {
    totalFields,
    totalArea: Math.round(totalArea * 10) / 10,
    healthyFields,
    avgNDVI: Math.round(avgNDVI * 100) / 100,
    alertsCount: mockFields.filter(f => f.healthStatus !== 'healthy').length
  };
};