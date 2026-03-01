import { Injectable, NotFoundException } from '@nestjs/common';
import { CitiesService } from '../cities/cities.service';
import { InsightService } from '../insight/insight.service';
import type { CityWithCosts } from '../cities/entities';

export interface ComparisonResult {
  cityA: CityWithCosts;
  cityB: CityWithCosts;
  totalA: number;
  totalB: number;
  percentDifference: number; // positive = A more expensive than B
  moreAffordableCityId: string;
  summaryText: string;
  /** AI-generated or fallback insight (always present) */
  aiInsight: string;
}

const COST_KEYS = ['rent', 'food', 'transport', 'utilities', 'internet'] as const;
const COST_LABELS_ES: Record<(typeof COST_KEYS)[number], string> = {
  rent: 'alquiler',
  food: 'alimentación',
  transport: 'transporte',
  utilities: 'servicios básicos',
  internet: 'internet',
};

function total(costs: { rent: number; food: number; transport: number; utilities: number; internet: number }): number {
  return Number(costs.rent) + Number(costs.food) + Number(costs.transport) + Number(costs.utilities) + Number(costs.internet);
}

@Injectable()
export class ComparisonService {
  constructor(
    private readonly cities: CitiesService,
    private readonly insight: InsightService,
  ) {}

  async compare(cityAId: string, cityBId: string): Promise<ComparisonResult> {
    const [cityA, cityB] = await Promise.all([
      this.cities.findOne(cityAId),
      this.cities.findOne(cityBId),
    ]);
    if (!cityA.costs) throw new NotFoundException(`No cost data for city ${cityA.name}`);
    if (!cityB.costs) throw new NotFoundException(`No cost data for city ${cityB.name}`);

    const totalA = total(cityA.costs);
    const totalB = total(cityB.costs);
    const diff = totalA - totalB;
    const percentDifference = totalB === 0 ? 0 : (diff / totalB) * 100;
    const moreAffordableCityId = totalA <= totalB ? cityA.id : cityB.id;
    const expensiveName = totalA >= totalB ? cityA.name : cityB.name;
    const cheapName = totalA <= totalB ? cityA.name : cityB.name;
    const pct = Math.abs(Math.round(percentDifference * 10) / 10);
    const summaryText =
      percentDifference === 0
        ? `${cityA.name} and ${cityB.name} have the same total monthly cost.`
        : `${expensiveName} is ${pct}% more expensive than ${cheapName}.`;

    let aiInsight = this.insight.isAvailable()
      ? await this.insight.generateInsight(cityA, cityB)
      : null;
    if (!aiInsight) {
      aiInsight = this.buildFallbackInsight(cityA, cityB);
    }

    return {
      cityA,
      cityB,
      totalA,
      totalB,
      percentDifference,
      moreAffordableCityId,
      summaryText,
      aiInsight,
    };
  }

  private buildFallbackInsight(cityA: CityWithCosts, cityB: CityWithCosts): string {
    if (!cityA.costs || !cityB.costs) return '';
    const totalA = total(cityA.costs);
    const totalB = total(cityB.costs);
    const cheaper = totalA <= totalB ? cityA : cityB;
    const costlier = totalA > totalB ? cityA : cityB;
    const cCosts = cheaper.costs!;
    const xCosts = costlier.costs!;

    let maxKey: (typeof COST_KEYS)[number] = 'rent';
    let maxDiff = 0;
    for (const key of COST_KEYS) {
      const diff = Number(xCosts[key]) - Number(cCosts[key]);
      if (diff > maxDiff) {
        maxDiff = diff;
        maxKey = key;
      }
    }
    const label = COST_LABELS_ES[maxKey];
    const cheapVal = Number(cCosts[maxKey]).toFixed(0);
    const costlyVal = Number(xCosts[maxKey]).toFixed(0);
    return `${cheaper.name} es más económico que ${costlier.name} sobre todo por un menor ${label} ($${cheapVal} vs $${costlyVal} USD/mes).`;
  }
}
