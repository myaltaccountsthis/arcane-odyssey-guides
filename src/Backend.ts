import CustomSet from "./CustomSet";
import { ArmorCalculatorInput } from "./types/ArmorCalculatorTypes";

export const Order = [
  "Amulet",
  "Accessory",
  "Boots",
  "Chestplate",
  "Helmet",
];
export const StatOrder = [
  "power",
  "defense",
  "size",
  "intensity",
  "speed",
  "agility",
  "regeneration",
  "resistance",
  "armorpiercing",
  "insanity",
  "warding",
  "drawback",
];
export const statToIndex: {[key: string]: number} = {
  power: 0,
  defense: 1,
  size: 2,
  intensity: 3,
  speed: 4,
  agility: 5,
  regeneration: 6,
  resistance: 7,
  armorpiercing: 8,
  insanity: 9,
  warding: 10,
  drawback: 11,
};

// Them darn normal jewels
// "Jewel Power power:3",
// "Jewel Defense defense:31",
// "Jewel Size size:10",
// "Jewel Intensity intensity:10",
// "Jewel Speed speed:10",
// "Jewel Agility agility:10",

const MAX_LEVEL = 140;
const BASE_HEALTH = 100 + 7 * (MAX_LEVEL - 1);
const BASE_ATTACK = 20 + (MAX_LEVEL - 1);
const HEALTH_PER_VIT = 4;
const REGENERATION_AMOUNT = 0.03375;
export const NUM_STATS = 9;
// const MAIN_STATS = StatOrder.slice(0, NUM_STATS);
const Ratio = [1/3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
const Armors: Armor[][] = [[], [], [], [], []];
const Enchants: BaseArmor[] = [];
const Jewels: BaseArmor[] = [];
const Modifiers: BaseArmor[] = [];

let enchantMax: number = 0;
let jewelMax: number = 0;
let modifierMax: number = 0;
const enchantMaxStats = Array(NUM_STATS).fill(0);
const jewelMaxStats = Array(NUM_STATS).fill(0);
const modifierMaxStats = Array(NUM_STATS).fill(0);

const BUILD_SIZE = 100;
const ARMOR_SIZE = 500;

// Tracking
let calls = 0;
let initialized = false;

// Inputs
let decimals = 2;
let vit = 0;
let useEfficiencyPoints = false;
let useAmulet = true;
let useSunken = true;
let useModifier = true;
let useExoticEnchants = true;
let useExoticJewels = true;
let insanity = 0;
let drawback = 0;
let warding = 0;
let fightDuration = 0;
const minStats = Array(NUM_STATS).fill(0);
const weights = Array(NUM_STATS).fill(100);

function log(func: Function, ...args: any) {
  func(...args);
}

export function updateInputs(options: ArmorCalculatorInput) {
  decimals = options.decimals;
  vit = options.vit;
  useEfficiencyPoints = options.useEfficiencyPoints;
  useAmulet = options.useAmulet;
  useSunken = options.useSunken;
  useModifier = options.useModifier;
  useExoticEnchants = options.useExoticEnchants;
  // useExoticJewels = options.useExoticJewels;
  insanity = options.insanity;
  drawback = options.drawback;
  warding = options.warding;
  fightDuration = options.fightDuration;
  for (let i = 0; i < minStats.length; i++) {
    minStats[i] = options.minStats[i];
  }
  for (let i = 0; i < weights.length; i++) {
    weights[i] = options.weights[i] / 100;
  }
}

export class BaseArmor {
  name: string;
  stats: number[];
  nonZeroStats: number[];
  attributes: string[] = [];

  constructor(name: string, stats: number[]) {
    this.name = name;
    this.stats = stats;
    this.nonZeroStats = stats.map((_, i) => i).filter((i) => stats[i] > 0);
  }

  public getTotalStats() {
    return this.stats.slice();
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
  regeneration() {
    return this.stats[6];
  }
  resistance() {
    return this.stats[7];
  }
  armorpiercing() {
    return this.stats[8];
  }
  insanity() {
    return this.stats[9];
  }
  warding() {
    return this.stats[10];
  }
  drawback() {
    return this.stats[11];
  }
}
export function armorToString(armor: BaseArmor) {
  return armor.name;
}
BaseArmor.prototype.toString = function () {
  return armorToString(this);
};

export class Armor extends BaseArmor {
  jewelSlots: number;
  canMod: boolean;
  enchant?: BaseArmor;
  jewels: BaseArmor[];
  modifier?: BaseArmor;

  constructor(
    name: string,
    stats: number[],
    jewelSlots: number,
    canMod = false,
    enchant?: BaseArmor,
    jewels: BaseArmor[] = [],
    modifier?: BaseArmor
  ) {
    super(name, stats);
    this.jewelSlots = jewelSlots;
    this.canMod = canMod;
    if (enchant) this.enchant = enchant;
    this.jewels = jewels;
    if (modifier) this.modifier = modifier;
  }

  public override getTotalStats() {
    const stats = super.getTotalStats();
    if (this.enchant != undefined) {
      for (const i of this.enchant.nonZeroStats)
        stats[i] += this.enchant.stats[i];
    }

    for (const jewel of this.jewels) {
      for (const i of jewel.nonZeroStats) stats[i] += jewel.stats[i];
    }

    if (this.modifier) {
      if (this.modifier.name == "Atlantean") {
        let i = 0;
        for (; i < NUM_STATS; i++) {
          if (stats[i] == 0) break;
        }
        i %= NUM_STATS;
        stats[i] += this.modifier.stats[i];
        stats[NUM_STATS] += this.modifier.stats[NUM_STATS];
      } else {
        for (const i of this.modifier.nonZeroStats)
          stats[i] += this.modifier.stats[i];
      }
    }
    return stats;
  }
}

export class Build {
  armorList: Armor[];
  stats: number[];
  jewelSlots: number;
  hash: number;
  multiplier: number;
  efficiencyPoints: number;

  constructor(armorList: Armor[] = [], stats?: number[]) {
    this.armorList = armorList;
    if (stats)
      this.stats = stats;
    else
      this.stats = calculateStats(armorList);
    this.jewelSlots = armorList.reduce(
      (sum, armor) => sum + armor.jewelSlots,
      0
    );
    this.hash = getHash(this);
    this.multiplier =
      getMult(this) +
      getExtraTotalStats(this) / ((BASE_ATTACK / Ratio[0] + BASE_HEALTH / Ratio[1]) / 2);
    this.efficiencyPoints = getNormalizedStats(this.stats);
    // this.statCode = getStatCode(stats);
  }

  value() {
    return this.multiplier;
  }

  compare(other: Build) {
    if (useEfficiencyPoints) return this.efficiencyPoints - other.efficiencyPoints;
    return this.multiplier - other.multiplier;
  }

  equals(other: Build) {
    calls++;
    // return this.statCode === other.statCode;
    for (let i in this.stats) {
      if (this.stats[i] != other.stats[i]) return false;
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
  regeneration() {
    return this.stats[6];
  }
  resistance() {
    return this.stats[7];
  }
  armorpiercing() {
    return this.stats[8];
  }
  insanity() {
    return this.stats[9];
  }
  warding() {
    return this.stats[10];
  }
  drawback() {
    return this.stats[11];
  }

  numEnchants() {
    return this.armorList.reduce((sum, armor) => sum + (armor.enchant ? 1 : 0), 0);
  }
  numJewels() {
    return this.armorList.reduce((sum, armor) => sum + (armor.jewels.filter(jewel => jewel).length), 0);
  }
  numModifiers() {
    return this.armorList.reduce((sum, armor) => sum + (armor.modifier ? 1 : 0), 0);
  }

  enchantsLeft() {
    return 5 - this.numEnchants();
  }
  jewelsLeft() {
    return this.jewelSlots - this.numJewels();
  }
  modifiersLeft() {
    return this.armorList.map(armor => armor.canMod && !armor.modifier ? 1 : 0).reduce((sum: number, val) => sum + val, 0);
  }

  getEnchants() {
    const enchants = new Array(Enchants.length).fill(0);
    for (const armor of this.armorList) {
      if (armor.enchant != undefined)
        enchants[Enchants.indexOf(armor.enchant)]++;
    }
    return enchants;
  }

  getJewels() {
    const jewels = new Array(Jewels.length).fill(0);
    for (const armor of this.armorList) {
      for (const jewel of armor.jewels) {
        if (jewel != undefined)
          jewels[Jewels.indexOf(jewel)]++;
      }
    }
    return jewels;
  }

}
export function buildToString(build: Build) {
  return `Multiplier: ${(Math.round(build.multiplier * 10000) / 10000)}\nBonus Stats: ${build.stats.join("/")}\nArmor: ${build.armorList.join(" ")}`;
}
Build.prototype.toString = function() {
  return buildToString(this);
}

export function isValid(build: Build) {
  if (build.numEnchants() == 5 && build.numJewels() == build.jewelSlots) {
    for (let i = 0; i < NUM_STATS; i++) {
      if (build.stats[i] < minStats[i]) return false;
    }
    return true;
  }
  return getExtraStats(build) >= -.05;
}

export function getHash(build: Build) {
  let num = 0;
  const stats = build.stats;
  for (let i in stats) {
    // multiply by a prime number to avoid collisions
    num *= 181;
    num += stats[i];
  }
  return num;
}

// Return a BigInt that represents the build's stats
// export function getStatCode(stats: number[]) {
//   return stats.reduce((acc, val, i) => acc * absMaxStats[i] + BigInt(val), 0n);
// }

export function getMultiplierColorStr(mult: number) {
  return `hsl(${(mult - 2) * 80}, 100%, 40%)`;
}

export function getEfficiencyPointsColorStr(points: number) {
  return `hsl(${(points - 600) / 4}, 100%, 40%)`;
}

export function getFormattedMultiplierStr(
  mult: number,
) {
  const tens = 10 ** decimals;
  return `${Math.floor(mult)}.${(Math.floor(mult * tens) % tens)
    .toString()
    .padStart(decimals, "0")}`;
}

export function getFormattedEfficiencyPointsStr(points: number) {
  const tens = 10 ** decimals;
  return `${Math.floor(points)}.${(Math.floor(points * tens) % tens)
    .toString()
    .padStart(decimals, "0")}`;
}

// pow/def, vit multiplier without weight
export function getBaseMult(build: Build, useWeight = false) {
  // Damage multiplier due to vit (vitDamage <= 1)
  const vitDamage = Math.sqrt(BASE_HEALTH / (vit * HEALTH_PER_VIT + BASE_HEALTH));
  const baseFightHP = BASE_HEALTH * (1 + fightDuration * .0075);
  const totalFightHP = baseFightHP + vit * HEALTH_PER_VIT + build.stats[1] + weights[statToIndex.regeneration] * REGENERATION_AMOUNT * build.stats[statToIndex.regeneration] * fightDuration;
  return (
    // Defense, Regeneration, Vitality multiplier
    ((totalFightHP / baseFightHP) *
      (useWeight ? weights[statToIndex.defense] : 1) +
      1) *
    // Power multiplier
    ((build.stats[0]) * vitDamage / BASE_ATTACK *
      (useWeight ? weights[statToIndex.power] : 1) +
      1)
  );
}


// Returns modified multiplier affected by weight
export function getMult(build: Build) {
  // const mult = (BASE_HEALTH * (1 + build.vit / (MAX_LEVEL * 2) * 1.1) + build.stats[1]) * getDefenseWeight() / BASE_HEALTH * (BASE_ATTACK + build.stats[0] * (1 - build.vit / (MAX_LEVEL * 2) * .5)) * getPowerWeight() / BASE_ATTACK;
  const mult = getBaseMult(build, true);
  return mult * otherMult(build);
}

// secondary stats multiplier
export function otherMult(build: Build) {
  return (
    ((estimateMultComplex(build.size()) - 1) * weights[2] * 0.68 + 1) *
    ((estimateMultComplex(build.intensity()) - 1) * weights[3] + 1) *
    ((estimateMultComplex(build.speed()) - 1) * weights[4] * 0.4 + 1) *
    ((estimateMultComplex(build.agility()) - 1) * weights[5] * 0.5 + 1) *
    ((estimateMultComplex(build.resistance()) - 1) * weights[7] + 1) *
    ((estimateMultComplex(build.armorpiercing()) - 1) * weights[8] + 1)
  );
}

// Real base secondary stat formula
export function estimateMultComplex(stat: number) {
  if (stat == 0) return 1;
  return (
    1 +
    (1.35 / 100) *
      ((16 * Math.pow(Math.log(0.1 * stat + 4), 3) * 0.09 + 0.15 * stat) /
        (0.1 + 0.15 * Math.pow(MAX_LEVEL, 0.5)) -
        0.79)
  );
}

// Estimates the number of stats (translated to power) left after subtracting minimum stats
export function getExtraStats(build: Build) {
  let statsLeft = 0;
  const enchantsLeft = build.enchantsLeft();
  const jewelsLeft = build.jewelsLeft();
  const modifiersLeft = build.modifiersLeft();

  const painites = Math.min(drawback - build.drawback(), jewelsLeft);
  const virtuous = warding - build.warding();

  statsLeft +=
    (virtuous * 54) / Ratio[1] + (enchantsLeft - virtuous) * enchantMax;
  statsLeft +=
    (painites * 125) / Ratio[1] + (jewelsLeft - painites) * jewelMax;
  if (useModifier) statsLeft += modifiersLeft * modifierMax;
  for (let i = 0; i < NUM_STATS; i++) {
    if (i == 1) {
      if (drawback > 0) {
        if (
          minStats[i] - build.stats[i] >
          enchantsLeft * enchantMaxStats[i] +
          painites * 125 +
          (jewelsLeft - painites) * jewelMaxStats[i] +
          modifiersLeft * modifierMaxStats[i]
        )
        return -1;
      } else if (
        warding > 0 &&
        minStats[i] - build.stats[i] >
        virtuous * 54 +
        (enchantsLeft - virtuous) * enchantMaxStats[i] +
        jewelsLeft * jewelMaxStats[i] +
        modifiersLeft * modifierMaxStats[i]
      )
      return -1;
    } else if (
      minStats[i] - build.stats[i] >
      enchantsLeft * enchantMaxStats[i] +
      jewelsLeft * jewelMaxStats[i] +
      modifiersLeft * modifierMaxStats[i]
    )
    return -1;
    statsLeft -=
    Math.max(minStats[i] - build.stats[i], 0) / Ratio[i];
  }
  return statsLeft;
}

export function getExtraTotalStats(build: Build) {
  let val = enchantMax * build.enchantsLeft();
  val += jewelMax * build.jewelsLeft();
  if (useModifier) val += modifierMax * build.modifiersLeft();
  return val;
}

// Returns the total number of stats, normalized to power, in the build
export function getPowerEquivalence(build: Build) {
  return (
    build.stats.reduce((acc, val, i) => acc + val / Ratio[i], 0) * Ratio[2]
  );
}

// Turn stats into their efficiency points using ratios
export function getNormalizedStats(stats: number[]) {
  return stats
    .map((val, i) => val / Ratio[i])
    .reduce((acc, val) => acc + val, 0);
}

// Used for making new build objects
function duplicateArmorList(armorList: Armor[]) {
  return armorList.map(
    (armor) =>
      new Armor(
        armor.name,
        armor.stats,
        armor.jewelSlots,
        armor.canMod,
        armor.enchant,
        armor.jewels.slice(),
        armor.modifier
      )
  );
}

// Recalculates all stats, used for atlantean
export function calculateStats(armorList: Armor[]) {
  let stats = new Array(StatOrder.length).fill(0);
  for (const armor of armorList) {
    const armorStats = armor.getTotalStats();
    stats = stats.map((val, i) => val + armorStats[i]);
  }
  return stats;
}

// // Combinations: [[number]], index: enchant index, arr, remaining: number
// // Should be called only once
// function calculateCombinationsHelper(
//   combinations: number[][],
//   numTypes: number,
//   index: number,
//   arr: number[],
//   remaining: number
// ) {
//   if (index === numTypes) {
//     combinations.push(arr.slice());
//     return;
//   }
//   if (index === numTypes - 1) {
//     arr[index] = remaining;
//     combinations.push(arr.slice());
//     return;
//   }
//   for (let i = 0; i <= remaining; i++) {
//     arr[index] = i;
//     calculateCombinationsHelper(
//       combinations,
//       numTypes,
//       index + 1,
//       arr,
//       remaining - i
//     );
//     // no need to set arr[index] to 0 because subsequent calls will overwrite it
//   }
// }

// // Returns an array of Armor objects where the stats are the number of enchants
// function calculateCombinations(numTypes: number, slots: number, forceLength = 6) {
//   const combinations: number[][] = [];
//   calculateCombinationsHelper(combinations, numTypes, 0, [], slots);
//   return combinations
//     .map((arr) => arr.concat(Array(forceLength - numTypes).fill(0)))
//     .map((stats) => new Armor("e", stats));
// }

function filterArmor(armorArr: Armor[][], enchantArr: BaseArmor[], jewelArr: BaseArmor[], modifierArr: BaseArmor[]) {
  for (let i = 0; i < 5; i++) {
    for (const armor of Armors[i]) {
      if (armor.drawback() > drawback) continue;
      if (armor.attributes.indexOf("sunken") != -1 && !useSunken) continue;
      armorArr[i].push(armor);
    }
  }
  if (!useAmulet) Armors[0] = [];
  for (const enchant of Enchants) {
    if (enchant.warding() > warding) continue;
    if (enchant.attributes.indexOf("exotic") != -1 && !useExoticEnchants) continue;
    enchantArr.push(enchant);
  }
  for (const jewel of Jewels) {
    if (jewel.drawback() > drawback) continue;
    // if (jewel.attributes.indexOf("exotic") != -1 && !useExoticJewels) continue;
    jewelArr.push(jewel);
  }
  for (const modifier of Modifiers) {
    if (modifier.insanity() > insanity) continue;
    modifierArr.push(modifier);
  }
}

// Updates the variables using the given info
// info: the parsed json file
export function updateInfo(info: any) {
  if (initialized) return;
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

// The main function. Returns an array of the top 100 builds
export function solve() {
  const armorArr: Armor[][] = [[], [], [], [], []];
  const enchantArr: BaseArmor[] = [];
  const jewelArr: BaseArmor[] = [];
  const modifierArr: BaseArmor[] = [];
  filterArmor(armorArr, enchantArr, jewelArr, modifierArr);
  // tracking vars
  let validArmor = 0,
    actualArmor = 0,
    nArmor = 0,
    dupesArmor = 0,
    purgesArmor = 0;
  let validModifier = 0,
    actualModifier = 0,
    nModifier = 0,
    dupesModifier = 0,
    purgesModifier = 0;
  let validEnchant = 0,
    actualEnchant = 0,
    nEnchant = 0,
    dupesEnchant = 0,
    purgesEnchant = 0;
  let validJewel = 0,
    actualJewel = 0,
    nJewel = 0,
    dupesJewel = 0,
    purgesJewel = 0;
  calls = 0;
  // let minArmorStats = minStats.map((val, i) => Math.max(val - Armors[4][i].stats[i] * 5 - (useJewels ? Armors[6][i].stats[i] * 10 : 0), 0));
  const armorSet = new CustomSet<Build>(getHash, Build.prototype.equals);
  log(console.time, "solveArmor");
  for (const armor of armorArr[3]) {
    for (const boot of armorArr[2]) {
      for (let i = 0; i < armorArr[1].length; i++) {
        const accessory1 = armorArr[1][i];
        // Make accessory2 array (helmets)
        const helmets = armorArr[4];
        const length = helmets.length;
        const accessories2 = helmets.concat(armorArr[1].slice(i + 1));

        for (let j = 0; j < accessories2.length; j++) {
          const accessory2 = accessories2[j];
          // Make accessory3 array (amulets)
          // If accessory2 is a helmet (j < length), allow only other accessories, otherwise allow accessories after j
          const accessories3 = (
            j < length ? accessories2.slice(length) : accessories2.slice(j + 1)
          ).concat(useAmulet ? armorArr[0] : []);

          for (const accessory3 of accessories3) {
            const armorList = [
              armor,
              boot,
              accessory1,
              accessory2,
              accessory3,
            ].map(
              (armor) =>
                new Armor(
                  armor.name,
                  armor.stats,
                  armor.jewelSlots,
                  armor.canMod
                )
            );
            const armorStats = Array(StatOrder.length).fill(0);
            for (const item of armorList) {
              for (const k of item.nonZeroStats) armorStats[k] += item.stats[k];
            }
            if (armorStats[11] > drawback) continue;
            const build = new Build(armorList, armorStats);
            nArmor++;
            if (isValid(build)) {
              validArmor++;
              if (armorSet.add(build)) {
                actualArmor++;
              } else {
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
  purgesArmor++;
  log(console.timeEnd, "solveArmor");

  const modifierSet = useModifier ? new CustomSet<Build>(getHash, Build.prototype.equals) : armorSet;
  if (useModifier) {
    log(console.time, "solveModifier");
    for (let i = 0; i < 5; i++) {
      for (const armorBuild of builds) {
        if (!armorBuild.armorList[i].canMod) modifierSet.add(armorBuild);
        for (const modifier of modifierArr) {
          if (modifier.name == "Atlantean" && armorBuild.insanity() >= insanity)
            continue;
          if (!armorBuild.armorList[i].canMod && modifier.name != "Atlantean")
            continue;
          const armorList = duplicateArmorList(armorBuild.armorList);
          armorList[i].modifier = modifier;
          const build = new Build(armorList);
          nModifier++;
          if (isValid(build)) {
            validModifier++;
            if (modifierSet.add(build)) {
              actualModifier++;
            } else {
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
  }

  if (useModifier)
    log(console.timeEnd, "solveModifier");
  const enchantSet = new CustomSet<Build>(getHash, Build.prototype.equals);
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
      for (const enchant of enchantArr) {
        if (armorBuild.warding() == warding && enchant.name == "Virtuous")
          continue;
        if (
          warding - armorBuild.warding() == 5 - i &&
          enchant.name != "Virtuous"
        )
          continue;
        if (
          armorBuild.insanity() == insanity &&
          enchant.name == "Atlantean"
        )
          continue;
        const stats = armorBuild.stats.slice();
        for (const k of enchant.nonZeroStats) {
          stats[k] += enchant.stats[k];
        }
        const armorList = duplicateArmorList(armorBuild.armorList);
        armorList[i].enchant = enchant;
        const build = new Build(armorList);
        nEnchant++;
        if (isValid(build)) {
          validEnchant++;
          if (enchantSet.add(build)) {
            actualEnchant++;
          } else {
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
  
  log(console.timeEnd, "solveEnchant");
  const jewelSet = new CustomSet<Build>(getHash, Build.prototype.equals);
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
      for (const j in jewelArr) {
        const jewel = jewelArr[j];
        if (
          drawback - enchantBuild.drawback() < 10 - i &&
          jewel.name == "Painite"
        )
          continue;

        const armorList = duplicateArmorList(enchantBuild.armorList);

        // figure out which armor to add jewel to
        let index = 0,
          used = enchantBuild.jewelSlots - 10 + i;
        for (const armor of armorList) {
          if (used < armor.jewelSlots) {
            break;
          }
          index++;
          used -= armor.jewelSlots;
        }
        armorList[index].jewels[used] = jewel;
        const build = new Build(armorList);
        nJewel++;
        if (isValid(build)) {
          validJewel++;
          if (jewelSet.add(build)) {
            actualJewel++;
          } else {
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
  
  log(console.timeEnd, "solveJewels");

  log(
    console.log,
    `${armorSet.size} builds after armor, ${enchantSet.size} builds after enchant, ${jewelSet.size} builds after jewel, ${calls} equals calls`
  );
  log(
    console.log,
    `${nArmor} armor, ${validArmor} valid, ${dupesArmor} armor dupes, ${purgesArmor} armor purges`
  );
  log(
    console.log,
    `${nModifier} modifier, ${validModifier} valid, ${dupesModifier} modifier dupes, ${purgesModifier} modifier purges`
  );
  log(
    console.log,
    `${nEnchant} enchant, ${validEnchant} valid, ${dupesEnchant} enchant dupes, ${purgesEnchant} enchant purges`
  );
  log(
    console.log,
    `${nJewel} jewel, ${validJewel} valid, ${dupesJewel} jewel dupes, ${purgesJewel} jewel purges`
  );
  return purge(builds, BUILD_SIZE);
}

// Sort and limit number of elements
function purge(builds: Build[], SIZE = ARMOR_SIZE) {
  return builds.sort((a, b) => b.compare(a)).slice(0, SIZE);
}