import { z } from 'zod';

/**
 * Soil condition metrics schema
 */
const SoilConditionSchema = z.object({
  /**
   * Soil moisture percentage (0-100)
   */
  moisture: z.number()
    .min(0)
    .max(100)
    .describe('Soil moisture percentage'),

  /**
   * Soil pH level (0-14)
   */
  pH: z.number()
    .min(0)
    .max(14)
    .describe('Soil pH level'),

  /**
   * Nitrogen content in ppm
   */
  nitrogen: z.number()
    .min(0)
    .describe('Nitrogen content in ppm'),

  /**
   * Phosphorus content in ppm
   */
  phosphorus: z.number()
    .min(0)
    .describe('Phosphorus content in ppm'),

  /**
   * Potassium content in ppm
   */
  potassium: z.number()
    .min(0)
    .describe('Potassium content in ppm')
});

/**
 * DTO Schema for creating new plant data records
 */
export const CreatePlantDataDtoSchema = z.object({
  /**
   * Soil condition metrics including moisture, pH and nutrients
   */
  soilCondition: SoilConditionSchema,

  /**
   * Timestamp when measurement was taken
   */
  timestamp: z.string()
    .datetime({ message: 'Must be a valid ISO 8601 datetime string' })
});

/**
 * Type definition for soil condition metrics
 */
export type SoilCondition = z.infer<typeof SoilConditionSchema>;

/**
 * DTO Type for creating new plant data records
 */
export type CreatePlantDataDto = z.infer<typeof CreatePlantDataDtoSchema>;

/**
 * Example usage:
 * const plantData: CreatePlantDataDto = {
 *   soilCondition: {
 *     moisture: 65,
 *     pH: 6.5,
 *     nitrogen: 150,
 *     phosphorus: 45,
 *     potassium: 80
 *   },
 *   timestamp: '2023-12-01T10:30:00Z'
 * };
 */