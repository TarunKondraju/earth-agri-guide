# indices.py
# Vegetation / spectral indices translated from the original JS implementation to Earth Engine Python API.
import ee

def NDBI(image):
    ndbi = image.expression('(S1 - N) / (S1 + N)', {
        'N': image.select('B8'),
        'S1': image.select('B11')
    })
    return ndbi.rename('NDBI').float().copyProperties(image, ["system:time_start", "satelite", "sensor", "tile"])

def NDSoil(image):
    ndsoil = image.expression('(S2 - G)/(S2 + G)', {
        'G': image.select('B3'),
        'S2': image.select('B12')
    })
    return ndsoil.rename('NDSoil').float().copyProperties(image, ["system:time_start", "satelite", "sensor", "tile"])

def NHFD(image):
    nhfd = image.expression('(RE1 - A) / (RE1 + A)', {
        'A': image.select('B1'),
        'RE1': image.select('B5')
    })
    return nhfd.rename('NDFD').float().copyProperties(image, ["system:time_start", "satelite", "sensor", "tile"])

def NSDS(image):
    nsds = image.expression('(S1 - S2)/(S1 + S2)', {
        'S1': image.select('B11'),
        'S2': image.select('B12')
    })
    return nsds.rename('NSDS').float().copyProperties(image, ["system:time_start", "satelite", "sensor", "tile"])

def PISI(image):
    pisi = image.expression('0.8192 * B - 0.5735 * N + 0.0750', {
        'B': image.select('B2'),
        'N': image.select('B8')
    })
    return pisi.rename('PISI').float().copyProperties(image, ["system:time_start", "satelite", "sensor", "tile"])

def UI(image):
    u1 = image.expression('(S2 - N)/(S2 + N)', {
        'N': image.select('B8'),
        'S1': image.select('B11')
    })
    return u1.rename('UI').float().copyProperties(image, ["system:time_start", "satelite", "sensor", "tile"])

def VIBI(image):
    vibi = image.expression('((N-R)/(N+R))/(((N-R)/(N+R)) + ((S1-N)/(S1+N)))', {
        'R': image.select('B4'),
        'N': image.select('B8'),
        'S1': image.select('B11')
    })
    return vibi.rename('VIBI').float().copyProperties(image, ["system:time_start", "satelite", "sensor", "tile"])

def VGNIRBI(image):
    vgnirbi = image.expression('(G - N)/(G + N)', {
        'G': image.select('B3'),
        'N': image.select('B8')
    })
    return vgnirbi.rename('VGNIRBI').float().copyProperties(image, ["system:time_start", "satelite", "sensor", "tile"])

def VRNIRBI(image):
    vrnirbi = image.expression('(R - N)/(R + N)', {
        'R': image.select('B4'),
        'N': image.select('B8')
    })
    return vrnirbi.rename('VRNIRBI').float().copyProperties(image, ["system:time_start", "satelite", "sensor", "tile"])

# Additional indices translated later in the file (examples)
def NRFIr(image):
    nrfir = image.expression('(R - S2) / (R + S2)', {
        'R': image.select('B4'),
        'S2': image.select('B12')
    })
    return nrfir.rename('NRFIr').float().copyProperties(image, ["system:time_start", "satelite", "sensor", "tile"])

def NormG(image):
    normg = image.expression('G/(N + G + R)', {
        'G': image.select('B3'),
        'R': image.select('B4'),
        'N': image.select('B8')
    })
    return normg.rename('NormG').float().copyProperties(image, ["system:time_start", "satelite", "sensor", "tile"])

def NormNIR(image):
    normnir = image.expression('N/(N + G + R)', {
        'G': image.select('B3'),
        'R': image.select('B4'),
        'N': image.select('B8')
    })
    return normnir.rename('NormNIR').float().copyProperties(image, ["system:time_start", "satelite", "sensor", "tile"])

def NormR(image):
    normr = image.expression('R/(N + G + R)', {
        'G': image.select('B3'),
        'R': image.select('B4'),
        'N': image.select('B8')
    })
    return normr.rename('NormR').float().copyProperties(image, ["system:time_start", "satelite", "sensor", "tile"])

def OCVI(image, cexp=1.16):
    ocvi = image.expression('(N / G) * (R / G) ** cexp', {
        'G': image.select('B3'),
        'R': image.select('B4'),
        'N': image.select('B8'),
        'cexp': cexp
    })
    return ocvi.rename('OCVI').float().copyProperties(image, ["system:time_start", "satelite", "sensor", "tile"])

def OSAVI(image):
    osavi = image.expression('(N - R) / (N + R + 0.16)', {
        'R': image.select('B4'),
        'N': image.select('B8')
    })
    return osavi.rename('OSAVI').float().copyProperties(image, ["system:time_start", "satelite", "sensor", "tile"])

def PSRI(image):
    psri = image.expression('(R - B)/RE2', {
        'B': image.select('B2'),
        'R': image.select('B4'),
        'RE2': image.select('B6')
    })
    return psri.rename('PSRI').float().copyProperties(image, ["system:time_start", "satelite", "sensor", "tile"])
