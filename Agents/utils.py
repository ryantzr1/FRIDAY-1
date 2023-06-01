def sum_dict(d1, d2):
    for key in d1:
        if key in d2:
            d1[key] += d2[key]
        else:
            d1[key] = d2[key]
    return d1