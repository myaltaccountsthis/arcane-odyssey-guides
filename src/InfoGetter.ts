import { Order, StatOrder, NUM_STATS, BaseArmor, Armor, getNormalizedStats } from './Backend';

let initialized = false;

let enchantMax = 0;
let jewelMax = 0;
let modifierMax = 0;
const Armors: Armor[][] = [[], [], [], [], []];
const Enchants: BaseArmor[] = [];
const Jewels: BaseArmor[] = [];
const Modifiers: BaseArmor[] = [];
const enchantMaxStats = Array(NUM_STATS).fill(0);
const jewelMaxStats = Array(NUM_STATS).fill(0);
const modifierMaxStats = Array(NUM_STATS).fill(0);

export async function getInfo(armorUrl: string) {
  if (!initialized) {
    await loadInfo(armorUrl);
  }

  return {
    Armors: Armors,
    Enchants: Enchants,
    Jewels: Jewels,
    Modifiers: Modifiers,
    enchantMax: enchantMax,
    jewelMax: jewelMax,
    modifierMax: modifierMax,
    enchantMaxStats: enchantMaxStats,
    jewelMaxStats: jewelMaxStats,
    modifierMaxStats: modifierMaxStats
  }
}

// Load data from info file into Armors. Must be called before solve()
async function loadInfo(armorUrl: string) {
  const info = await fetch(armorUrl).then((response) =>
    response.json()
  );
  for (const line of info) {
    const words = line.split(" ");
    const category = words[0];
    const name = words[1].replaceAll("_", " ");
    // Stats contains all tokens
    const stats = new Array(StatOrder.length).fill(0);
    let jewels = 0;
    let canMod = false;
    const attributes: string[] = [];
    for (let i = 2; i < words.length; i++) {
      const entry = words[i].split(":");
      const stat = entry[0];
      const val = parseInt(entry[1]);
      if (stat == "jewels") {
        jewels = val;
        continue;
      }
      if (stat == "modifier") {
        canMod = true;
        continue;
      }
      if (stat == "exotic" || stat == "amulet" || stat == "sunken") {
        attributes.push(stat);
        continue;
      }
      stats[StatOrder.indexOf(stat)] = val;
    }

    if (category == "Jewel") {
      const jewel = new BaseArmor(name, stats);
      jewel.attributes = attributes;
      Jewels.push(jewel);
      jewelMax = Math.max(jewelMax, getNormalizedStats(stats));
      for (let i = 0; i < NUM_STATS; i++)
        jewelMaxStats[i] = Math.max(jewelMaxStats[i], stats[i]);
    }
    else if (category == "Enchant") {
      const enchant = new BaseArmor(name, stats);
      enchant.attributes = attributes;
      Enchants.push(enchant);
      enchantMax = Math.max(enchantMax, getNormalizedStats(stats));
      for (let i = 0; i < NUM_STATS; i++)
        enchantMaxStats[i] = Math.max(enchantMaxStats[i], stats[i]);
    }
    else if (category == "Modifier") {
      const modifier = new BaseArmor(name, stats);
      modifier.attributes = attributes;
      Modifiers.push(modifier);
      if (name != "Atlantean") {
        modifierMax = Math.max(modifierMax, getNormalizedStats(stats));
        for (let i = 0; i < NUM_STATS; i++)
          modifierMaxStats[i] = Math.max(modifierMaxStats[i], stats[i]);
      }
    }
    else {
      const index = Order.indexOf(category);
      const armor = new Armor(name, stats, jewels, canMod);
      armor.attributes = attributes;
      Armors[index].push(armor);
    }
  }

  initialized = true;
}