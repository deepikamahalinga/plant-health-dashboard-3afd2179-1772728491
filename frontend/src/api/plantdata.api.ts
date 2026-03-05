// plantdata.api.ts
import axios, { AxiosError, AxiosInstance } from 'axios';

// Types
export interface SoilCondition {
  moisture: number;
  pH: number;
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
}

export interface PlantData {
  id: string;
  soilCondition: SoilCondition;
  timestamp: string;
  plotId: string;
}

export interface PlantDataCreateDTO {
  soilCondition: SoilCondition;
  plotId: string;
}

export interface PlantDataUpdateDTO {
  soilCondition?: SoilCondition;
  plotId?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface FilterParams {
  plotId?: string;
  startDate?: string;
  endDate?: string;
}

export interface SortParams {
  field: keyof PlantData;
  direction: 'asc' | 'desc';
}

export interface PlantDataResponse {
  data: PlantData[];
  total: number;
  page: number;
  limit: number;
}

export class PlantDataApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error?: any
  ) {
    super(message);
    this.name = 'PlantDataApiError';
  }
}

// API Client
export class PlantDataApi {
  private api: AxiosInstance;
  private static retryLimit = 3;
  private static retryDelay = 1000;

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL;
    
    this.api = axios.create({
      baseURL: `${baseURL}/api`,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error);

        if (error.response?.status === 401) {
          // Handle token refresh here if needed
          const refreshToken = localStorage.getItem('refresh_token');
          // Implement refresh token logic
        }

        throw new PlantDataApiError(
          error.response?.status || 500,
          error.message,
          error.response?.data
        );
      }
    );
  }

  private async retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    for (let i = 0; i < PlantDataApi.retryLimit; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        await new Promise(resolve => 
          setTimeout(resolve, PlantDataApi.retryDelay * Math.pow(2, i))
        );
      }
    }
    throw lastError;
  }

  async getAllPlantDatas(
    filters?: FilterParams,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<PlantDataResponse> {
    return this.retryOperation(async () => {
      const { data } = await this.api.get('/plantdatas', {
        params: {
          ...filters,
          ...pagination,
          ...sort,
        },
      });
      return data;
    });
  }

  async getPlantDataById(id: string): Promise<PlantData> {
    return this.retryOperation(async () => {
      const { data } = await this.api.get(`/plantdatas/${id}`);
      return data;
    });
  }

  async createPlantData(plantData: PlantDataCreateDTO): Promise<PlantData> {
    return this.retryOperation(async () => {
      const { data } = await this.api.post('/plantdatas', plantData);
      return data;
    });
  }

  async updatePlantData(
    id: string,
    plantData: PlantDataUpdateDTO
  ): Promise<PlantData> {
    return this.retryOperation(async () => {
      const { data } = await this.api.put(`/plantdatas/${id}`, plantData);
      return data;
    });
  }

  async deletePlantData(id: string): Promise<void> {
    return this.retryOperation(async () => {
      await this.api.delete(`/plantdatas/${id}`);
    });
  }
}

// Export singleton instance
export const plantDataApi = new PlantDataApi();