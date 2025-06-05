// import { BaseArmor } from "../Backend";

export type ArmorCalculatorSettings = { [key: string]: any };
export type ArmorCalculatorInput = {
  vit: number;
  useEfficiencyPoints: boolean;
  useAmulet: boolean;
  useSunken: boolean;
  useModifier: boolean;
  useExoticEnchants: boolean;
  // useExoticJewels: boolean,
  insanity: number;
  drawback: number;
  warding: number;
  fightDuration: number;
  minStats: number[];
  weights: number[];
  includeArmor: string[];
  excludeArmor: string[];
};

export type EventType = "init" | "config" | "solve";
export interface EventData {
  type: EventType;
  body: any;
}

// For armor filter
export type ArmorState = "none" | "include" | "exclude";
// For other filter
export type OtherType = "enchant" | "jewel" | "modifier";
