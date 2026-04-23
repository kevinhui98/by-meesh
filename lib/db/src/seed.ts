import { db } from "./index";
import { dishesTable, eventRequestsTable } from "./schema";

async function seed() {
  console.log("Seeding database...");

  // Seed dishes
  const dishes = [
    {
      name: "Roasted Beet & Burrata Salad",
      description: "Earthy beets roasted with thyme, paired with creamy burrata and a citrus-herb vinaigrette.",
      recipe: "Roast beets at 400°F for 45 min wrapped in foil. Cool, peel, slice. Plate with torn burrata, micro herbs, citrus vinaigrette.",
      prep: "Beets can be roasted up to 2 days ahead. Dress just before service.",
      service: "Serve at room temperature. Plate to order.",
      flatware: "Salad fork and small knife.",
      category: "appetizer",
      ingredients: [
        { name: "Beets (red)", quantity: "2", unit: "lbs", unitCost: 3.50 },
        { name: "Burrata", quantity: "1", unit: "lb", unitCost: 12.00 },
        { name: "Micro herbs", quantity: "1", unit: "oz", unitCost: 4.00 },
        { name: "Olive oil", quantity: "0.25", unit: "cup", unitCost: 1.50 },
        { name: "Lemon", quantity: "2", unit: "each", unitCost: 0.80 },
      ],
      supplies: [
        { name: "Foil", quantity: "1", unitCost: 0.50 },
        { name: "Salad bowls (8oz)", quantity: "1", unitCost: 2.00 },
      ],
    },
    {
      name: "Pan-Seared Duck Breast",
      description: "French-style magret duck breast with cherry gastrique and wild mushroom risotto.",
      recipe: "Score skin, season generously. Sear skin-down in cold pan, render 10 min. Flip, roast at 375°F for 8 min. Rest 5 min. Slice on bias.",
      prep: "Score and season duck day before. Prepare gastrique up to 3 days ahead.",
      service: "Serve medium-rare. Slice to order, fan on risotto, sauce to order.",
      flatware: "Dinner fork, steak knife.",
      category: "main",
      ingredients: [
        { name: "Duck breast (magret)", quantity: "1", unit: "lb", unitCost: 18.00 },
        { name: "Fresh cherries", quantity: "0.5", unit: "lb", unitCost: 5.00 },
        { name: "Red wine vinegar", quantity: "0.25", unit: "cup", unitCost: 1.00 },
        { name: "Arborio rice", quantity: "0.5", unit: "lb", unitCost: 3.00 },
        { name: "Wild mushrooms", quantity: "0.5", unit: "lb", unitCost: 8.00 },
        { name: "Shallots", quantity: "3", unit: "each", unitCost: 1.50 },
        { name: "Chicken stock", quantity: "2", unit: "qt", unitCost: 4.00 },
        { name: "Parmesan", quantity: "2", unit: "oz", unitCost: 3.00 },
      ],
      supplies: [
        { name: "Cast iron pan (12\")", quantity: "1", unitCost: 0.00 },
        { name: "Serving plates (10\")", quantity: "1", unitCost: 3.00 },
      ],
    },
    {
      name: "Whipped Ricotta Crostini",
      description: "House-whipped ricotta on toasted sourdough with honey, walnuts, and fresh thyme.",
      recipe: "Whip ricotta with olive oil and lemon zest until fluffy. Toast crostini. Top with ricotta, drizzle honey, add walnuts and thyme.",
      prep: "Whip ricotta day of event. Toast crostini up to 2 hours ahead.",
      service: "Pass butler-style or arrange on platters. Keep at room temp.",
      flatware: "Cocktail napkins only.",
      category: "appetizer",
      ingredients: [
        { name: "Whole milk ricotta", quantity: "1", unit: "lb", unitCost: 6.00 },
        { name: "Sourdough baguette", quantity: "2", unit: "each", unitCost: 5.00 },
        { name: "Raw honey", quantity: "3", unit: "tbsp", unitCost: 2.00 },
        { name: "Walnuts (toasted)", quantity: "0.5", unit: "cup", unitCost: 3.00 },
        { name: "Fresh thyme", quantity: "4", unit: "sprigs", unitCost: 1.00 },
        { name: "Olive oil", quantity: "2", unit: "tbsp", unitCost: 0.50 },
      ],
      supplies: [
        { name: "Wooden serving boards", quantity: "2", unitCost: 0.00 },
      ],
    },
    {
      name: "Charred Romanesco",
      description: "Wood-roasted romanesco cauliflower with preserved lemon yogurt and dukkah.",
      recipe: "Cut romanesco into florets. Toss with oil, salt. Roast at 450°F until charred edges, ~20-25 min. Plate on yogurt, top with dukkah.",
      prep: "Make dukkah and yogurt day before. Roast romanesco to order or reheat quickly.",
      service: "Serve warm on yogurt. Finish with lemon zest.",
      flatware: "Salad fork or small spoon.",
      category: "side",
      ingredients: [
        { name: "Romanesco", quantity: "2", unit: "heads", unitCost: 8.00 },
        { name: "Greek yogurt", quantity: "1", unit: "cup", unitCost: 3.00 },
        { name: "Preserved lemon", quantity: "2", unit: "tbsp", unitCost: 2.00 },
        { name: "Dukkah mix", quantity: "3", unit: "tbsp", unitCost: 4.00 },
      ],
      supplies: [
        { name: "Serving bowls (6oz)", quantity: "1", unitCost: 1.50 },
      ],
    },
    {
      name: "Brown Butter Olive Oil Cake",
      description: "Moist single-layer cake with brown butter and citrus, served with crème fraîche.",
      recipe: "Brown butter, cool. Whisk with eggs, sugar, citrus zest. Fold in flour. Bake at 325°F for 35 min. Dust with powdered sugar.",
      prep: "Bake day before. Wrap tightly. Slice and plate day of.",
      service: "Serve at room temp with a quenelle of crème fraîche.",
      flatware: "Dessert fork.",
      category: "dessert",
      ingredients: [
        { name: "Unsalted butter", quantity: "1", unit: "cup", unitCost: 4.00 },
        { name: "Eggs", quantity: "4", unit: "each", unitCost: 2.00 },
        { name: "All-purpose flour", quantity: "2", unit: "cups", unitCost: 1.50 },
        { name: "Sugar", quantity: "1.5", unit: "cups", unitCost: 2.00 },
        { name: "Orange zest", quantity: "2", unit: "each", unitCost: 1.00 },
        { name: "Crème fraîche", quantity: "1", unit: "cup", unitCost: 6.00 },
      ],
      supplies: [
        { name: "9\" cake pan", quantity: "1", unitCost: 0.00 },
        { name: "Dessert plates", quantity: "1", unitCost: 2.00 },
      ],
    },
    {
      name: "Herb-Crusted Rack of Lamb",
      description: "French-trimmed rack of lamb with persillade crust, finished with a rosemary jus.",
      recipe: "French-trim rack. Season and sear all sides. Coat with persillade (parsley, garlic, breadcrumbs, olive oil). Roast at 400°F for 15-20 min for medium-rare.",
      prep: "Trim and sear day of. Persillade can be made day before.",
      service: "Rest 10 min before carving. Cut into single chops, arrange 2-3 per plate.",
      flatware: "Dinner fork and dinner knife.",
      category: "main",
      ingredients: [
        { name: "Rack of lamb (2 racks)", quantity: "2", unit: "each", unitCost: 45.00 },
        { name: "Flat-leaf parsley", quantity: "1", unit: "bunch", unitCost: 2.00 },
        { name: "Garlic", quantity: "4", unit: "cloves", unitCost: 0.50 },
        { name: "Breadcrumbs (panko)", quantity: "0.5", unit: "cup", unitCost: 1.00 },
        { name: "Dijon mustard", quantity: "3", unit: "tbsp", unitCost: 1.50 },
        { name: "Lamb jus (or stock)", quantity: "1", unit: "cup", unitCost: 5.00 },
        { name: "Fresh rosemary", quantity: "4", unit: "sprigs", unitCost: 1.00 },
      ],
      supplies: [
        { name: "Roasting pan with rack", quantity: "1", unitCost: 0.00 },
        { name: "Serving plates (12\")", quantity: "1", unitCost: 3.50 },
      ],
    },
  ];

  for (const dish of dishes) {
    await db.insert(dishesTable).values(dish).onConflictDoNothing();
  }

  // Seed some sample event requests
  const events = [
    {
      clientName: "Sarah Chen",
      clientEmail: "sarah.chen@example.com",
      eventDate: "2026-05-15",
      guestCount: 24,
      eventType: "Corporate Dinner",
      restrictions: "Two guests are vegetarian, one is gluten-free.",
      notes: "Evening networking dinner. Elegant but approachable.",
      status: "in_progress" as const,
    },
    {
      clientName: "Marcus & Diane Webb",
      clientEmail: "webbs@example.com",
      eventDate: "2026-06-07",
      guestCount: 40,
      eventType: "Wedding",
      restrictions: "No shellfish — guest allergy.",
      notes: "Intimate garden wedding. Cocktail reception followed by seated dinner.",
      status: "confirmed" as const,
    },
    {
      clientName: "Alex Reyes",
      clientEmail: "alex.reyes@example.com",
      eventDate: "2026-05-28",
      guestCount: 12,
      eventType: "Birthday Celebration",
      restrictions: null,
      notes: "Surprise 40th birthday dinner. Guest loves French cuisine.",
      status: "new" as const,
    },
  ];

  for (const event of events) {
    await db.insert(eventRequestsTable).values(event).onConflictDoNothing();
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
