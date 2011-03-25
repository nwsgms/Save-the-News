import sys
import os
import json

mapping = {
    "Unterhaltung" : "u",
    "Wirtschaft" : "w",
    "Deutschland" : "d",
    "International" : "i",
    "Meistgeklickt" : "m",
    }

res = []
for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    cat, teaser, text = line.split(";")
    try:
        res.append((mapping[cat], teaser))
    except KeyError:
        print line
        raise

sys.stdout.write(json.dumps(res))
