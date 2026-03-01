import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import type { CityWithCosts } from '../cities/entities';

@Injectable()
export class InsightService {
  private client: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey?.trim()) {
      this.client = new OpenAI({ apiKey: apiKey.trim() });
      console.log('[InsightService] OpenAI API key loaded — AI insight enabled.');
    } else {
      console.log('[InsightService] No OPENAI_API_KEY — AI insight disabled.');
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async generateInsight(cityA: CityWithCosts, cityB: CityWithCosts): Promise<string | null> {
    if (!this.client || !cityA.costs || !cityB.costs) return null;

    const totalA =
      Number(cityA.costs.rent) +
      Number(cityA.costs.food) +
      Number(cityA.costs.transport) +
      Number(cityA.costs.utilities) +
      Number(cityA.costs.internet);
    const totalB =
      Number(cityB.costs.rent) +
      Number(cityB.costs.food) +
      Number(cityB.costs.transport) +
      Number(cityB.costs.utilities) +
      Number(cityB.costs.internet);
    const cheaper = totalA <= totalB ? cityA.name : cityB.name;
    const costlier = totalA > totalB ? cityA.name : cityB.name;

    const prompt = `You are a brief cost-of-living analyst for Ecuador. Given this monthly cost data (USD), write exactly 1-2 short sentences in Spanish explaining why ${cheaper} is more affordable than ${costlier}. Mention the main categories that drive the difference (e.g. rent, food, utilities). Be factual and concise.

${cityA.name}: rent ${cityA.costs.rent}, food ${cityA.costs.food}, transport ${cityA.costs.transport}, utilities ${cityA.costs.utilities}, internet ${cityA.costs.internet} (total ${totalA.toFixed(0)}).
${cityB.name}: rent ${cityB.costs.rent}, food ${cityB.costs.food}, transport ${cityB.costs.transport}, utilities ${cityB.costs.utilities}, internet ${cityB.costs.internet} (total ${totalB.toFixed(0)}).

Reply only with the insight, no preamble.`;

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.3,
      });
      const text = completion.choices[0]?.message?.content?.trim();
      return text || null;
    } catch (err) {
      console.warn('[InsightService] OpenAI request failed:', err instanceof Error ? err.message : err);
      return null;
    }
  }
}
