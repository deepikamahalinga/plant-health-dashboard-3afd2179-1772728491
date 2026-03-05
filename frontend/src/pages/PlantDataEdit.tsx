import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { PlantData, Plot } from '../types';
import { getPlantData, updatePlantData } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

// Validation schema
const soilConditionSchema = z.object({
  moisture: z.number().min(0).max(100),
  pH: z.number().min(0).max(14),
  nutrients: z.object({
    nitrogen: z.number().min(0),
    phosphorus: z.number().min(0),
    potassium: z.number().min(0)
  })
});

const plantDataSchema = z.object({
  id: z.string().uuid(),
  soilCondition: soilConditionSchema,
  timestamp: z.string().datetime()
});

type FormData = z.infer<typeof plantDataSchema>;

export default function PlantDataEdit() {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    id: '',
    soilCondition: {
      moisture: 0,
      pH: 7,
      nutrients: {
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0
      }
    },
    timestamp: new Date().toISOString()
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Fetch existing data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getPlantData(id!);
        setFormData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch plant data');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setError(null);

    try {
      // Validate form data
      plantDataSchema.parse(formData);
      
      setSubmitting(true);
      await updatePlantData(id!, formData);
      navigate(`/plant-data/${id}`);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: {[key: string]: string} = {};
        err.errors.forEach(error => {
          errors[error.path.join('.')] = error.message;
        });
        setValidationErrors(errors);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update plant data');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (id) {
      getPlantData(id).then(setFormData);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Plant Data</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Soil Moisture (%)
            <input
              type="number"
              min="0"
              max="100"
              value={formData.soilCondition.moisture}
              onChange={e => setFormData({
                ...formData,
                soilCondition: {
                  ...formData.soilCondition,
                  moisture: parseFloat(e.target.value)
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>
          {validationErrors['soilCondition.moisture'] && (
            <p className="mt-1 text-sm text-red-600">{validationErrors['soilCondition.moisture']}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Soil pH
            <input
              type="number"
              min="0"
              max="14"
              step="0.1"
              value={formData.soilCondition.pH}
              onChange={e => setFormData({
                ...formData,
                soilCondition: {
                  ...formData.soilCondition,
                  pH: parseFloat(e.target.value)
                }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>
          {validationErrors['soilCondition.pH'] && (
            <p className="mt-1 text-sm text-red-600">{validationErrors['soilCondition.pH']}</p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Nutrients</h3>
          
          {['nitrogen', 'phosphorus', 'potassium'].map(nutrient => (
            <div key={nutrient}>
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {nutrient}
                <input
                  type="number"
                  min="0"
                  value={formData.soilCondition.nutrients[nutrient as keyof typeof formData.soilCondition.nutrients]}
                  onChange={e => setFormData({
                    ...formData,
                    soilCondition: {
                      ...formData.soilCondition,
                      nutrients: {
                        ...formData.soilCondition.nutrients,
                        [nutrient]: parseFloat(e.target.value)
                      }
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </label>
              {validationErrors[`soilCondition.nutrients.${nutrient}`] && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors[`soilCondition.nutrients.${nutrient}`]}
                </p>
              )}
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Timestamp
            <input
              type="datetime-local"
              value={formData.timestamp.slice(0, 16)}
              onChange={e => setFormData({
                ...formData,
                timestamp: new Date(e.target.value).toISOString()
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </label>
          {validationErrors['timestamp'] && (
            <p className="mt-1 text-sm text-red-600">{validationErrors['timestamp']}</p>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Reset
          </button>
          
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}