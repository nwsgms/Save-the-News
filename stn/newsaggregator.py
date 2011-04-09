from __future__ import absolute_import
import os
import sys
import urllib2
import logging
import random
from cStringIO import StringIO
from ConfigParser import ConfigParser

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
from sqlalchemy.sql import and_


from .textrenderer import ImageFormatter

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


    def image4format(self, format):
        image = Image.query.filter_by(
            format=format,
            entry=self).first()
        if image is None:
            img = ImageFormatter(format).render_image(self.title)
            data = StringIO()
            img.save(data, "PNG")
            image = Image(
                data=data.getvalue(),
                entry=self,
                format=format,
                )
        return image.data
        

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


def configure_db(dburi):
    metadata.bind = dburi
    #metadata.bind.echo = True    
    setup_all()
    create_all()


def dburi_from_ini(filename, section="app:main", key="dburi"):
    cp = ConfigParser(dict(here=os.path.dirname(filename)))
    cp.read([filename])
    return cp.get(section, key)


def newsmuncher():
    logging.basicConfig(
        level=logging.DEBUG
        )
    logger.info("starting newsmuncher")
    dbfile = os.path.normpath(os.path.abspath(os.path.expanduser(sys.argv[1])))
    if dbfile.endswith(".ini"):
        dburi = dburi_from_ini(dbfile)
    else:
        dburi = "sqlite:///%s" % dbfile
    logger.debug("dburi: %s", dburi)
    configure_db(dburi)
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



STANDARD_DISTRIBUTION = dict(
    top=2,
    international=1,
    germany=1,
    economy=1,
    entertainment=1,
    )

assert set(STANDARD_DISTRIBUTION.keys()) == set(c for c, _ in CATEGORIES)


class CantSampleEnough(Exception):
    pass


def sample(distribution=None, max_age=timedelta(hours=2)):
    if distribution is None:
        distribution = STANDARD_DISTRIBUTION
    res = {}
    date_limit = datetime.now() - max_age
    for category, _ in CATEGORIES:
        entries = NewsEntry.query.filter(
            and_(
                NewsEntry.category==category,
                NewsEntry.valid==True,
                NewsEntry.created >= date_limit,
                )).all()
        if len(entries) < distribution[category]:
            raise CantSampleEnough()
        res[category] = random.sample(entries, distribution[category])
    return res

            
            
