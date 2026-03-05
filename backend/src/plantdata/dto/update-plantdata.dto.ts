import { z } from 'zod';

// Soil condition schema
const SoilConditionSchema = z.object({
  moisture: z.number()
    .min(0)
    .max(100)
    .describe('Soil moisture percentage'),
  
  pH: z.number()
    .min(0)
    .max(14)
    .describe('Soil pH level'),
  
  nutrients: z.object({
    nitrogen: z.number().min(0).describe('Nitrogen level'),
    phosphorus: z.number().min(0).describe('Phosphorus level'), 
    potassium: z.number().min(0).describe('Potassium level')
  }).describe('Soil nutrient levels')
});

// Update DTO schema
export const UpdatePlantDataSchema = z.object({
  soilCondition: SoilConditionSchema.optional(),
  timestamp: z.string()
    .datetime({ message: 'Must be valid ISO 8601 datetime string' })
    .optional()
});

// TypeScript type
export type UpdatePlantDataDto = z.infer<typeof UpdatePlantDataSchema>;