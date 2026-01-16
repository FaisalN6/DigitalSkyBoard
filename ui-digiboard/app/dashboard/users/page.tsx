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
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import type { User, UserPagination, UserFormData } from '@/types/user';
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

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<UserPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form States
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search, sortBy, sortDirection]);

  const fetchUsers = async (page = 1) => {
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

      const response = await fetchWithAuth(`http://localhost:8001/api/users?${queryParams}`);

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      setUsers(data.data);
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
      const url = selectedUser
        ? `http://localhost:8001/api/users/${selectedUser.id}`
        : 'http://localhost:8001/api/users';

      const method = selectedUser ? 'PUT' : 'POST';

      // Don't send empty password on update
      const payload: Partial<UserFormData> = { ...formData };
      if (selectedUser && !payload.password) {
        delete payload.password;
      }

      const response = await fetchWithAuth(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Operation failed');

      closeModals();
      fetchUsers(pagination?.current_page || 1);
    } catch (error) {
      console.error(error);
      alert('Failed to save user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setFormLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetchWithAuth(`http://localhost:8001/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      closeModals();
      fetchUsers(pagination?.current_page || 1);
    } catch (error) {
      console.error(error);
      alert('Failed to delete user');
    } finally {
      setFormLoading(false);
    }
  };

  const openAddModal = () => {
    setSelectedUser(null);
    setFormData({ name: '', email: '', password: '' });
    setIsAddModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '' // Don't prefill password
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5 }}>
          <Box>
            <Typography variant="h4" color="text.primary" gutterBottom>
              Users Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage system access and administration
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
            Add User
          </Button>
        </Box>

        {/* Search */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search users by name or email..."
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
                <TableCell width={80}>Avatar</TableCell>
                <TableCell
                  onClick={() => handleSort('name')}
                  sx={{ cursor: 'pointer' }}
                >
                  Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell
                  onClick={() => handleSort('email')}
                  sx={{ cursor: 'pointer' }}
                >
                  Email {sortBy === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableCell>
                <TableCell
                  onClick={() => handleSort('created_at')}
                  sx={{ cursor: 'pointer' }}
                >
                  Created At {sortBy === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
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
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">No users found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Avatar sx={{ bgcolor: 'primary.soft', color: 'primary.main', width: 40, height: 40, fontWeight: 'bold' }}>
                        {user.name.charAt(0)}
                      </Avatar>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="default"
                        onClick={() => openEditModal(user)}
                        size="small"
                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'primary.50' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="default"
                        onClick={() => openDeleteModal(user)}
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
                onChange={(_, page) => fetchUsers(page)}
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
                {isAddModalOpen ? 'Add New User' : 'Edit User'}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ px: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                <TextField
                  label="Full Name"
                  fullWidth
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                />
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. john@example.com"
                />
                <TextField
                  label={isAddModalOpen ? "Password" : "New Password (Optional)"}
                  type="password"
                  fullWidth
                  required={isAddModalOpen}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  helperText={!isAddModalOpen && "Leave blank to keep current password"}
                />
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
                Are you sure you want to delete <strong>{selectedUser?.name}</strong>?
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
