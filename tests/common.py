import Image
from cStringIO import StringIO

from stn.newsaggregator import NewsEntry


def fake_news(distribution):
    img = Image.new("RGBA", (100, 100))
    outf = StringIO()
    img.save(outf, "PNG")
    teaser_image = outf.getvalue()
    for category, number in distribution.iteritems():
        for i in xrange(number):
            NewsEntry(
                id=category + str(i),
                category=category,
                title=u"Title: %s %i" % (category, i),
                teaser_image=teaser_image,
                valid=True,
                abstract=u"abstract %i" % i
                )
