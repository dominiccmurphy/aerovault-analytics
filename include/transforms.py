import math

def convert_float(x):
    if x is None or isinstance(x, bool):
        return None
    try:
        val = float(x)
        return val if math.isfinite(val) else None
    except (ValueError, TypeError):
        return None