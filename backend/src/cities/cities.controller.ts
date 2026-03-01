import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { CitiesService } from './cities.service';
import type { UpdateLivingCostDto } from './entities';

@Controller('cities')
export class CitiesController {
  constructor(private readonly cities: CitiesService) {}

  @Get()
  list() {
    return this.cities.findAll();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.cities.findOne(id);
  }

  @Patch(':id/costs')
  updateCosts(@Param('id') id: string, @Body() dto: UpdateLivingCostDto) {
    return this.cities.updateCosts(id, dto);
  }
}
