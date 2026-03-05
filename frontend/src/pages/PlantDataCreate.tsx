import React, { useState } from 'react';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

// Types (would normally be imported)
type SoilCondition = {
  moisture: number;
  pH: number;
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
};

type PlantDataCreate = {
  soilCondition: SoilCondition;
  timestamp: string;
};

// Validation schema
const soilConditionSchema = z.object({
  moisture: z.number().min(0).max(100),
  pH: z.number().min(0).max(14),
  nutrients: z.object({
    nitrogen: z.number().min(0).max(100),
    phosphorus: z.number().min(0).max(100),
    potassium: z.number().min(0).max(100),
  }),
});

const plantDataSchema = z.object({
  soilCondition: soilConditionSchema,
  timestamp: z.string().datetime().refine(
    (date) => new Date(date) <= new Date(),
    { message: "Timestamp cannot be in the future" }
  ),
});

export const PlantDataCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PlantDataCreate>({
    soilCondition: {
      moisture: 0,
      pH: 7,
      nutrients: {
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0,
      },
    },
    timestamp: new Date().toISOString().slice(0, 16),
  });

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string[];
  }>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field?: string,
    subfield?: string
  ) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    
    if (field === 'soilCondition') {
      if (subfield) {
        setFormData(prev => ({
          ...prev,
          soilCondition: {
            ...prev.soilCondition,
            nutrients: {
              ...prev.soilCondition.nutrients,
              [subfield]: value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          soilCondition: {
            ...prev.soilCondition,
            [e.target.name]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [e.target.name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    try {
      // Validate form data
      plantDataSchema.parse(formData);
      
      setIsLoading(true);
      // Await API call here
      // await createPlantData(formData);
      
      navigate('/plant-data'); // Navigate to list view
    } catch (err) {
      if (err instanceof z.ZodError) {
        setValidationErrors(err.flatten().fieldErrors);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create Plant Data Record</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Soil Conditions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Moisture (%)
              </label>
              <input
                type="number"
                name="moisture"
                value={formData.soilCondition.moisture}
                onChange={(e) => handleInputChange(e, 'soilCondition')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                max="100"
                step="0.1"
              />
              {validationErrors['soilCondition.moisture']?.map((error, i) => (
                <p key={i} className="mt-1 text-sm text-red-600">{error}</p>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                pH Level
              </label>
              <input
                type="number"
                name="pH"
                value={formData.soilCondition.pH}
                onChange={(e) => handleInputChange(e, 'soilCondition')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                max="14"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nitrogen (%)
              </label>
              <input
                type="number"
                name="nitrogen"
                value={formData.soilCondition.nutrients.nitrogen}
                onChange={(e) => handleInputChange(e, 'soilCondition', 'nitrogen')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phosphorus (%)
              </label>
              <input
                type="number"
                name="phosphorus"
                value={formData.soilCondition.nutrients.phosphorus}
                onChange={(e) => handleInputChange(e, 'soilCondition', 'phosphorus')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Potassium (%)
              </label>
              <input
                type="number"
                name="potassium"
                value={formData.soilCondition.nutrients.potassium}
                onChange={(e) => handleInputChange(e, 'soilCondition', 'potassium')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Timestamp
            </label>
            <input
              type="datetime-local"
              name="timestamp"
              value={formData.timestamp}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              max={new Date().toISOString().slice(0, 16)}
            />
            {validationErrors.timestamp?.map((error, i) => (
              <p key={i} className="mt-1 text-sm text-red-600">{error}</p>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};