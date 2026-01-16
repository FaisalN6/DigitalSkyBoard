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
  CssBaseline,
  MenuItem,
  Chip,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import type { Flight, FlightPagination, FlightFormData } from '@/types/flight';
import type { Airline } from '@/types/airline';
import type { Airport } from '@/types/airport';
import type { Gate } from '@/types/gate';
import type { FlightStatus } from '@/types/flight-status';
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
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 8 }
      }
    }
  },
});

export default function FlightPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [pagination, setPagination] = useState<FlightPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('departure_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Resource Data for Dropdowns
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [statuses, setStatuses] = useState<FlightStatus[]>([]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form States
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [formData, setFormData] = useState<FlightFormData>({
    flight_number: '',
    departure_time: '',
    departure_date: '',
    airline_id: '',
    destination_airport_id: '',
    gate_id: '',
    status_id: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  // Load resources once
  useEffect(() => {
    fetchResources();
  }, []);

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchFlights(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search, sortBy, sortDirection]);

  const fetchResources = async () => {
    try {
      const [airlinesRes, airportsRes, gatesRes, statusesRes] = await Promise.all([
        fetchWithAuth('http://localhost:8001/api/airlines?per_page=100'),
        fetchWithAuth('http://localhost:8001/api/airports?per_page=100'),
        fetchWithAuth('http://localhost:8001/api/gates?per_page=100'),
        fetchWithAuth('http://localhost:8001/api/flight-statuses?per_page=100'),
      ]);

      const [airlinesData, airportsData, gatesData, statusesData] = await Promise.all([
        airlinesRes.json(),
        airportsRes.json(),
        gatesRes.json(),
        statusesRes.json()
      ]);

      setAirlines(airlinesData.data);
      setAirports(airportsData.data);
      setGates(gatesData.data);
      setStatuses(statusesData.data);
    } catch (error) {
      console.error('Failed to load resources', error);
    }
  };

  const fetchFlights = async (page = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        search,
        sort_by: sortBy,
        sort_direction: sortDirection,
        per_page: '10'
      });

      const response = await fetchWithAuth(`http://localhost:8001/api/flights?${queryParams}`);

      if (!response.ok) throw new Error('Failed to fetch flights');

      const data = await response.json();
      setFlights(data.data);
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
      const url = selectedFlight
        ? `http://localhost:8001/api/flights/${selectedFlight.id}`
        : 'http://localhost:8001/api/flights';

      const method = selectedFlight ? 'PUT' : 'POST';

      const response = await fetchWithAuth(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Operation failed');
      }

      closeModals();
      fetchFlights(pagination?.current_page || 1);
    } catch (error) {
      console.error(error);
      alert('Failed to save flight');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFlight) return;
    setFormLoading(true);

    try {
      const response = await fetchWithAuth(`http://localhost:8001/api/flights/${selectedFlight.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      closeModals();
      fetchFlights(pagination?.current_page || 1);
    } catch (error) {
      console.error(error);
      alert('Failed to delete flight');
    } finally {
      setFormLoading(false);
    }
  };

  const openAddModal = () => {
    setSelectedFlight(null);
    setFormData({
      flight_number: '',
      departure_time: '',
      departure_date: '',
      airline_id: '',
      destination_airport_id: '',
      gate_id: '',
      status_id: ''
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (flight: Flight) => {
    setSelectedFlight(flight);
    setFormData({
      flight_number: flight.flight_number,
      departure_time: flight.departure_time,
      departure_date: flight.departure_date,
      airline_id: flight.airline_id,
      destination_airport_id: flight.destination_airport_id,
      gate_id: flight.gate_id,
      status_id: flight.status_id
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (flight: Flight) => {
    setSelectedFlight(flight);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedFlight(null);
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5 }}>
          <Box>
            <Typography variant="h4" color="text.primary" gutterBottom>
              Flights Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Schedule and manage flight departures
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
            Schedule Flight
          </Button>
        </Box>

        {/* Search */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search flights by number..."
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
                  onClick={() => handleSort('departure_date')}
                  sx={{ cursor: 'pointer' }}
                >
                  Date/Time {sortBy === 'departure_date' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell
                  onClick={() => handleSort('flight_number')}
                  sx={{ cursor: 'pointer' }}
                >
                  Flight No. {sortBy === 'flight_number' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell>Airline</TableCell>
                <TableCell>Destination</TableCell>
                <TableCell>Gate</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : flights.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">No flights found matching your criteria.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                flights.map((flight) => (
                  <TableRow key={flight.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '1rem' }}>
                          {flight.departure_time}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight="medium">
                          {new Date(flight.departure_date).toLocaleDateString(undefined, {
                            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={flight.flight_number}
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          fontFamily: 'monospace',
                          bgcolor: 'primary.50',
                          color: 'primary.main',
                          borderRadius: 2
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {flight.airline?.name || '-'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{flight.destination_airport?.city}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-block', bgcolor: 'grey.100', px: 0.5, borderRadius: 0.5, mt: 0.5 }}>
                          {flight.destination_airport?.code}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box component="span" sx={{
                        bgcolor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        fontFamily: 'monospace',
                        fontWeight: 'bold'
                      }}>
                        {flight.gate?.code || '-'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={flight.status?.name || 'Unknown'}
                        sx={{
                          fontWeight: 'bold',
                          bgcolor: flight.status?.color ? alpha(flight.status.color, 0.1) : '#f3f4f6',
                          color: flight.status?.color || '#374151',
                          border: '1px solid',
                          borderColor: flight.status?.color ? alpha(flight.status.color, 0.2) : 'transparent',
                        }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="default"
                        onClick={() => openEditModal(flight)}
                        size="small"
                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'primary.50' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="default"
                        onClick={() => openDeleteModal(flight)}
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
                onChange={(_, page) => fetchFlights(page)}
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
          maxWidth="md"
          fullWidth
          PaperProps={{
            elevation: 0,
            sx: { bgcolor: 'background.paper', overflow: 'visible' }
          }}
        >
          <form onSubmit={handleSubmit}>
            <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                {isAddModalOpen ? 'Schedule New Flight' : 'Edit Flight Details'}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ px: 3, pb: 1, overflow: 'visible' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, pt: 2 }}>

                {/* Flight Info */}
                <Box sx={{ gridColumn: 'span 2' }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>Flight Information</Typography>
                </Box>

                <TextField
                  label="Flight Number"
                  required
                  value={formData.flight_number}
                  onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })}
                  placeholder="e.g. GA123"
                  helperText={selectedFlight ? "Changing this ensures uniqueness" : ""}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Airline"
                  select
                  required
                  value={formData.airline_id}
                  onChange={(e) => setFormData({ ...formData, airline_id: Number(e.target.value) })}
                  InputLabelProps={{ shrink: true }}
                >
                  {airlines.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name} ({option.code})
                    </MenuItem>
                  ))}
                </TextField>

                {/* Schedule & Location */}
                <Box sx={{ gridColumn: 'span 2', mt: 1 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>Schedule & Location</Typography>
                </Box>

                <TextField
                  label="Departure Date"
                  type="date"
                  required
                  InputLabelProps={{ shrink: true }}
                  value={formData.departure_date}
                  onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                />

                <TextField
                  label="Departure Time"
                  type="time"
                  required
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 1 }}
                  value={formData.departure_time}
                  onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                />

                <TextField
                  label="Destination Airport"
                  select
                  required
                  value={formData.destination_airport_id}
                  onChange={(e) => setFormData({ ...formData, destination_airport_id: Number(e.target.value) })}
                  InputLabelProps={{ shrink: true }}
                >
                  {airports.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.city} - {option.name} ({option.code})
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Gate"
                  select
                  required
                  value={formData.gate_id}
                  onChange={(e) => setFormData({ ...formData, gate_id: Number(e.target.value) })}
                  InputLabelProps={{ shrink: true }}
                >
                  {gates.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      Gate {option.code}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Status */}
                <Box sx={{ gridColumn: 'span 2', mt: 1 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>Status</Typography>
                </Box>

                <TextField
                  label="Current Status"
                  select
                  required
                  fullWidth
                  value={formData.status_id}
                  onChange={(e) => setFormData({ ...formData, status_id: Number(e.target.value) })}
                  sx={{ gridColumn: 'span 2' }}
                  InputLabelProps={{ shrink: true }}
                >
                  {statuses.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </TextField>

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
                {isAddModalOpen ? 'Schedule Flight' : 'Save Changes'}
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
                Are you sure you want to delete flight <strong>{selectedFlight?.flight_number}</strong>?
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
              Delete Flight
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
