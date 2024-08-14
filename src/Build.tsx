// Custom set (hashmap implementation)

class Entry<T> {
    key: T;
    next: Entry<T> | null;

    constructor(key: T) {
        this.key = key;
        this.next = null;
    }
}

class CustomSet<T> {
    hashFunction: (key: T) => number;
    equalsFunction: (a: T, b: T) => boolean;
    entries: (Entry<T> | null)[];
    size: number;

    constructor(hashFunction: ((key: T) => number), equalsFunction: ((a: T, b: T) => boolean)) {
        this.hashFunction = hashFunction;
        this.equalsFunction = equalsFunction;
        // we are dealing with hundreds of thousands of builds
        this.entries = new Array(1000);
        this.size = 0;
        this.clear();
    }

    hash(key: T) {
        return this.hashFunction(key) % this.entries.length;
    }

    add(key: T) {
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

    addAll(arr: T[]) {
        for (const key of arr) {
            this.add(key);
        }
    }

    contains(key: T) {
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

    remove(key: T) {
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
Armor.prototype.toString = function () {
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
        this.multiplier = getMult(this) + getExtraTotalStats(this) / (BASE_ATTACK / 2 + BASE_HEALTH / Ratio[1] / 2);
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
            return `<tr><td class="${armorName.split(" ")[0].toLowerCase()}">${armor.modifier != undefined ? armor.modifier + " " : ""}${armor.enchant} ${armorName}</td></tr>
              <tr><td>${armor.jewels.join(" ")}</td></tr>`;
        }).join("")}
          </table>
        </div>
      `;
    }
}
Build.prototype.toString = function () {
    let output = `Multiplier: ${(Math.round(this.multiplier * 10000) / 10000)}\nBonus Stats: ${this.stats.join("/")}\nArmor: ${this.armorList.join(" ")}`;
    output += `\nEnchants: ${this.enchants.join('/')}`;
    return output;
}