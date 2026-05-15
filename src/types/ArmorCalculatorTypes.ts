// import { BaseArmor } from "../Backend";

export type ArmorCalculatorSettings = { [key: string]: any };
export type ArmorCalculatorInput = {
  useEfficiencyPoints: boolean;
  useAmulet: boolean;
  useSunken: boolean;
  useModifier: boolean;
  // useExoticEnchants: boolean;
  useFusedJewels: boolean,
  insanity: number;
  drawback: number;
  warding: number;
  fightDuration: number;
  dragonBlood: number;
  shieldDef: number;
  minStats: number[];
  weights: number[];
  includeArmor: string[];
  excludeArmor: string[];
  enchantBounds: { [key: string]: [number, number] };
  jewelBounds: { [key: string]: [number, number] };
  modifierBounds: { [key: string]: [number, number] };
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
