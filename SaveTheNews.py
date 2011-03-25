import os
from bottle import route, run, static_file, redirect


@route('/')
def index():
    redirect("/html/game.html")

@route('/html/:filename#.+#')
def root(filename):
    base = os.path.join(os.path.dirname(__file__), "html")
    return static_file(filename, root=base)


run(host='localhost', port=8080)
