"""
Simple rule-based EYD/PUEBI checker utilities.
These are heuristic implementations to detect and suggest corrections
for capitalization, particles, prepositions, and punctuation.
"""
import re
from typing import List, Dict


def check_capitalization(text: str) -> List[Dict]:
    """Suggest capitalizing sentence starts and words after titles (Pak/Bu), and simple proper nouns heuristics."""
    suggestions = []
    # Capitalize first letter of text and after sentence endings
    def check_match(m):
        word = m.group(1)
        if word and word[0].islower():
            suggested = word[0].upper() + word[1:]
            return (word, suggested)
        return None

    # Check beginning of text
    m = re.match(r"^\s*([a-zżźćńółęąśA-Za-z]+)", text)
    if m:
        res = check_match(m)
        if res:
            suggestions.append({"original": res[0], "suggested": res[1], "rule": "Kapitalisasi awal kalimat"})

    # After . ? ! followed by space and lowercase
    for match in re.finditer(r"(?:[\.\?\!]\s+)([a-zżźćńółęąśA-Za-z]+)", text):
        res = check_match(match)
        if res:
            suggestions.append({"original": res[0], "suggested": res[1], "rule": "Kapitalisasi setelah tanda titik"})

    # After 'Pak' or 'Bu' titles like 'pak joko' -> 'Pak Joko'
    for match in re.finditer(r"\b(pak|bu)\s+([a-zżźćńółęąśA-Za-z]+)", text, flags=re.IGNORECASE):
        title = match.group(1)
        name = match.group(2)
        if name and name[0].islower():
            suggested = name[0].upper() + name[1:]
            suggestions.append({"original": name, "suggested": suggested, "rule": "Kapitalisasi nama setelah sapaan (Pak/Bu)"})

    return suggestions


def check_particles(text: str) -> List[Dict]:
    """Check particles: -nya, -kah, -lah should be attached to preceding word (no space)."""
    suggestions = []
    # find 'nya', 'kah', 'lah' with space before -> suggest attach
    for match in re.finditer(r"\b(\w+)\s+(nya|kah|lah)\b", text, flags=re.IGNORECASE):
        word = match.group(1)
        part = match.group(2)
        original = f"{word} {part}"
        suggested = f"{word}{part}"
        suggestions.append({"original": original, "suggested": suggested, "rule": "Partikel harus melekat pada kata sebelumnya"})

    # find attached particle where it should be separate rarely: 'punya' vs 'pu n' not handled
    return suggestions


def check_prepositions(text: str) -> List[Dict]:
    """Check 'di/ke/dari' prepositions vs prefix. Heuristic: if 'di' is followed by space, it's preposition; if attached and common verb stem follows, keep attached. We'll suggest separation when 'di' is isolated in the middle of a sentence used as preposition incorrectly attached."""
    suggestions = []
    # If we see ' di[A-Z]' (rare) ignore. If we see words like 'didatangi' probably correct as prefix.
    # Suggest separating when pattern word startswith 'di' and the rest is lowercase and whole word length<=4 (like 'di kota' typo 'dikota')
    for match in re.finditer(r"\b(d[iI][a-zżźćńółęąśA-Za-z]{1,10})\b", text):
        word = match.group(1)
        # if it looks like 'dikota' (di + kota) and the rest is a common short place-like token, suggest separation
        rest = word[2:]
        if rest and rest[0].islower() and len(rest) <= 8:
            # suggest separation
            suggested = f"di {rest}"
            suggestions.append({"original": word, "suggested": suggested, "rule": "Preposisi 'di/ke/dari' harus dipisah jika berfungsi sebagai preposisi"})

    # also check 'ke' and 'dari' attached
    for match in re.finditer(r"\b(ke[a-z]{1,8})\b", text, flags=re.IGNORECASE):
        w = match.group(1)
        rest = w[2:]
        if rest and rest[0].islower():
            suggestions.append({"original": w, "suggested": f"ke {rest}", "rule": "Preposisi 'ke' harus dipisah jika berfungsi sebagai preposisi"})

    for match in re.finditer(r"\b(dari[a-z]{1,8})\b", text, flags=re.IGNORECASE):
        w = match.group(1)
        rest = w[4:]
        if rest and rest[0].islower():
            suggestions.append({"original": w, "suggested": f"dari {rest}", "rule": "Preposisi 'dari' harus dipisah jika berfungsi sebagai preposisi"})

    return suggestions


def check_punctuation(text: str) -> List[Dict]:
    """Check common comma/period spacing issues and multiple punctuation."""
    suggestions = []
    # missing space after comma
    for match in re.finditer(r",([A-Za-z0-9])", text):
        original = match.group(0)
        suggested = ", " + match.group(1)
        suggestions.append({"original": original, "suggested": suggested, "rule": "Tambahkan spasi setelah koma"})

    # multiple spaces -> single
    for match in re.finditer(r" {2,}", text):
        original = match.group(0)
        suggested = " "
        suggestions.append({"original": original, "suggested": suggested, "rule": "Ganti spasi berlebih dengan satu spasi"})

    # space before punctuation
    for match in re.finditer(r"\s+([\.,\?!])", text):
        original = match.group(0)
        suggested = match.group(1)
        suggestions.append({"original": original, "suggested": suggested, "rule": "Hapus spasi sebelum tanda baca"})

    return suggestions


def analyze_text(text: str) -> Dict:
    """Run all rule checks and aggregate suggestions."""
    corrections = []
    corrections.extend(check_capitalization(text))
    corrections.extend(check_particles(text))
    corrections.extend(check_prepositions(text))
    corrections.extend(check_punctuation(text))

    # Deduplicate by original+suggested
    seen = set()
    out = []
    for c in corrections:
        key = (c["original"], c["suggested"])
        if key in seen:
            continue
        seen.add(key)
        out.append(c)

    return {"text": text, "corrections": out}
