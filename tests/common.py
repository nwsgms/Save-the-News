from stn.newsaggregator import NewsEntry


def fake_news(distribution):
    for category, number in distribution.iteritems():
        for i in xrange(number):
            NewsEntry(
                id=category + str(i),
                category=category,
                title="Title: %s %i" % (category, i),
                teaser_image="\0" * 1000,
                valid=True,
                )
