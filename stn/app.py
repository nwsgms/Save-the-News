from __future__ import absolute_import
import os
import random

from bottle import route, run, static_file, redirect, request, response
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
    image = entry.image4format(format)
    response.headers["Content-type"] = "image/png"
    return image

