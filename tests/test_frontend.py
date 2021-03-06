import random
from collections import defaultdict
from pprint import pprint
from unittest import TestCase
from cStringIO import StringIO

from webtest import TestApp

from simplejson import loads
import Image

from stn import app_factory, transactional

from stn.newsaggregator import (
    STANDARD_DISTRIBUTION,
    NewsEntry,
    )

from .common import fake_news

class FrontendTests(TestCase):


    @transactional
    def setUp(self):
        app = app_factory(
            { "debug" : "true" },
            dburi="sqlite:///:memory:"
            )
        fake_news(STANDARD_DISTRIBUTION)
        self.app = TestApp(app)


    def test_sampling(self):
        res = self.app.get("/sample")
        json = loads(res.body)
        news = json["news"]
        d = defaultdict(list)
        for n in news:
            d[n["category"]].append(n)

        for c, num in STANDARD_DISTRIBUTION.iteritems():
            assert c in d, "not in result: " + c
            assert len(d[c]) == num


    def test_textblock_fetching(self):
        entry = NewsEntry.query.filter_by(valid=True).first()

        device = "iPhone3"
        for stage in "Ordering", "Selecting", "Sorting":
            res = self.app.get("/textblock/%s/%s/%s" %
                               (device,
                                stage,
                                entry.id,
                                ))
            assert res.content_type == "image/png"
            image = Image.open(StringIO(res.body))
            image.load()
            assert image.size
            

