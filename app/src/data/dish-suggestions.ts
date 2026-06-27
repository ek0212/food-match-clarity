/**
 * Curated dish suggestions per cuisine direction.
 * keyIngredients: quiz ingredient names that are deal-breakers for the dish.
 * If the user rated any of these as "not for me", the dish is filtered out.
 */

export interface DishSuggestion {
  name: string;
  url: string;
  keyIngredients?: string[];
}

function ar(query: string): string {
  return `https://www.allrecipes.com/search?q=${encodeURIComponent(query)}`;
}

export const DISH_SUGGESTIONS: Record<string, DishSuggestion[]> = {
  south_asian: [
    { name: "Dal tadka",       url: ar("dal tadka"),        keyIngredients: ["Lentil", "Ghee"] },
    { name: "Chicken biryani", url: ar("chicken biryani"),  keyIngredients: ["Ghee"] },
    { name: "Palak paneer",    url: ar("palak paneer"),     keyIngredients: ["Ghee", "Feta Cheese"] },
    { name: "Samosa chaat",    url: ar("samosa chaat"),     keyIngredients: ["Chickpea"] },
    { name: "Lamb rogan josh", url: ar("lamb rogan josh"),  keyIngredients: ["Lamb", "Ghee"] },
  ],
  east_asian: [
    { name: "Mapo tofu",        url: ar("mapo tofu"),         keyIngredients: ["Tofu", "Gochujang"] },
    { name: "Kung pao chicken", url: ar("kung pao chicken"),  keyIngredients: ["Chili Pepper", "Soy Sauce"] },
    { name: "Soup dumplings",   url: ar("xiaolongbao soup dumplings"), keyIngredients: [] },
    { name: "Dan dan noodles",  url: ar("dan dan noodles"),   keyIngredients: ["Soy Sauce", "Chili Pepper"] },
    { name: "Miso ramen",       url: ar("miso ramen"),        keyIngredients: ["Miso", "Soy Sauce"] },
  ],
  southeast_asian: [
    { name: "Pad thai",      url: ar("pad thai"),              keyIngredients: ["Fish Sauce"] },
    { name: "Green curry",   url: ar("thai green curry"),      keyIngredients: ["Coconut Milk", "Fish Sauce"] },
    { name: "Pho bo",        url: ar("pho bo beef noodle"),    keyIngredients: ["Fish Sauce"] },
    { name: "Laksa",         url: ar("laksa"),                 keyIngredients: ["Coconut Milk", "Fish Sauce"] },
    { name: "Nasi lemak",    url: ar("nasi lemak"),            keyIngredients: ["Coconut Milk", "Shrimp"] },
  ],
  mediterranean: [
    { name: "Shakshuka",          url: ar("shakshuka"),            keyIngredients: ["Olive Oil"] },
    { name: "Pasta aglio e olio", url: ar("pasta aglio e olio"),   keyIngredients: ["Olive Oil", "Anchovy"] },
    { name: "Greek mezze",        url: ar("greek mezze platter"),  keyIngredients: ["Feta Cheese", "Olive Oil"] },
    { name: "Paella",             url: ar("paella valenciana"),    keyIngredients: ["Olive Oil", "Shrimp"] },
    { name: "Caprese salad",      url: ar("caprese salad"),        keyIngredients: ["Basil", "Olive Oil"] },
  ],
  latin_american: [
    { name: "Tacos al pastor", url: ar("tacos al pastor"),  keyIngredients: ["Coriander", "Lime", "Chipotle"] },
    { name: "Ceviche",         url: ar("ceviche"),           keyIngredients: ["Lime", "Coriander", "Shrimp"] },
    { name: "Mole negro",      url: ar("mole negro"),        keyIngredients: ["Chocolate", "Chipotle"] },
    { name: "Arroz con pollo", url: ar("arroz con pollo"),   keyIngredients: ["Coriander"] },
    { name: "Empanadas",       url: ar("empanadas"),         keyIngredients: [] },
  ],
  western_atlantic: [
    { name: "Clam chowder",   url: ar("clam chowder"),   keyIngredients: ["Cream", "Bacon"] },
    { name: "Pulled pork",    url: ar("pulled pork"),    keyIngredients: ["Bacon"] },
    { name: "Mac and cheese", url: ar("mac and cheese"), keyIngredients: ["Cheddar Cheese", "Cream", "Butter"] },
    { name: "Fish and chips", url: ar("fish and chips"), keyIngredients: ["Salmon"] },
    { name: "Caesar salad",   url: ar("caesar salad"),   keyIngredients: ["Anchovy"] },
  ],
  middle_eastern: [
    { name: "Falafel wrap",   url: ar("falafel"),               keyIngredients: ["Chickpea", "Tahini"] },
    { name: "Lamb shawarma",  url: ar("lamb shawarma"),         keyIngredients: ["Lamb"] },
    { name: "Persian rice",   url: ar("persian herb rice"),     keyIngredients: [] },
    { name: "Moroccan tagine",url: ar("moroccan tagine"),       keyIngredients: ["Harissa"] },
    { name: "Hummus",         url: ar("homemade hummus"),       keyIngredients: ["Chickpea", "Tahini"] },
  ],
  eastern_european: [
    { name: "Pierogi",     url: ar("pierogi"),       keyIngredients: ["Butter"] },
    { name: "Borscht",     url: ar("borscht"),       keyIngredients: ["Dill"] },
    { name: "Beef goulash",url: ar("beef goulash"),  keyIngredients: ["Beef"] },
    { name: "Schnitzel",   url: ar("schnitzel"),     keyIngredients: ["Butter"] },
    { name: "Pelmeni",     url: ar("pelmeni"),       keyIngredients: [] },
  ],
};
