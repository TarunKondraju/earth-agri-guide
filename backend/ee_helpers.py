# ee_helpers.py
# Earth Engine initialization helpers

import ee

def init(ask_auth=False):
    """
    Initialize Earth Engine.
    If running locally and not authenticated, run `earthengine authenticate` in terminal first.
    """
    try:
        ee.Initialize()
    except Exception as e:
        if ask_auth:
            print("Attempting to authenticate to Earth Engine...")
            ee.Authenticate()
            ee.Initialize()
        else:
            raise e

def get_sample_image():
    """
    Return a sample Sentinel-2 image for quick testing (cloud mask not applied).
    """
    return ee.ImageCollection("COPERNICUS/S2_SR") \
             .filterDate('2020-01-01', '2020-12-31') \
             .filterBounds(ee.Geometry.Point(81.8463, 25.4358)) \
             .sort('CLOUD_COVER') \
             .first()
