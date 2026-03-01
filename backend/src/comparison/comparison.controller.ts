import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ComparisonService } from './comparison.service';

@Controller('comparison')
export class ComparisonController {
  constructor(private readonly comparison: ComparisonService) {}

  @Get()
  compare(
    @Query('cityA') cityA: string,
    @Query('cityB') cityB: string,
  ) {
    if (!cityA || !cityB) {
      throw new BadRequestException('Query params cityA and cityB are required');
    }
    return this.comparison.compare(cityA, cityB);
  }
}
