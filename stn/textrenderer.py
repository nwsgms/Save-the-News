import os
from math import ceil

import Image, ImageFont, ImageDraw

import stn


class SimpleTextProducer(object):

    def __init__(self, text):
        self.parts = list(reversed([p for p in text.strip().split() if p]))
        self.lines = [[]]
        

    def __nonzero__(self):
        return bool(self.parts)


    @property
    def line(self):
        return u" ".join(self.lines[-1])


    def pop(self):
        p = self.parts.pop()
        self.lines[-1].append(p)


    def push(self):
        p = self.lines[-1].pop()
        self.parts.append(p)


    def next(self):
        self.lines.append([])

        

class CantPlaceText(Exception):
    pass


def place_text(text, width, font, vspacing=2, center=True):
    top = 0
    ops = []
    while text:
        tw = 0
        try:
            while tw < width:
                text.pop()
                tw, th = font.getsize(text.line)
        except IndexError:
            pass
        else:
            # undo the last pop, as it pushed us over
            # the edge, but only if we didn't break off due to the
            # end being reached
            text.push()
            
                
        # one word larger than the overall width - we
        # can't render
        if not text.line:
            raise CantPlaceText()
        tw, th = font.getsize(text.line)
        left = 0
        if center:
            left = (width - tw) / 2
        ops.append(((left, top), text.line))
        top += th + vspacing
        text.next()
        
    return top - vspacing, ops


def load_font(name, size):
    fname = os.path.join(
        os.path.dirname(stn.__file__),
        "fonts",
        name
        )
    return ImageFont.truetype(fname, size)

def rounded_rect(draw, width, height, corner_radius, color):
    draw.rectangle(((corner_radius, 0),
                    (width - corner_radius , height + 1)),
                   fill=color)
    draw.rectangle(((0, corner_radius),
                    (width + 1, height - corner_radius , )),
                   fill=color)

    def corner(left, top, start, stop):
        draw.pieslice((left, top, left + corner_radius*2, top +corner_radius*2),
                      start, stop,
                      fill=color)
        
    corner(0, 0, 180, 270)
    corner(width - corner_radius * 2 - 1, 0, 270, 0)
    corner(width - corner_radius * 2 - 1, height - corner_radius * 2 , 0, 90)
    corner(0, height - corner_radius * 2, 90, 180)

def render_text(
    text,
    width,
    fontsize=15,
    vspacing=3,
    center=True,
    padding=10,
    fontname="arial.ttf",
    fontcolor=(255, 255, 255, 255),
    backgroundcolor=(0, 0, 255, 200),
    corner_radius=10):
    text_width = width - padding * 2
    start_size = fontsize
    while True:
        producer = SimpleTextProducer(text)
        font = load_font(fontname, fontsize)
        vs = int(ceil((float(fontsize) / start_size) * vspacing))
        try:
            text_height, ops = place_text(
                producer,
                text_width,
                font,
                vspacing=vs,
                center=center,
                )
            break
        except CantPlaceText:
            fontsize -= 1
            if not fontsize:
                raise CantPlaceText
    height = text_height + padding * 2
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    rounded_rect(draw, width, height, corner_radius, backgroundcolor)
    left = padding
    top = padding
    for (tl, tt), line in ops:
        draw.text((left + tl, top + tt), line, font=font,
                  fill=fontcolor)
    return image

## image = Image.new('RGBA', (100, 100), (0, 0, 0, 0))
## draw = ImageDraw.Draw(image)

## arial = load_font("arial.ttf", 15)



## draw.rectangle(((10, 10), (80, 80)), fill=(255, 255, 0, 100))
## draw.text((10, 25), "world", font=font)

## image.save("/tmp/test.png")
