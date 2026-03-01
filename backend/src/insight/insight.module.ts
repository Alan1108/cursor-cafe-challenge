import { Global, Module } from '@nestjs/common';
import { InsightService } from './insight.service';

@Global()
@Module({
  providers: [InsightService],
  exports: [InsightService],
})
export class InsightModule {}
