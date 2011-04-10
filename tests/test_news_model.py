# -*- coding: utf-8 -*-
from __future__ import absolute_import
import time
from datetime import timedelta
from BeautifulSoup import BeautifulSoup

from abl.util import Bunch

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
    process_entry,
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
        abstract="abstract",
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


def test_news_processing():
    text = '''<table border="0" cellpadding="2" cellspacing="7" style="vertical-align: top;">
 <tr>
  <td align="center" valign="top" width="80">
   <font style="font-size: 85%; font-family: arial,sans-serif;">
    <a href="http://news.google.com/news/url?sa=t&amp;fd=R&amp;usg=AFQjCNEPtBk3lizjCpeeX8wNoU251ImD3Q&amp;url=http://www.wochenblatt.de/nachrichten/welt/Guttenberg-Anwalt-erhebt-Vorwuerfe-gegen-Uni-Bayreuth;art29,42621">
     <img alt="" border="1" height="80" src="http://nt1.ggpht.com/news/tbn/UfKn65vKaSQEdM/0.jpg" width="54" />
     <br />
     <font size="-2">
      Wochenblatt.de
     </font>
    </a>
   </font>
  </td>
  <td class="j" valign="top">
   <font style="font-size: 85%; font-family: arial,sans-serif;">
    <br />
    <div style="padding-top: 0.8em;">
     <img alt="" height="1" width="1" />
    </div>
    <div class="lh">
     <a href="http://news.google.com/news/url?sa=t&amp;fd=R&amp;usg=AFQjCNGnMZ-X2pBWpiFDvNKlKFi6fCS9_Q&amp;url=http://www.welt.de/newsticker/dpa_nt/infoline_nt/brennpunkte_nt/article13128485/Heftiger-Streit-zwischen-Guttenberg-und-Uni-Bayreuth.html">
      <b>
       Heftiger Streit zwischen Guttenberg und Uni Bayreuth
      </b>
     </a>
     <br />
     <font size="-1">
      <b>
       <font color="#6f6f6f">
        WELT ONLINE
       </font>
      </b>
     </font>
     <br />
     <font size="-1">
      Bayreuth (dpa) - Zwischen Ex-Verteidigungsminister Karl-Theodor zu Guttenberg und seiner ehemaligen Universität ist ein heftig Streit über den Untersuchungsbericht zu seiner Doktorarbeit entbrannt. Der Anwalt des früheren CSU-Politikers griff die
      <b>
       ...
      </b>
     </font>
     <br />
     <font size="-1">
      <a href="http://news.google.com/news/url?sa=t&amp;fd=R&amp;usg=AFQjCNEQUVdv7cRuxsg7xOKJQZQEULDFeg&amp;url=http://www.zeit.de/politik/deutschland/2011-04/guttenberg-anwalt-universitaet-bayreuth">
       Guttenbergs Anwalt greift Uni Bayreuth an
      </a>
      <font color="#6f6f6f" size="-1">
       ZEIT ONLINE
      </font>
     </font>
     <br />
     <font size="-1">
      <a href="http://news.google.com/news/url?sa=t&amp;fd=R&amp;usg=AFQjCNFufVYfkVAmsKK4hhmHDWEDAnENqQ&amp;url=http://www.bild.de/politik/inland/karl-theodor-zu-guttenberg/anwalt-greift-uni-bayreuth-an-17346442.bto.html">
       „Haltlose Vorwürfe“, „Vorverurteilung“, „unangemessen“ Guttenbergs Anwalt
       <b>
        ...
       </b>
      </a>
      <font color="#6f6f6f" size="-1">
       BILD
      </font>
     </font>
     <br />
     <font size="-1">
      <a href="http://news.google.com/news/url?sa=t&amp;fd=R&amp;usg=AFQjCNEmZS1F3EKCpXvnfOKL5MszHFYsgQ&amp;url=http://www.welt.de/print/wams/politik/article13127733/Guttenberg-laesst-seine-Anwaelte-sprechen.html">
       Guttenberg lässt seine Anwälte sprechen
      </a>
      <font color="#6f6f6f" size="-1">
       WELT ONLINE
      </font>
     </font>
     <br />
     <font class="p" size="-1">
      <a href="http://news.google.com/news/url?sa=t&amp;fd=R&amp;usg=AFQjCNFi1VLHcyP6ZpastuL85qNPFX4EFA&amp;url=http://www.bild.de/regional/muenchen/muenchen-regional/uni-bayreuth-will-kommissionsbericht-veroeffentlichen-17345572.bild.html">
       BILD
      </a>
      &nbsp;-
      <a href="http://news.google.com/news/url?sa=t&amp;fd=R&amp;usg=AFQjCNFAdzwm1slVKRK7Ph2RIBLWRl8jiQ&amp;url=http://www.sueddeutsche.de/karriere/plagiatsaffaere-guttenberg-und-die-moral-von-der-geschicht-1.1083303">
       sueddeutsche.de
      </a>
      &nbsp;-
      <a href="http://news.google.com/news/url?sa=t&amp;fd=R&amp;usg=AFQjCNE0W8oyhQyGZxMm3fF7kF5St-THpw&amp;url=http://www.sueddeutsche.de/karriere/strafanzeigen-gegen-guttenberg-mit-glueck-kommt-er-aus-der-sache-raus-1.1083324">
       sueddeutsche.de
      </a>
      &nbsp;-
      <a href="http://news.google.com/news/url?sa=t&amp;fd=R&amp;usg=AFQjCNErJx7LKane-6KV_cjejcDcR4Gc3w&amp;url=http://www.dw-world.de/dw/function/0,,83389_cid_14978254,00.html">
       Deutsche Welle
      </a>
     </font>
     <br />
     <font class="p" size="-1">
      <a class="p" href="http://news.google.de/news/story?pz=1&amp;cf=all&amp;ned=de&amp;ncl=dRJZ85HWrMdl8gMHrVF2jZrBuJrZM">
       <b>
        Alle 840 Artikel&nbsp;&raquo;
       </b>
      </a>
     </font>
    </div>
   </font>
  </td>
 </tr>
</table>'''
    res = process_entry(
        "foo", Bunch(
            summary_detail=Bunch(
            value=text
            ),
            title="The title - Forget this",
            id="the_id",
        )
        )
    assert res.image
    
