'use client';

import { useState, useEffect, FormEvent } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  InputAdornment,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import type { Airport, AirportPagination, AirportFormData } from '@/types/airport';
import { fetchWithAuth } from '@/utils/api';

// Create a light theme to match the dashboard
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4f46e5', // indigo-600
    },
    background: {
      paper: '#ffffff',
      default: '#f8fafc', // slate-50
    },
    text: {
      primary: '#111827', // gray-900
      secondary: '#6b7280', // gray-500
    },
  },
  typography: {
    fontFamily: 'inherit',
    h4: { fontWeight: 800, letterSpacing: '-0.025em' },
    subtitle2: { fontWeight: 600 }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
          borderRadius: 16,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          backgroundColor: '#f9fafb',
          color: '#6b7280',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
          borderBottom: '1px solid #f3f4f6',
          paddingTop: '20px',
          paddingBottom: '20px',
        },
        body: {
          color: '#111827',
          borderBottom: '1px solid #f3f4f6',
          fontSize: '0.95rem',
          paddingTop: '20px',
          paddingBottom: '20px',
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(79, 70, 229, 0.04) !important',
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
          }
        },
        contained: {
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#ffffff',
            '& fieldset': { borderColor: '#e5e7eb' },
            '&:hover fieldset': { borderColor: '#d1d5db' },
            '&.Mui-focused fieldset': { borderColor: '#4f46e5' }
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        }
      }
    }
  },
});

export default function AirportPage() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [pagination, setPagination] = useState<AirportPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form States
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [formData, setFormData] = useState<AirportFormData>({
    name: '',
    code: '',
    city: '',
    country: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchAirports(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search, sortBy, sortDirection]);

  const fetchAirports = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: page.toString(),
        search,
        sort_by: sortBy,
        sort_direction: sortDirection,
        per_page: '10'
      });

      const response = await fetchWithAuth(`http://localhost:8001/api/airports?${queryParams}`);

      if (!response.ok) throw new Error('Failed to fetch airports');

      const data = await response.json();
      setAirports(data.data);
      setPagination(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = selectedAirport
        ? `http://localhost:8001/api/airports/${selectedAirport.id}`
        : 'http://localhost:8001/api/airports';

      const method = selectedAirport ? 'PUT' : 'POST';

      const response = await fetchWithAuth(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Operation failed');

      closeModals();
      fetchAirports(pagination?.current_page || 1);
    } catch (error) {
      console.error(error);
      alert('Failed to save airport');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAirport) return;
    setFormLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetchWithAuth(`http://localhost:8001/api/airports/${selectedAirport.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      closeModals();
      fetchAirports(pagination?.current_page || 1);
    } catch (error) {
      console.error(error);
      alert('Failed to delete airport');
    } finally {
      setFormLoading(false);
    }
  };

  const openAddModal = () => {
    setSelectedAirport(null);
    setFormData({ name: '', code: '', city: '', country: '' });
    setIsAddModalOpen(true);
  };

  const openEditModal = (airport: Airport) => {
    setSelectedAirport(airport);
    setFormData({
      name: airport.name,
      code: airport.code,
      city: airport.city,
      country: airport.country
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (airport: Airport) => {
    setSelectedAirport(airport);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedAirport(null);
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5 }}>
          <Box>
            <Typography variant="h4" color="text.primary" gutterBottom>
              Airports Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage airport destinations and origins
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={openAddModal}
            size="large"
            sx={{ px: 3, py: 1.5 }}
          >
            Add Airport
          </Button>
        </Box>

        {/* Search */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search airports by name, code, city or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              disableUnderline: true
            }}
            variant="outlined"
            size="medium"
            sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'transparent !important' } }}
          />
        </Paper>

        {/* Table */}
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  onClick={() => handleSort('name')}
                  sx={{ cursor: 'pointer' }}
                >
                  Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell
                  onClick={() => handleSort('code')}
                  sx={{ cursor: 'pointer' }}
                >
                  Code {sortBy === 'code' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell
                  onClick={() => handleSort('city')}
                  sx={{ cursor: 'pointer' }}
                >
                  City {sortBy === 'city' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell
                  onClick={() => handleSort('country')}
                  sx={{ cursor: 'pointer' }}
                >
                  Country {sortBy === 'country' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : airports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">No airports found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                airports.map((airport) => (
                  <TableRow key={airport.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{airport.name}</TableCell>
                    <TableCell>
                      <Box component="span" sx={{
                        bgcolor: 'background.default',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}>
                        {airport.code}
                      </Box>
                    </TableCell>
                    <TableCell>{airport.city}</TableCell>
                    <TableCell>{airport.country}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="default"
                        onClick={() => openEditModal(airport)}
                        size="small"
                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'primary.50' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="default"
                        onClick={() => openDeleteModal(airport)}
                        size="small"
                        sx={{ color: 'text.secondary', ml: 1, '&:hover': { color: 'error.main', bgcolor: 'error.50' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination && (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
              <Pagination
                count={pagination.last_page}
                page={pagination.current_page}
                onChange={(_, page) => fetchAirports(page)}
                color="primary"
                shape="rounded"
                size="large"
              />
            </Box>
          )}
        </TableContainer>

        {/* Add/Edit Modal */}
        <Dialog
          open={isAddModalOpen || isEditModalOpen}
          onClose={closeModals}
          maxWidth="sm"
          fullWidth
          PaperProps={{ elevation: 0 }}
        >
          <form onSubmit={handleSubmit}>
            <DialogTitle sx={{ pt: 3, px: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                {isAddModalOpen ? 'Add New Airport' : 'Edit Airport'}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ px: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                <TextField
                  label="Airport Name"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Soekarno-Hatta International Airport"
                />
                <TextField
                  label="Airport Code (IATA)"
                  fullWidth
                  required
                  inputProps={{ maxLength: 3, style: { textTransform: 'uppercase' } }}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. CGK"
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="City"
                    fullWidth
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Jakarta"
                  />
                  <TextField
                    label="Country"
                    fullWidth
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. Indonesia"
                  />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 4, pt: 2 }}>
              <Button onClick={closeModals} color="inherit" sx={{ mr: 1, borderRadius: 3, px: 3 }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={formLoading}
                startIcon={formLoading && <CircularProgress size={20} />}
                size="large"
                sx={{ borderRadius: 3, px: 4 }}
              >
                {isAddModalOpen ? 'Create' : 'Save Changes'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={isDeleteModalOpen}
          onClose={closeModals}
          maxWidth="xs"
          fullWidth
          PaperProps={{ borderRadius: 4 }}
        >
          <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 1 }}>
            Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'error.50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1
              }}>
                <DeleteIcon color="error" fontSize="large" />
              </Box>
              <Typography align="center" color="text.secondary">
                Are you sure you want to delete <strong>{selectedAirport?.name}</strong>?
                This action cannot be undone.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 4, px: 3, gap: 2 }}>
            <Button onClick={closeModals} variant="outlined" color="inherit" fullWidth sx={{ borderRadius: 3, py: 1.5, borderColor: 'divider' }}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              color="error"
              fullWidth
              disabled={formLoading}
              startIcon={formLoading && <CircularProgress size={20} />}
              sx={{ borderRadius: 3, py: 1.5, boxShadow: 'none' }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
