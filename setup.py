import os
import sys
from setuptools import setup, find_packages

setup(
    name="SaveTheNews",
    version="0.1",
    author="Diez B. Roggisch",
    author_email="deets@web.de",
    license="MIT",
    packages=find_packages(exclude=['ez_setup', 'tests']),
    package_data = {'': ['*.html', '*.txt', '*.rst', '*.tpl']},
    zip_safe=False,
    include_package_data=True,
    install_requires=[
        "abl.util",
        "bottle",
        "Genshi",
        "PasteDeploy",
        "PasteScript",
        "WSGIUtils",
        "ToscaWidgets",
        "BeautifulSoup",
        "feedparser",
        ],
    classifiers = [
        'Development Status :: 3 - Alpha',
        'Environment :: Web Environment',
        'Topic :: Software Development :: Libraries :: Python Modules',
        'Topic :: Software Development :: Widget Sets',
        'Intended Audience :: Developers',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
    ],
    entry_points={
        'paste.app_factory': [
            'main=stn.app:app_factory',
            ]
        },
)
