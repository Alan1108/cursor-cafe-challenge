import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { City, CityWithCosts, LivingCost, UpdateLivingCostDto } from './entities';

@Injectable()
export class CitiesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<City[]> {
    const rows = await this.db.query<City>(
      'SELECT id, name, slug, created_at, updated_at FROM cities ORDER BY name',
    );
    return rows;
  }

  async findOne(id: string): Promise<CityWithCosts> {
    const cities = await this.db.query<City>(
      'SELECT id, name, slug, created_at, updated_at FROM cities WHERE id = $1',
      [id],
    );
    if (!cities.length) throw new NotFoundException('City not found');
    const costs = await this.db.query<LivingCost>(
      'SELECT id, city_id, rent, food, transport, utilities, internet, created_at, updated_at FROM living_costs WHERE city_id = $1',
      [id],
    );
    return { ...cities[0], costs: costs[0] ?? null };
  }

  async updateCosts(cityId: string, dto: UpdateLivingCostDto): Promise<LivingCost> {
    const city = await this.findOne(cityId);
    if (!city.costs) {
      const inserted = await this.db.query<LivingCost>(
        `INSERT INTO living_costs (city_id, rent, food, transport, utilities, internet)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, city_id, rent, food, transport, utilities, internet, created_at, updated_at`,
        [
          cityId,
          dto.rent ?? 0,
          dto.food ?? 0,
          dto.transport ?? 0,
          dto.utilities ?? 0,
          dto.internet ?? 0,
        ],
      );
      return inserted[0];
    }
    const updates: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    if (dto.rent !== undefined) {
      updates.push(`rent = $${i++}`);
      values.push(dto.rent);
    }
    if (dto.food !== undefined) {
      updates.push(`food = $${i++}`);
      values.push(dto.food);
    }
    if (dto.transport !== undefined) {
      updates.push(`transport = $${i++}`);
      values.push(dto.transport);
    }
    if (dto.utilities !== undefined) {
      updates.push(`utilities = $${i++}`);
      values.push(dto.utilities);
    }
    if (dto.internet !== undefined) {
      updates.push(`internet = $${i++}`);
      values.push(dto.internet);
    }
    if (updates.length === 0) return city.costs;
    values.push(cityId);
    const rows = await this.db.query<LivingCost>(
      `UPDATE living_costs SET ${updates.join(', ')} WHERE city_id = $${i} RETURNING id, city_id, rent, food, transport, utilities, internet, created_at, updated_at`,
      values,
    );
    return rows[0];
  }
}
