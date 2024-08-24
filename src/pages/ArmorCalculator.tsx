import { useEffect, useState } from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";
import CheckboxGroup from "../components/CheckboxGroup";
import SliderGroup from "../components/SliderGroup";
import CopyPasteSettings from "../components/CopyPasteSettings";
import DropDown from "../components/DropDown";
import CustomSet from "../CustomSet.ts";

const MAX_LEVEL = 140;
const BASE_HEALTH = 100 + 7 * (MAX_LEVEL - 1);
const BASE_ATTACK = 20 + (MAX_LEVEL - 1);
const HEALTH_PER_VIT = 4;
// Stat order: power defense size intensity speed agility

// Tracking
let calls = 0;

class BaseArmor {
  name: string;
  stats: number[];
  nonZeroStats: number[];

  constructor(name: string, stats: number[]) {
    this.name = name;
    this.stats = stats;
    this.nonZeroStats = stats.map((val, i) => i).filter((i) => stats[i] > 0);
  }

  public getTotalStats() {
    return this.stats.slice();
  }
}
BaseArmor.prototype.toString = function () {
  return this.name;
};

class Armor extends BaseArmor {
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
        for (; i < 6; i++) {
          if (stats[i] == 0) break;
        }
        i %= 6;
        stats[i] += this.modifier.stats[i];
        stats[6] += this.modifier.stats[6];
      } else {
        for (const i of this.modifier.nonZeroStats)
          stats[i] += this.modifier.stats[i];
      }
    }
    return stats;
  }
}

class Build {
  armorList: Armor[];
  stats: number[];
  vit: number;
  jewelSlots: number;
  hash: number;
  multiplier: number;

  constructor(armorList: Armor[] = [], vit: number = 0) {
    this.armorList = armorList;
    this.stats = calculateStats(armorList);
    this.vit = vit;
    this.jewelSlots = armorList.reduce(
      (sum, armor) => sum + armor.jewelSlots,
      0
    );
    this.hash = getHash(this);
    this.multiplier =
      getMult(this) +
      getExtraTotalStats(this) / (BASE_ATTACK / 2 + BASE_HEALTH / Ratio[1] / 2);
    // this.statCode = getStatCode(stats);
  }

  value() {
    return this.multiplier;
  }

  compare(other: Build) {
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
    return this.armorList.map(armor => armor.canMod && armor.modifier ? 1 : 0).reduce((sum: number, val) => sum + val, 0);
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
        <div>${StatOrder.map(stat => this.stats[statToIndex[stat]] == 0 ? `` : `<span class="${stat}">${this.stats[statToIndex[stat]]}</span><img class="icon" src="./armor/${stat}_icon.png">`).join(" ")}</div>
        <div class="br-small"></div>
        <table>
          <th>Armor</th>
          ${this.armorList.map(armor => {
            const armorName = armor.toString().replaceAll("_", " ");
            return `<tr><td class="${armorName.split(" ")[0].toLowerCase()}">${armor.modifier != undefined ? armor.modifier + " " : ""}${armor.enchant} ${armorName}</td></tr>
            <tr><td>${armor.jewels.join(" ")}</td></tr>`;
          }).join("")}
        </table>
      </div>
    `;
  }
}
Build.prototype.toString = function() {
  return `Multiplier: ${(Math.round(this.multiplier * 10000) / 10000)}\nBonus Stats: ${this.stats.join("/")}\nArmor: ${this.armorList.join(" ")}`;
}

function isValid(build: Build, minStats: number[]) {
  if (build.numEnchants() == 5 && build.numJewels() == build.jewelSlots)
    return build.stats.every((val, i) => val >= minStats[i]);
  return getExtraStats(build) >= -.05;
}

function getHash(build: Build) {
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
function getStatCode(stats: number[]) {
  return stats.reduce((acc, val, i) => acc * absMaxStats[i] + BigInt(val), 0n);
}

function getMultiplierColorStr(mult: number) {
  return `hsl(${(mult - 2) * 75}, 100%, 40%)`;
}

function getFormattedMultiplierStr(
  mult: number,
  decimals: number
) {
  const tens = 10 ** decimals;
  return `${Math.floor(mult)}.${(Math.floor(mult * tens) % tens)
    .toString()
    .padStart(decimals, "0")}`;
}

// pow/def, vit multiplier without weight
function getBaseMult(build: Build, weights: number[], useWeight = false) {
  const vitDamage = Math.sqrt(BASE_HEALTH / (build.vit * HEALTH_PER_VIT + BASE_HEALTH));
  return (
    (((build.vit * HEALTH_PER_VIT + build.stats[1]) / BASE_HEALTH) *
      (useWeight ? weights[1] : 1) +
      1) *
    ((build.stats[0] + BASE_ATTACK) * vitDamage *
      (useWeight ? weights[0] : 1) +
      1)
  );
}

// Returns modified multiplier affected by weight
function getMult(build: Build, weights: number[]) {
  // const mult = (BASE_HEALTH * (1 + build.vit / (MAX_LEVEL * 2) * 1.1) + build.stats[1]) * getDefenseWeight() / BASE_HEALTH * (BASE_ATTACK + build.stats[0] * (1 - build.vit / (MAX_LEVEL * 2) * .5)) * getPowerWeight() / BASE_ATTACK;
  const mult = getBaseMult(build, weights, true);
  return mult * otherMult(build, weights);
}

// secondary stats multiplier
function otherMult(build: Build, weights: number[]) {
  return (
    ((estimateMultComplex(build.stats[2]) - 1) * weights[2] * 0.68 + 1) *
    ((estimateMultComplex(build.stats[3]) - 1) * weights[3] + 1) *
    ((estimateMultComplex(build.stats[4]) - 1) * weights[4] * 0.4 + 1) *
    ((estimateMultComplex(build.stats[5]) - 1) * weights[5] * 0.5 + 1)
  );
}

// Real base secondary stat formula
function estimateMultComplex(stat: number) {
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
function getExtraStats(build: Build) {
  let statsLeft = 0;
  const enchantsLeft = build.enchantsLeft();
  const jewelsLeft = build.jewelsLeft();
  const modifiersLeft = build.modifiersLeft();

  const painites = Math.min(drawback - build.drawback(), jewelsLeft);
  const virtuous = warding - build.warding();

  statsLeft +=
    (virtuous * 54) / Ratio[1] + (enchantsLeft - virtuous) * enchantMax;
  if (useJewels)
    statsLeft +=
      (painites * 125) / Ratio[1] + (jewelsLeft - painites) * jewelMax;
  if (useModifier) statsLeft += modifiersLeft * modifierMax;

  for (const i in build.stats) {
    if (!includeSecondary && i >= 2) continue;
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
      (Math.max(minStats[i] - build.stats[i], 0) * Ratio[0]) / Ratio[i];
  }
  return statsLeft;
}

function getExtraTotalStats(build: Build) {
  let val = enchantMax * build.enchantsLeft();
  if (useJewels) val += jewelMax * build.jewelsLeft();
  if (useModifier) val += modifierMax * build.modifiersLeft();
  return val;
}

// Returns the total number of stats, normalized to power, in the build
function getPowerEquivalence(build: Build) {
  return (
    build.stats.reduce((acc, val, i) => acc + val / Ratio[i], 0) * Ratio[0]
  );
}

// Solver.py
const Order = [
  "Amulet",
  "Accessory",
  "Boots",
  "Chestplate",
  "Enchant",
  "Helmet",
  "Jewel",
  "Modifier",
];
const StatOrder = [
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
const statToIndex: {[key: string]: number} = {
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
const MainStats = StatOrder.slice(0, 6);
const Ratio = [1/3, 11/3, 1, 1, 1, 1, 1, 1, 1];
let Armors: BaseArmor[][] = [[], [], [], [], [], [], [], []];
let enchantMax: number;
let jewelMax: number;
let modifierMax: number;
const enchantMaxStats = [0, 0, 0, 0, 0, 0];
const jewelMaxStats = [0, 0, 0, 0, 0, 0];
const modifierMaxStats = [0, 0, 0, 0, 0, 0];

const BUILD_SIZE = 100;
const ARMOR_SIZE = 500;

// Combinations: [[number]], index: enchant index, arr, remaining: number
// Should be called only once
function calculateCombinationsHelper(
  combinations: number[][],
  numTypes: number,
  index: number,
  arr: number[],
  remaining: number
) {
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
    calculateCombinationsHelper(
      combinations,
      numTypes,
      index + 1,
      arr,
      remaining - i
    );
    // no need to set arr[index] to 0 because subsequent calls will overwrite it
  }
}

// Returns an array of Armor objects where the stats are the number of enchants
function calculateCombinations(numTypes: number, slots: number, forceLength = 6) {
  const combinations: number[][] = [];
  calculateCombinationsHelper(combinations, numTypes, 0, [], slots);
  return combinations
    .map((arr) => arr.concat(Array(forceLength - numTypes).fill(0)))
    .map((stats) => new Armor("e", stats));
}

// Load data from info file into Armors. Must be called before solve()
async function getInfo(fileName: string) {
  Armors = [[], [], [], [], [], [], [], []];
  enchantMax = 0;
  jewelMax = 0;
  modifierMax = 0;
  const info = await fetch("../public/armor/" + fileName).then((response) =>
    response.json()
  );
  for (const line of info) {
    const words = line.split(" ");
    const category = words[0];
    const name = words[1];
    const stats = new Array(StatOrder.length).fill(0);
    let jewels = 0;
    let canMod = false;
    let invalid = false;
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
    if (invalid) continue;
    const armor = new Armor(name, stats, jewels, canMod);
    const index = Order.indexOf(category);
    Armors[index].push(armor);

    if (stats[8] > 0) continue;
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
    if (index == Order.indexOf("Modifier") && name != "Atlantean") {
      modifierMax = Math.max(modifierMax, normalizeStats(stats));
      for (let i = 0; i < 6; i++)
        modifierMaxStats[i] = Math.max(modifierMaxStats[i], stats[i]);
    }
  }
}

// Turn stats into their efficiency points using ratios
function normalizeStats(stats: number[]) {
  return stats
    .map((val, i) => val / Ratio[i])
    .reduce((acc, val) => acc + val, 0);
}

// Used for making new build objects
function duplicateArmorList(armorList) {
  return armorList.map(
    (armor) =>
      new MainArmor(
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
function calculateStats(armorList: Armor[]) {
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
  for (const armor of Armors[3]) {
    if (drawback < 1 && armor.name.startsWith("Vatrachos")) continue;
    if (!useSunken && armor.name.startsWith("Sunken")) continue;

    for (const boot of Armors[2]) {
      if (drawback < 1 && boot.name.startsWith("Vatrachos")) continue;
      if (!useSunken && boot.name.startsWith("Sunken")) continue;

      for (let i = 0; i < Armors[1].length; i++) {
        const accessory1 = Armors[1][i];
        // Make accessory2 array (helmets)
        const helmets = Armors[5].filter(
          (helmet) =>
            (useSunken || !helmet.name.startsWith("Sunken")) &&
            (drawback >= 1 || !helmet.name.startsWith("Vatrachos"))
        );
        const length = helmets.length;
        const accessories2 = helmets.concat(Armors[1].slice(i + 1));

        for (let j = 0; j < accessories2.length; j++) {
          const accessory2 = accessories2[j];
          // Make accessory3 array (amulets)
          // If accessory2 is a helmet (j < length), allow only other accessories, otherwise allow accessories after j
          const accessories3 = (
            j < length ? accessories2.slice(length) : accessories2.slice(j + 1)
          ).concat(useAmulet ? Armors[0] : []);

          for (const accessory3 of accessories3) {
            const armorList = [
              armor,
              boot,
              accessory1,
              accessory2,
              accessory3,
            ].map(
              (armor) =>
                new MainArmor(
                  armor.name,
                  armor.stats,
                  armor.jewelSlots,
                  armor.canMod
                )
            );
            const armorStats = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            for (const item of armorList) {
              for (const k of item.nonZeroStats) armorStats[k] += item.stats[k];
            }
            if (armorStats[8] > drawback) continue;
            const build = new Build(armorList, vit, armorStats);
            nArmor++;
            if (build.isValid()) {
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
  console.log(builds[0]);
  purgesArmor++;
  log(console.timeEnd, "solveArmor");

  const modifierSet = useModifier ? new CustomSet() : armorSet;
  if (useModifier) {
    log(console.time, "solveModifier");
    for (let i = 0; i < 5; i++) {
      for (const armorBuild of builds) {
        if (!armorBuild.armorList[i].canMod) modifierSet.add(armorBuild);
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

  console.log(builds[0]);
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
      for (const j in Armors[4]) {
        const enchant = Armors[4][j];
        if (armorBuild.warding() == warding && enchant.name == "Virtuous")
          continue;
        if (
          warding - armorBuild.warding() == 5 - i &&
          enchant.name != "Virtuous"
        )
          continue;
        if (
          armorBuild.armorList[i].modifier == undefined &&
          enchant.name == "Atlantean" &&
          enchant.name == "Virtuous"
        )
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
  console.log(builds[0]);
  log(console.timeEnd, "solveEnchant");
  const jewelSet = new CustomSet<Build>(getHash, Build.prototype.equals);
  // Get best builds with jewels if useJewels
  if (useJewels) {
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
          if (
            drawback - enchantBuild.drawback() < 10 - i &&
            jewel.name == "Painite"
          )
            continue;
          const stats = enchantBuild.stats.slice();
          for (const k of jewel.nonZeroStats) {
            stats[k] += jewel.stats[k];
          }

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
          const build = new Build(armorList, vit, stats);
          nJewel++;
          if (build.isValid()) {
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
  }
  console.log(builds[0]);
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

const moreInfo = [
    "Armor",
    "Weights",
    "Multiplier",
    "Efficiency Points"
];
const definition = [
    "list of required armor pieces",
    "change them to prioritize certain stats",
    "estimate advantage against unarmored opponent based on pow/def and weighted secondary stats",
    "sum of build stats normalized to secondary stats using enchant ratios"
];

const tips = [
    "Secondary stat curve is based on Metapoly's real formulas",
    "Base Multiplier only considers pow/def raw multiplier",
    "Jewels and Enchants can be swapped around unless Atlantean",
    "Takes about 2000ms",
    "Solver runs faster with more restrictions"
]

function ArmorCalculator() {
    const [infoVisible, setInfoVisible] = useState(true);

    const toggleInfo = () => {
        const val = !infoVisible
        setInfoVisible(val);
        window.sessionStorage.setItem("showInfo", val ? "true" : "false");
    }

    const setCopyPaste = (value: string) => {
        return value;
    }

    useEffect(() => {
        if (window.sessionStorage.getItem("showInfo") === "false" && infoVisible)
            toggleInfo();
    }, []);

    // Restrictions
    const [useSunken, setUseSunken] = useState(true);
    const [useModifier, setUseModifier] = useState(true);
    const [useAmulet, setUseAmulet] = useState(true);
    const restrictions = [
        { className: "use-sunken", name: "Use Sunken", value: useSunken, setValue: setUseSunken },
        { className: "use-modifier", name: "Use Modifier", value: useModifier, setValue: setUseModifier },
        { className: "use-amulet", name: "Use Amulet", value: useAmulet, setValue: setUseAmulet },
    ];

    // Options
    const [vit, setVit] = useState(0);
    const [decimals, setDecimals] = useState(3);
    const [insanity, setInsanity] = useState(0);
    const [warding, setWarding] = useState(0);
    const [maxDrawbacks, setMaxDrawbacks] = useState(0);
    const options = [
        { className: "vit", name: "Vitality", value: vit, min: 0, max: 250, step: 1, onChange: setVit },
        { className: "decimals", name: "Decimals", value: decimals, min: 1, max: 5, step: 1, onChange: setDecimals },
        { className: "insanity", name: "Insanity", value: insanity, min: 0, max: 5, step: 1, onChange: setInsanity },
        { className: "warding", name: "Warding", value: warding, min: 0, max: 5, step: 1, onChange: setWarding },
        { className: "drawback", name: "Max Drawback", value: maxDrawbacks, min: 0, max: 20, step: 1, onChange: setMaxDrawbacks },
    ];
    
    // Mins
    const [minPower, setMinPower] = useState(0);
    const [minDefense, setMinDefense] = useState(0);
    const [minSize, setMinSize] = useState(0);
    const [minIntensity, setMinIntensity] = useState(0);
    const [minSpeed, setMinSpeed] = useState(0);
    const [minAgility, setMinAgility] = useState(0);
    const [minRegeneration, setMinRegeneration] = useState(0);
    const [minResistance, setMinResistance] = useState(0);
    const [minArmorPiercing, setMinArmorPiercing] = useState(0);
    const mins = [
        { className: "min-power", name: "Power", value: minPower, min: 0, max: 350, step: 1, onChange: setMinPower },
        { className: "min-defense", name: "Defense", value: minDefense, min: 0, max: 3500, step: 1, onChange: setMinDefense },
        { className: "min-size", name: "Size", value: minSize, min: 0, max: 650, step: 1, onChange: setMinSize },
        { className: "min-intensity", name: "Intensity", value: minIntensity, min: 0, max: 650, step: 1, onChange: setMinIntensity },
        { className: "min-speed", name: "Speed", value: minSpeed, min: 0, max: 650, step: 1, onChange: setMinSpeed },
        { className: "min-agility", name: "Agility", value: minAgility, min: 0, max: 650, step: 1, onChange: setMinAgility },
        { className: "min-regeneration", name: "Regeneration", value: minRegeneration, min: 0, max: 650, step: 1, onChange: setMinRegeneration },
        { className: "min-resistance", name: "Resistance", value: minResistance, min: 0, max: 650, step: 1, onChange: setMinResistance },
        { className: "min-armor-piercing", name: "Armor Piercing", value: minArmorPiercing, min: 0, max: 650, step: 1, onChange: setMinArmorPiercing },
    ];

    // Weights
    const [powerWeight, setPowerWeight] = useState(1);
    const [defenseWeight, setDefenseWeight] = useState(1);
    const [sizeWeight, setSizeWeight] = useState(1);
    const [intensityWeight, setIntensityWeight] = useState(1);
    const [speedWeight, setSpeedWeight] = useState(1);
    const [agilityWeight, setAgilityWeight] = useState(1);
    const [regenerationWeight, setRegenerationWeight] = useState(1);
    const [resistanceWeight, setResistanceWeight] = useState(1);
    const [armorPiercingWeight, setArmorPiercingWeight] = useState(1);
    const weights = [
        { className: "power-weight", name: "Power", value: powerWeight, min: 0, max: 200, step: 1, onChange: setPowerWeight },
        { className: "defense-weight", name: "Defense", value: defenseWeight, min: 0, max: 200, step: 1, onChange: setDefenseWeight },
        { className: "size-weight", name: "Size", value: sizeWeight, min: 0, max: 200, step: 1, onChange: setSizeWeight },
        { className: "intensity-weight", name: "Intensity", value: intensityWeight, min: 0, max: 200, step: 1, onChange: setIntensityWeight },
        { className: "speed-weight", name: "Speed", value: speedWeight, min: 0, max: 200, step: 1, onChange: setSpeedWeight },
        { className: "agility-weight", name: "Agility", value: agilityWeight, min: 0, max: 200, step: 1, onChange: setAgilityWeight },
        { className: "regeneration-weight", name: "Regeneration", value: regenerationWeight, min: 0, max: 200, step: 1, onChange: setRegenerationWeight },
        { className: "resistance-weight", name: "Resistance", value: resistanceWeight, min: 0, max: 200, step: 1, onChange: setResistanceWeight },
        { className: "armor-piercing-weight", name: "Armor Piercing", value: armorPiercingWeight, min: 0, max: 200, step: 1, onChange: setArmorPiercingWeight },
    ];

    const update = () => {

    }

    return <div>
        <HelmetProvider>
            <Helmet>
                <title>Arcane Odyssey Armor Builds</title>
                {/* Google tag (gtag.js) */}
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-YC04R7C65B"></script>
                <script>
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());

                        gtag('config', 'G-YC04R7C65B');
                    `}
                </script>
            </Helmet>
        </HelmetProvider>
        <h1>Arcane Odyssey Armor Build</h1>
        <div className="br-small"></div>
        <div id="info">
            <div>
                Made by <b>myaltaccountsthis</b> (<a target="_blank" href="https://www.discord.gg/3GARqj2" title="myaltaccountsthis">Discord</a> | <a target="_blank" href="https://www.youtube.com/myaltaccountsthis" title="myaltaccountsthis">YouTube</a>)
            </div>
            <div className="br-small"></div>
            <div>Check the source code <a target="_blank" href="https://github.com/myaltaccountsthis/arcane-odyssey-guides">here</a></div>
            <div className="br-small"></div>
            <div><a href="index.html">More Guides</a></div>
        </div>
        <br />
        <div>
            <button id="filter-list-button" className="toggle" onClick={() => setInfoVisible(!infoVisible)}>{infoVisible ? "Hide Filters" : "Show Filters"}</button>
            {infoVisible &&
                <div>
                    <CheckboxGroup title="Restrictions" checkboxes={restrictions}/>
                    <br />
                    <SliderGroup title="Options" sliders={options}/>
                    <br />
                    <SliderGroup title="Mins" sliders={mins} />
                    <br />
                    <SliderGroup title="Weights" sliders={weights} />
                </div>
            }
        </div>
        <br />
        <CopyPasteSettings settingsStr="" setCopyPaste={setCopyPaste}/>
        <br />
        <input type="button" onClick={update} value="Update"  />
        <br />
        <div id="armor-list"></div>
        <br />
        <div id="drop-downs">
            <DropDown title="More Info" lines={definition} boldLines={moreInfo}/>
            <br />
            <DropDown title="Tips" lines={tips}/>
        </div>
    </div>
}

export default ArmorCalculator;