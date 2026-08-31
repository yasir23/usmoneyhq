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
    {
        "id": "house-150k",
        "title": "How much house can you afford on $150k?",
        "script": "One hundred and fifty thousand a year. That is top ten percent of American incomes. How much house does it buy? Twenty eight percent of gross income is forty two hundred a month. At six and a half percent with twenty percent down, that is roughly a five hundred and fifty thousand dollar home. Different state, different property taxes, different result. The home affordability calculator at US Money HQ does your exact math for any state, free.",
    },
    {
        "id": "emergency-fund",
        "title": "The 3-6 month emergency fund rule",
        "script": "Experts say keep three to six months of expenses in an emergency fund. What does that actually mean? If your monthly bills are four thousand dollars, three months is twelve thousand. Six months is twenty four thousand. That money sits in a high yield savings account, earning five percent, ready for layoffs and car repairs. The emergency fund calculator at US Money HQ tells you your exact target in seconds.",
    },
    {
        "id": "rent-vs-buy",
        "title": "Rent vs buy: the honest math",
        "script": "Rent for ten years or buy? The honest answer depends on one number: how long you stay. Buy, and the first five years mostly pay interest. Rent, and you never build equity. In most US cities, the break even is around five to seven years. Stay longer, buying wins. Move sooner, renting wins. The rent versus buy calculator at US Money HQ compares both scenarios with real numbers for your city.",
    },
    {
        "id": "closing-costs",
        "title": "The hidden 3% you forgot",
        "script": "You saved the down payment. Did you save the closing costs? Buying a four hundred thousand dollar home, closing costs typically run two to five percent, eight to twenty thousand dollars. Appraisal, title insurance, loan origination, escrow. First time buyers forget this every time. The closing cost calculator at US Money HQ estimates your exact closing costs before you make an offer.",
    },
    {
        "id": "car-affordability",
        "title": "The 20/4/10 car rule",
        "script": "Here is the car buying rule financial advisors love: twenty percent down, finance for no more than four years, and keep total car costs under ten percent of your gross income. On a sixty thousand dollar salary, that is six thousand a year, about five hundred a month. The car affordability calculator at US Money HQ shows what you can really afford, payments and insurance included.",
    },
    {
        "id": "retirement",
        "title": "The 25x retirement rule",
        "script": "Here is the simplest retirement math: multiply your annual spending by twenty five. That is your target nest egg. Spend sixty thousand a year? One point five million. The idea: withdraw four percent a year, adjust for inflation, and the money lasts thirty years. The retirement calculator at US Money HQ checks whether your savings rate gets you there by your target age.",
    },
    {
        "id": "child-support",
        "title": "How child support is calculated",
        "script": "Child support formulas vary wildly by state. Many states use income shares: both parents incomes, combined, then split by custody time. Others use a flat percentage of the non custodial parent's income. A sixty thousand dollar salary can mean anywhere from five hundred to eleven hundred dollars a month depending on where you live. The child support calculator at US Money HQ shows state by state estimates.",
    },
    {
        "id": "heloc",
        "title": "HELOC: the cheap money trap",
        "script": "A home equity line of credit feels like cheap money, because the rate is low. But it is your house on the line. The draw period is often interest only, ten years. Then the repayment period hits, and your payment can double. Only borrow for improvements that raise home value. The HELOC calculator at US Money HQ shows the true payment schedule.",
    },
    {
        "id": "overtime",
        "title": "Time and a half, explained",
        "script": "Hourly workers: time and a half kicks in after forty hours. Twenty dollars an hour becomes thirty. Forty five hour week? Five hours at time and a half adds one hundred and fifty dollars. The overtime calculator at US Money HQ computes your paycheck with overtime in seconds, including double time states.",
    },
    {
        "id": "529",
        "title": "College costs: start a 529 now",
        "script": "A four year public college now runs about one hundred thousand dollars, all in. Private, two hundred and fifty thousand or more. Start at birth with two hundred and fifty dollars a month at six percent, and you have about fifty eight thousand by eighteen. Tax free growth and state deductions make the 529 plan the best college vehicle. The 529 calculator at US Money HQ shows your exact projection.",
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
