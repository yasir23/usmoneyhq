#!/usr/bin/env python3
"""gen_shorts.py — YouTube Shorts pipeline for US Money HQ.
Generates 1080x1920 branded Shorts: title card (PIL) + macOS TTS voiceover
(say) + ffmpeg mux. Output: ~/usmoneyhq-shorts/*.mp4 + titles.txt (upload metadata).
Re-run any time; topics are the top-traffic calculator searches.
"""
import os
import subprocess
import sys
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.expanduser("~/usmoneyhq-shorts")
os.makedirs(OUT, exist_ok=True)

NAVY = (15, 23, 42, 255)
GREEN = (16, 185, 129, 255)
WHITE = (255, 255, 255, 255)
GRAY = (203, 213, 225, 255)

TOPICS = [
    {
        "id": "mortgage-300k",
        "title": "What does a $300,000 mortgage really cost?",
        "script": "A $300,000 mortgage at six and a half percent for thirty years costs about one thousand, eight hundred and ninety six dollars a month. Before property taxes and insurance. Over the life of the loan, you will pay more than four hundred thousand dollars in interest alone. Pay an extra one hundred dollars a month and you could save over forty thousand and pay it off five years early. The mortgage calculator at US Money HQ shows the full schedule. Free, in your browser, right now.",
    },
    {
        "id": "salary-75k",
        "title": "$75,000 salary: how much do you keep?",
        "script": "Seventy five thousand dollars a year sounds great. But what actually lands in your bank account? In California, federal tax, state tax, and FICA take about twenty five thousand. You keep roughly fifty thousand, about four thousand a month. In Texas, with no state income tax, you keep more. The salary after tax calculator at US Money HQ does the math for all fifty states. Type in your salary and see exactly what you keep.",
    },
    {
        "id": "house-100k",
        "title": "Can you afford a house on $100k?",
        "script": "You earn one hundred thousand dollars a year. How much house can you afford? Lenders say keep housing under twenty eight percent of gross income. That is about two thousand three hundred a month. At six and a half percent with twenty percent down, that buys roughly a three hundred and seventy thousand dollar home. No other debt, no surprises. The home affordability calculator at US Money HQ shows the full math for any income.",
    },
    {
        "id": "401k-match",
        "title": "The 401k match is free money",
        "script": "Your employer matches fifty percent of contributions up to six percent of your salary. Skip it, and you are turning down free money. On a seventy five thousand dollar salary, the full match is worth two thousand two hundred and fifty dollars a year. Invested for thirty years at seven percent, that grows past two hundred thousand. Contribute at least enough to get the full match. The 401k calculator at US Money HQ shows exactly what your match becomes.",
    },
    {
        "id": "debt-snowball",
        "title": "Three debts, one plan: the snowball",
        "script": "Credit card, car loan, student loan. Three debts, one plan. The snowball method: pay minimums on everything, then throw every extra dollar at the smallest balance first. When it is gone, roll that payment into the next smallest. You finish accounts fast, and the wins keep you motivated. The debt snowball calculator at US Money HQ gives you your exact debt free date. Try it for free.",
    },
    {
        "id": "bmi",
        "title": "BMI 25.1 — what does it mean?",
        "script": "Your body mass index is twenty five point one. Overweight, right? Not so fast. BMI is a population scale, not a verdict. It divides weight by height squared, and ignores muscle entirely. A fit athlete can land in the overweight range. The real picture: pair BMI with body fat percentage, measured with a tape. The BMI and body fat calculators at US Money HQ do both, in seconds, for free.",
    },
    {
        "id": "water",
        "title": "How much water do you actually need?",
        "script": "Eight glasses a day is the rule everyone knows. The math behind it: drink about half your body weight in pounds, as ounces of water. One hundred and eighty pounds? Ninety ounces a day. More if you sweat. Less is a headache and brain fog. The water intake calculator at US Money HQ does the exact math for your weight in seconds. Free, no sign up.",
    },
    {
        "id": "sleep",
        "title": "Wake at 7? Here's when to sleep.",
        "script": "You need to be up at seven AM. When should you go to bed? Sleep runs in ninety minute cycles. Waking at the end of a cycle feels great. Waking mid cycle feels terrible. Work backwards: seven AM minus five cycles is ten PM. The sleep calculator at US Money HQ finds your best bedtimes for any wake up time. Go to bed right, wake up right.",
    },
    {
        "id": "compound",
        "title": "The rule of 72, explained",
        "script": "Want to know how long it takes your money to double? Divide seventy two by your interest rate. At six percent, twelve years. At eight percent, nine years. At ten percent, about seven years. That is the rule of seventy two, and it works for any growth rate. The rule of seventy two calculator at US Money HQ does the math instantly. And shows you the compound growth behind it.",
    },
    {
        "id": "sales-tax",
        "title": "Texas vs California sales tax",
        "script": "Buying a fifty dollar item in California, and the same item in Texas. California's average combined sales tax is about eight point eight percent, so you pay about four dollars and forty cents. Texas averages eight point two percent, about four dollars and ten cents. Small difference once. Huge over a year of shopping. The sales tax calculator at US Money HQ works for every state. Free, instant, accurate.",
    },
]


def font(size):
    for p in ["/System/Library/Fonts/Helvetica.ttc", "/Library/Fonts/Arial.ttf"]:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            continue
    return ImageFont.load_default()


def wrap(draw, text, fnt, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if draw.textlength(test, font=fnt) <= max_w:
            cur = test
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def title_card(topic):
    W, H = 1080, 1920
    img = Image.new("RGBA", (W, H), NAVY)
    d = ImageDraw.Draw(img)
    # green accent bar
    d.rectangle([0, H - 90, W, H], fill=GREEN)
    # brand top
    d.text((60, 70), "US MONEY HQ", font=font(46), fill=GREEN)
    d.text((60, 140), "free financial calculators", font=font(34), fill=GRAY)
    # title
    t = wrap(d, topic["title"].upper(), font(88), W - 120)
    y = 560
    for line in t:
        d.text((60, y), line, font=font(88), fill=WHITE)
        y += 115
    # CTA
    d.text((60, H - 220), "TRY THE CALCULATOR", font=font(52), fill=WHITE)
    d.text((60, H - 150), "usmoneyhq.com", font=font(56), fill=GREEN)
    p = os.path.join(OUT, topic["id"] + ".png")
    img.save(p)
    return p


def tts_mp3(topic):
    aiff = os.path.join(OUT, topic["id"] + ".aiff")
    mp3 = os.path.join(OUT, topic["id"] + ".mp3")
    subprocess.run(["say", "-v", "Ava", "-r", "180", "-o", aiff, topic["script"]], check=True, timeout=120)
    subprocess.run(["ffmpeg", "-y", "-i", aiff, "-codec:a", "libmp3lame", "-qscale:a", "4", mp3],
                   check=True, capture_output=True, timeout=120)
    return mp3


def render(topic, img, mp3):
    out = os.path.join(OUT, topic["id"] + ".mp4")
    subprocess.run(
        ["ffmpeg", "-y", "-loop", "1", "-i", img, "-i", mp3,
         "-c:v", "libx264", "-tune", "stillimage", "-c:a", "aac", "-b:a", "128k",
         "-pix_fmt", "yuv420p", "-vf", "scale=1080:1920", "-shortest", out],
        check=True, capture_output=True, timeout=300)
    return out


def main():
    only = sys.argv[1] if len(sys.argv) > 1 else None
    titles = []
    for t in TOPICS:
        if only and only not in t["id"]:
            continue
        img = title_card(t)
        mp3 = tts_mp3(t)
        out = render(t, img, mp3)
        size = os.path.getsize(out) // (1024 * 1024)
        titles.append(f"{t['title']} | #shorts #finance #money | {out}")
        print(f"OK {t['id']}: {size}MB")
    with open(os.path.join(OUT, "titles.txt"), "w") as f:
        f.write("\n".join(titles))
    print(f"DONE — {len(titles)} shorts in {OUT}")


if __name__ == "__main__":
    main()
