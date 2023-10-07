// For Armor.html

// Config
let MODE_BONUS = .2;
let decimalPlaces = 3;
// Unlike python script, these range from [0, 1]
const weights = [1, 1, .25, .5, .5, .4];
const minStats = [0, 0, 0, 0, 0, 0];
const maxStats = [200, 3000, 400, 400, 400, 400];
const absMaxStats = [];
let includeSecondary = true;
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
const BASE_HEALTH = 968;
const HEALTH_PER_VIT = 4;
const BASE_ATTACK = 144;

// Stat order: power defense size intensity speed agility

// Tracking
let calls = 0;

class Armor {
  constructor(name, stats, jewelSlots) {
    this.name = name;
    this.stats = stats;
    this.jewelSlots = jewelSlots;
    this.nonZeroStats = stats.map((val, i) => i).filter(i => stats[i] > 0);
  }
}
Armor.prototype.toString = function() {
  return this.name;
}

class Build {
  constructor(armorList = [], vit = 0, stats = [0, 0, 0, 0, 0, 0], enchants = [0, 0, 0, 0, 0, 0], jewels = [0, 0, 0, 0, 0, 0], useEnchants = false, useJewels = false) {
    this.stats = stats
    this.armorList = armorList;
    this.vit = vit;
    this.enchants = enchants;
    this.jewels = jewels;
    this.jewelSlots = armorList.reduce((sum, armor) => sum + armor.jewelSlots, 0);
    this.hash = getHash(stats);
    // this.statCode = getStatCode(stats);
    this.multiplier = getMult(this) * (1 + .005 * getExtraStats(this));
    this.useEnchants = useEnchants;
    this.useJewels = useJewels;
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

  isValid() {
    if (!this.stats.every((val, i) => val <= maxStats[i]))
      return false;
    if (!this.useEnchants && !this.useJewels)
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
        <div>Multiplier: <span style="color: ${this.multiplierColorStr()}">${getFormattedMultiplierStr(this.multiplier)}</span></div>
        ${`<div>Base Multiplier: <span style="color: ${getMultiplierColorStr(getBaseMult(this))}">${getFormattedMultiplierStr(getBaseMult(this))}</span></div>`}
        <div>${StatOrder.map(stat => `<span class="${stat}">${this[stat]()}</span><img class="icon" src="./armor/${stat}_icon.png">`).join(" ")}</div>
        <div class="br-small"></div>
        <table>
          <th>Armor</th>
          ${this.armorList.map(armor => {
            const armorName = armor.toString().replaceAll("_", " ");
            return `<tr><td class="${armorName.split(" ")[0].toLowerCase()}">${armorName}</td></tr>`;
          }).join("")}
        </table>
        <div class="br-small"></div>
        <div>Enchants: ${StatOrder.map((statName, i) => `<span class="${statName}">${this.enchants[i]}</span>`).join("/")}</div>
        <div>Jewels: ${StatOrder.map((statName, i) => `<span class="${statName}">${this.jewels[i]}</span>`).join("/")}</div>
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
  return `hsl(${(mult - 1.7) * 120}, 100%, 40%)`;
}

function getFormattedMultiplierStr(mult) {
  const tens = 10 ** decimalPlaces;
  return `${Math.floor(mult)}.${(Math.floor(mult * tens) % tens).toString().padStart(decimalPlaces, "0")}`;
}

// pow/def, vit multiplier without weight
function getBaseMult(build) {
  return (BASE_HEALTH + HEALTH_PER_VIT * build.vit + build.stats[1]) / BASE_HEALTH * (build.stats[0] + BASE_ATTACK) / BASE_ATTACK;
}

// Returns modified multiplier affected by weight
function getMult(build) {
  const mult = (1 + (HEALTH_PER_VIT * build.vit + build.stats[1]) * getDefenseWeight() / BASE_HEALTH) * (1 + (build.stats[0]) * getPowerWeight() / BASE_ATTACK);
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
  // return Math.pow(.0132 * Math.pow(stat, 1.176) + 1, .35) + .0552 * Math.pow(stat, .241) - .059 * Math.log(stat + 1) / Math.log(30);
  return Math.pow(.01194 * Math.pow(stat, 1.188) + 1, .3415) + .06195 * Math.pow(stat, .2992) - .0893 * Math.log(stat + 1) / Math.log(30);
}

function getExtraStats(build) {
  let statsLeft = 0;
  if (build.useEnchants)
    statsLeft += 5 * EnchantStats[0];
  if (build.useJewels)
    statsLeft += JewelStats[0] * (build.jewelSlots);
  for (const i in build.stats) {
    statsLeft -= Math.max((minStats[i] - build.stats[i]), 0) * EnchantStats[0] / EnchantStats[i];
  }
  return statsLeft;
}

// Solver.py
const Order = ["Amulet", "Accessory", "Boots", "Chestplate", "Enchant", "Helmet", "Jewel"];
const StatOrder = ["power", "defense", "size", "intensity", "speed", "agility"];
const Armors = [[], [], [], [], [], [], []];
const EnchantStats = [];
const JewelStats = [];

const BUILD_SIZE = 100;
const ARMOR_SIZE = 200;

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
  const info = await fetch("./armor/" + fileName).then(response => response.json());
  for (const line of info) {
    const words = line.split(" ");
    const category = words[0];
    const name = words[1];
    const stats = [];
    for (let i = 2; i < 8; i++) {
      stats.push(parseInt(words[i]));
    }
    const jewels = words.length > 8 ? parseInt(words[8]) : 0;
    const armor = new Armor(name, stats, jewels);
    const index = Order.indexOf(category);
    Armors[index].push(armor);
    if (index == Order.indexOf("Jewel"))
      JewelStats.push(stats.reduce((a, b) => a + b, 0));
    if (index == Order.indexOf("Enchant"))
      EnchantStats.push(stats.reduce((a, b) => a + b, 0));
  }
  absMaxStats.splice(0, absMaxStats.length);
  StatOrder.map(statName => BigInt(document.getElementById(`max-${statName}`).max)).forEach(max => absMaxStats.push(max));
}

// The main function. Returns an array of the top 100 builds
function solve(vit, useSunken, useAmulet, useJewels) {
  // tracking vars
  let validArmor = 0, actualArmor = 0, nArmor = 0, dupesArmor = 0, purgesArmor = 0;
  let validEnchant = 0, actualEnchant = 0, nEnchant = 0, dupesEnchant = 0, purgesEnchant = 0;
  let validJewel = 0, actualJewel = 0, nJewel = 0, dupesJewel = 0, purgesJewel = 0;
  calls = 0;
  // TODO subtract jewels if using them
  // let minArmorStats = minStats.map((val, i) => Math.max(val - Armors[4][i].stats[i] * 5 - (useJewels ? Armors[6][i].stats[i] * 10 : 0), 0));
  const armorSet = new CustomSet();
  log(console.time, "solveArmor");
  for (const armor of Armors[3]) {
    if (!useSunken && armor.name.startsWith("Sunken"))
      continue;

    for (const boot of Armors[2]) {
      if (!useSunken && boot.name.startsWith("Sunken"))
        continue;

      for (let i = 0; i < Armors[1].length; i++) {
        const accessory1 = Armors[1][i];
        // Make accessory2 array (helmets)
        const helmets = Armors[5].filter(helmet => useSunken || !helmet.name.startsWith("Sunken"));
        const length = helmets.length;
        const accessories2 = helmets.concat(Armors[1].slice(i + 1));

        for (let j = 0; j < accessories2.length; j++) {
          const accessory2 = accessories2[j];
          // Make accessory3 array (amulets)
          // If accessory2 is a helmet (j < length), allow only other accessories, otherwise allow accessories after j
          const accessories3 = (j < length ? accessories2.slice(length) : accessories2.slice(j + 1)).concat(useAmulet ? Armors[0] : []);

          for (const accessory3 of accessories3) {
            const armorList = [armor, boot, accessory1, accessory2, accessory3];
            const armorStats = [0, 0, 0, 0, 0, 0];
            for (const item of armorList) {
              for (const k of item.nonZeroStats)
                armorStats[k] += item.stats[k];
            }
            const build = new Build(armorList, vit, armorStats, undefined, undefined, true, useJewels);
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
  const armorArr = purge(armorSet.toList());
  purgesArmor++;
  log(console.timeEnd, "solveArmor");
  const enchantSet = new CustomSet();
  log(console.time, "solveEnchant");
  const enchantCombinations = calculateCombinations(includeSecondary ? 6 : 2, 5);
  // TODO should only be applied if using jewels
  for (const armorBuild of armorArr) {
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
  }
  const enchantArr = purge(enchantSet.toList());
  purgesEnchant++;
  log(console.timeEnd, "solveEnchant");
  const jewelSet = useJewels ? new CustomSet() : enchantSet;
  if (useJewels) {
    log(console.time, "solveJewels");
    for (const enchantBuild of enchantArr) {
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
    }
    log(console.timeEnd, "solveJewels");
  }
  
  log(console.log, `${armorSet.size} builds after armor, ${enchantSet.size} builds after enchant, ${jewelSet.size} builds after jewel, ${calls} equals calls`);
  log(console.log, `${nArmor} armor, ${validArmor} valid, ${dupesArmor} armor dupes, ${purgesArmor} armor purges`);
  log(console.log, `${nEnchant} enchant, ${validEnchant} valid, ${dupesEnchant} enchant dupes, ${purgesEnchant} enchant purges`);
  log(console.log, `${nJewel} jewel, ${validJewel} valid, ${dupesJewel} jewel dupes, ${purgesJewel} jewel purges`);
  return purge(jewelSet.toList(), BUILD_SIZE);
}

// Sort and limit number of elements
function purge(builds, SIZE = ARMOR_SIZE) {
  return builds.sort((a, b) => b.compare(a)).slice(0, SIZE);
}

// Runs once when the website is loaded
async function run() {
  vitChange(document.getElementById("vit"));
  for (const i in StatOrder) {
    const statName = StatOrder[i];
    minChange(i, document.getElementById(`min-${statName}`));
    maxChange(i, document.getElementById(`max-${statName}`));
    if (i >= 2)
      weightChange(i, document.getElementById(`weight-${statName}`));
  }
  modeBonusChange(document.getElementById("mode-bonus"));

  log(console.time, "getInfo");
  await getInfo("info.json");
  log(console.timeEnd, "getInfo");

  // update();
}

// Update the list of builds (takes a long time to run)
async function update() {
  const vit = parseInt(document.getElementById("vit").value);
  const useSunken = document.getElementById("use-sunken").checked;
  const useAmulet = document.getElementById("use-amulet").checked;
  const useJewels = document.getElementById("use-jewels").checked;
  const armorList = document.getElementById("armor-list");

  armorList.innerHTML = "<div>Loading...</div>";
  setTimeout(async () => {
    const start = performance.now();
    log(console.log, "-".repeat(10));
    log(console.time, "updateTotal");
    log(console.time, "solve");
    const builds = solve(vit, useSunken, useAmulet, useJewels).slice(0, 100);
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
    const statName = StatOrder[index];
    const value = Math.max(parseInt(document.getElementById(`min-${statName}`).min), Math.min(int, parseInt(document.getElementById(`min-${statName}`).max)));
    document.getElementById(`min-${statName}-text`).value = value;
    document.getElementById(`min-${statName}`).value = value;
    minStats[index] = value;
  }
}

function maxChange(index, input) {
  const int = parseInt(input.value);
  if (!isNaN(int)) {
    const statName = StatOrder[index];
    const value = Math.max(parseInt(document.getElementById(`max-${statName}`).min), Math.min(int, parseInt(document.getElementById(`max-${statName}`).max)));
    document.getElementById(`max-${statName}-text`).value = value;
    document.getElementById(`max-${statName}`).value = value;
    maxStats[index] = value;
  }
}

function vitChange(input) {
  const int = parseInt(input.value);
  if (!isNaN(int)) {
    const value = Math.max(parseInt(document.getElementById("vit").min), Math.min(int, parseInt(document.getElementById("vit").max)));
    document.getElementById("vit-text").value = value;
    document.getElementById("vit").value = value;
  }
}

function decimalsChange(input) {
  const int = parseInt(input.value);
  if (!isNaN(int)) {
    const value = Math.max(parseInt(document.getElementById("decimals").min), Math.min(int, parseInt(document.getElementById("decimals").max)));
    document.getElementById("decimals-text").value = value;
    document.getElementById("decimals").value = value;
    decimalPlaces = value;
  }
}

function weightChange(index, input) {
  const int = parseInt(input.value);
  if (!isNaN(int)) {
    const statName = StatOrder[index];
    const value = Math.max(parseInt(document.getElementById(`weight-${statName}`).min), Math.min(int, parseInt(document.getElementById(`weight-${statName}`).max)));
    document.getElementById(`weight-${statName}-text`).value = value;
    document.getElementById(`weight-${statName}`).value = value;
    weights[index] = value / 100;
  }
}

function modeBonusChange(input) {
  const int = parseInt(input.value);
  if (!isNaN(int)) {
    const value = Math.max(parseInt(document.getElementById("mode-bonus").min), Math.min(int, parseInt(document.getElementById("mode-bonus").max)));
    document.getElementById("mode-bonus-text").value = value;
    document.getElementById("mode-bonus").value = value;
    MODE_BONUS = value / 100;
  }
}

function toggleSecondary(input) {
  includeSecondary = input.checked;
  for (const element of document.getElementsByClassName("secondary")) {
    element.style.display = includeSecondary ? "" : "none";
  }
}

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

function onBodyLoad() {
  // update();
  if (window.sessionStorage.getItem("showInfo"))
    toggleInfo(document.getElementById("visibility-button"));
  if (window.sessionStorage.getItem("showIgnoreList"))
    toggleIgnoreList(document.getElementById("filter-list-button"));
}