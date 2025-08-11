from fastapi import FastAPI, UploadFile, Form, File
from fastapi.middleware.cors import CORSMiddleware
import ee, models
import geopandas as gpd
import tempfile

app = FastAPI()

# Allow requests from your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # in production, set your frontend domain here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Earth Engine
ee.Initialize(project="iari-big-data-project")

# Load your PUSAeCMS model file
models.init_from_js("/path/to/PUSAeCMS_code.txt")  # adjust path

@app.post("/run-model")
async def run_model(
    parameter: str = Form(...),
    start_date: str = Form(...),
    end_date: str = Form(...),
    cloud_cover: float = Form(...),
    aoi_file: UploadFile = File(...),
):
    # Save KML temporarily
    tmp = tempfile.NamedTemporaryFile(delete=False)
    tmp.write(await aoi_file.read())
    tmp.flush()

    # Convert to Earth Engine geometry
    gdf = gpd.read_file(tmp.name)
    aoi = ee.Geometry.Polygon(gdf.geometry[0].__geo_interface__["coordinates"])

    # Filter Sentinel-2
    coll = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(aoi)
        .filterDate(start_date, end_date)
        .filter(ee.Filter.lte("CLOUDY_PIXEL_PERCENTAGE", cloud_cover))
        .median()
    )

    # Select model
    if parameter == "Cw":
        img = models.calculate_CWC(coll)
    elif parameter == "Ccc":
        img = models.calculate_CCC(coll)
    else:
        img = models.calculate_LAI_GREEN(coll)

    stats = img.reduceRegion(
        ee.Reducer.mean(), geometry=aoi, scale=10, maxPixels=1e13
    ).getInfo()

    return {
        "parameter": parameter,
        "mean": stats.get(img.bandNames().getInfo()[0])
    }
