const BASE_HEALTH = 968;
const HEALTH_PER_VIT = 4;
const BASE_ATTACK = 144;

class Armor {
  constructor(name = "", power = 0, defense = 0) {
    this.name = name;
    this.power = power;
    this.defense = defense;
  }
}
Armor.prototype.toString = function() {
  return this.name;
}

class Build {
  constructor(power = 0, defense = 0, armorList = [], vit = 0, hard = 0) {
    this.power = power;
    this.defense = defense;
    this.armorList = armorList;
    this.vit = vit;
    this.hard = hard;
  }
  
  value() {
    return getMult(this.defense, this.power, this.vit);
  }
  
  compare(other) {
    return this.value() - other.value();
  }

  // value is from (1.7, 2.7)
  multiplierColorStr() {
    return `hsl(${(this.value() - 1.7) * 120}, 100%, 40%)`;
  }

  asHTML() {
    return `
      <div class="list-element">
        <div>Multiplier: <span style="color: ${this.multiplierColorStr()}">${Math.round(getMult(this.defense, this.power, this.vit) * 1000) / 1000}</span></div>
        <div>Bonus Stats: <span class="pow">${this.power}</span><img class="icon" src="./armor/Power_Icon.png"> <span class="def">${this.defense}</span><img class="icon" src="./armor/Defense_Icon.png"></div>
        <div class="br-small"></div>
        <table>
          <th>Armor</th>
          ${(() => {
            let str = "";
            for (let armor of this.armorList) {
              str += `<tr><td>${armor.toString().replaceAll("_", " ")}</td></tr>`;
            }
            return str; 
          })()}
        </table>
        <div class="br-small"></div>
        <div class="def">${this.hard} hard</div>
        <div class="pow">${5 - this.hard} strong</div>
      </div>
    `;
  }
}
Build.prototype.toString = function() {
  let output = "Multiplier: " + Math.round(getMult(this.defense, this.power, this.vit) * 1000) / 1000 + "\nBonus Stats: " + this.power + "/" + this.defense + "\nArmor: ";
  for (let armor of this.armorList)
    output += armor + " ";
  output = output.trim() + "\n" + this.hard + " hard, " + (5 - this.hard) + " strong";
  return output;
}

const Amulets = [];
const Accessories = [];
const Armors = [];
const Boots = [];

async function getInfo() {
  const info = await fetch("./armor/info.json").then(response => {
    return response.json();
  });
  for (const line of info) {
    const words = line.split(" ");
    const category = words[0];
    const name = words[1];
    const power = parseInt(words[2]);
    const defense = parseInt(words[3]);
    const armor = new Armor(name, power, defense);

    switch (category) {
      case "Amulet":
        Amulets.push(armor);
        break;

      case "Accessory":
        Accessories.push(armor);
        break;

      case "Armor":
        Armors.push(armor);
        break;

      case "Boot":
        Boots.push(armor);
        break;
    }
  }
}

function getMult(defense, power, vit) {
  return (BASE_HEALTH + HEALTH_PER_VIT * vit + defense) / BASE_HEALTH * (power + BASE_ATTACK) / BASE_ATTACK;
}

function solve(vit = 0, useSunken = false, useArcsphere = true, minPower = 0) {
  let builds = [];
  for (const amulet of Amulets) {
    for (const armor of Armors) {
      if (!useSunken && armor.name.substring(0, 6) == "Sunken")
        continue;
      for (const boot of Boots) {
        if (!useSunken && boot.name.substring(0, 6) == "Sunken")
          continue;
        for (let i = 0; i < Accessories.length - 1; i++) {
          const accessory1 = Accessories[i];
          if (!useArcsphere && accessory1.name == "Arcsphere")
            continue;
          for (let j = i + 1; j < Accessories.length; j++) {
            const accessory2 = Accessories[j];
            if (!useArcsphere && accessory2.name == "Arcsphere")
              continue;
            for (let k = 0; k < 6; k++) {
              const defense = amulet.defense + armor.defense + boot.defense + accessory1.defense + accessory2.defense + k * 72;
              const power = amulet.power + armor.power + boot.power + accessory1.power + accessory2.power + (5 - k) * 7;
              const armorList = [amulet, armor, boot, accessory1, accessory2];
              const hard = k;
              const build = new Build(power, defense, armorList, vit, hard);
              builds.push(build);
            }
          }
        }
      }
    }
  }
  builds = builds.filter(build => build.power >= minPower).sort((a, b) => a.compare(b)).reverse();
  // get rid of duplicates
  for (let i = 1; i < builds.length; i++) {
    if (builds[i].value() == builds[i - 1].value()) {
      builds.splice(i, 1);
      i--;
    }
  }
  return builds;
}
async function run() {
  minPowerChange(document.getElementById("min-power"));
  await getInfo();

  update();
}

async function update() {
  const vit = parseInt(document.getElementById("vit").value);
  const useSunken = document.getElementById("use-sunken").checked;
  const useArcsphere = document.getElementById("use-arcsphere").checked;
  const minPower = parseInt(document.getElementById("min-power").value);
  const builds = solve(vit, useSunken, useArcsphere, minPower).splice(0, 10);
  const armorList = document.getElementById("armor-list");
  armorList.innerHTML = "";
  for (const build of builds) {
    // TODO update right here
    const div = document.createElement("div");
    // div.className = "list-element";
    div.innerHTML = build.asHTML();
    armorList.appendChild(div);
  }
}

function minPowerChange(input) {
  const int = parseInt(input.value);
  if (!isNaN(int)) {
    const value = Math.max(0, Math.min(int, parseInt(document.getElementById("min-power").max)));
    document.getElementById("min-power-text").value = value;
    document.getElementById("min-power").value = value;
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