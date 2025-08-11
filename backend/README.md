# PUSA eEMS Streamlit Port

This package contains a first-pass conversion of the PUSAeCMS JavaScript Earth Engine app into Earth Engine Python + Streamlit UI.

Run with:

```bash
pip install earthengine-api streamlit streamlit-folium
streamlit run ui_streamlit.py
```


# Models parsing

The models.py file contains a parser that reads the original JS file `/mnt/data/PUSAeCMS_code.txt` and extracts numeric arrays and model constants. Before calling model functions you must run:

```python
import ee
import models
ee.Initialize()
models.init_from_js('/mnt/data/PUSAeCMS_code.txt')
```

This preserves the original numeric arrays verbatim from your source.
