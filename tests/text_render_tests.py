from stn.textrenderer import (
    render_text,
    place_text,
    load_font,
    SimpleTextProducer,
    CantPlaceText,
    ImageFormatter,
    UnknownFormatException,
    )


def test_text_placement():
    font = load_font("arial.ttf", 15)
    width = 200
    testtext = "A test text that spans more than one line of text."

    text_producer = SimpleTextProducer(testtext)

    height, ops = place_text(text_producer, width, font)
    assert height == 36
    assert len(ops) == 2

    testtext = "Onegiantwordthatwillbewiderthanthewholeimage"
    text_producer = SimpleTextProducer(testtext)
    try:
        place_text(text_producer, width, font)
    except CantPlaceText:
        pass
    else:
        assert False, "I shouldn't be able to place the above word!"



def test_text_rendering():
    width = 200
    testtext = "A test text that spans more than one line of text."
    image = render_text(testtext, width)
    image.save("/tmp/test.png")
    testtext = "A" * width
    try:
        image = render_text(testtext, width)
    except CantPlaceText:
        pass
    else:
        assert False, "That shouldn't be placeable"
    

def test_format_rendering():
    for sc in ImageFormatter.__subclasses__():
        name = sc.__name__
        image = ImageFormatter(name).render_image("test text")
        assert image.size[0] == sc.WIDTH

    try:
        ImageFormatter("foobarabaz")
    except UnknownFormatException:
        pass
    else:
        assert False, "Should have raised UnknownFormatException"
