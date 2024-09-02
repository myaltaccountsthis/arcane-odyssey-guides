from data import Armor, Build
import time

SIZE = 1000

class Solver:
    def __init__(self, fileName):
        self.Order = ["Amulet", "Accessory", "Boots", "Chestplate", "Enchant", "Helmet", "Jewel"]
        self.Armors = [[], [], [], [], [], [], []]
        self.prune = False
        with open(fileName, "r") as info:
            for line in info:
                words = line.split(" ")
                category = words[0]
                name = words[1]
                stats = []
                for i in range(2, len(words)):
                    stats.append(int(words[i]))
                armor = Armor(name, stats)
                self.Armors[self.Order.index(category)].append(armor)
    
    def calculateCombinations(self, available, options, combinations, current):
        if available == 0:
            newArray = current.copy()
            for i in range(options):
                newArray.append(0)
            combinations.append(newArray)
            return
        if options == 1:
            newArray = current.copy()
            newArray.append(available)
            combinations.append(newArray)
            return
        for i in range(available + 1):
            newArray = current.copy()
            newArray.append(i)
            self.calculateCombinations(available - i, options - 1, combinations, newArray)

    def solve(self, small = False, vit = 0, use_sunken = True):
        if small:
            self.prune = False
        armorSet = set()
        time1 = time.time()

        for armor in self.Armors[3]:
            if not use_sunken and armor.name[:6] == "Sunken":
                continue
            for boot in self.Armors[2]:
                if not use_sunken and boot.name[:6] == "Sunken":
                    continue
                for i in range(len(self.Armors[1])):
                    accessory1 = self.Armors[1][i]
                    
                    # Make accessory2 array (helmets)
                    accessories2 = self.Armors[1][i + 1 : len(self.Armors[1])]
                    length = len(accessories2)
                    for helmet in self.Armors[5]:
                        if not use_sunken and helmet.name[:6] == "Sunken":
                            continue
                        accessories2.append(helmet)
                    
                    for j in range(len(accessories2)):
                        accessory2 = accessories2[j]
                        
                        # Make accessory3 array (amulets)
                        accessories3 = j < length and accessories2[j + 1 : length] or []
                        for amulet in self.Armors[0]:
                            accessories3.append(amulet)
                        
                        for accessory3 in accessories3:
                            armorList = [armor, boot, accessory1, accessory2, accessory3]
                            stats = [0] * 6
                            for item in armorList:
                                for k in range(len(stats)):
                                    stats[k] += item.stats[k]
                            armorBuild = Build(armorList, vit, stats)
                            if armorBuild in armorSet:
                                continue
                            armorSet.add(armorBuild)
        time2 = time.time()
        print("Combinations", time2 - time1)
        builds = list(armorSet)
        if small:
            builds = self.purge(builds)
        else:
            builds.sort(reverse=True)
        print("Sorting", time.time() - time2)
        return builds
    

    def solveEnchants(self, small = False, vit = 0, use_sunken = True):
        builds = self.solve(small, vit, use_sunken)
        newBuilds = []
        combinations = []
        self.calculateCombinations(5, 6, combinations, [])
        time1 = time.time()
        for build in builds:
            for combination in combinations:
                stats = [0] * 6
                for i in range(len(stats)):
                    stats[i] = build.stats[i] + combination[i] * self.Armors[4][i].stats[i]
                newBuild = Build(build.armorList, build.vit, stats, combination)
                newBuilds.append(newBuild)
                if small and len(newBuilds) > 10 * SIZE:
                    newBuilds = self.purge(newBuilds)
        time2 = time.time()
        print("Enchant combinations", time2 - time1)
        if small:
            newBuilds = self.purge(newBuilds)
        else:
            newBuilds.sort(reverse=True)
        print("Sorting", time.time() - time2)
        return newBuilds

    def solveGems(self, small = False, vit = 0, use_sunken = True):
        builds = self.solveEnchants(small, vit, use_sunken)
        newBuilds = []
        combinations8 = []
        combinations10 = []
        self.calculateCombinations(8, 2, combinations8, [])
        self.calculateCombinations(10, 2, combinations10, [])
        time1 = time.time()
        for build in builds:
            if build.armorList[4].name[-6:] == "Amulet":
                self.gemHelper(newBuilds, combinations8, build, small)
            else:
                self.gemHelper(newBuilds, combinations10, build, small)
        time2 = time.time()
        print("Gem combinations", time2 - time1)
        if small:
            newBuilds = self.purge(newBuilds)
        else:
            newBuilds.sort(reverse=True)
        print("Sorting", time.time() - time2)
        return newBuilds
    
    def gemHelper(self, newBuilds, combinations, build, small):
        for combination in combinations:
            stats = [0] * 6
            for i in range(len(stats)):
                stats[i] = build.stats[i] + (len(combination) > i and combination[i] * self.Armors[6][i].stats[i] or 0)
            newBuild = Build(build.armorList, build.vit, stats, build.enchants, combination)
            newBuilds.append(newBuild)
            if small and len(newBuilds) > 10 * SIZE:
                newBuilds = self.purge(newBuilds)

    def purge(self, builds):
        self.prune = True
        builds.sort(reverse=True)
        builds = builds[:SIZE]
        return builds
    
    def write(self, fileName, builds):
        with open(fileName, "w") as output:
            output.write("\n\n".join([str(build) for build in builds]))

    def writeSmall(self, fileName, builds):
        with open(fileName, "w") as output:
            i = 0
            for build in builds:
                if i >= SIZE:
                    break
                output.write(str(build) + "\n\n")
                i += 1

    def writePowers(self, filePrefix, builds, min, max, step):
        for power in range(min, max + step, step):
            self.writeLambda(filePrefix + str(power) + "power.txt", builds, lambda build : build.power() >= power)

    def writeLambda(self, fileName, builds, precon):
        with open(fileName, "w") as output:
            for build in builds:
                if not precon(build):
                    continue
                output.write(str(build) + "\n\n")