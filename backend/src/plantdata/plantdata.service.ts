// plant-data.types.ts
export interface SoilCondition {
  moisture: number;
  pH: number;
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
}

export interface PlantDataCreateInput {
  soilCondition: SoilCondition;
  timestamp: Date;
  plotId: string; // Reference to Plot
}

export interface PlantDataUpdateInput {
  soilCondition?: SoilCondition;
  timestamp?: Date;
  plotId?: string;
}

export interface PlantDataFilters {
  startDate?: Date;
  endDate?: Date;
  plotId?: string;
}

export interface PaginationParams {
  skip?: number;
  take?: number;
}

// plant-data.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlantData, Prisma } from '@prisma/client';
import {
  PlantDataCreateInput,
  PlantDataUpdateInput,
  PlantDataFilters,
  PaginationParams,
} from './plant-data.types';

@Injectable()
export class PlantDataService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    filters?: PlantDataFilters,
    pagination?: PaginationParams,
  ): Promise<PlantData[]> {
    const where: Prisma.PlantDataWhereInput = {};

    if (filters?.plotId) {
      where.plotId = filters.plotId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {
        ...(filters.startDate && { gte: filters.startDate }),
        ...(filters.endDate && { lte: filters.endDate }),
      };
    }

    return this.prisma.plantData.findMany({
      where,
      skip: pagination?.skip,
      take: pagination?.take,
      include: {
        plot: true, // Include related plot data
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async findById(id: string): Promise<PlantData> {
    const plantData = await this.prisma.plantData.findUnique({
      where: { id },
      include: {
        plot: true,
      },
    });

    if (!plantData) {
      throw new NotFoundException(`PlantData with ID ${id} not found`);
    }

    return plantData;
  }

  async create(data: PlantDataCreateInput): Promise<PlantData> {
    // Basic validation
    if (data.timestamp > new Date()) {
      throw new Error('Timestamp cannot be in the future');
    }

    return this.prisma.plantData.create({
      data: {
        id: undefined, // Let Prisma handle UUID generation
        soilCondition: data.soilCondition,
        timestamp: data.timestamp,
        plot: {
          connect: { id: data.plotId },
        },
      },
      include: {
        plot: true,
      },
    });
  }

  async update(id: string, data: PlantDataUpdateInput): Promise<PlantData> {
    // Check if exists
    await this.findById(id);

    // Basic validation
    if (data.timestamp && data.timestamp > new Date()) {
      throw new Error('Timestamp cannot be in the future');
    }

    return this.prisma.plantData.update({
      where: { id },
      data: {
        ...(data.soilCondition && { soilCondition: data.soilCondition }),
        ...(data.timestamp && { timestamp: data.timestamp }),
        ...(data.plotId && {
          plot: {
            connect: { id: data.plotId },
          },
        }),
      },
      include: {
        plot: true,
      },
    });
  }

  async delete(id: string): Promise<PlantData> {
    // Check if exists
    await this.findById(id);

    return this.prisma.plantData.delete({
      where: { id },
      include: {
        plot: true,
      },
    });
  }

  // Additional utility method for latest readings
  async getLatestReadingsByPlot(plotId: string): Promise<PlantData | null> {
    return this.prisma.plantData.findFirst({
      where: {
        plotId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        plot: true,
      },
    });
  }
}