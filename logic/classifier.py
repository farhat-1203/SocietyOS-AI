from sentence_transformers import SentenceTransformer, util
from categories import CATEGORY_DESCRIPTIONS
import difflib
import csv
import os


# Load embedder once
embedder = SentenceTransformer("all-MiniLM-L6-v2")

category_names = list(CATEGORY_DESCRIPTIONS.keys())
category_embeddings = embedder.encode(list(CATEGORY_DESCRIPTIONS.values()), convert_to_tensor=True)


CATEGORY_KEYWORD_OVERRIDES = {
    "electrical": ["smoke", "electrical room", "wiring", "shock", "spark", "short circuit", "mcb", "fuse box"],
    "plumbing": ["pipe", "leak", "leakage", "water pipe", "tap", "drainage", "burst"],
    "security": ["theft", "stolen", "stranger", "cctv", "watchman", "intruder"],
    "lift": ["lift", "elevator"],
}


HIGH_PRIORITY = [
    "fire", "smoke", "burning", "spark", "sparks", "sparking",
    "gas leak", "gas smell", "lpg",
    "electric shock", "shock",
    "flood", "flooding", "water entering", "ceiling collapse",
    "short circuit", "short-circuit",
    "danger", "emergency", "urgent", "help",
    "stuck inside", "trapped", "fell", "injured", "injury", "blood",
]


HALLUCINATION_BLOCKLIST = {
    "thank you.", "thank you", "thanks for watching",
    "thank you for watching", "bye.", "okay.", "you",
    "i don't even know.", "wait, i don't even know.",
    "will but do.", "let's continue.",
}


def is_hallucination(text, cutoff=0.85):
    """Return True if text is in or very close to the hallucination blocklist.

    Uses difflib to allow small misspellings to be matched against the blocklist.
    """
    if not text:
        return True
    t = text.strip().lower()
    # exact match fast path
    if t in HALLUCINATION_BLOCKLIST:
        return True

    # allow approximate matches for common short hallucinations
    matches = difflib.get_close_matches(t, HALLUCINATION_BLOCKLIST, n=1, cutoff=cutoff)
    return len(matches) > 0


def detect_priority(text):
    text = text.lower()
    for word in HIGH_PRIORITY:
        if word in text:
            return "HIGH"
    return "NORMAL"


def classify(text):
    """Return (category, confidence).

    First checks keyword overrides, then falls back to embedding similarity.
    """
    text_lower = text.lower()
    for category, keywords in CATEGORY_KEYWORD_OVERRIDES.items():
        for kw in keywords:
            if kw in text_lower:
                return category, 1.0

    emb = embedder.encode(text, convert_to_tensor=True)
    sims = util.cos_sim(emb, category_embeddings)[0]
    idx = sims.argmax().item()
    return category_names[idx], round(sims[idx].item(), 3)


ASSIGNEE_MAP = {
    "plumbing": "Plumber",
    "electrical": "Electrician",
    "security": "Security Manager",
    "parking": "Parking Attendant",
    "cleanliness": "Housekeeping Staff",
    "lift": "Maintenance Team",
    "noise": "Security/Management",
    "common_area": "Facilities Team",
}


def assign_responsible(category, text=None):
    """Return an assignee (role) for the given category.

    `text` can be used later to refine assignment (e.g., building/flat-specific rules).
    """
    return ASSIGNEE_MAP.get(category, "Admin")


def load_examples_from_csv(file_path):
    """Load past complaints from CSV to support future augmentation.

    Returns list of dict rows. This function is defensive — if the file doesn't
    exist or is malformed it returns an empty list.
    """
    if not file_path or not os.path.isfile(file_path):
        return []
    rows = []
    try:
        with open(file_path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for r in reader:
                rows.append(r)
    except Exception:
        return []
    return rows