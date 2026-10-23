"""
make_icon.py
------------
Creates icon.png (512x512): a teal rounded square with a white "BB".
Run it once. It needs the Pillow library:  pip install pillow
"""

from PIL import Image, ImageDraw, ImageFont

SIZE = 512      # icon width and height in pixels
TEXT = "BB"     # the letters shown on the icon

# Start with a transparent square canvas
img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Teal rounded background (same colour as the app header)
draw.rounded_rectangle((0, 0, SIZE, SIZE), radius=110, fill="#00a3ad")

# Bold Arial ships with Windows; 230 is the text height in pixels
font = ImageFont.truetype("arialbd.ttf", 230)

# Measure the text so we can centre it on the square
left, top, right, bottom = draw.textbbox((0, 0), TEXT, font=font)
width, height = right - left, bottom - top
draw.text(((SIZE - width) / 2 - left, (SIZE - height) / 2 - top),
          TEXT, font=font, fill="white")

img.save("icon.png")
print("Saved icon.png")