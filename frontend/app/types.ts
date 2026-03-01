export interface City {
  id: string;
  name: string;
  slug: string;
}

export interface LivingCost {
  id: string;
  city_id: string;
  rent: number;
  food: number;
  transport: number;
  utilities: number;
  internet: number;
}

export interface CityWithCosts extends City {
  costs: LivingCost | null;
}

export interface ComparisonResult {
  cityA: CityWithCosts;
  cityB: CityWithCosts;
  totalA: number;
  totalB: number;
  percentDifference: number;
  moreAffordableCityId: string;
  summaryText: string;
  /** AI-generated or fallback insight */
  aiInsight: string;
}
