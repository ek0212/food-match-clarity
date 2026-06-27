/**
 * Curated dish suggestions per cuisine direction.
 * Shown in the profile view under each top cuisine.
 */

export const DISH_SUGGESTIONS: Record<string, string[]> = {
  south_asian: [
    "Dal tadka",
    "Chicken biryani",
    "Palak paneer",
    "Samosa chaat",
    "Lamb rogan josh",
  ],
  east_asian: [
    "Mapo tofu",
    "Kung pao chicken",
    "Xiaolongbao",
    "Dan dan noodles",
    "Miso ramen",
  ],
  southeast_asian: [
    "Pad thai",
    "Green curry",
    "Pho bo",
    "Laksa",
    "Nasi lemak",
  ],
  mediterranean: [
    "Shakshuka",
    "Pasta aglio e olio",
    "Greek mezze platter",
    "Paella valenciana",
    "Caprese salad",
  ],
  latin_american: [
    "Tacos al pastor",
    "Ceviche",
    "Mole negro",
    "Arroz con pollo",
    "Empanadas",
  ],
  western_atlantic: [
    "Clam chowder",
    "Pulled pork sandwich",
    "Mac and cheese",
    "Fish and chips",
    "Caesar salad",
  ],
  middle_eastern: [
    "Falafel wrap",
    "Lamb shawarma",
    "Persian rice with herbs",
    "Moroccan tagine",
    "Hummus with warm pita",
  ],
  eastern_european: [
    "Pierogi",
    "Borscht",
    "Beef goulash",
    "Schnitzel",
    "Pelmeni",
  ],
};
