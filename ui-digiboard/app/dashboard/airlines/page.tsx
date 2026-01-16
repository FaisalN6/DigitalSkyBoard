'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import Image from 'next/image';
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
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import type { Airline, AirlinePagination, AirlineFormData } from '@/types/airline';
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

export default function AirlinePage() {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [pagination, setPagination] = useState<AirlinePagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form States
  const [selectedAirline, setSelectedAirline] = useState<Airline | null>(null);
  const [formData, setFormData] = useState<AirlineFormData>({
    name: '',
    code: '',
    logo: null
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchAirlines(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search, sortBy, sortDirection]);

  const fetchAirlines = async (page = 1) => {
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

      const response = await fetchWithAuth(`http://localhost:8001/api/airlines?${queryParams}`);

      if (!response.ok) throw new Error('Failed to fetch airlines');

      const data = await response.json();
      setAirlines(data.data);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('name', formData.name);
      data.append('code', formData.code);
      if (formData.logo) {
        data.append('logo', formData.logo);
      }

      const url = selectedAirline
        ? `http://localhost:8001/api/airlines/${selectedAirline.id}?_method=PUT`
        : 'http://localhost:8001/api/airlines';

      const response = await fetchWithAuth(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: data
      });

      if (!response.ok) throw new Error('Operation failed');

      closeModals();
      fetchAirlines(pagination?.current_page || 1);
    } catch (error) {
      console.error(error);
      alert('Failed to save airline');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAirline) return;
    setFormLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetchWithAuth(`http://localhost:8001/api/airlines/${selectedAirline.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      closeModals();
      fetchAirlines(pagination?.current_page || 1);
    } catch (error) {
      console.error(error);
      alert('Failed to delete airline');
    } finally {
      setFormLoading(false);
    }
  };

  const openAddModal = () => {
    setSelectedAirline(null);
    setFormData({ name: '', code: '', logo: null });
    setLogoPreview(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (airline: Airline) => {
    setSelectedAirline(airline);
    setFormData({ name: airline.name, code: airline.code, logo: null });
    setLogoPreview(airline.logo ? `http://localhost:8001/storage/${airline.logo}` : null);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (airline: Airline) => {
    setSelectedAirline(airline);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedAirline(null);
    setLogoPreview(null);
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5 }}>
          <Box>
            <Typography variant="h4" color="text.primary" gutterBottom>
              Airlines Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your airline partners and fleets
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
            Add Airline
          </Button>
        </Box>

        {/* Search */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search airlines by name or code..."
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
                <TableCell>Logo</TableCell>
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
                <TableCell>Created At</TableCell>
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
              ) : airlines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">No airlines found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                airlines.map((airline) => (
                  <TableRow key={airline.id} hover>
                    <TableCell>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        bgcolor: 'background.default',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 0.5,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}>
                        {airline.logo ? (
                          <Image
                            src={`http://localhost:8001/storage/${airline.logo}`}
                            alt={airline.name}
                            width={40}
                            height={40}
                            style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                            unoptimized
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">No Logo</Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{airline.name}</TableCell>
                    <TableCell>
                      <Box component="span" sx={{
                        bgcolor: 'primary.50',
                        color: 'primary.main',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontWeight: 'bold'
                      }}>
                        {airline.code}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(airline.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="default"
                        onClick={() => openEditModal(airline)}
                        size="small"
                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'primary.50' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="default"
                        onClick={() => openDeleteModal(airline)}
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
                onChange={(_, page) => fetchAirlines(page)}
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
                {isAddModalOpen ? 'Add New Airline' : 'Edit Airline'}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ px: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                <TextField
                  label="Airline Name"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Garuda Indonesia"
                />
                <TextField
                  label="Airline Code (IATA)"
                  fullWidth
                  required
                  inputProps={{ maxLength: 3, style: { textTransform: 'uppercase' } }}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. GA"
                />

                <Box>
                  <Typography variant="subtitle2" gutterBottom color="text.secondary">Airline Logo</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {logoPreview && (
                      <Box sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 3,
                        border: '1px dashed #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'background.default',
                        overflow: 'hidden',
                        p: 1
                      }}>
                        <Image
                          src={logoPreview}
                          alt="Preview"
                          width={60}
                          height={60}
                          style={{ objectFit: 'contain' }}
                          unoptimized
                        />
                      </Box>
                    )}
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      sx={{ borderRadius: 3, height: 50, px: 3 }}
                    >
                      Upload Logo
                      <input
                        type="file"
                        hidden
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </Button>
                  </Box>
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
                Are you sure you want to delete <strong>{selectedAirline?.name}</strong>?
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
