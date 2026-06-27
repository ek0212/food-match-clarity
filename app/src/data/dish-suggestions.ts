/**
 * Curated dish suggestions per cuisine direction, each linked to a recipe search.
 */

export interface DishSuggestion {
  name: string;
  url: string;
}

function ar(query: string): string {
  return `https://www.allrecipes.com/search?q=${encodeURIComponent(query)}`;
}

export const DISH_SUGGESTIONS: Record<string, DishSuggestion[]> = {
  south_asian: [
    { name: "Dal tadka",          url: ar("dal tadka") },
    { name: "Chicken biryani",    url: ar("chicken biryani") },
    { name: "Palak paneer",       url: ar("palak paneer") },
    { name: "Samosa chaat",       url: ar("samosa chaat") },
    { name: "Lamb rogan josh",    url: ar("lamb rogan josh") },
  ],
  east_asian: [
    { name: "Mapo tofu",          url: ar("mapo tofu") },
    { name: "Kung pao chicken",   url: ar("kung pao chicken") },
    { name: "Xiaolongbao",        url: ar("xiaolongbao soup dumplings") },
    { name: "Dan dan noodles",    url: ar("dan dan noodles") },
    { name: "Miso ramen",         url: ar("miso ramen") },
  ],
  southeast_asian: [
    { name: "Pad thai",           url: ar("pad thai") },
    { name: "Green curry",        url: ar("thai green curry") },
    { name: "Pho bo",             url: ar("pho bo beef noodle soup") },
    { name: "Laksa",              url: ar("laksa") },
    { name: "Nasi lemak",         url: ar("nasi lemak") },
  ],
  mediterranean: [
    { name: "Shakshuka",          url: ar("shakshuka") },
    { name: "Pasta aglio e olio", url: ar("pasta aglio e olio") },
    { name: "Greek mezze",        url: ar("greek mezze platter") },
    { name: "Paella",             url: ar("paella valenciana") },
    { name: "Caprese salad",      url: ar("caprese salad") },
  ],
  latin_american: [
    { name: "Tacos al pastor",    url: ar("tacos al pastor") },
    { name: "Ceviche",            url: ar("ceviche") },
    { name: "Mole negro",         url: ar("mole negro") },
    { name: "Arroz con pollo",    url: ar("arroz con pollo") },
    { name: "Empanadas",          url: ar("empanadas") },
  ],
  western_atlantic: [
    { name: "Clam chowder",       url: ar("clam chowder") },
    { name: "Pulled pork",        url: ar("pulled pork") },
    { name: "Mac and cheese",     url: ar("mac and cheese") },
    { name: "Fish and chips",     url: ar("fish and chips") },
    { name: "Caesar salad",       url: ar("caesar salad") },
  ],
  middle_eastern: [
    { name: "Falafel wrap",       url: ar("falafel") },
    { name: "Lamb shawarma",      url: ar("lamb shawarma") },
    { name: "Persian rice",       url: ar("persian herb rice") },
    { name: "Moroccan tagine",    url: ar("moroccan tagine") },
    { name: "Hummus",             url: ar("homemade hummus") },
  ],
  eastern_european: [
    { name: "Pierogi",            url: ar("pierogi") },
    { name: "Borscht",            url: ar("borscht") },
    { name: "Beef goulash",       url: ar("beef goulash") },
    { name: "Schnitzel",          url: ar("schnitzel") },
    { name: "Pelmeni",            url: ar("pelmeni") },
  ],
};
