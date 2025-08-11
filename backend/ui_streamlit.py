# ui_streamlit.py
# Streamlit app that mimics the original EE JS UI for selecting indices and running calculations.
import streamlit as st
import ee
from ee_helpers import init, get_sample_image
import indices as idx

st.set_page_config(page_title="PUSA eEMS - Streamlit Port", layout="wide")

st.title("PUSA eEMS — Streamlit port of Earth Engine JS UI")
st.markdown("This app initializes Earth Engine and exposes several spectral indices translated from the original JS code.")

# Initialize EE
try:
    init(ask_auth=False)
    st.success("Initialized Earth Engine")
except Exception as e:
    st.error(f"Could not initialize Earth Engine: {e}. If running locally, authenticate by running `earthengine authenticate`.")

# Sidebar controls (mimic many of the ui.Textbox placeholders)
st.sidebar.header("Parameters (placeholders from original UI)")
c = st.sidebar.text_input("c (default:1.0)", value="1.0")
g = st.sidebar.text_input("g (default:2.5)", value="2.5")
p = st.sidebar.text_input("p (default:2.0)", value="2.0")
k = st.sidebar.text_input("k (default:0.0)", value="0.0")
PAR = st.sidebar.text_input("PAR (default:1.0)", value="1.0")

st.sidebar.markdown("Other numeric placeholders...")
alpha = st.sidebar.text_input("alpha (default:0.1)", value="0.1")
beta = st.sidebar.text_input("beta (default:0.05)", value="0.05")
gamma = st.sidebar.text_input("gamma (default:1.0)", value="1.0")

# Index selection (subset)
index_options = {
    'NDBI': idx.NDBI,
    'NDSoil': idx.NDSoil,
    'PISI': idx.PISI,
    'VIBI': idx.VIBI,
    'OCVI': idx.OCVI,
    'OSAVI': idx.OSAVI,
    'PSRI': idx.PSRI,
    'NormG': idx.NormG,
}

selected_index = st.selectbox("Choose index", list(index_options.keys()))

st.sidebar.header("Map / Image selection")
use_sample = st.sidebar.checkbox("Use sample Sentinel-2 image", value=True)

if use_sample:
    image = get_sample_image()
    st.sidebar.write("Using a sample S2 image (2020, low cloud)")
else:
    st.sidebar.text("Custom image filters not implemented in this scaffold.")

if st.button("Run index on sample image"):
    func = index_options[selected_index]
    result = func(image)
    # Create a small map preview using folium
    import folium
    from streamlit_folium import st_folium
    centroid = image.geometry().centroid().getInfo()['coordinates'][::-1]  # lat, lon
    m = folium.Map(location=centroid, zoom_start=8)
    viz_params = {'min': 0, 'max': 1, 'palette': ['blue','white','green']}
    try:
        vis = result.getMapId(viz_params)
        folium.TileLayer(
            tiles=vis['tile_fetcher'].url_format,
            attr='Google Earth Engine',
            name='Result',
            overlay=True,
            control=True
        ).add_to(m)
        st_folium(m, width=700, height=500)
    except Exception as e:
        st.error(f"Could not render preview: {e} — you can still export the result to your Earth Engine assets or download a PNG via server-side export.")
