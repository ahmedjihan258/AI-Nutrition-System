import spacy
from spacy.matcher import PhraseMatcher
import re
import pandas as pd
from app.services.nutrition_service import load_nutrition_dataset, get_nutrition

_nlp = None
_matcher = None

# Numeric words dictionary for normalization
NUM_WORDS = {
    "a": 1.0,
    "an": 1.0,
    "one": 1.0,
    "two": 2.0,
    "three": 3.0,
    "four": 4.0,
    "five": 5.0,
    "six": 6.0,
    "seven": 7.0,
    "eight": 8.0,
    "nine": 9.0,
    "ten": 10.0,
}

def parse_number(num_str: str) -> float:
    """
    Parses a string representation of a number (digit or word) into a float.
    """
    num_str = num_str.strip().lower()
    if num_str.isdigit():
        return float(num_str)
    try:
        return float(num_str)
    except ValueError:
        pass
    return NUM_WORDS.get(num_str, 1.0)

def normalize_unit(unit_str: str) -> str:
    """
    Normalizes spelling of food measurement units to standard labels.
    """
    if not unit_str:
        return "serving"
    unit_str = unit_str.strip().lower()
    if unit_str in ["g", "gram", "grams"]:
        return "g"
    if unit_str in ["kg", "kilogram", "kilograms"]:
        return "kg"
    if unit_str in ["piece", "pieces", "egg", "eggs", "slice", "slices"]:
        return "piece"
    if unit_str in ["plate", "plates"]:
        return "plate"
    if unit_str in ["bowl", "bowls"]:
        return "bowl"
    if unit_str in ["cup", "cups"]:
        return "cup"
    if unit_str in ["serving", "servings"]:
        return "serving"
    return unit_str

def get_nlp_and_matcher():
    global _nlp, _matcher
    if _nlp is None:
        try:
            _nlp = spacy.load("en_core_web_sm")
        except OSError:
            _nlp = spacy.blank("en")
            
        _matcher = PhraseMatcher(_nlp.vocab, attr="LOWER")
        
        try:
            df = load_nutrition_dataset()
            food_patterns = []
            for _, row in df.iterrows():
                food = str(row['food_name']).strip().lower()
                food_patterns.append(food)
                if 'aliases' in row and pd.notna(row['aliases']):
                    aliases = [a.strip().lower() for a in str(row['aliases']).split(',') if a.strip()]
                    food_patterns.extend(aliases)
            food_patterns = list(set(food_patterns))
            patterns = [_nlp.make_doc(food) for food in food_patterns]
            _matcher.add("FOOD_PATTERNS", patterns)
        except Exception as e:
            pass
            
    return _nlp, _matcher

def extract_foods(text: str):
    """
    Extracts food names from the given text.
    Maintained for backward compatibility.
    """
    extracted_items = extract_foods_with_quantities(text)
    return [item["food_name"] for item in extracted_items]

def extract_foods_with_quantities(text: str):
    """
    Advanced NLP parser extracting food name, quantity, and unit from conversational text.
    Returns: List[Dict]: [{"food_name": str, "quantity": float, "unit": str}]
    """
    if not text:
        return []
        
    nlp, matcher = get_nlp_and_matcher()
    doc = nlp(text)
    
    # 1. Match food entities
    matches = matcher(doc)
    
    # Pre-parse matching spans
    matched_spans = []
    for match_id, start, end in matches:
        span = doc[start:end]
        matched_spans.append((start, end, span.text.lower()))
        
    # Also find foods using regex fallback in case spaCy PhraseMatcher missed any
    try:
        df = load_nutrition_dataset()
        search_names = []
        for _, row in df.iterrows():
            search_names.append(str(row['food_name']).strip().lower())
            if 'aliases' in row and pd.notna(row['aliases']):
                aliases = [a.strip().lower() for a in str(row['aliases']).split(',') if a.strip()]
                search_names.extend(aliases)
        search_names = sorted(list(set(search_names)), key=len, reverse=True)
        text_lower = text.lower()
        
        for food in search_names:
            pattern = rf"\b{re.escape(food)}\b"
            for match in re.finditer(pattern, text_lower):
                start_char, end_char = match.span()
                span = doc.char_span(start_char, end_char)
                if span:
                    overlap = False
                    for s_start, s_end, _ in matched_spans:
                        if not (span.end <= s_start or span.start >= s_end):
                            overlap = True
                            break
                    if not overlap:
                        matched_spans.append((span.start, span.end, food))
    except Exception as e:
        pass
        
    # Resolve overlaps (keep longer matches)
    matched_spans.sort(key=lambda x: (x[0], -(x[1] - x[0])))
    non_overlapping = []
    for s_start, s_end, food in matched_spans:
        overlap = False
        for o_start, o_end, _ in non_overlapping:
            if not (s_end <= o_start or s_start >= o_end):
                overlap = True
                break
        if not overlap:
            non_overlapping.append((s_start, s_end, food))
    matched_spans = non_overlapping
    
    # Sort matched spans by start token index
    matched_spans.sort(key=lambda x: x[0])
    
    results = []
    num_spans = len(matched_spans)
    
    for idx, (start, end, food_name) in enumerate(matched_spans):
        # Determine search boundaries for preceding and succeeding text to avoid crossing items
        boundary_prev = matched_spans[idx - 1][1] if idx > 0 else 0
        boundary_next = matched_spans[idx + 1][0] if idx < num_spans - 1 else len(doc)
        
        # Preceding text segment
        prev_tokens = [doc[i].text for i in range(boundary_prev, start)]
        prev_text = " ".join(prev_tokens).lower().strip()
        
        # Succeeding text segment
        next_tokens = [doc[i].text for i in range(end, boundary_next)]
        next_text = " ".join(next_tokens).lower().strip()
        
        quantity = 1.0
        unit = "serving"
        
        # Regex patterns for quantity and unit extraction (handling adjacent units like 200g or separated like 200 g)
        prefix_pattern = r"\b(\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|a|an)\s*(gram|grams|g|kilogram|kilograms|kg|piece|pieces|egg|eggs|plate|plates|bowl|bowls|cup|cups|serving|servings|slice|slices)?\s*(?:of)?\s*$"
        suffix_pattern = r"^\s*(\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|a|an)\s*(gram|grams|g|kilogram|kilograms|kg|piece|pieces|egg|eggs|plate|plates|bowl|bowls|cup|cups|serving|servings|slice|slices)?\b"
        
        match = re.search(prefix_pattern, prev_text)
        if match:
            num_val = match.group(1)
            unit_val = match.group(2) if match.group(2) else None
            quantity = parse_number(num_val)
            unit = normalize_unit(unit_val)
        else:
            match_succ = re.search(suffix_pattern, next_text)
            if match_succ:
                num_val = match_succ.group(1)
                unit_val = match_succ.group(2) if match_succ.group(2) else None
                quantity = parse_number(num_val)
                unit = normalize_unit(unit_val)
                
        # Resolve matched name to canonical name using nutrition_service's get_nutrition
        canonical_name = food_name
        try:
            nutrition = get_nutrition(food_name)
            if nutrition:
                canonical_name = nutrition["food_name"]
        except Exception:
            pass

        # Default unit mapping logic for count-based items if user provided a raw number without unit
        if unit == "serving" and canonical_name in ["egg", "banana", "apple", "roti", "chapati", "samosa", "singara", "sweet", "rasgulla", "burger", "pizza", "orange", "mango"]:
            unit = "piece"
            
        results.append({
            "food_name": canonical_name,
            "quantity": quantity,
            "unit": unit
        })
        
    return results
