// plantdata.types.ts

import { z } from 'zod';

/**
 * Enum for soil condition metrics that must be included
 */
export enum SoilMetric {
  MOISTURE = 'moisture',
  PH = 'ph',
  NITROGEN = 'nitrogen',
  PHOSPHORUS = 'phosphorus',
  POTASSIUM = 'potassium'
}

/**
 * Soil condition data structure
 */
export interface SoilCondition {
  moisture: number; // 0-100%
  ph: number; // 0-14 scale
  nutrients: {
    nitrogen: number; // ppm
    phosphorus: number; // ppm
    potassium: number; // ppm
  };
}

/**
 * Main PlantData entity interface
 */
export interface PlantData {
  /** Unique identifier */
  id: string;
  
  /** Soil metrics including moisture, pH, nutrients */
  soilCondition: SoilCondition;
  
  /** Measurement timestamp */
  timestamp: Date;
  
  /** Associated plot ID */
  plotId: string;
  
  /** Record creation timestamp */
  createdAt: Date;
  
  /** Record last update timestamp */
  updatedAt: Date;
}

/**
 * DTO for creating new plant data records
 */
export type CreatePlantDataDto = Omit<PlantData, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * DTO for updating existing plant data records
 */
export type UpdatePlantDataDto = Partial<CreatePlantDataDto>;

/**
 * Filter parameters for querying plant data
 */
export interface PlantDataFilterParams {
  plotId?: string;
  startDate?: Date;
  endDate?: Date;
  minMoisture?: number;
  maxMoisture?: number;
  minPh?: number;
  maxPh?: number;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Sort parameters
 */
export interface SortParams {
  field: keyof PlantData;
  direction: 'ASC' | 'DESC';
}

/**
 * API response wrapper with metadata
 */
export interface ApiResponse<T> {
  data: T;
  metadata: {
    timestamp: Date;
    count?: number;
    page?: number;
    totalPages?: number;
    totalCount?: number;
  };
}

/**
 * Zod validation schema for soil condition
 */
export const soilConditionSchema = z.object({
  moisture: z.number().min(0).max(100),
  ph: z.number().min(0).max(14),
  nutrients: z.object({
    nitrogen: z.number().positive(),
    phosphorus: z.number().positive(), 
    potassium: z.number().positive()
  })
});

/**
 * Zod validation schema for plant data
 */
export const plantDataSchema = z.object({
  soilCondition: soilConditionSchema,
  timestamp: z.date().max(new Date(), 'Timestamp cannot be in the future'),
  plotId: z.string().uuid()
});

/**
 * Type for aggregated plant data metrics
 */
export interface AggregatedPlantData {
  plotId: string;
  period: 'day' | 'week' | 'month';
  startDate: Date;
  endDate: Date;
  averageMoisture: number;
  averagePh: number;
  averageNutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  measurementCount: number;
}

/**
 * Type for latest readings per plot
 */
export interface LatestPlantData {
  plotId: string;
  lastMeasurement: PlantData;
  lastUpdated: Date;
}