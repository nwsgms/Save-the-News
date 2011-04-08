import os
import sys
import urllib2
import logging

import feedparser
from BeautifulSoup import BeautifulSoup

from abl.util import Bunch

from datetime import datetime, timedelta

from elixir import (
    Entity,
    setup_all,
    create_all,
    session,
    Field,
    Unicode,
    DateTime,
    metadata,
    LargeBinary,
    Boolean,
    Enum,
    OneToMany,
    ManyToOne,
    )


logger = logging.getLogger(__name__)

CATEGORIES = (
    ("top", "http://news.google.de/news?pz=1&cf=all&ned=de&hl=de&topic=po&output=rss"),
    ("international", "http://news.google.de/news?pz=1&cf=all&ned=de&hl=de&topic=w&output=rss"),
    ("germany", "http://news.google.de/news?pz=1&cf=all&ned=de&hl=de&topic=n&output=rss"),
    ("economy", "http://news.google.de/news?pz=1&cf=all&ned=de&hl=de&topic=b&output=rss"),
    ("entertainment", "http://news.google.de/news?pz=1&cf=all&ned=de&hl=de&topic=e&output=rss"),
    )

class NewsEntry(Entity):

    id = Field(Unicode, primary_key=True)
    title = Field(Unicode, required=True)
    created = Field(DateTime, required=True, default=datetime.now)
    teaser_image = Field(LargeBinary)
    valid = Field(Boolean, required=True)
    category = Field(Unicode, required=True) #Enum(list(c for c, _ in CATEGORIES) + [None]), required=True)

    images = OneToMany("Image")


    @classmethod
    def from_feed_entry(cls, feed_entry):
        teaser_image = feed_entry.image
        if teaser_image is not None:
            res = urllib2.urlopen(teaser_image)
            teaser_image = res.read()
            
        return cls(
            id=feed_entry.id,
            title=feed_entry.title,
            teaser_image=teaser_image,
            valid=teaser_image is not None,
            category=feed_entry.category,
            )


class Image(Entity):

    format = Field(Unicode, required=True)
    data = Field(LargeBinary, required=True)

    entry = ManyToOne("NewsEntry")
    
    
class Config(Entity):

    PAUSE = timedelta(minutes=30)
    
    lastrun = Field(DateTime, required=True)


    @classmethod
    def instance(cls):
        config = cls.get(1)
        if config is None:
            config = cls(id=1, lastrun=datetime.now() - cls.PAUSE * 2)
        return config


    def update(self):
        self.lastrun = datetime.now()
        return self.lastrun

    @property
    def can_run(self):
        return self.next_run <= datetime.now()


    @property
    def next_run(self):
        return self.lastrun + self.PAUSE
    
    
def process_entry(category, entry):
    soup = BeautifulSoup(entry.summary)
    try:
        image = soup.findAll("img")[0]["src"]
    except KeyError:
        image=None
    title = entry.title.rsplit("-", 1)[0].rstrip()
    return Bunch(
        image=image,
        id=entry.id,
        title=title,
        category=category,
        )


def fetch_news():
    count = 0
    for category, feed_url in CATEGORIES:
        p = feedparser.parse(feed_url)
        for entry in p.entries:
            entry = process_entry(category, entry)
            if NewsEntry.get(entry.id) is None:
                NewsEntry.from_feed_entry(entry)
                count += 1
    return count



def newsmuncher():
    logging.basicConfig(
        level=logging.DEBUG
        )
    logger.info("starting newsmuncher")
    dbfile = os.path.normpath(os.path.expanduser(sys.argv[1]))
    dburi = "sqlite:///%s" % dbfile
    logger.debug("dburi: %s", dburi)
    metadata.bind = dburi
    #metadata.bind.echo = True    
    setup_all()
    create_all()
    logger.debug("Existing entries so far:")
    for category, _ in CATEGORIES:
        logger.debug(
            "%s: %i",
            category,
            NewsEntry.query.filter_by(
                category=category,
                ).count()
            )

    config = Config.instance()
    if not config.can_run:
        logger.info("Next run possible in %s", config.next_run.isoformat())
        return
    count = fetch_news()
    logger.info("Added %i news.", count)
    config.update()
    session.commit()
