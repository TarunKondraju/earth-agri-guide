# utils.py
# Utility helpers (export / download placeholders)

import ee

def export_to_drive(image, description="pusa_export", folder="EarthEngineImages", scale=10, region=None):
    task = ee.batch.Export.image.toDrive(image=image, description=description, folder=folder, scale=scale, region=region)
    task.start()
    return task
