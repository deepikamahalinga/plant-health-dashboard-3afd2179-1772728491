// plant-data.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantDataController } from './plant-data.controller';
import { PlantDataService } from './plant-data.service';
import { PlantData } from './entities/plant-data.entity';
import { PlotModule } from '../plot/plot.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlantData]),
    PlotModule, // Import PlotModule for relationship
  ],
  controllers: [PlantDataController],
  providers: [
    PlantDataService,
  ],
  exports: [PlantDataService], // Export service for use in other modules
})
export class PlantDataModule {}