// For Armor.html

// Config
let MODE_BONUS = .2;
// Unlike python script, these range from [0, 1]
const weights = [1, 1, .25, .5, .5, .4];
const minStats = [0, 0, 0, 0, 0, 0];
const maxStats = [200, 3000, 400, 400, 400, 400];
const absMaxStats = [];
let includeSecondary = true;

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
  constructor(hashFunction, equalsFunction) {
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
  constructor(name, stats) {
    this.name = name;
    this.stats = stats;
    this.nonZeroStats = stats.map((val, i) => i).filter(i => stats[i] > 0);
  }
}
Armor.prototype.toString = function() {
  return this.name;
}

class Build {
  constructor(armorList = [], vit = 0, stats = [0, 0, 0, 0, 0, 0], enchants = [0, 0, 0, 0, 0, 0], jewels = [0, 0, 0, 0, 0, 0]) {
    this.stats = stats
    this.armorList = armorList;
    this.vit = vit;
    this.enchants = enchants;
    this.jewels = jewels;
    this.hash = getHash(stats);
    // this.statCode = getStatCode(stats);
    this.multiplier = getMult(this);
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
    for (const i in this.stats) {
      if (this.stats[i] < minStats[i] || this.stats[i] > maxStats[i]) {
        return false;
      }
    }
    return true;
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
        ${includeSecondary ? `<div>Base Multiplier: <span style="color: ${getMultiplierColorStr(getBaseMult(this))}">${getFormattedMultiplierStr(getBaseMult(this))}</span></div>` : ""}
        <div>${StatOrder.map(stat => `<span class="${stat}">${this[stat]()}</span><img class="icon" src="./armor/${stat}_Icon.png">`).join(" ")}</div>
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
      </div>
    `;
  }
}
Build.prototype.toString = function() {
  let output = `Multiplier: ${(Math.round(this.multiplier * 1000) / 1000)}\nBonus Stats: ${this.stats.join("/")}\nArmor: ${this.armorList.join(" ")}`;
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
  return `${Math.floor(mult)}.${(Math.floor(mult * 1000) % 1000).toString().padStart(3, "0")}`;
}

// pow/def, vit multiplier
function getBaseMult(build) {
  return (BASE_HEALTH + HEALTH_PER_VIT * build.vit + build.stats[1]) / BASE_HEALTH * (build.stats[0] + BASE_ATTACK) / BASE_ATTACK;
}

function getMult(build) {
  if (includeSecondary)
    return getBaseMult(build) * otherMult(build);
  return (BASE_HEALTH + HEALTH_PER_VIT * build.vit + build.stats[1]) / BASE_HEALTH * (build.stats[0] + BASE_ATTACK) / BASE_ATTACK;
}

// secondary stats multiplier
function otherMult(build) {
  const modeMultiplier = 1 / (1 / MODE_BONUS + 1);
  return ((estimateMultComplex(build.stats[2]) - 1) * getSizeWeight() * 4/7 + 1) * ((1 + estimateMultComplex(build.stats[3]) * getIntensityWeight() * modeMultiplier) / (1 + getIntensityWeight() * modeMultiplier)) * ((estimateMultComplex(build.stats[4]) - 1) * getSpeedWeight() * 4/7 + 1) * ((estimateMultComplex(build.stats[5]) - 1) * getAgilityWeight() * 4/7 + 1);
}

// estimate effect of secondary stats (bc non-linear)
function estimateMultComplex(stat) {
  return Math.pow(.0132 * Math.pow(stat, 1.176) + 1, .35) + .0552 * Math.pow(stat, .241) - .059 * Math.log(stat + 1) / Math.log(30);
}


// Solver.py
const Order = ["Amulet", "Accessory", "Boots", "Chestplate", "Enchant", "Helmet"];
const StatOrder = ["power", "defense", "size", "intensity", "speed", "agility"];
const Armors = [[], [], [], [], [], []];

const BUILD_SIZE = 100;
const ARMOR_SIZE = 1000; 

// Combinations: [[number]], index: enchant index, arr, remaining: number
// Should be called only once
function calculateCombinationsHelper(combinations, numEnchants, index, arr, remaining) {
  if (index === numEnchants) {
    combinations.push(arr.slice());
    return;
  }
  if (index === numEnchants - 1) {
    arr[index] = remaining;
    combinations.push(arr.slice());
    return;
  }
  for (let i = 0; i <= remaining; i++) {
    arr[index] = i;
    calculateCombinationsHelper(combinations, numEnchants, index + 1, arr, remaining - i);
    // no need to set arr[index] to 0 because subsequent calls will overwrite it
  }
}

// Returns an array of Armor objects where the stats are the number of enchants
function calculateCombinations(numEnchants, remaining, forceLength = 6) {
  const combinations = [];
  calculateCombinationsHelper(combinations, numEnchants, 0, [], remaining);
  return combinations.map(arr => arr.concat(Array(forceLength - numEnchants).fill(0))).map(stats => new Armor("e", stats));
}

// Load data from info file into Armors. Must be called before solve()
async function getInfo(fileName) {
  const info = await fetch("./armor/" + fileName).then(response => response.json());
  for (const line of info) {
    const words = line.split(" ");
    const category = words[0];
    const name = words[1];
    const stats = [];
    for (let i = 2; i < words.length; i++) {
      stats.push(parseInt(words[i]));
    }
    const armor = new Armor(name, stats);
    Armors[Order.indexOf(category)].push(armor);
  }
  absMaxStats.splice(0, absMaxStats.length);
  StatOrder.map(statName => BigInt(document.getElementById(`max-${statName}`).max)).forEach(max => absMaxStats.push(max));
}

function solve(vit = 0, useSunken = false) {
  let actualArmor = 0, actualEnchant = 0, valid = 0, nArmor = 0, nEnchant = 0, dupesArmor = 0, dupesEnchant = 0, purgesArmor = 0, purgesEnchant = 0;
  calls = 0;
  const buildSet = new CustomSet(build => build.hash, (a, b) => a.equals(b));
  const armorSet = new CustomSet(build => build.hash, (a, b) => a.equals(b));
  const EnchantCombinations = calculateCombinations(includeSecondary ? 6 : 2, 5);
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
          const accessories3 = (j < length ? accessories2.slice(length) : accessories2.slice(j + 1)).concat(Armors[0]);

          for (const accessory3 of accessories3) {
            const armorList = [armor, boot, accessory1, accessory2, accessory3];
            const armorStats = [0, 0, 0, 0, 0, 0];
            for (const item of armorList) {
              for (const k of item.nonZeroStats)
                armorStats[k] += item.stats[k];
            }
            const build = new Build(armorList, vit, armorStats);
            nArmor++;
            if (armorSet.add(build)) {
              actualArmor++;
            }
            else {
              dupesArmor++;
            }
            if (armorSet.size > ARMOR_SIZE * 10) {
              const buildArr = purge(armorSet.toList());
              armorSet.clear();
              armorSet.addAll(buildArr);
              purgesArmor++;
            }
          }
        }
      }
    }
  }
  for (const armorBuild of armorSet.toList()) {
    for (const enchant of EnchantCombinations) {
      const combination = enchant.stats;
      const stats = armorBuild.stats.slice();
      for (const i of enchant.nonZeroStats) {
        stats[i] += combination[i] * Armors[4][i].stats[i];
      }
      const build = new Build(armorBuild.armorList, vit, stats, combination);
      nEnchant++;
      if (build.isValid()) {
        valid++;
        if (buildSet.add(build)) {
          actualEnchant++;
        }
        else {
          dupesEnchant++;
        }
      }
      
      if (buildSet.size > ARMOR_SIZE * 10) {
        const buildArr = purge(buildSet.toList());
        buildSet.clear();
        buildSet.addAll(buildArr);
        purgesEnchant++;
      }
    }
  }
  // TODO track num builds
  console.log(`${armorSet.size} builds before enchant, ${buildSet.size} builds after enchant, ${valid} valid, ${calls} equals calls`);
  console.log(`${nArmor} armor, ${dupesArmor} armor dupes, ${purgesArmor} armor purges`);
  console.log(`${nEnchant} enchant, ${dupesEnchant} enchant dupes, ${purgesEnchant} enchant purges`);
  return purge(buildSet.toList(), BUILD_SIZE);
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

  console.time("getInfo");
  await getInfo("infonew.json");
  console.timeEnd("getInfo");

  // update();
}

// Update the list of builds (takes a long time to run)
async function update() {
  const vit = parseInt(document.getElementById("vit").value);
  const useSunken = document.getElementById("use-sunken").checked;
  const armorList = document.getElementById("armor-list");

  armorList.innerHTML = "<div>Loading...</div>";
  setTimeout(async () => {
    console.time("updateTotal");
    console.time("solve");
    const builds = solve(vit, useSunken).slice(0, 100);
    console.timeEnd("solve");
    console.time("updateHTML");
    armorList.innerHTML = "";
    for (const build of builds) {
      // TODO update right here
      const div = document.createElement("div");
      // div.className = "list-element";
      div.innerHTML = build.asHTML();
      armorList.appendChild(div);
    }
    console.timeEnd("updateHTML");
    console.timeEnd("updateTotal");
  }, 100);
}

function minChange(index, input) {
  const int = parseInt(input.value);
  if (!isNaN(int)) {
    const statName = StatOrder[index];
    const value = Math.max(0, Math.min(int, parseInt(document.getElementById(`min-${statName}`).max)));
    document.getElementById(`min-${statName}-text`).value = value;
    document.getElementById(`min-${statName}`).value = value;
    minStats[index] = value;
  }
}

function maxChange(index, input) {
  const int = parseInt(input.value);
  if (!isNaN(int)) {
    const statName = StatOrder[index];
    const value = Math.max(0, Math.min(int, parseInt(document.getElementById(`max-${statName}`).max)));
    document.getElementById(`max-${statName}-text`).value = value;
    document.getElementById(`max-${statName}`).value = value;
    maxStats[index] = value;
  }
}

function vitChange(input) {
  const int = parseInt(input.value);
  if (!isNaN(int)) {
    const value = Math.max(0, Math.min(int, parseInt(document.getElementById("vit").max)));
    document.getElementById("vit-text").value = value;
    document.getElementById("vit").value = value;
  }
}

function weightChange(index, input) {
  const int = parseInt(input.value);
  if (!isNaN(int)) {
    const statName = StatOrder[index];
    const value = Math.max(0, Math.min(int, parseInt(document.getElementById(`weight-${statName}`).max)));
    document.getElementById(`weight-${statName}-text`).value = value;
    document.getElementById(`weight-${statName}`).value = value;
    weights[index] = value / 100;
  }
}

function modeBonusChange(input) {
  const int = parseInt(input.value);
  if (!isNaN(int)) {
    const value = Math.max(0, Math.min(int, parseInt(document.getElementById("mode-bonus").max)));
    document.getElementById("mode-bonus-text").value = value;
    document.getElementById("mode-bonus").value = value;
    MODE_BONUS = value / 100;
  }
}

function toggleSecondary() {
  includeSecondary = !includeSecondary;
  for (const element of document.getElementsByClassName("secondary")) {
    element.style.display = includeSecondary ? "" : "none";
  }
}