import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { InsightModule } from './insight/insight.module';
import { CitiesModule } from './cities/cities.module';
import { ComparisonModule } from './comparison/comparison.module';

@Module({
  imports: [
    DatabaseModule,
    InsightModule,
    CitiesModule,
    ComparisonModule,
  ],
})
export class AppModule {}
