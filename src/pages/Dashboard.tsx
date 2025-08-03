import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { 
  MapPin, 
  Thermometer, 
  Droplets, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { mockFields, getDashboardSummary, generateWeatherData } from "@/services/mockData";

const Dashboard = () => {
  const summary = getDashboardSummary();
  const weatherData = generateWeatherData().slice(-7); // Last 7 days
  
  const fieldHealthData = mockFields.map(field => ({
    name: field.name.split(' ')[0], // First word only
    ndvi: field.ndviValue,
    moisture: field.soilMoisture,
    area: field.area
  }));

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-healthy';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-healthy/10 text-healthy border-healthy/20';
      case 'warning': return 'bg-warning/10 text-warning border-warning/20';
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your agricultural operations
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Last updated</p>
          <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fields</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalFields}</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalArea} hectares total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy Fields</CardTitle>
            <CheckCircle className="h-4 w-4 text-healthy" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-healthy">{summary.healthyFields}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((summary.healthyFields / summary.totalFields) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average NDVI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avgNDVI}</div>
            <Progress value={summary.avgNDVI * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{summary.alertsCount}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Field Health Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Field Health Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fieldHealthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ndvi" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weather Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weather Trends (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weatherData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).getDate().toString()} />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}${name === 'temperature' ? '°C' : '%'}`,
                    name === 'temperature' ? 'Temperature' : 'Humidity'
                  ]}
                />
                <Area type="monotone" dataKey="temperature" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                <Area type="monotone" dataKey="humidity" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Field Status List */}
      <Card>
        <CardHeader>
          <CardTitle>Field Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockFields.map((field) => (
              <div key={field.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <p className="font-medium">{field.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {field.cropType} • {field.area} hectares
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm">NDVI: {field.ndviValue}</p>
                    <p className="text-sm text-muted-foreground">
                      Moisture: {field.soilMoisture}%
                    </p>
                  </div>
                  
                  <Badge className={getHealthBadge(field.healthStatus)}>
                    {field.healthStatus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;