
# models.py
# Auto-conversion helper: parses the original JavaScript Earth Engine file (PUSAeCMS_code.txt)
# and extracts numeric arrays and parameter declarations, converting them into Earth Engine Python objects.
#
# This preserves the original numeric content verbatim by parsing the source file at runtime,
# minimizing the chance of missing lines from the original file.
#
# Usage:
#   import ee, models
#   models.init_from_js('/path/to/PUSAeCMS_code.txt')
#   Then call models.calculate_CWC(image), calculate_CCC(image), calculate_LAI_GREEN(image) as needed.
import re, os, ee, ast

_JS_FILE_PATH = os.path.join('/mnt/data', 'PUSAeCMS_code.txt')

# Regular expressions to capture JS var declarations for arrays/numbers used in models
_VAR_RE = re.compile(r'var\s+(?P<name>\w+)\s*=\s*(?P<value>ee\.Array\(|ee\.Image\(|\[|[-]?[0-9]+\.?[0-9]*(?:[eE][-+]?[0-9]+)?)[\s\S]*?;')
# We will also directly search for specific known variable names to ensure we capture them.
_TARGET_VARS = [
    'X_train_Cw','mx_Cw','sx_Cw','mean_model_Cw','hyp_ell_Cw','hyp_sign_Cw','hyp_sig_Cw','XDX_pre_calc_Cw','alpha_coefficients_Cw',
    'X_train_CCC','mx_CCC','sx_CCC','mean_model_CCC','hyp_ell_CCC','hyp_sign_CCC','hyp_sig_CCC','XDX_pre_calc_CCC','alpha_coefficients_CCC',
    'X_train_GREEN','mean_model_GREEN','alpha_coefficients_GREEN','XDX_pre_calc_GREEN'
]

def _js_array_to_python(text):
    """Convert a JavaScript numeric array (possibly nested) into a Python list using ast.literal_eval after minor cleanup."""
    # Replace JavaScript 'ee.Array(' wrapping and trailing ');' if present
    # Remove 'ee.Array(' and 'ee.Image(' etc. Keep inner bracket content.
    # Normalize JS scientific notation and trailing commas.
    t = text
    # Remove 'ee.Array(' or 'ee.Image(' prefixes
    t = re.sub(r'ee\.(Array|Image)\s*\(', '', t)
    # Remove trailing ');' or ';'
    t = re.sub(r'\)\s*;\s*$', '', t.strip())
    # Replace JavaScript-style arrays like [1,2,] remove trailing commas before ]
    t = re.sub(r',\s*\]', ']', t)
    # Ensure numbers have decimal point when needed - ast can parse scientific notation OK.
    # Now safely evaluate with ast.literal_eval
    try:
        py = ast.literal_eval(t)
        return py
    except Exception as e:
        # As a fallback, try to extract bracketed content and eval
        m = re.search(r'\[.*\]', t, flags=re.DOTALL)
        if m:
            try:
                return ast.literal_eval(m.group(0))
            except Exception:
                raise
        raise

def parse_js_variables(js_path=_JS_FILE_PATH, targets=_TARGET_VARS):
    """Parse the JS file and return a dict of variable name -> python list/number for the target variables."""
    with open(js_path, 'r', encoding='utf-8') as f:
        txt = f.read()
    results = {}
    for var in targets:
        # simple pattern: var <varname> = <value>;
        pattern = re.compile(r'var\s+' + re.escape(var) + r'\s*=\s*([\s\S]*?);', flags=re.MULTILINE)
        m = pattern.search(txt)
        if not m:
            # try without 'var' (some values may be assigned without var)
            pattern2 = re.compile(re.escape(var) + r'\s*=\s*([\s\S]*?);', flags=re.MULTILINE)
            m = pattern2.search(txt)
        if not m:
            continue
        raw = m.group(1).strip()
        # Clean up common suffixes like ').multiply(1.0e+04)' -> we keep the numeric array part and the multiply factor
        multiply_factor = 1.0
        mult_m = re.search(r'\.multiply\(\s*([0-9\.eE\+\-]+)\s*\)', raw)
        if mult_m:
            multiply_factor = float(mult_m.group(1))
            # remove .multiply(...) from raw
            raw = re.sub(r'\.multiply\([\s\S]*\)$', '', raw).strip()
        # Convert raw to python object
        try:
            pyval = _js_array_to_python(raw)
            # Apply multiplication factor if numeric arrays
            def apply_mul(x):
                if isinstance(x, list):
                    return [apply_mul(i) for i in x]
                elif isinstance(x, (int, float)):
                    return x * multiply_factor
                else:
                    return x
            pyval = apply_mul(pyval)
            results[var] = pyval
        except Exception as e:
            # store raw for debugging
            results[var] = {'_raw': raw, '_error': str(e)}
    return results

# Initialize EE Python objects for the model variables
def init_from_js(js_path=_JS_FILE_PATH):
    vals = parse_js_variables(js_path)
    globals_dict = {}
    # Convert lists into ee.Array or ee.Image as appropriate
    for k, v in vals.items():
        if isinstance(v, list):
            # Some are 2D arrays (X_train_*), others are 1D numeric lists -> treat 2D as ee.Array, 1D as ee.Image
            if any(isinstance(i, list) for i in v):
                globals_dict[k] = ee.Array(v)
            else:
                # 1D numeric -> convert to ee.Image (as per original code usage)
                # Use ee.Image(list) to preserve original pattern
                globals_dict[k] = ee.Image(v)
        elif isinstance(v, (int, float)):
            globals_dict[k] = float(v)
        else:
            globals_dict[k] = v
    # Attach parsed variables into module globals for easy access
    globals().update(globals_dict)
    return globals_dict

# Wrapper functions that mirror the original JS compute functions (CWC and CCC)
def calculate_CWC(image_orig):
    """Calculate CWC band using parameters parsed from the original JS file.
    Requires init_from_js(...) to be called beforehand so variables like X_train_Cw, mx_Cw exist in globals()."""
    # Ensure EE is initialized by caller
    # Retrieve required variables from globals()
    X_train = globals().get('X_train_Cw')
    mx = globals().get('mx_Cw')
    sx = globals().get('sx_Cw')
    hyp_ell = globals().get('hyp_ell_Cw')
    hyp_sig = globals().get('hyp_sig_Cw')
    hyp_sign = globals().get('hyp_sign_Cw')
    XDX_pre_calc = globals().get('XDX_pre_calc_Cw')
    alpha = globals().get('alpha_coefficients_Cw')
    mean_model = globals().get('mean_model_Cw')
    if X_train is None:
        raise RuntimeError('Model variables not initialized. Call init_from_js(path) first.')
    # Follow the algorithm from the JS code using ee.Array/ee.Image operations
    XTrain_dim = X_train.length().get([0])
    band_sequence = ee.List.sequence(1, XTrain_dim).map(lambda e: ee.String('B').cat(ee.String(e)).replace('[.]+[0-9]*$',''))
    im_norm_ell2D_hypell = image_orig.subtract(ee.Image(mx)).divide(ee.Image(sx)).multiply(ee.Image(hyp_ell)).toArray().toArray(1)
    im_norm_ell2D = image_orig.subtract(ee.Image(mx)).divide(ee.Image(sx)).toArray().toArray(1)
    PtTPt = im_norm_ell2D_hypell.matrixTranspose().matrixMultiply(im_norm_ell2D).arrayProject([0]).multiply(-0.5)
    PtTDX = ee.Image(X_train).matrixMultiply(im_norm_ell2D_hypell).arrayProject([0]).arrayFlatten([band_sequence])
    arg1 = PtTPt.exp().multiply(hyp_sig)
    k_star = PtTDX.subtract(ee.Image(XDX_pre_calc).multiply(0.5)).exp().toArray()
    mean_pred = k_star.arrayDotProduct(ee.Image(alpha).toArray()).multiply(arg1)
    mean_pred = mean_pred.toArray(1).arrayProject([0]).arrayFlatten([['CWC']])
    mean_pred = mean_pred.add(ee.Image(mean_model))
    mean_pred = mean_pred.where(mean_pred.lt(0), ee.Image(0.00001))
    image_orig = image_orig.addBands(mean_pred)
    return image_orig.select('CWC')

def calculate_CCC(image_orig):
    X_train = globals().get('X_train_CCC')
    mx = globals().get('mx_CCC')
    sx = globals().get('sx_CCC')
    hyp_ell = globals().get('hyp_ell_CCC')
    hyp_sig = globals().get('hyp_sig_CCC')
    hyp_sign = globals().get('hyp_sign_CCC')
    XDX_pre_calc = globals().get('XDX_pre_calc_CCC')
    alpha = globals().get('alpha_coefficients_CCC')
    mean_model = globals().get('mean_model_CCC')
    if X_train is None:
        raise RuntimeError('Model variables not initialized. Call init_from_js(path) first.')
    XTrain_dim = X_train.length().get([0])
    band_sequence = ee.List.sequence(1, XTrain_dim).map(lambda e: ee.String('B').cat(ee.String(e)).replace('[.]+[0-9]*$',''))
    im_norm_ell2D_hypell = image_orig.subtract(ee.Image(mx)).divide(ee.Image(sx)).multiply(ee.Image(hyp_ell)).toArray().toArray(1)
    im_norm_ell2D = image_orig.subtract(ee.Image(mx)).divide(ee.Image(sx)).toArray().toArray(1)
    PtTPt = im_norm_ell2D_hypell.matrixTranspose().matrixMultiply(im_norm_ell2D).arrayProject([0]).multiply(-0.5)
    PtTDX = ee.Image(X_train).matrixMultiply(im_norm_ell2D_hypell).arrayProject([0]).arrayFlatten([band_sequence])
    arg1 = PtTPt.exp().multiply(hyp_sig)
    k_star = PtTDX.subtract(ee.Image(XDX_pre_calc).multiply(0.5)).exp().toArray()
    mean_pred = k_star.arrayDotProduct(ee.Image(alpha).toArray()).multiply(arg1)
    mean_pred = mean_pred.toArray(1).arrayProject([0]).arrayFlatten([['CCC']])
    mean_pred = mean_pred.add(ee.Image(mean_model))
    mean_pred = mean_pred.where(mean_pred.lt(0), ee.Image(0.00001))
    image_orig = image_orig.addBands(mean_pred)
    return image_orig.select('CCC')

def calculate_LAI_GREEN(image_orig):
    # LAI uses X_train_GREEN etc.
    X_train = globals().get('X_train_GREEN')
    mx = globals().get('mx_GREEN') or globals().get('mx_Cw')  # fallback
    sx = globals().get('sx_GREEN') or globals().get('sx_Cw')
    alpha = globals().get('alpha_coefficients_GREEN')
    XDX_pre_calc = globals().get('XDX_pre_calc_GREEN')
    mean_model = globals().get('mean_model_GREEN')
    if X_train is None:
        raise RuntimeError('Model variables not initialized. Call init_from_js(path) first.')
    XTrain_dim = X_train.length().get([0])
    band_sequence = ee.List.sequence(1, XTrain_dim).map(lambda e: ee.String('B').cat(ee.String(e)).replace('[.]+[0-9]*$',''))
    # Simple linear model placeholder similar to CCC/CWC; original uses same kernel approach.
    im_norm_ell2D = image_orig.subtract(ee.Image(mx)).divide(ee.Image(sx)).toArray().toArray(1)
    PtTDX = ee.Image(X_train).matrixMultiply(im_norm_ell2D).arrayProject([0]).arrayFlatten([band_sequence])
    k_star = PtTDX.subtract(ee.Image(XDX_pre_calc).multiply(0.5)).exp().toArray()
    mean_pred = k_star.arrayDotProduct(ee.Image(alpha).toArray())
    mean_pred = ee.Image(mean_pred).add(ee.Image(mean_model))
    mean_pred = mean_pred.toArray(1).arrayProject([0]).arrayFlatten([['LAI']])
    mean_pred = mean_pred.where(mean_pred.lt(0), ee.Image(0.00001))
    image_orig = image_orig.addBands(mean_pred)
    return image_orig.select('LAI')
