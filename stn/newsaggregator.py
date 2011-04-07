import feedparser
from BeautifulSoup import BeautifulSoup

from abl.util import Bunch


def process_entry(entry):
    soup = BeautifulSoup(entry.summary)
    image = soup.findAll("img")[0]["src"]
    title = entry.title.rsplit("-", 1)[0].rstrip()
    return Bunch(
        image=image,
        id=entry.id,
        title=title,
        )

    

if __name__ == "__main__":

    p = feedparser.parse("http://news.google.de/news?pz=1&cf=all&ned=de&hl=de&topic=po&output=atom")
    for entry in p.entries[:1]:
        print entry.id
        print process_entry(entry)
