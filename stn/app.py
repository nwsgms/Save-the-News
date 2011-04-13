from __future__ import absolute_import
import os
import random
from math import ceil

from bottle import (
    route,
    run,
    static_file,
    redirect,
    request,
    response,
    post,
    )

import time

from .util import transactional

from .newsaggregator import (
    sample,
    NewsEntry,
    )

SLOW_LOADING = False

@route('/')
def index():
    agent = request.header.get("User-Agent", "")
    if "iPhone" in agent:
        redirect("/static/iphone3.html")
    redirect("/static/game.html")

@route('/static/:filename#.+#')
def root(filename):
    base = os.path.join(os.path.dirname(__file__), "static")
    if SLOW_LOADING and filename.endswith(".png"):
        time.sleep(1)
    return static_file(filename, root=base)


@route("/sample")
@transactional
def web_sample():
    entries = sample()
    news = [
        dict(
            id=entry.id,
            headline=entry.title,
            category=entry.category,
            )
        for _, news in entries.iteritems() for entry in news
        ]
    random.shuffle(news)
    return dict(
        news=news
        )

    


@route("/textblock/:device/:stage/:id")
@transactional
def textblock(device, stage, id):
    format = "%s_%s" % (device, stage)
    entry = NewsEntry.get(id)
    if stage == "Ordering":
        image = entry.teaser_image
    else:
        image = entry.image4format(format)
    response.headers["Content-type"] = "image/png"
    return image


@post("/score")
def score():
    ids = request.forms.getall("news[]")
    entries = [NewsEntry.get(id_) for id_ in ids]
    categories = [entry.category for entry in entries]
    full = 75.0 # no fly, no images so far
    score = .0
    
    if categories[0] == "top":
        score += 15.0
    for category, match in zip(
        categories[1:],
        ["international", "germany", "economy", "entertainment"],
        ):
        if category == match:
            score += 10.0
    

    return dict(score=int(ceil(score)))
