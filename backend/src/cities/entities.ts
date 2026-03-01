export interface City {
  id: string;
  name: string;
  slug: string;
  created_at: Date;
  updated_at: Date;
}

export interface LivingCost {
  id: string;
  city_id: string;
  rent: number;
  food: number;
  transport: number;
  utilities: number;
  internet: number;
  created_at: Date;
  updated_at: Date;
}

export interface CityWithCosts extends City {
  costs: LivingCost | null;
}

export interface UpdateLivingCostDto {
  rent?: number;
  food?: number;
  transport?: number;
  utilities?: number;
  internet?: number;
}
