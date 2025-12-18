import { Module } from '@nestjs/common';
import { BreakdownsService } from './breakdowns.service';
import { BreakdownsController } from './breakdowns.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [BreakdownsController],
  providers: [BreakdownsService],
  exports: [BreakdownsService],
})
export class BreakdownsModule {}
