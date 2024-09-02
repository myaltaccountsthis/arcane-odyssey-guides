from data import Armor, Build

TO_PRINT = 30

class Solver:
    def __init__(self, fileName):
        self.Order = ["Amulet", "Accessory", "Boots", "Chestplate", "Enchant", "Helmet"]
        self.Armors = [[], [], [], [], [], []]
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
    
    def solve(self, vit = 0, use_sunken = False, use_arcsphere = True):
        builds = []
        armorSet = set()
        for amulet in self.Armors[0]:
            for armor in self.Armors[3]:
                if not use_sunken and armor.name[:6] == "Sunken":
                    continue
                for boot in self.Armors[2]:
                    if not use_sunken and boot.name[:6] == "Sunken":
                        continue
                    for i in range(len(self.Armors[1]) - 1):
                        accessory1 = self.Armors[1][i]
                        if not use_arcsphere and accessory1.name == "Arcsphere":
                            continue
                        accessories = self.Armors[1][i + 1 : len(self.Armors[1])]
                        for helmet in self.Armors[5]:
                            if not use_sunken and helmet.name[:6] == "Sunken":
                                continue
                            accessories.append(helmet)
                        for accessory2 in accessories:
                            if not use_arcsphere and accessory2.name == "Arcsphere":
                                continue
                            armorList = [amulet, armor, boot, accessory1, accessory2]
                            stats = [0] * 6
                            for item in armorList:
                                for k in range(len(item.stats)):
                                    stats[k] += item.stats[k]
                            armorBuild = Build(armorList, stats)
                            if armorBuild in armorSet:
                                continue
                            armorSet.add(armorBuild)

                            for strong in range(6):
                                for hard in range(6 - strong):
                                    for bursting in range(6 - strong - hard):
                                        for amplified in range(6 - strong - hard - bursting):
                                            for swift in range(6 - strong - hard - bursting - amplified):
                                                nimble = 5 - strong - hard - bursting - amplified - swift
                                                enchants = [strong, hard, bursting, amplified, swift, nimble]
                                                newStats = [0] * 6
                                                for k in range(len(stats)):
                                                    newStats[k] = stats[k] + enchants[k] * self.Armors[4][k].stats[k]
                                                build = Build(armorList, newStats, enchants, vit)
                                                builds.append(build)
        builds.sort()
        builds.reverse()
        return builds
    
    def solveSmall(self, vit = 0, use_sunken = False, use_arcsphere = True):
        self.prune = False
        builds = []
        armorSet = set()
        for amulet in self.Armors[0]:
            for armor in self.Armors[3]:
                if not use_sunken and armor.name[:6] == "Sunken":
                    continue
                for boot in self.Armors[2]:
                    if not use_sunken and boot.name[:6] == "Sunken":
                        continue
                    for i in range(len(self.Armors[1]) - 1):
                        accessory1 = self.Armors[1][i]
                        if not use_arcsphere and accessory1.name == "Arcsphere":
                            continue
                        accessories = self.Armors[1][i + 1 : len(self.Armors[1])]
                        for helmet in self.Armors[5]:
                            if not use_sunken and helmet.name[:6] == "Sunken":
                                continue
                            accessories.append(helmet)
                        for accessory2 in accessories:
                            if not use_arcsphere and accessory2.name == "Arcsphere":
                                continue
                            armorList = [amulet, armor, boot, accessory1, accessory2]
                            stats = [0] * 6
                            for item in armorList:
                                for k in range(len(item.stats)):
                                    stats[k] += item.stats[k]
                            armorBuild = Build(armorList, stats)
                            if armorBuild in armorSet:
                                continue
                            armorSet.add(armorBuild)

                            for strong in range(6):
                                for hard in range(6 - strong):
                                    for bursting in range(6 - strong - hard):
                                        for amplified in range(6 - strong - hard - bursting):
                                            for swift in range(6 - strong - hard - bursting - amplified):
                                                nimble = 5 - strong - hard - bursting - amplified - swift
                                                enchants = [strong, hard, bursting, amplified, swift, nimble]
                                                newStats = [0] * 6
                                                for k in range(len(stats)):
                                                    newStats[k] = stats[k] + enchants[k] * self.Armors[4][k].stats[k]
                                                build = Build(armorList, newStats, enchants, vit)
                                                if (not self.prune or build > builds[TO_PRINT - 1]):
                                                    builds.append(build)
                            if len(builds) > 10 * TO_PRINT:
                                builds = self.purge(builds)
        builds = self.purge(builds)
        return builds
    
    def purge(self, builds):
        self.prune = True
        builds.sort()
        builds.reverse()
        builds = builds[:TO_PRINT]
        return builds
    
    def write(self, fileName, builds):
        with open(fileName, "w") as output:
            output.write("\n\n".join([str(build) for build in builds]))

    def writeSmall(self, fileName, builds):
        with open(fileName, "w") as output:
            i = 0
            for build in builds:
                if i >= 100:
                    break
                output.write(str(build) + "\n\n")
                i += 1

    def writePowers(self, filePrefix, builds, min, max, step):
        for power in range(min, max + step, step):
            self.writeLambda(filePrefix + str(power) + "power.txt", builds, lambda build : build.power() >= power)
            # with open(filePrefix + str(power) + "power.txt", "w") as output:
            #     for build in builds:
            #         if build.power() < power:
            #             continue
            #         output.write(str(build) + "\n\n")

    def writeLambda(self, fileName, builds, precon):
        with open(fileName, "w") as output:
            for build in builds:
                if not precon(build):
                    continue
                output.write(str(build) + "\n\n")