import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, doc, runTransaction, getDoc } from "firebase/firestore";

const config = {
  apiKey: "AIzaSyA-PJqOZrTj8I1mEUgsgoiKVTn6a32erxM",
  authDomain: "bymeesh-a5ee5.firebaseapp.com",
  projectId: "bymeesh-a5ee5",
  storageBucket: "bymeesh-a5ee5.firebasestorage.app",
  messagingSenderId: "697313195591",
  appId: "1:697313195591:web:8728b031b806f1dda7a362",
};

const app = initializeApp(config);
const db = getFirestore(app);

async function nextId(name: string): Promise<number> {
  const ref = doc(db, "_counters", name);
  return await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const current = (snap.exists() ? (snap.data().value as number) : 0) || 0;
    const next = current + 1;
    tx.set(ref, { value: next });
    return next;
  });
}

const dishes = [
  {
    name: "Ginger Jujube House Soda",
    description: "A refreshing house shrub tonic made with ginger, jujube, apple cider vinegar, and honey, topped with club soda and candied ginger.",
    recipe: "Combine 2 oz shrub concentrate with 5 oz club soda over ice. Garnish with candied ginger. Shrub: simmer ginger, jujube, ACV, honey; strain and cool.",
    prep: "Make shrub concentrate day before. Chill. Mix to order.",
    service: "Serve in short glasses on table to start.",
    flatware: "Short glass, cocktail napkin.",
    category: "appetizer",
    ingredients: [
      { name: "Ginger Jujube Tea Concentrate (YINA)", quantity: "2", unit: "each", unitCost: 12.00 },
      { name: "Apple cider vinegar", quantity: "0.5", unit: "cup", unitCost: 2.00 },
      { name: "Raw honey", quantity: "0.25", unit: "cup", unitCost: 2.50 },
      { name: "Club soda", quantity: "2", unit: "l", unitCost: 3.00 },
      { name: "Candied ginger (garnish)", quantity: "2", unit: "oz", unitCost: 3.00 },
    ],
    supplies: [
      { name: "Short glasses (1 pp)", quantity: "20", unitCost: 0.00 },
      { name: "Jigger / shaker", quantity: "1", unitCost: 0.00 },
      { name: "Ice", quantity: "1", unitCost: 2.00 },
    ],
  },
  {
    name: "Healing Broth with Tea Dumpling",
    description: "Clarified dashi broth poured tableside from silver teapots over a teabag-shaped dumpling filled with watercress, tofu, mushrooms, and sesame paste, with a miso sugar cube that blooms in the broth.",
    recipe: "Broth: simmer kombu, shiitake, ginger, star anise, cloves; strain; finish with miso. Dumplings: mix ginger, garlic, scallions, s&p, MSG, watercress, tofu, shiitake, napa cabbage; fill wonton wraps into teabag shape. Shape miso paste into cubes and freeze. Steam dumplings to order. Pour broth tableside.",
    prep: "Make broth day before. Make dumpling filling and fold dumplings day before. Freeze miso cubes night before.",
    service: "1 dumpling + miso cube in small white bowl per guest. Broth in silver teapots; 2 servers pour tableside.",
    flatware: "Small white bowl, soup spoon.",
    category: "appetizer",
    ingredients: [
      { name: "Watercress", quantity: "1", unit: "bunch", unitCost: 3.00 },
      { name: "Firm tofu", quantity: "1", unit: "lb", unitCost: 3.50 },
      { name: "Shiitake mushrooms", quantity: "0.5", unit: "lb", unitCost: 5.00 },
      { name: "Sesame paste (tahini)", quantity: "3", unit: "tbsp", unitCost: 2.00 },
      { name: "Napa cabbage", quantity: "0.5", unit: "head", unitCost: 2.00 },
      { name: "Wonton wrappers", quantity: "1", unit: "lb", unitCost: 3.00 },
      { name: "Kombu", quantity: "1", unit: "oz", unitCost: 3.00 },
      { name: "Dried mushrooms (broth)", quantity: "2", unit: "oz", unitCost: 4.00 },
      { name: "Ginger (fresh)", quantity: "4", unit: "oz", unitCost: 1.50 },
      { name: "Garlic", quantity: "4", unit: "cloves", unitCost: 0.50 },
      { name: "Star anise", quantity: "3", unit: "each", unitCost: 0.50 },
      { name: "Miso paste", quantity: "4", unit: "oz", unitCost: 4.00 },
      { name: "Scallions", quantity: "1", unit: "bunch", unitCost: 1.50 },
    ],
    supplies: [
      { name: "Small white bowls (1 pp)", quantity: "20", unitCost: 0.00 },
      { name: "Silver teapots / metal teapots (3)", quantity: "3", unitCost: 0.00 },
      { name: "Induction pot", quantity: "1", unitCost: 0.00 },
      { name: "Ladle", quantity: "1", unitCost: 0.00 },
      { name: "Steamer (2)", quantity: "2", unitCost: 0.00 },
    ],
  },
  {
    name: "Wood Ear Mushroom Salad",
    description: "Pickled wood ear mushrooms tossed with shaved celery and sliced kirby cucumbers in a bright Chinkiang vinaigrette — a little sweet, a little vinegar, cold and squeaky.",
    recipe: "Rehydrate and blanch wood ear mushrooms. Slice celery paper-thin. Halve kirby cucumbers. Dress with Chinkiang vinegar, olive oil, Dijon, soy sauce, lemon juice, s&p.",
    prep: "Rehydrate mushrooms overnight. Dress and chill 1–2 hours before service.",
    service: "Plate individually on 10\" white plate. Served.",
    flatware: "Salad fork.",
    category: "appetizer",
    ingredients: [
      { name: "Dried wood ear mushrooms (1 bag)", quantity: "4", unit: "oz", unitCost: 6.00 },
      { name: "Kirby cucumbers", quantity: "4", unit: "each", unitCost: 4.00 },
      { name: "Celery", quantity: "4", unit: "each", unitCost: 2.50 },
      { name: "Chinkiang vinegar", quantity: "3", unit: "tbsp", unitCost: 2.00 },
      { name: "Olive oil", quantity: "2", unit: "tbsp", unitCost: 1.00 },
      { name: "Dijon mustard", quantity: "1", unit: "tbsp", unitCost: 0.50 },
      { name: "Soy sauce", quantity: "1", unit: "tbsp", unitCost: 0.50 },
      { name: "Lemon", quantity: "1", unit: "each", unitCost: 0.75 },
    ],
    supplies: [
      { name: "White 10\" plates (1 pp)", quantity: "20", unitCost: 0.00 },
      { name: "Tongs", quantity: "2", unitCost: 0.00 },
    ],
  },
  {
    name: "Vegetable Endive Wraps",
    description: "Crisp endive leaves filled with mashed tofu and peas, topped with crushed flamin' hot corn nuts for crunch and heat.",
    recipe: "Mash tofu with cooked peas, fennel fronds, salt. Pipe or spoon into endive leaves. Top with crushed flamin' hot corn nuts.",
    prep: "Make filling day of. Assemble to order or just before service.",
    service: "Plate on 10\" white plate. Served.",
    flatware: "Hands / cocktail napkin.",
    category: "appetizer",
    ingredients: [
      { name: "Belgian endive", quantity: "2", unit: "each", unitCost: 5.00 },
      { name: "Firm tofu (1 brick)", quantity: "14", unit: "oz", unitCost: 3.00 },
      { name: "Frozen peas", quantity: "1", unit: "cup", unitCost: 1.50 },
      { name: "Fennel fronds", quantity: "1", unit: "oz", unitCost: 1.00 },
      { name: "Flamin' hot corn nuts", quantity: "3", unit: "oz", unitCost: 3.00 },
      { name: "Maldon salt", quantity: "1", unit: "tsp", unitCost: 0.50 },
    ],
    supplies: [
      { name: "Piping bag", quantity: "1", unitCost: 0.50 },
      { name: "White 10\" plates (1 pp)", quantity: "20", unitCost: 0.00 },
    ],
  },
  {
    name: "Eur-Rad Whipped Butter",
    description: "European butter whipped with mascarpone, served on crispy roti circles with a rainbow of French radishes and a sprinkle of Maldon salt.",
    recipe: "Whip European butter with mascarpone until fluffy; fold in minced salted radish. Cut roti into circles and toast/fry until crispy. Plate schmear, top with radishes and finishing salt.",
    prep: "Make whipped butter day of. Toast roti AM of event.",
    service: "Plate on 10\" white plate. Butter in sauce dish per person. Served.",
    flatware: "Butter knife.",
    category: "appetizer",
    ingredients: [
      { name: "European butter", quantity: "1.25", unit: "lb", unitCost: 9.00 },
      { name: "Mascarpone", quantity: "4", unit: "oz", unitCost: 5.00 },
      { name: "Roti (store-bought or homemade)", quantity: "5", unit: "each", unitCost: 6.00 },
      { name: "French radishes (assorted)", quantity: "2", unit: "bunches", unitCost: 6.00 },
      { name: "Maldon salt", quantity: "1", unit: "tsp", unitCost: 0.50 },
    ],
    supplies: [
      { name: "Butter knife (1 pp)", quantity: "20", unitCost: 0.00 },
      { name: "Sauce dishes (1 pp)", quantity: "20", unitCost: 0.00 },
      { name: "Induction pan / oven", quantity: "1", unitCost: 0.00 },
    ],
  },
  {
    name: "Braised Beef Jook",
    description: "Silky congee with slow-braised beef chuck and fennel, topped with pickled turnip, fennel fronds, and Thai roasted rice powder.",
    recipe: "Jook base: rinse 3.5 cups rice; cook with garlic, pickled turnip, scallions, soy, white pepper until porridge consistency. Braise beef chuck with fennel low and slow. Shred. Plate jook, top with beef.",
    prep: "Braise beef day before. Make jook base day before; reheat with stock. Prep all accoutrements AM of event.",
    service: "Plate individually in Origami soup bowls (1 pp). Accoutrements in 4–5 sauce dishes family-style.",
    flatware: "Soup spoon, dinner fork.",
    category: "main",
    ingredients: [
      { name: "Beef chuck", quantity: "6.5", unit: "lb", unitCost: 52.00 },
      { name: "Fennel bulb", quantity: "2", unit: "each", unitCost: 5.00 },
      { name: "Jasmine rice", quantity: "3.5", unit: "cup", unitCost: 4.00 },
      { name: "Pickled turnip / pickled radish", quantity: "1", unit: "cup", unitCost: 3.00 },
      { name: "Scallions", quantity: "2", unit: "bunches", unitCost: 3.00 },
      { name: "Garlic", quantity: "6", unit: "cloves", unitCost: 0.75 },
      { name: "Soy sauce", quantity: "3", unit: "tbsp", unitCost: 1.00 },
      { name: "White pepper", quantity: "1", unit: "tsp", unitCost: 0.50 },
      { name: "Thai roasted rice powder (khao khua)", quantity: "3", unit: "tbsp", unitCost: 2.00 },
    ],
    supplies: [
      { name: "Origami soup bowls 9\" (1 pp)", quantity: "20", unitCost: 0.00 },
      { name: "Induction pot, ladle", quantity: "1", unitCost: 0.00 },
    ],
  },
  {
    name: "Vegetarian Jook",
    description: "The same silky congee base topped with braised eggplant and fennel instead of beef — available for vegetarian guests.",
    recipe: "Use same jook base. Braise eggplant with fennel, soy, and garlic until tender. Plate jook, top with eggplant. Same accoutrements as beef jook.",
    prep: "Braise eggplant day before. Reheat with stock before service.",
    service: "Plate individually in Origami soup bowls (for vegetarian guests).",
    flatware: "Soup spoon, dinner fork.",
    category: "main",
    ingredients: [
      { name: "Eggplant (Chinese or globe)", quantity: "3", unit: "each", unitCost: 6.00 },
      { name: "Fennel bulb", quantity: "1", unit: "each", unitCost: 2.50 },
      { name: "Soy sauce", quantity: "2", unit: "tbsp", unitCost: 0.75 },
      { name: "Garlic", quantity: "3", unit: "cloves", unitCost: 0.40 },
    ],
    supplies: [
      { name: "Origami soup bowls 9\" (vegetarian guests)", quantity: "3", unitCost: 0.00 },
    ],
  },
  {
    name: "Kohlrabi and Radish Salad",
    description: "Crisp kohlrabi and watermelon radish tossed with chili crunch, Chinkiang vinegar, and grated garlic — vibrant, crunchy, and served family-style.",
    recipe: "Mandoline kohlrabi and radish thin. Toss x4: 250g kohlrabi, 275g radish, 2 tbsp chili crunch, 2 tbsp Chinkiang vinegar, 3 cloves grated garlic, salt. Mound on white rectangle plates.",
    prep: "Slice kohlrabi and radish AM of event. Mix and dress just before service.",
    service: "3 large white rectangle plates family-style. Tongs for each.",
    flatware: "Tongs (3).",
    category: "side",
    ingredients: [
      { name: "Kohlrabi", quantity: "10", unit: "each", unitCost: 15.00 },
      { name: "Watermelon radish", quantity: "10", unit: "each", unitCost: 12.00 },
      { name: "Chili crunch", quantity: "4", unit: "tbsp", unitCost: 4.00 },
      { name: "Chinkiang vinegar", quantity: "4", unit: "tbsp", unitCost: 2.00 },
      { name: "Garlic", quantity: "6", unit: "cloves", unitCost: 0.75 },
    ],
    supplies: [
      { name: "White rectangle plates (large, 3)", quantity: "3", unitCost: 0.00 },
      { name: "Tongs (3)", quantity: "3", unitCost: 0.00 },
      { name: "Mandolin", quantity: "1", unitCost: 0.00 },
    ],
  },
  {
    name: "Accoutrements",
    description: "A family-style spread of condiments and garnishes — chili oil, scallions, cucumbers, pickled mustard greens, ginger, and crispy shallots — to accompany the jook.",
    recipe: "Prepare all condiments and arrange in small sauce dishes for the table.",
    prep: "Prep all AM of event. Slice cucumbers, mince scallions, prep ginger matchsticks. Fill sauce dishes.",
    service: "Arrange in 4–5 sauce dishes family-style on each table.",
    flatware: "Demi-tasse spoons (4).",
    category: "side",
    ingredients: [
      { name: "Chili oil (Jenny's recipe / store)", quantity: "1", unit: "cup", unitCost: 5.00 },
      { name: "Scallions", quantity: "2", unit: "bunches", unitCost: 3.00 },
      { name: "Kirby cucumbers (diced)", quantity: "3", unit: "each", unitCost: 3.00 },
      { name: "Pickled mustard greens", quantity: "0.5", unit: "cup", unitCost: 2.50 },
      { name: "Fresh ginger (matchsticks)", quantity: "3", unit: "oz", unitCost: 1.50 },
      { name: "Crispy shallots", quantity: "1", unit: "cup", unitCost: 4.00 },
    ],
    supplies: [
      { name: "Sauce dishes / demi-tasse bowls (5 sets)", quantity: "5", unitCost: 0.00 },
      { name: "Demi-tasse spoons (4)", quantity: "4", unitCost: 0.00 },
      { name: "Tongs (2)", quantity: "2", unitCost: 0.00 },
    ],
  },
  {
    name: "Yuzu Key Lime Pie",
    description: "Bright yuzu–key lime custard in a fortune cookie crust, topped with coconut whipped cream and a drizzle of jujube–date syrup.",
    recipe: "Crust: crush 1.5 cups fortune cookies (80 cookies) with 6 tbsp butter; press and bake. Filling: whisk 28 oz condensed milk, 8 egg yolks, 1.25 cups key lime juice; bake at 325°F 20 min. Chill overnight.",
    prep: "Make crust and filling day before. Chill overnight. Whip cream and make syrup day of.",
    service: "Cut into diamonds. Plate on white rectangle plates family-style.",
    flatware: "Small white plate, small dessert fork.",
    category: "dessert",
    ingredients: [
      { name: "Key lime juice (4 bags, ~0.5 cup each)", quantity: "4", unit: "each", unitCost: 5.00 },
      { name: "Sweetened condensed milk", quantity: "56", unit: "oz", unitCost: 8.00 },
      { name: "Eggs (yolks only)", quantity: "16", unit: "each", unitCost: 5.00 },
      { name: "Fortune cookies (5 bags)", quantity: "5", unit: "each", unitCost: 20.00 },
      { name: "Unsalted butter", quantity: "12", unit: "tbsp", unitCost: 3.00 },
      { name: "Coconut cream (canned)", quantity: "2", unit: "each", unitCost: 5.00 },
      { name: "Powdered sugar", quantity: "1", unit: "cup", unitCost: 1.50 },
      { name: "Limes (zest)", quantity: "6", unit: "each", unitCost: 3.00 },
      { name: "Jujube / goji berry / date syrup", quantity: "0.5", unit: "cup", unitCost: 4.00 },
    ],
    supplies: [
      { name: "Pie pans (9\", 2)", quantity: "2", unitCost: 0.00 },
      { name: "Piping bags", quantity: "3", unitCost: 1.50 },
      { name: "Microplane", quantity: "1", unitCost: 0.00 },
      { name: "White rectangle plates (family-style)", quantity: "3", unitCost: 0.00 },
    ],
  },
  {
    name: "Fruit Platter",
    description: "Seasonal fruit — oranges, persimmons, and grapes — washed and cut, served family-style.",
    recipe: "Wash and cut fruit. Arrange on large bowls.",
    prep: "Cut day of.",
    service: "2 large bowls, family-style. Tongs.",
    flatware: "Tongs (2).",
    category: "dessert",
    ingredients: [
      { name: "Oranges", quantity: "6", unit: "each", unitCost: 6.00 },
      { name: "Persimmons", quantity: "4", unit: "each", unitCost: 8.00 },
      { name: "Grapes", quantity: "2", unit: "lb", unitCost: 8.00 },
    ],
    supplies: [
      { name: "Large serving bowls (2)", quantity: "2", unitCost: 0.00 },
      { name: "Tongs (2)", quantity: "2", unitCost: 0.00 },
    ],
  },
  {
    name: "Wok Crispy Treats",
    description: "Vegan wok-style crispy rice treats made with vegan marshmallows, cut into squares and served family-style.",
    recipe: "Melt vegan marshmallows in wok with a touch of oil. Stir in rice crispies. Press into pan, cool, cut into squares.",
    prep: "Make AM of event.",
    service: "2 platters, family-style.",
    flatware: "Tongs (2).",
    category: "dessert",
    ingredients: [
      { name: "Rice Krispies cereal", quantity: "6", unit: "cup", unitCost: 5.00 },
      { name: "Vegan marshmallows", quantity: "10", unit: "oz", unitCost: 6.00 },
      { name: "Neutral oil", quantity: "1", unit: "tbsp", unitCost: 0.25 },
    ],
    supplies: [
      { name: "Wok / large pan", quantity: "1", unitCost: 0.00 },
      { name: "Large white platters (2)", quantity: "2", unitCost: 0.00 },
      { name: "Tongs (2)", quantity: "2", unitCost: 0.00 },
    ],
  },
  {
    name: "Tea — Grand Tea Imports",
    description: "Premium loose-leaf teas from Grand Tea Imports served hot, family-style for the table.",
    recipe: "Steep selected teas per package instructions. Serve in teapots.",
    prep: "Boil water and steep teas just before service.",
    service: "Serve in teapots on the table.",
    flatware: "Teacups, teaspoons.",
    category: "beverage",
    ingredients: [],
    supplies: [
      { name: "Grand Tea Imports tea selection", quantity: "1", unitCost: 0.00 },
      { name: "Teapots", quantity: "2", unitCost: 0.00 },
      { name: "Teacups (1 pp)", quantity: "20", unitCost: 0.00 },
    ],
  },
];

async function seed() {
  console.log("Checking existing dishes...");

  const snap = await getDocs(collection(db, "dishes"));
  const existingNames = new Set(snap.docs.map((d) => (d.data() as { name: string }).name));
  console.log(`Found ${existingNames.size} existing dishes: ${[...existingNames].join(", ")}`);

  let added = 0;
  let skipped = 0;

  for (const dish of dishes) {
    if (existingNames.has(dish.name)) {
      console.log(`  SKIP: ${dish.name}`);
      skipped++;
      continue;
    }
    const id = await nextId("dishes");
    await setDoc(doc(db, "dishes", String(id)), {
      id,
      ...dish,
      createdAt: new Date().toISOString(),
    });
    console.log(`  ADD: ${dish.name} (id=${id})`);
    added++;
  }

  console.log(`\nDone! Added ${added} dishes, skipped ${skipped}.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
