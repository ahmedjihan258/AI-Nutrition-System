import io
from PIL import Image
from transformers import pipeline

_classifier = None

def get_classifier():
    """
    Lazy-loads and caches the Hugging Face image classification pipeline.
    Uses the 'nateraw/food' model.
    """
    global _classifier
    if _classifier is None:
        _classifier = pipeline(
            "image-classification",
            model="nateraw/food"
        )
    return _classifier

def classify_image(image_bytes: bytes):
    """
    Classifies food in an image and returns the prediction results.
    Returns a list of dicts with keys 'label' and 'score'.
    """
    image = Image.open(io.BytesIO(image_bytes))
    classifier = get_classifier()
    results = classifier(image)
    return results
