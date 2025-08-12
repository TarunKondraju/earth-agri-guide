import { useState } from "react";

export default function ModelForm() {
  const [parameter, setParameter] = useState("Cw");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cloudCover, setCloudCover] = useState(10);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please upload an AOI file (.kml, .geojson, or .zip)");

    const form = new FormData();
    form.append("parameter", parameter);
    form.append("start_date", startDate);
    form.append("end_date", endDate);
    form.append("cloud_cover", cloudCover.toString());
    form.append("aoi_file", file);

    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    const res = await fetch(`${API_URL}/run-model`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    setResult(`${data.parameter} Mean: ${data.mean}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <select value={parameter} onChange={e => setParameter(e.target.value)}>
        <option value="Cw">CWC</option>
        <option value="Ccc">CCC</option>
        <option value="Lai">LAI</option>
      </select>
      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
      <input type="number" value={cloudCover} onChange={e => setCloudCover(parseFloat(e.target.value))} />
      <input type="file" accept=".kml,.geojson,.zip" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button type="submit">Run Model</button>

      {result && <div className="mt-4">{result}</div>}
    </form>
  );
}
