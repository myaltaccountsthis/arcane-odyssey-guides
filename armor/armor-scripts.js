// For Armor.html

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
  await getInfo();
  log(console.timeEnd, "getInfo");

  // update();
}

const worker = new Worker("/armor/solver.js");
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

    const builds = await new Promise((res, rej) => {
      worker.onmessage = (e) => {
        res(e.data.slice(0, 100));
      };
      worker.postMessage({ vit, useSunken, useAmulet, useJewels, Order, StatOrder, Armors, EnchantStats, JewelStats, minStats, maxStats, absMaxStats, weights, MODE_BONUS, includeSecondary });
    });
    // const builds = solve(vit, useSunken, useAmulet, useJewels).slice(0, 100);
    log(console.timeEnd, "solve");
    log(console.time, "updateHTML");
    if (builds.length === 0) {
      armorList.innerHTML = "<div>No builds found</div>";
    }
    else {
      armorList.innerHTML = "";
      for (const buildHTML of builds) {
        // TODO update right here
        const div = document.createElement("div");
        // div.className = "list-element";
        div.innerHTML = buildHTML;
        armorList.appendChild(div);
      }
    }
    log(console.timeEnd, "updateHTML");
    log(console.timeEnd, "updateTotal");
  }, 100);
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