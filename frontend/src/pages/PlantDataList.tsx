import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Alert
} from '@mui/material';
import { useRouter } from 'next/router';
import { format } from 'date-fns';

// Types
interface PlantData {
  id: string;
  soilCondition: {
    moisture: number;
    pH: number;
    nutrients: {
      nitrogen: number;
      phosphorus: number;
      potassium: number;
    };
  };
  timestamp: string;
  plotId: string;
}

interface SortConfig {
  field: keyof PlantData;
  direction: 'asc' | 'desc';
}

// Component
export const PlantDataList: React.FC = () => {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    field: 'timestamp', 
    direction: 'desc' 
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Fetch data
  const { data, isLoading, isError, error, refetch } = useQuery(
    ['plantData', page, rowsPerPage, searchTerm, sortConfig],
    async () => {
      // Replace with actual API call
      const response = await fetch(`/api/plant-data?page=${page}&limit=${rowsPerPage}&search=${searchTerm}&sort=${sortConfig.field}&direction=${sortConfig.direction}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    }
  );

  // Handlers
  const handleSort = (field: keyof PlantData) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/plant-data/${id}`, { method: 'DELETE' });
      refetch();
    } catch (error) {
      console.error('Delete failed:', error);
    }
    setDeleteDialogOpen(false);
    setSelectedId(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height={60} />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={() => refetch()}>
            Retry
          </Button>
        }
      >
        {error instanceof Error ? error.message : 'An error occurred'}
      </Alert>
    );
  }

  // Empty state
  if (!data?.items?.length) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 mb-4">No plant data available</p>
        <Button 
          variant="contained" 
          onClick={() => router.push('/plant-data/new')}
        >
          Add First Record
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Plant Data</h1>
        <Button 
          variant="contained" 
          onClick={() => router.push('/plant-data/new')}
        >
          Add New Record
        </Button>
      </div>

      {/* Search */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search records..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.field === 'timestamp'}
                  direction={sortConfig.direction}
                  onClick={() => handleSort('timestamp')}
                >
                  Timestamp
                </TableSortLabel>
              </TableCell>
              <TableCell>Plot ID</TableCell>
              <TableCell>Soil Moisture</TableCell>
              <TableCell>Soil pH</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.items.map((item: PlantData) => (
              <TableRow key={item.id}>
                <TableCell>{format(new Date(item.timestamp), 'PPpp')}</TableCell>
                <TableCell>{item.plotId}</TableCell>
                <TableCell>{item.soilCondition.moisture}</TableCell>
                <TableCell>{item.soilCondition.pH}</TableCell>
                <TableCell>
                  <div className="space-x-2">
                    <Button 
                      size="small"
                      onClick={() => router.push(`/plant-data/${item.id}`)}
                    >
                      View
                    </Button>
                    <Button 
                      size="small"
                      onClick={() => router.push(`/plant-data/${item.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedId(item.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={data.total}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this record?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            color="error" 
            onClick={() => selectedId && handleDelete(selectedId)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PlantDataList;