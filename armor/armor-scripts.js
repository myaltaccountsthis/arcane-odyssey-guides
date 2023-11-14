// For Armor.html

// Config
let MODE_BONUS = .2;
let decimalPlaces = 3;
// Unlike python script, these range from [0, 1]
const weights = [1, 1, .25, .5, .5, .4, 0, 0, 0];
const minStats = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let vit = 0;
let insanity = 3;
let warding = 4;
let drawback = 0;
let includeSecondary = true;
let useSunken = true;
let useAmulet = true;
let nonZero = true;
let logEnabled = true;

function getPowerWeight() {
  return weights[0];
}
function getDefenseWeight() {
  return weights[1];
}
function getSizeWeight() {
  return weights[2];
}
function getIntensityWeight() {
  return weights[3];
}
function getSpeedWeight() {
  return weights[4];
}
function getAgilityWeight() {
  return weights[5];
}

// Custom set (hashmap implementation)

class Entry {
  constructor(key) {
    this.key = key;
    this.next = null;
  }
}

class CustomSet {
  constructor(hashFunction = build => build.hash, equalsFunction = (a, b) => a.equals(b)) {
    this.hashFunction = hashFunction;
    this.equalsFunction = equalsFunction;
    // we are dealing with hundreds of thousands of builds
    this.clear();
  }

  hash(key) {
    return this.hashFunction(key) % this.entries.length;
  }

  add(key) {
    const hash = this.hashFunction(key);
    let entry = this.entries[hash];
    if (entry == null) {
      this.entries[hash] = new Entry(key);
    }
    else {
      while (entry.next != null && !this.equalsFunction(entry.key, key)) {
        entry = entry.next;
      }
      if (this.equalsFunction(entry.key, key)) {
        return false;
      }
      entry.next = new Entry(key);
    }
    this.size++;
    return true;
  }

  addAll(arr) {
    for (const key of arr) {
      this.add(key);
    }
  }

  contains(key) {
    const hash = this.hashFunction(key);
    let entry = this.entries[hash];
    while (entry != null) {
      if (this.equalsFunction(entry.key, key)) {
        return true;
      }
      entry = entry.next;
    }
    return false;
  }

  remove(key) {
    const hash = this.hashFunction(key);
    let entry = this.entries[hash];
    if (entry == null) {
      return false;
    }
    if (this.equalsFunction(entry.key, key)) {
      this.entries[hash] = entry.next;
    }
    else {
      while (entry.next != null && !this.equalsFunction(entry.next.key, key)) {
        entry = entry.next;
      }
      if (entry.next == null) {
        return false;
      }
      entry.next = entry.next.next;
    }
    this.size--;
    return true;
  }

  clear() {
    this.entries = new Array(1000);
    this.size = 0;
  }

  toList() {
    const list = [];
    for (const i in this.entries) {
      let entry = this.entries[i];
      while (entry != null) {
        list.push(entry.key);
        entry = entry.next;
      }
    }
    return list;
  }
}

// Data.py
const MAX_LEVEL = 125;
const BASE_HEALTH = 100 + 7 * (MAX_LEVEL - 1);
const BASE_ATTACK = 20 + (MAX_LEVEL - 1);
const HEALTH_PER_VIT = 4;

// Stat order: power defense size intensity speed agility

// Tracking
let calls = 0;

class Armor {
  constructor(name, stats, jewelSlots, canMod = false) {
    this.name = name;
    this.stats = stats;
    this.jewelSlots = jewelSlots;
    this.canMod = canMod;
    this.nonZeroStats = stats.map((val, i) => i).filter(i => stats[i] > 0);
  }
}
Armor.prototype.toString = function() {
  return this.name;
}

class MainArmor extends Armor {
  constructor(name, stats, jewelSlots, canMod = false, enchant = undefined, jewels = [undefined, undefined], modifier = undefined) {
    super(name, stats, jewelSlots, canMod);
    this.enchant = enchant;
    this.jewels = jewels;
    this.modifier = modifier;
  }

  getTotalStats() {
    const stats = this.stats.slice();
    if (this.enchant != undefined) {
      for (const i of this.enchant.nonZeroStats)
        stats[i] += this.enchant.stats[i];
    }
    for (const jewel of this.jewels) {
      if (jewel != undefined) {
        for (const i of jewel.nonZeroStats)
          stats[i] += jewel.stats[i];
      }
    }
    if (this.modifier != undefined) {
      if (this.modifier.name == "Atlantean") {
        let i = 0;
        for (; i < 6; i++) {
          if (stats[i] == 0)
            break;
        }
        i %= 6;
        stats[i] += this.modifier.stats[i];
        stats[6] += this.modifier.stats[6];
      }
      else {
        for (const i of this.modifier.nonZeroStats)
          stats[i] += this.modifier.stats[i];
      }
    }
    return stats;
  }
}

class Build {
  constructor(armorList = [], vit = 0) {
    this.armorList = armorList;
    this.stats = calculateStats(armorList);
    this.vit = vit;
    this.jewelSlots = armorList.reduce((sum, armor) => sum + armor.jewelSlots, 0);
    this.hash = getHash(this.stats);
    // this.statCode = getStatCode(stats);
    this.multiplier = getMult(this) + (enchantMax * this.enchantsLeft() + jewelMax * this.jewelsLeft() + modifierMax * this.modifiersLeft()) / (BASE_ATTACK / 2 + BASE_HEALTH / Ratio[1] / 2);
  }
  
  value() {
    return this.multiplier;
  }

  compare(other) {
    return this.multiplier - other.multiplier;
  }

  equals(other) {
    calls++;
    // return this.statCode === other.statCode;
    for (let i in this.stats) {
      if (this.stats[i] != other.stats[i])
        return false;
    }
    return true;
  }

  // Stat functions
  power() {
    return this.stats[0];
  }
  defense() {
    return this.stats[1];
  }
  size() {
    return this.stats[2];
  }
  intensity() {
    return this.stats[3];
  }
  speed() {
    return this.stats[4];
  }
  agility() {
    return this.stats[5];
  }
  insanity() {
    return this.stats[6];
  }
  warding() {
    return this.stats[7];
  }
  drawback() {
    return this.stats[8];
  }

  numEnchants() {
    return this.armorList.reduce((sum, armor) => sum + (armor.enchant != undefined), 0);
  }
  numJewels() {
    return this.armorList.reduce((sum, armor) => sum + (armor.jewels.filter(jewel => jewel != undefined).length), 0);
  }
  numModifiers() {
    return this.armorList.reduce((sum, armor) => sum + (armor.modifier != undefined), 0);
  }

  enchantsLeft() {
    return 5 - this.numEnchants();
  }
  jewelsLeft() {
    return this.jewelSlots - this.numJewels();
  }
  modifiersLeft() {
    return this.armorList.map(armor => armor.canMod && armor.modifier == undefined).reduce((sum, val) => sum + val, 0);
  }

  getEnchants() {
    const enchants = new Array(Armors[4].length).fill(0);
    for (const armor of this.armorList) {
      if (armor.enchant != undefined)
        enchants[Armors[4].indexOf(armor.enchant)]++;
    }
    return enchants;
  }

  getJewels() {
    const jewels = new Array(Armors[6].length).fill(0);
    for (const armor of this.armorList) {
      for (const jewel of armor.jewels) {
        if (jewel != undefined)
          jewels[Armors[6].indexOf(jewel)]++;
      }
    }
    return jewels;
  }

  isValid() {
    if (this.numEnchants() == 5 && this.numJewels() == this.jewelSlots)
      return this.stats.every((val, i) => val >= minStats[i]);
    return getExtraStats(this) >= -.05;
  }

  // HTML incorporation
  // value is from (1.7, 2.7)
  multiplierColorStr() {
    return getMultiplierColorStr(this.multiplier);
  }

  asHTML() {
    return `
      <div class="list-element">
        <div title="Multiplier of all stats, scales with weight">Multiplier: <span style="color: ${this.multiplierColorStr()}">${getFormattedMultiplierStr(this.multiplier)}</span></div>
        ${`<div title="Multiplier from power and defense">Base Multiplier: <span style="color: ${getMultiplierColorStr(getBaseMult(this))}">${getFormattedMultiplierStr(getBaseMult(this))}</span></div>`}
        <div title="Total stats, normalized to power">Power Equivalence: <span style="color: ${getMultiplierColorStr(getPowerEquivalence(this) / 80)}">${getFormattedMultiplierStr(getPowerEquivalence(this), 2)}</span></div>
        <div>${StatOrder.map(stat => nonZero && this[stat]() == 0 ? `` : `<span class="${stat}">${this[stat]()}</span><img class="icon" src="./armor/${stat}_icon.png">`).join(" ")}</div>
        <div class="br-small"></div>
        <table>
          <th>Armor</th>
          ${this.armorList.map(armor => {
            const armorName = armor.toString().replaceAll("_", " ");
            return `<tr><td class="${armorName.split(" ")[0].toLowerCase()}">${armor.modifier != undefined ? armor.modifier + " " : ""}${armor.enchant} ${armorName}</td></tr>`;
          }).join("")}
        </table>
        <div class="br-small"></div>
        <div>Jewels: ${this.armorList.map((armor) => armor.jewels.map((i) => i).join(" ")).join(", ")}</div>
      </div>
    `;
  }
}
Build.prototype.toString = function() {
  let output = `Multiplier: ${(Math.round(this.multiplier * 10000) / 10000)}\nBonus Stats: ${this.stats.join("/")}\nArmor: ${this.armorList.join(" ")}`;
  output += `\nEnchants: ${this.enchants.join('/')}`;
  return output;
}

function getHash(stats) {
  let num = 0;
  for (let i in stats) {
    // multiply by a prime number to avoid collisions
    num *= 181;
    num += stats[i];
  }
  return num;
}

// Return a BigInt that represents the build's stats
function getStatCode(stats) {
  return stats.reduce((acc, val, i) => acc * absMaxStats[i] + BigInt(val), 0n);
}

function getMultiplierColorStr(mult) {
  return `hsl(${(mult - 2) * 75}, 100%, 40%)`;
}

function getFormattedMultiplierStr(mult, decimals = decimalPlaces) {
  const tens = 10 ** decimals;
  return `${Math.floor(mult)}.${(Math.floor(mult * tens) % tens).toString().padStart(decimals, "0")}`;
}

// pow/def, vit multiplier without weight
function getBaseMult(build, useWeight = false) {
  return ((build.vit * HEALTH_PER_VIT + build.stats[1]) / BASE_HEALTH * (useWeight ? getDefenseWeight() : 1) + 1) * ((-build.vit / (MAX_LEVEL * 2) * .5 + build.stats[0] / BASE_ATTACK) * (useWeight ? getPowerWeight() : 1) + 1);
}

// Returns modified multiplier affected by weight
function getMult(build) {
  // const mult = (BASE_HEALTH * (1 + build.vit / (MAX_LEVEL * 2) * 1.1) + build.stats[1]) * getDefenseWeight() / BASE_HEALTH * (BASE_ATTACK + build.stats[0] * (1 - build.vit / (MAX_LEVEL * 2) * .5)) * getPowerWeight() / BASE_ATTACK;
  const mult = getBaseMult(build, true);
  if (includeSecondary)
    return mult * otherMult(build);
  return mult;
}

// secondary stats multiplier
function otherMult(build) {
  const modeMultiplier = 1 / (1 / MODE_BONUS + 1);
  return ((estimateMultComplex(build.stats[2]) - 1) * getSizeWeight() * 4/7 + 1) * ((1 + estimateMultComplex(build.stats[3]) * getIntensityWeight() * modeMultiplier) / (1 + getIntensityWeight() * modeMultiplier)) * ((estimateMultComplex(build.stats[4]) - 1) * getSpeedWeight() * 4/7 + 1) * ((estimateMultComplex(build.stats[5]) - 1) * getAgilityWeight() * 4/7 + 1);
}

// estimate effect of secondary stats (bc non-linear)
function estimateMultComplex(stat) {
  // return Math.pow(.01194 * Math.pow(stat, 1.188) + 1, .3415) + .06195 * Math.pow(stat, .2992) - .0893 * Math.log(stat + 1) / Math.log(30);
  return 2.02197 * Math.pow(stat + 22.5647, -.22586) + .0316989 * Math.pow(stat, .733205);
}

// Estimates the number of stats (translated to power) left after subtracting minimum stats
function getExtraStats(build) {
  let statsLeft = 0;
  const enchantsLeft = build.enchantsLeft();
  const jewelsLeft = build.jewelsLeft();
  const modifiersLeft = build.modifiersLeft();

  const painites = Math.min(drawback - build.drawback(), jewelsLeft);
  const virtuous = warding - build.warding();
  
  statsLeft += virtuous * 54 / Ratio[1] + (enchantsLeft - virtuous) * enchantMax;
  statsLeft += painites * 125 / Ratio[1] + (jewelsLeft - painites) * jewelMax;
  
  for (const i in build.stats) {
    if (!includeSecondary && i >= 2)
      continue;
    if (i == 1) {
      if (drawback > 0) {
        if (minStats[i] - build.stats[i] > enchantsLeft * enchantMaxStats[i] + painites * 125 + (jewelsLeft - painites) * jewelMaxStats[i] + modifiersLeft * modifierMaxStats[i])
          return -1;
      }
      else if (warding > 0 && minStats[i] - build.stats[i] > virtuous * 54 + (enchantsLeft - virtuous) * enchantMaxStats[i] + jewelsLeft * jewelMaxStats[i] + modifiersLeft * modifierMaxStats[i])
        return -1;
    }
    else if (minStats[i] - build.stats[i] > enchantsLeft * enchantMaxStats[i] + jewelsLeft * jewelMaxStats[i] + modifiersLeft * modifierMaxStats[i])
      return -1;
    statsLeft -= Math.max((minStats[i] - build.stats[i]), 0) * Ratio[0] / Ratio[i];
  }
  return statsLeft;
}

// Returns the total number of stats, normalized to power, in the build 
function getPowerEquivalence(build) {
  return build.stats.reduce((acc, val, i) => acc + val / Ratio[i], 0) * Ratio[0];
}

// Solver.py
const Order = ["Amulet", "Accessory", "Boots", "Chestplate", "Enchant", "Helmet", "Jewel", "Modifier"];
const StatOrder = ["power", "defense", "size", "intensity", "speed", "agility", "insanity", "warding", "drawback"];
const MainStats = StatOrder.slice(0, 6);
const Ratio = [1, 9, 3, 3, 3, 3, 1, 1, 1];
let Armors;
let enchantMax;
let jewelMax;
let modifierMax;
const enchantMaxStats = [0, 0, 0, 0, 0, 0];
const jewelMaxStats = [0, 0, 0, 0, 0, 0];
const modifierMaxStats = [0, 0, 0, 0, 0, 0];

const BUILD_SIZE = 100;
const ARMOR_SIZE = 500;

let defaultSettings;

// Combinations: [[number]], index: enchant index, arr, remaining: number
// Should be called only once
function calculateCombinationsHelper(combinations, numTypes, index, arr, remaining) {
  if (index === numTypes) {
    combinations.push(arr.slice());
    return;
  }
  if (index === numTypes - 1) {
    arr[index] = remaining;
    combinations.push(arr.slice());
    return;
  }
  for (let i = 0; i <= remaining; i++) {
    arr[index] = i;
    calculateCombinationsHelper(combinations, numTypes, index + 1, arr, remaining - i);
    // no need to set arr[index] to 0 because subsequent calls will overwrite it
  }
}

// Returns an array of Armor objects where the stats are the number of enchants
function calculateCombinations(numTypes, slots, forceLength = 6) {
  const combinations = [];
  calculateCombinationsHelper(combinations, numTypes, 0, [], slots);
  return combinations.map(arr => arr.concat(Array(forceLength - numTypes).fill(0))).map(stats => new Armor("e", stats));
}

// Load data from info file into Armors. Must be called before solve()
async function getInfo(fileName) {
  Armors = [[], [], [], [], [], [], [], []];
  enchantMax = 0;
  jewelMax = 0;
  modifierMax = 0;
  const info = await fetch("./armor/" + fileName).then(response => response.json());
  for (const line of info) {
    const words = line.split(" ");
    const category = words[0];
    const name = words[1];
    const stats = new Array(StatOrder.length).fill(0);
    let jewels = 0;
    let canMod = false;
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
      }
      stats[StatOrder.indexOf(stat)] = val;
    }
    const armor = new Armor(name, stats, jewels, canMod);
    const index = Order.indexOf(category);
    Armors[index].push(armor);
    if (stats[8] > 0)
      continue;
    if (index == Order.indexOf("Jewel")) {
      jewelMax = Math.max(jewelMax, normalizeStats(stats));
      for (let i = 0; i < 6; i++)
        jewelMaxStats[i] = Math.max(jewelMaxStats[i], stats[i]);
    }
    if (index == Order.indexOf("Enchant")) {
      enchantMax = Math.max(enchantMax, normalizeStats(stats));
      for (let i = 0; i < 6; i++)
        enchantMaxStats[i] = Math.max(enchantMaxStats[i], stats[i]);
    }
    if (index == Order.indexOf("Modifier")) {
      modifierMax = Math.max(modifierMax, normalizeStats(stats));
      for (let i = 0; i < 6; i++)
        modifierMaxStats[i] = Math.max(modifierMaxStats[i], stats[i]);
    }
  }
}

// Turn stats into their power equivalent using ratios
function normalizeStats(stats) {
  return stats.map((val, i) => val / Ratio[i]).reduce((acc, val) => acc + val, 0);
}

// Used for making new build objects
function duplicateArmorList(armorList) {
  return armorList.map(armor => new MainArmor(armor.name, armor.stats, armor.jewelSlots, armor.canMod, armor.enchant, armor.jewels.slice(), armor.modifier));
}

// Recalculates all stats, used for atlantean
function calculateStats(armorList) {
  let stats = new Array(StatOrder.length).fill(0);
  for (const armor of armorList) {
    const armorStats = armor.getTotalStats();
    stats = stats.map((val, i) => val + armorStats[i]);
  }
  return stats;
}

// The main function. Returns an array of the top 100 builds
function solve() {
  // tracking vars
  let validArmor = 0, actualArmor = 0, nArmor = 0, dupesArmor = 0, purgesArmor = 0;
  let validModifier = 0, actualModifier = 0, nModifier = 0, dupesModifier = 0, purgesModifier = 0;
  let validEnchant = 0, actualEnchant = 0, nEnchant = 0, dupesEnchant = 0, purgesEnchant = 0;
  let validJewel = 0, actualJewel = 0, nJewel = 0, dupesJewel = 0, purgesJewel = 0;
  calls = 0;
  // let minArmorStats = minStats.map((val, i) => Math.max(val - Armors[4][i].stats[i] * 5 - (useJewels ? Armors[6][i].stats[i] * 10 : 0), 0));
  const armorSet = new CustomSet();
  log(console.time, "solveArmor");
  for (const armor of Armors[3]) {
    if (drawback < 1 && armor.name.startsWith("Vatrachos"))
      continue;
    if (!useSunken && armor.name.startsWith("Sunken"))
      continue;

    for (const boot of Armors[2]) {
      if (drawback < 1 && boot.name.startsWith("Vatrachos"))
        continue;
      if (!useSunken && boot.name.startsWith("Sunken"))
        continue;

      for (let i = 0; i < Armors[1].length; i++) {
        const accessory1 = Armors[1][i];
        // Make accessory2 array (helmets)
        const helmets = Armors[5].filter(helmet => (useSunken || !helmet.name.startsWith("Sunken")) && (drawback >= 1 || !helmet.name.startsWith("Vatrachos")));
        const length = helmets.length;
        const accessories2 = helmets.concat(Armors[1].slice(i + 1));

        for (let j = 0; j < accessories2.length; j++) {
          const accessory2 = accessories2[j];
          // Make accessory3 array (amulets)
          // If accessory2 is a helmet (j < length), allow only other accessories, otherwise allow accessories after j
          const accessories3 = (j < length ? accessories2.slice(length) : accessories2.slice(j + 1)).concat(useAmulet ? Armors[0] : []);

          for (const accessory3 of accessories3) {
            const armorList = [armor, boot, accessory1, accessory2, accessory3].map(armor => new MainArmor(armor.name, armor.stats, armor.jewelSlots, armor.canMod));
            const armorStats = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            for (const item of armorList) {
              for (const k of item.nonZeroStats)
                armorStats[k] += item.stats[k];
            }
            if (armorStats[8] > drawback)
              continue;
            const build = new Build(armorList, vit, armorStats);
            nArmor++;
            if (build.isValid()) {
              validArmor++;
              if (armorSet.add(build)) {
                actualArmor++;
              }
              else {
                dupesArmor++;
              }
              if (armorSet.size > ARMOR_SIZE * 10) {
                const armorArr = purge(armorSet.toList());
                armorSet.clear();
                armorSet.addAll(armorArr);
                purgesArmor++;
              }
            }
          }
        }
      }
    }
  }
  let builds = purge(armorSet.toList());
  console.log(builds[0]);
  purgesArmor++;
  log(console.timeEnd, "solveArmor");

  const modifierSet = new CustomSet();
  log(console.time, "solveModifier");
  for (let i = 0; i < 5; i++) {
    for (const armorBuild of builds) {
      if (!armorBuild.armorList[i].canMod)
        modifierSet.add(armorBuild);
      for (const j in Armors[7]) {
        const modifier = Armors[7][j];
        if (modifier.name == "Atlantean" && armorBuild.insanity() >= insanity)
          continue;
        if (!armorBuild.armorList[i].canMod && modifier.name != "Atlantean")
          continue;
        const stats = armorBuild.stats.slice();
        for (const k of modifier.nonZeroStats) {
          stats[k] += modifier.stats[k];
        }
        const armorList = duplicateArmorList(armorBuild.armorList);
        armorList[i].modifier = modifier;
        const build = new Build(armorList, vit, stats);
        nModifier++;
        if (build.isValid()) {
          validModifier++;
          if (modifierSet.add(build)) {
            actualModifier++;
          }
          else {
            dupesModifier++;
          }
          
          if (modifierSet.size > ARMOR_SIZE * 10) {
            const modifierArr = purge(modifierSet.toList());
            modifierSet.clear();
            modifierSet.addAll(modifierArr);
            purgesModifier++;
          }
        }
      }
    }
    builds = purge(modifierSet.toList());
    modifierSet.clear();
    purgesModifier++;
  }

  console.log(builds[0]);
  log(console.timeEnd, "solveModifier");
  const enchantSet = new CustomSet();
  log(console.time, "solveEnchant");
  // Get best builds with enchants
  // const enchantCombinations = calculateCombinations(includeSecondary ? 6 : 2, 5);
  for (let i = 0; i < 5; i++) {
    for (const armorBuild of builds) {
      /*
      for (const enchants of enchantCombinations) {
        const combination = enchants.stats;
        const stats = armorBuild.stats.slice();
        for (const i of enchants.nonZeroStats) {
          stats[i] += combination[i] * Armors[4][i].stats[i];
        }
        const build = new Build(armorBuild.armorList, vit, stats, combination, undefined, false, useJewels);
        nEnchant++;
        if (build.isValid()) {
          validEnchant++;
          if (enchantSet.add(build)) {
            actualEnchant++;
          }
          else {
            dupesEnchant++;
          }
          
          if (enchantSet.size > ARMOR_SIZE * 10) {
            const enchantArr = purge(enchantSet.toList());
            enchantSet.clear();
            enchantSet.addAll(enchantArr);
            purgesEnchant++;
          }
        }
      }
      */
      for (const j in Armors[4]) {
        const enchant = Armors[4][j];
        if (armorBuild.warding() == warding && enchant.name == "Virtuous")
          continue;
        const stats = armorBuild.stats.slice();
        for (const k of enchant.nonZeroStats) {
          stats[k] += enchant.stats[k];
        }
        const armorList = duplicateArmorList(armorBuild.armorList);
        armorList[i].enchant = enchant;
        const build = new Build(armorList, vit, stats);
        nEnchant++;
        if (build.isValid()) {
          validEnchant++;
          if (enchantSet.add(build)) {
            actualEnchant++;
          }
          else {
            dupesEnchant++;
          }
          
          if (enchantSet.size > ARMOR_SIZE * 10) {
            const enchantArr = purge(enchantSet.toList());
            enchantSet.clear();
            enchantSet.addAll(enchantArr);
            purgesEnchant++;
          }
        }
      }
    }
    builds = purge(enchantSet.toList());
    enchantSet.clear();
    purgesEnchant++;
  }
  console.log(builds[0]);
  log(console.timeEnd, "solveEnchant");
  const jewelSet = new CustomSet();
  // Get best builds with jewels if useJewels
  log(console.time, "solveJewels");
  for (let i = 0; i < 10; i++) {
    for (const enchantBuild of builds) {
      if (enchantBuild.jewelSlots < 10 - i) {
        jewelSet.add(enchantBuild);
        continue;
      }
      /*
      const jewelCombinations = calculateCombinations(includeSecondary ? 6 : 2, enchantBuild.jewelSlots);
      for (const jewels of jewelCombinations) {
        const combination = jewels.stats;
        const stats = enchantBuild.stats.slice();
        for (const i of jewels.nonZeroStats) {
          stats[i] += combination[i] * Armors[6][i].stats[i];
        }
        const build = new Build(enchantBuild.armorList, vit, stats, enchantBuild.enchants, combination);
        nJewel++;
        if (build.isValid()) {
          validJewel++;
          if (jewelSet.add(build)) {
            actualJewel++;
          }
          else {
            dupesJewel++;
          }

          if (jewelSet.size > ARMOR_SIZE * 10) {
            const buildArr = purge(jewelSet.toList());
            jewelSet.clear();
            jewelSet.addAll(buildArr);
            purgesJewel++;
          }
        }
      }
      */
      for (const j in Armors[6]) {
        const jewel = Armors[6][j];
        if (drawback - enchantBuild.drawback() < 10 - i && jewel.name == "Painite")
          continue;
        const stats = enchantBuild.stats.slice();
        for (const k of jewel.nonZeroStats) {
          stats[k] += jewel.stats[k];
        }

        const armorList = duplicateArmorList(enchantBuild.armorList);

        // figure out which armor to add jewel to
        let index = 0, used = enchantBuild.jewelSlots - 10 + i; 
        for (const armor of armorList) {
          if (used < armor.jewelSlots) {
            break;
          }
          index++;
          used -= armor.jewelSlots;
        }
        armorList[index].jewels[used] = jewel;
        const build = new Build(armorList, vit, stats);
        nJewel++;
        if (build.isValid()) {
          validJewel++;
          if (jewelSet.add(build)) {
            actualJewel++;
          }
          else {
            dupesJewel++;
          }

          if (jewelSet.size > ARMOR_SIZE * 10) {
            const buildArr = purge(jewelSet.toList());
            jewelSet.clear();
            jewelSet.addAll(buildArr);
            purgesJewel++;
          }
        }
      }
    }
    builds = purge(jewelSet.toList());
    jewelSet.clear();
    purgesJewel++;
  }
  console.log(builds[0]);
  log(console.timeEnd, "solveJewels");

  log(console.log, `${armorSet.size} builds after armor, ${enchantSet.size} builds after enchant, ${jewelSet.size} builds after jewel, ${calls} equals calls`);
  log(console.log, `${nArmor} armor, ${validArmor} valid, ${dupesArmor} armor dupes, ${purgesArmor} armor purges`);
  log(console.log, `${nModifier} modifier, ${validModifier} valid, ${dupesModifier} modifier dupes, ${purgesModifier} modifier purges`)
  log(console.log, `${nEnchant} enchant, ${validEnchant} valid, ${dupesEnchant} enchant dupes, ${purgesEnchant} enchant purges`);
  log(console.log, `${nJewel} jewel, ${validJewel} valid, ${dupesJewel} jewel dupes, ${purgesJewel} jewel purges`);
  return purge(builds, BUILD_SIZE);
}

// Sort and limit number of elements
function purge(builds, SIZE = ARMOR_SIZE) {
  return builds.sort((a, b) => b.compare(a)).slice(0, SIZE);
}

// Runs once when the website is loaded
async function run() {
  vitChange(document.getElementById("vit"));
  for (const i in MainStats) {
    const statName = MainStats[i];
    minChange(i, document.getElementById(`min-${statName}`));
    if (i >= 2)
      weightChange(i, document.getElementById(`weight-${statName}`));
  }
  insanityChange(document.getElementById("insanity"));
  wardingChange(document.getElementById("warding"));
  drawbackChange(document.getElementById("drawback"));
  modeBonusChange(document.getElementById("mode-bonus"));
  updateCopyPaste();
  defaultSettings = getSettings();

  log(console.time, "getInfo");
  await getInfo("info.json");
  log(console.timeEnd, "getInfo");

  // update();
}

// Update the list of builds (takes a long time to run)
async function update() {
  useSunken = document.getElementById("use-sunken").checked;
  useAmulet = document.getElementById("use-amulet").checked;
  const armorList = document.getElementById("armor-list");

  armorList.innerHTML = "<div>Loading...</div>";
  setTimeout(async () => {
    const start = performance.now();
    log(console.log, "-".repeat(10));
    log(console.time, "updateTotal");
    log(console.time, "solve");
    const builds = solve();
    log(console.timeEnd, "solve");
    log(console.time, "updateHTML");
    if (builds.length === 0) {
      armorList.innerHTML = "<div>No builds found</div>";
    }
    else {
      armorList.innerHTML = "";
      for (const build of builds) {
        // TODO update right here
        const div = document.createElement("div");
        // div.className = "list-element";
        div.innerHTML = build.asHTML();
        armorList.appendChild(div);
      }
    }
    log(console.timeEnd, "updateHTML");
    log(console.timeEnd, "updateTotal");
  }, 100);
}

function log(func, ...args) {
  if (logEnabled) {
    func(...args);
  }
}

function minChange(index, input) {
  const int = parseInt(input.value);
  if (!isNaN(int)) {
    const statName = MainStats[index];
    const value = Math.max(parseInt(document.getElementById(`min-${statName}`).min), Math.min(int, parseInt(document.getElementById(`min-${statName}`).max)));
    document.getElementById(`min-${statName}-text`).value = value;
    document.getElementById(`min-${statName}`).value = value;
    minStats[index] = value;
    updateCopyPaste();
  }
}

function vitChange(input) {
  const int = parseInt(input.value);
  if (!isNaN(int)) {
    const value = Math.max(parseInt(document.getElementById("vit").min), Math.min(int, parseInt(document.getElementById("vit").max)));
    document.getElementById("vit-text").value = value;
    document.getElementById("vit").value = value;
    vit = value;
    updateCopyPaste();
  }
}

function decimalsChange(input) {
  const int = parseInt(input.value);
  if (!isNaN(int)) {
    const value = Math.max(parseInt(document.getElementById("decimals").min), Math.min(int, parseInt(document.getElementById("decimals").max)));
    document.getElementById("decimals-text").value = value;
    document.getElementById("decimals").value = value;
    decimalPlaces = value;
    updateCopyPaste();
  }
}

function insanityChange(input) {
  const int = parseInt(input.value);
  if (!isNaN(int)) {
    const value = Math.max(parseInt(document.getElementById("insanity").min), Math.min(int, parseInt(document.getElementById("insanity").max)));
    document.getElementById("insanity-text").value = value;
    document.getElementById("insanity").value = value;
    insanity = value;
    updateCopyPaste();
  }
}

function wardingChange(input) {
  const int = parseInt(input.value);
  if (!isNaN(int)) {
    const value = Math.max(parseInt(document.getElementById("warding").min), Math.min(int, parseInt(document.getElementById("warding").max)));
    document.getElementById("warding-text").value = value;
    document.getElementById("warding").value = value;
    warding = value;
    updateCopyPaste();
  }
}

function drawbackChange(input) {
  const int = parseInt(input.value);
  if (!isNaN(int)) {
    const value = Math.max(parseInt(document.getElementById("drawback").min), Math.min(int, parseInt(document.getElementById("drawback").max)));
    document.getElementById("drawback-text").value = value;
    document.getElementById("drawback").value = value;
    drawback = value;
    updateCopyPaste();
  }
}

function weightChange(index, input) {
  const int = parseInt(input.value);
  if (!isNaN(int)) {
    const statName = MainStats[index];
    const value = Math.max(parseInt(document.getElementById(`weight-${statName}`).min), Math.min(int, parseInt(document.getElementById(`weight-${statName}`).max)));
    document.getElementById(`weight-${statName}-text`).value = value;
    document.getElementById(`weight-${statName}`).value = value;
    weights[index] = value / 100;
    updateCopyPaste();
  }
}

function modeBonusChange(input) {
  const int = parseInt(input.value);
  if (!isNaN(int)) {
    const value = Math.max(parseInt(document.getElementById("mode-bonus").min), Math.min(int, parseInt(document.getElementById("mode-bonus").max)));
    document.getElementById("mode-bonus-text").value = value;
    document.getElementById("mode-bonus").value = value;
    MODE_BONUS = value / 100;
    updateCopyPaste();
  }
}

// Copy Paste feature

function getSettings() {
  return {
    nz: nonZero ? 1 : 0,
    s: document.getElementById("use-sunken").checked ? 1 : 0,
    a: document.getElementById("use-amulet").checked ? 1 : 0,
    se: document.getElementById("use-secondary").checked ? 1 : 0,
    v: parseInt(document.getElementById("vit").value),
    d: decimalPlaces,
    i: insanity,
    wa: warding,
    dr: drawback,
    min: minStats,
    w: weights,
    mb: MODE_BONUS,
  };
}

function updateCopyPaste() {
  const settings = getSettings();
  document.getElementById("copy-paste").value = Object.keys(settings).map(key => `${key}:${JSON.stringify(settings[key])}`).join(";");
}

// on settings changed (pasted or modified)
function pasteSettings(input) {
  const str = input.value;
  const settings = JSON.parse(JSON.stringify(defaultSettings));
  str.split(";").forEach(setting => {
    try {
      const [key, value] = setting.split(":");
      settings[key] = JSON.parse(value);
    }
    catch (e) {
      console.log(`Invalid setting: ${setting}`);
    }
  });

  // Set settings
  document.getElementById("only-nonzero").checked = settings.nz === 1;
  document.getElementById("use-sunken").checked = settings.s === 1;
  document.getElementById("use-amulet").checked = settings.a === 1;
  document.getElementById("use-secondary").checked = settings.se === 1;
  document.getElementById("use-jewels").checked = settings.j === 1;
  document.getElementById("use-exotic").checked = settings.e === 1;
  document.getElementById("vit").value = settings.v;
  document.getElementById("decimals").value = settings.d;
  document.getElementById("mode-bonus").value = MODE_BONUS * 100;
  toggleNonZero(document.getElementById("only-nonzero"));
  toggleSecondary(document.getElementById("use-secondary"));
  toggleExotic(document.getElementById("use-exotic"));
  vitChange(document.getElementById("vit"));
  decimalsChange(document.getElementById("decimals"));
  modeBonusChange(document.getElementById("mode-bonus"));
  for (const i in MainStats) {
    const statName = MainStats[i];
    document.getElementById(`min-${statName}`).value = settings.min[i];
    document.getElementById(`weight-${statName}`).value = settings.w[i] * 100;
    minChange(i, document.getElementById(`min-${statName}`));
    weightChange(i, document.getElementById(`weight-${statName}`));
  }
  document.getElementById("insanity").value = settings.i;
  insanityChange(document.getElementById("insanity"));
  document.getElementById("warding").value = settings.wa;
  wardingChange(document.getElementById("warding"));
  document.getElementById("drawback").value = settings.dr;
  drawbackChange(document.getElementById("drawback"));
}

let copyTimeout;
function copySettings(input) {
  updateCopyPaste();
  navigator.clipboard.writeText(document.getElementById("copy-paste").value);
  input.style = "background-color: lightgreen;";
  clearTimeout(copyTimeout);
  copyTimeout = setTimeout(() => input.style = "", 200);
}

// Settings toggles

function toggleNonZero(input) {
  nonZero = input.checked;
  updateCopyPaste();
}

// no toggle function for sunken
// no toggle function for amulet

function toggleSecondary(input) {
  includeSecondary = input.checked;
  for (const element of document.getElementsByClassName("secondary")) {
    element.style.display = includeSecondary ? "" : "none";
  }
  if (!includeSecondary) {
    for (let i = 2; i < MainStats.length; i++) {
      const statName = MainStats[i];
      document.getElementById(`min-${statName}-text`).value = 0;
      document.getElementById(`min-${statName}`).value = 0;
      minStats[i] = 0;
    }
  }
  updateCopyPaste();
}

// UI related toggles

function toggleLog(input) {
  logEnabled = input.checked;
}

function toggleInfo(element) {
  const infoElement = document.getElementById("info");
  infoElement.style.display = infoElement.style.display == "none" ? "" : "none";
  element.innerText = infoElement.style.display == "" ? "Hide Info" : "Show Info";
  window.sessionStorage.setItem("showInfo", infoElement.style.display);
}

function toggleIgnoreList(element) {
  const ignoreListElement = document.getElementById("filter-list");
  ignoreListElement.style.display = ignoreListElement.style.display == "none" ? "" : "none";
  element.innerText = ignoreListElement.style.display == "" ? "Hide Filters" : "Show Filters";
  window.sessionStorage.setItem("showIgnoreList", ignoreListElement.style.display);
}

// Runs when website loads
function onBodyLoad() {
  // update();
  if (window.sessionStorage.getItem("showInfo"))
    toggleInfo(document.getElementById("visibility-button"));
  if (window.sessionStorage.getItem("showIgnoreList"))
    toggleIgnoreList(document.getElementById("filter-list-button"));
}