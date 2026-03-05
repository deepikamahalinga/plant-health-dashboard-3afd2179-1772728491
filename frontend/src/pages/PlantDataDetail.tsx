import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Alert,
  Breadcrumbs,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Typography
} from '@mui/material';
import { ArrowBack, Edit, Delete } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Types
interface SoilCondition {
  moisture: number;
  pH: number;
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
}

interface PlantData {
  id: string;
  soilCondition: SoilCondition;
  timestamp: string;
  plot?: {
    id: string;
    name: string;
  };
}

// API client imports
import { getPlantData, deletePlantData } from '../api/plantData';

const PlantDataDetail: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PlantData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPlantData(id!);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deletePlantData(id!);
      navigate('/plant-data');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={fetchData}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="warning">
        Plant data record not found
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs className="mb-6">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/plant-data">Plant Data</Link>
        <Typography color="textPrimary">View Details</Typography>
      </Breadcrumbs>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4">Plant Data Details</Typography>
        <div className="space-x-4">
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/plant-data')}
          >
            Back to List
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Edit />}
            onClick={() => navigate(`/plant-data/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<Delete />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <Typography variant="h6" className="mb-4">Basic Information</Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="subtitle2" color="textSecondary">ID</Typography>
              <Typography>{data.id}</Typography>
            </div>
            <div>
              <Typography variant="subtitle2" color="textSecondary">Timestamp</Typography>
              <Typography>
                {format(new Date(data.timestamp), 'PPpp')}
              </Typography>
            </div>
            {data.plot && (
              <div>
                <Typography variant="subtitle2" color="textSecondary">Plot</Typography>
                <Typography>
                  {data.plot.name} ({data.plot.id})
                </Typography>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <Typography variant="h6" className="mb-4">Soil Conditions</Typography>
          <div className="space-y-4">
            <div>
              <Typography variant="subtitle2" color="textSecondary">Moisture</Typography>
              <Typography>{data.soilCondition.moisture}%</Typography>
            </div>
            <div>
              <Typography variant="subtitle2" color="textSecondary">pH Level</Typography>
              <Typography>{data.soilCondition.pH}</Typography>
            </div>
            <div>
              <Typography variant="subtitle2" color="textSecondary">Nutrients</Typography>
              <div className="ml-4">
                <Typography>Nitrogen: {data.soilCondition.nutrients.nitrogen} ppm</Typography>
                <Typography>Phosphorus: {data.soilCondition.nutrients.phosphorus} ppm</Typography>
                <Typography>Potassium: {data.soilCondition.nutrients.potassium} ppm</Typography>
              </div>
            </div>
          </div>
        </Card>

        {/* Soil Metrics Chart */}
        <Card className="p-6 md:col-span-2">
          <Typography variant="h6" className="mb-4">Soil Metrics Timeline</Typography>
          <div className="h-64">
            <LineChart
              width={800}
              height={240}
              data={[data]}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="soilCondition.moisture" stroke="#8884d8" name="Moisture" />
              <Line type="monotone" dataKey="soilCondition.pH" stroke="#82ca9d" name="pH" />
            </LineChart>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this plant data record? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PlantDataDetail;