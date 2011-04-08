from __future__ import absolute_import
import time
from datetime import timedelta

from stn.newsaggregator import (
    setup_all,
    create_all,
    metadata,
    session,
    NewsEntry,
    Config,
    fetch_news,
    sample,
    STANDARD_DISTRIBUTION,
    CantSampleEnough,
    )

from .common import fake_news


def setup():
    metadata.bind = "sqlite:///:memory:"
    #metadata.bind.echo = True
    setup_all()
    create_all()


def test_entry_creation():
    NewsEntry(
        id="foo",
        title="title",
        teaser_image = "\x00" * 1000,
        valid=True,
        category="top",
        )
    session.commit()
                      
    entry = NewsEntry.get("foo")
    assert entry.title == "title"


def test_config():
    config = Config.instance()
    lastrun = config.update()
    session.commit()
    time.sleep(1)
    config = Config.instance()
    assert config.lastrun == lastrun


def test_news_fetching():
    Config.PAUSE = timedelta(seconds=-10)
    fetch_news()
    session.commit()
    for entry in NewsEntry.query.all():
        print len(entry.teaser_image)
    


def test_news_sampling():
    fake_news(STANDARD_DISTRIBUTION)
    session.commit()
    res = sample()
    for c, num in STANDARD_DISTRIBUTION.iteritems():
        assert len(res[c]) == num

    try:
        count = NewsEntry.query.count()
        d = dict((c, count) for c, _ in STANDARD_DISTRIBUTION.iteritems())

        sample(d)
    except CantSampleEnough:
        pass
    else:
        assert Fail, "Shouldn't be able to sample this"
