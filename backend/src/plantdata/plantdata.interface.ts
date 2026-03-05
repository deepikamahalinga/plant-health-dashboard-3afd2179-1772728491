/** Soil condition metrics including moisture, pH and nutrient levels */
interface SoilConditionMetrics {
  /** Soil moisture percentage (0-100) */
  moisture: number;
  
  /** Soil pH level (0-14) */
  pH: number;
  
  /** Nitrogen level in ppm */
  nitrogen: number;
  
  /** Phosphorus level in ppm */
  phosphorus: number;
  
  /** Potassium level in ppm */
  potassium: number;
}

/** Represents a single plant health measurement record */
export interface PlantData {
  /** Unique identifier for the measurement */
  id: string;

  /** Soil condition measurements */
  soilCondition: SoilConditionMetrics;

  /** Timestamp when measurement was taken */
  timestamp: Date;

  /** ID of the associated plot */
  plotId: string;
}

/** Partial type for updating existing plant data */
export type PlantDataUpdate = Partial<Omit<PlantData, 'id'>>;

/** Type for creating new plant data records */
export type PlantDataCreate = Omit<PlantData, 'id'>;

/** Represents related plot entity */
export interface PlotRelation {
  /** Plot unique identifier */
  id: string;
  
  /** Reference to associated plant data measurements */
  plantData?: PlantData[];
}

/** Query parameters for fetching plant data */
export interface PlantDataQuery {
  /** Start of time range */
  startDate?: Date;
  
  /** End of time range */
  endDate?: Date;
  
  /** Filter by specific plot ID */
  plotId?: string;
  
  /** Number of records to return */
  limit?: number;
  
  /** Number of records to skip */
  offset?: number;
}

/** Aggregation period for plant data metrics */
export type AggregationPeriod = 'day' | 'week' | 'month';