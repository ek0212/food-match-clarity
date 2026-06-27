"""
Data pipeline: select quiz ingredients, extract embeddings, build app data assets.

This script:
1. Loads Epicure cooc embeddings and vocab
2. Loads mode atlas
3. Identifies cuisine direction vectors from the embedding space
4. Selects 30 quiz ingredients using cuisine-anchored strategy
5. Outputs JSON files for the app bundle
"""

import csv
import json
import numpy as np
from pathlib import Path

DATA_DIR = Path(__file__).parent
OUTPUT_DIR = DATA_DIR.parent / "app" / "src" / "data" / "generated"

# Cuisine directions we want to represent.
# These are derived from the SLERP test cases in Epicure.
CUISINE_SEEDS = {
    "south_asian": "rice",
    "east_asian": "beef",
    "latin_american": "corn",
    "mediterranean": "salmon",
    "western_atlantic": "chicken",
    "eastern_european": "lamb",
}

# Manually curated 50 quiz ingredients.
# Criteria: recognizable, cuisine-anchored, covers meat/plant divide for discrimination.
QUIZ_INGREDIENTS = [
    # South Asian anchors
    ("ghee", "Clarified butter used in South Asian cooking"),
    ("cumin", "Earthy spice central to Indian and Middle Eastern dishes"),
    ("lentil", "Protein-rich legume in dal, soups, and stews"),
    ("turmeric", "Golden spice in curries and rice dishes"),
    ("cardamom", "Fragrant spice in Indian chai, biryanis, and Middle Eastern coffee"),
    ("tamarind", "Sour pod in Indian chutneys, pad thai, and barbecue sauces"),
    # East Asian anchors
    ("soy sauce", "Fermented seasoning in Chinese, Japanese, and Korean cooking"),
    ("sesame oil", "Nutty finishing oil in East Asian dishes"),
    ("ginger", "Sharp, warming root used across Asian cuisines"),
    ("tofu", "Soy protein in stir-fries, soups, and curries"),
    # Japanese specifics
    ("miso", "Fermented soybean paste in Japanese soups, ramen, and glazes"),
    ("mirin", "Sweet Japanese rice wine in teriyaki and braising sauces"),
    ("nori", "Toasted seaweed sheets in sushi, ramen, and onigiri"),
    # Korean specifics
    ("gochujang", "Fermented Korean chili paste in bibimbap, stews, and marinades"),
    ("kimchi", "Spicy fermented cabbage at the center of Korean cooking"),
    # Mediterranean anchors
    ("olive oil", "Foundational fat in Mediterranean cooking"),
    ("basil", "Fresh herb in Italian pasta, pizza, and salads"),
    ("feta cheese", "Tangy crumbled cheese in Greek and Middle Eastern dishes"),
    ("chickpea", "Versatile legume in hummus, falafel, and stews"),
    ("thyme", "Woody herb in French, Mediterranean, and roasted dishes"),
    # Latin American anchors
    ("coriander", "Bright herb in Mexican, Thai, and Indian cooking"),
    ("avocado", "Creamy fruit in guacamole, tacos, and salads"),
    ("black bean", "Staple legume in Latin American rice and burritos"),
    ("chipotle", "Smoky dried jalapeño in Mexican sauces"),
    ("lime", "Bright citrus in Mexican, Thai, and Vietnamese cooking"),
    ("jalapeno", "Fresh green chili in salsas, nachos, and pickles"),
    # Western/Atlantic anchors
    ("butter", "Rich dairy fat in French and American cooking"),
    ("bacon", "Cured smoked pork in breakfasts and sandwiches"),
    ("cheddar cheese", "Sharp aged cheese in British and American dishes"),
    ("cream", "Rich dairy in French sauces, gratins, and chowders"),
    # Southeast Asian anchors
    ("coconut milk", "Creamy base in Thai and Indonesian curries"),
    ("lemongrass", "Citrusy stalk in Thai and Vietnamese soups"),
    ("fish sauce", "Pungent fermented seasoning in Southeast Asian cooking"),
    # Middle Eastern / North African anchors
    ("tahini", "Sesame paste in hummus and Middle Eastern dressings"),
    ("pomegranate", "Tart fruit seeds in salads and Persian stews"),
    ("harissa", "Fiery North African chili paste in stews and roasted vegetables"),
    # Eastern European anchors
    ("dill", "Grassy herb in Eastern European, Scandinavian, and Jewish cooking"),
    # Protein anchors — critical for omnivore/plant-based discrimination
    ("beef", "Hearty red meat in burgers, stews, and Korean barbecue"),
    ("lamb", "Tender red meat in Middle Eastern, Mediterranean, and South Asian stews"),
    ("shrimp", "Sweet shellfish in stir-fries, paella, and Vietnamese cooking"),
    ("salmon", "Rich fish in Japanese, Scandinavian, and Pacific cooking"),
    # Polarizing/discriminating ingredients
    ("mushroom", "Earthy fungi in risotto, stir-fries, and soups"),
    ("blue cheese", "Strong aged cheese with bold funky flavor"),
    ("anchovy", "Small salted fish used in Caesar dressing and pizza"),
    # Sweet / dessert dimension
    ("chocolate", "Bitter-rich cacao in desserts, Mexican mole, and drinks"),
    ("vanilla", "Floral pod in ice cream, baking, and custards worldwide"),
    # Bridge / universal ingredients
    ("rice", "Staple grain across Asian, Latin, and Middle Eastern cuisines"),
    ("garlic", "Aromatic base in nearly every world cuisine"),
    ("chili pepper", "Heat element across Asian, Latin, and Mediterranean dishes"),
    ("honey", "Natural sweetener in baking, glazes, and dressings worldwide"),
]


def load_vocab(path: Path) -> dict:
    """Load vocab.csv and return name -> cooc node_id mapping."""
    vocab = {}
    with open(path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            vocab[row["name"]] = int(row["node_id_cooc"])
    return vocab


def load_embeddings(path: Path) -> tuple:
    """Load epicure_cooc.csv and return (names, embedding_matrix)."""
    names = []
    vectors = []
    with open(path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            names.append(row["name"])
            dims = [float(row[f"dim_{i}"]) for i in range(300)]
            vectors.append(dims)
    return names, np.array(vectors, dtype=np.float32)


def load_mode_atlas(path: Path) -> list:
    """Load mode_atlas_cooc.csv and return mode entries."""
    modes = []
    with open(path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            modes.append({
                "mode_id": row["mode_id"],
                "kind": row["kind"],
                "property": row["property"],
                "label": row["label"],
                "n_members": int(row["n_members"]),
                "members": row["members_pipe"].split("|"),
            })
    return modes


def find_ingredient(name: str, vocab: dict, names: list) -> "int | None":
    """Find an ingredient in the vocab, trying common variations."""
    # Direct match
    if name in vocab:
        return vocab[name]
    # Try with underscores
    underscore_name = name.replace(" ", "_")
    if underscore_name in vocab:
        return vocab[underscore_name]
    # Try singular/plural
    if name.endswith("s") and name[:-1] in vocab:
        return vocab[name[:-1]]
    if name + "s" in vocab:
        return vocab[name + "s"]
    # Partial match
    for v_name in vocab:
        if name in v_name or v_name in name:
            return vocab[v_name]
    return None


def compute_cuisine_directions(
    embeddings: np.ndarray, vocab: dict
) -> dict[str, np.ndarray]:
    """
    Compute cuisine direction vectors using centroid-based approach.
    
    Uses mode atlas ingredients grouped by cuisine-associated modes
    to compute direction vectors.
    """
    # For now, use a simpler approach: compute directions from the
    # SLERP seed ingredients. The direction from a universal ingredient
    # toward a cuisine-specific one approximates the cuisine direction.
    # 
    # In a more sophisticated version, we'd use the linear probe vectors.
    # For MVP, we use mode atlas membership to identify cuisine clusters.
    return {}


def select_quiz_ingredients(
    vocab: dict, names: list, embeddings: np.ndarray
) -> list:
    """Select and validate the 30 quiz ingredients."""
    selected = []
    seen_names = set()
    
    for item in QUIZ_INGREDIENTS:
        if len(selected) >= 50:
            break
        name = item[0]
        context = item[1] if len(item) > 1 else None
        
        if name in seen_names:
            continue
        if context is None:
            continue
            
        idx = find_ingredient(name, vocab, names)
        if idx is not None:
            seen_names.add(name)
            selected.append({
                "name": name.replace("_", " ").title(),
                "context": context,
                "vocab_index": idx,
            })
        else:
            print(f"WARNING: Could not find '{name}' in vocab")
    
    print(f"Selected {len(selected)} quiz ingredients")
    return selected


def compute_mode_centroids(
    modes: list, vocab: dict, embeddings: np.ndarray
) -> tuple:
    """Compute centroids for factor modes only (the interpretable ones)."""
    factor_modes = [m for m in modes if m["kind"] == "factor"]
    
    # Take the top modes by member count (most robust centroids)
    factor_modes.sort(key=lambda m: m["n_members"], reverse=True)
    
    # Keep top 30 modes for scoring (user sees top 5)
    top_modes = factor_modes[:30]
    
    centroids = []
    mode_entries = []
    
    for mode in top_modes:
        # Compute centroid from member embeddings
        member_indices = []
        for member in mode["members"][:50]:  # Use top 50 members
            idx = find_ingredient(member, vocab, [])
            if idx is not None:
                member_indices.append(idx)
        
        if len(member_indices) < 3:
            continue
            
        centroid = embeddings[member_indices].mean(axis=0)
        centroid = centroid / (np.linalg.norm(centroid) + 1e-8)
        
        centroids.append(centroid)
        mode_entries.append({
            "label": mode["label"],
            "members": [m.replace("_", " ") for m in mode["members"][:6]],
        })
    
    return mode_entries, np.array(centroids, dtype=np.float32)


def compute_cuisine_vectors_from_modes(
    modes: list, vocab: dict, embeddings: np.ndarray
) -> tuple:
    """
    Compute cuisine direction vectors from cuisine-tagged modes.
    
    The mode atlas contains modes tagged with cuisine properties (e.g., cuisine_South_Asian).
    We use their centroids as approximate cuisine directions.
    """
    # Map cuisine property names to our labels
    cuisine_map = {
        "south_asian": ("South Asian", ["cuisine_South_Asian", "South_Asian"]),
        "east_asian": ("East Asian", ["cuisine_East_Asian", "East_Asian", "Chinese"]),
        "southeast_asian": ("Southeast Asian", ["cuisine_Southeast_Asian", "Southeast_Asian"]),
        "mediterranean": ("Mediterranean", ["cuisine_Mediterranean", "Mediterranean"]),
        "latin_american": ("Latin American", ["cuisine_Latin_American", "Latin_American"]),
        "western_atlantic": ("Western/Atlantic", ["cuisine_Western_Atlantic", "Western_Atlantic", "Western"]),
        "middle_eastern": ("Middle Eastern & North African", ["cuisine_Middle_Eastern", "Middle_Eastern"]),
        "eastern_european": ("Eastern European", ["cuisine_Eastern_European", "Eastern_European"]),
    }
    
    # Find modes associated with each cuisine
    cuisine_labels = []
    cuisine_vectors = []
    
    for cuisine_id, (label, property_keywords) in cuisine_map.items():
        # Find modes whose property matches this cuisine
        matching_modes = []
        for mode in modes:
            prop = mode.get("property", "")
            mode_id = mode.get("mode_id", "")
            for kw in property_keywords:
                if kw.lower() in prop.lower() or kw.lower() in mode_id.lower():
                    matching_modes.append(mode)
                    break
        
        if matching_modes:
            # Use the highest z-score mode's members to compute direction
            best_mode = max(matching_modes, key=lambda m: m.get("n_members", 0))
            member_indices = []
            for member in best_mode["members"][:30]:
                idx = find_ingredient(member, vocab, [])
                if idx is not None:
                    member_indices.append(idx)
            
            if member_indices:
                centroid = embeddings[member_indices].mean(axis=0)
                centroid = centroid / (np.linalg.norm(centroid) + 1e-8)
                cuisine_labels.append({"id": cuisine_id, "label": label})
                cuisine_vectors.append(centroid)
                print(f"  {label}: {len(member_indices)} members from mode '{best_mode['label']}'")
            else:
                print(f"  WARNING: No valid members for {label}")
        else:
            # Fallback: compute from known cuisine-anchor ingredients
            print(f"  {label}: No matching modes, using fallback")
            # Use a set of known anchor ingredients
            fallback_anchors = {
                "south_asian": ["ghee", "cumin", "turmeric", "lentil", "garam_masala", "curry_leaf", "cardamom"],
                "east_asian": ["soy_sauce", "sesame_oil", "ginger", "rice_wine", "msg", "tofu", "noodle"],
                "southeast_asian": ["fish_sauce", "coconut_milk", "lemongrass", "galangal", "shrimp_paste"],
                "mediterranean": ["olive_oil", "basil", "oregano", "feta_cheese", "balsamic_vinegar"],
                "latin_american": ["cilantro", "avocado", "black_bean", "chipotle", "corn", "lime"],
                "western_atlantic": ["butter", "bacon", "cheddar_cheese", "cream", "mustard"],
                "middle_eastern": ["tahini", "pomegranate", "sumac", "za_atar", "rosewater"],
                "eastern_european": ["sour_cream", "dill", "beet", "caraway", "rye"],
            }
            anchors = fallback_anchors.get(cuisine_id, [])
            member_indices = []
            for a in anchors:
                idx = find_ingredient(a, vocab, [])
                if idx is not None:
                    member_indices.append(idx)
            
            if member_indices:
                centroid = embeddings[member_indices].mean(axis=0)
                centroid = centroid / (np.linalg.norm(centroid) + 1e-8)
                cuisine_labels.append({"id": cuisine_id, "label": label})
                cuisine_vectors.append(centroid)
                print(f"    -> Used {len(member_indices)} fallback anchors")
    
    return cuisine_labels, np.array(cuisine_vectors, dtype=np.float32)


def main():
    print("Loading Epicure data...")
    vocab = load_vocab(DATA_DIR / "vocab.csv")
    names, embeddings = load_embeddings(DATA_DIR / "epicure_cooc.csv")
    modes = load_mode_atlas(DATA_DIR / "mode_atlas_cooc.csv")
    
    print(f"Vocab: {len(vocab)} ingredients")
    print(f"Embeddings: {embeddings.shape}")
    print(f"Modes: {len(modes)} total")
    
    # Normalize embeddings to unit length (prevents magnitude dominance - Failure F1)
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    norms[norms == 0] = 1
    embeddings = embeddings / norms
    
    print("\nSelecting quiz ingredients...")
    quiz_ingredients = select_quiz_ingredients(vocab, names, embeddings)
    
    print("\nComputing cuisine direction vectors...")
    cuisine_labels, cuisine_vectors = compute_cuisine_vectors_from_modes(modes, vocab, embeddings)
    print(f"Computed {len(cuisine_labels)} cuisine directions")
    
    print("\nComputing mode centroids...")
    mode_entries, mode_centroids = compute_mode_centroids(modes, vocab, embeddings)
    print(f"Computed {len(mode_entries)} mode centroids")
    
    # Extract quiz ingredient embeddings
    quiz_embeddings = []
    for ing in quiz_ingredients:
        quiz_embeddings.append(embeddings[ing["vocab_index"]].tolist())
    
    # Output
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Quiz deck
    quiz_deck = [
        {"name": ing["name"], "context": ing["context"], "embeddingIndex": i}
        for i, ing in enumerate(quiz_ingredients)
    ]
    with open(OUTPUT_DIR / "quiz-deck.json", "w") as f:
        json.dump(quiz_deck, f, indent=2)
    
    # Embeddings (30 × 300)
    with open(OUTPUT_DIR / "embeddings.json", "w") as f:
        json.dump(quiz_embeddings, f)
    
    # Cuisine vectors (8 × 300)
    with open(OUTPUT_DIR / "cuisine-vectors.json", "w") as f:
        json.dump({
            "labels": cuisine_labels,
            "vectors": cuisine_vectors.tolist(),
        }, f)
    
    # Mode data
    with open(OUTPUT_DIR / "mode-atlas.json", "w") as f:
        json.dump({
            "entries": mode_entries,
            "centroids": mode_centroids.tolist(),
        }, f)
    
    print(f"\n✓ Written to {OUTPUT_DIR}")
    print(f"  quiz-deck.json: {len(quiz_deck)} cards")
    print(f"  embeddings.json: {len(quiz_embeddings)}×{len(quiz_embeddings[0])} matrix")
    print(f"  cuisine-vectors.json: {len(cuisine_labels)} directions")
    print(f"  mode-atlas.json: {len(mode_entries)} modes")


if __name__ == "__main__":
    main()
