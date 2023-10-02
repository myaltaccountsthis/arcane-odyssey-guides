importScripts("./armor-util.js");

getInfo();

// The main function. Returns an array of the top 100 builds
onmessage = (e) => {
  const { vit, useSunken, useAmulet, useJewels, Order, StatOrder, Armors, EnchantStats, JewelStats, minStats, maxStats, absMaxStats, weights, MODE_BONUS, includeSecondary } = e.data;

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
  postMessage(purge(jewelSet.toList(), BUILD_SIZE).map(build => build.asHTML()));
}

// Sort and limit number of elements
function purge(builds, SIZE = ARMOR_SIZE) {
  return builds.sort((a, b) => b.compare(a)).slice(0, SIZE);
}