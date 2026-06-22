import { useEffect, useState, useCallback } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, Box, Tab, Tabs, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, IconButton, Tooltip,
  Alert, Snackbar,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RestoreIcon from '@mui/icons-material/Restore';
import LockResetIcon from '@mui/icons-material/LockReset';
import Navbar from '../components/Navbar';
import {
  getUsers,
  getPendingUsers,
  approveUser,
  updateUserRole,
  suspendUser,
  reactivateUser,
  deleteUser,
  resetUserPassword,
} from '../services/userService';

const DEPARTMENTS = ['Ressources Humaines', 'Logistique & Stock', 'Commercial & Ventes', 'Finance & Comptabilité', 'Maintenance', 'Achats & Approvisionnement'];
const ROLES = [
  { value: 'user', label: 'Utilisateur' },
  { value: 'admin', label: 'Admin (Chef de département)' },
  { value: 'erp_manager', label: 'ERP Manager' },
];

const ROLE_COLORS = {
  erp_manager: 'error',
  admin: 'warning',
  user: 'info',
};

const ROLE_LABELS = {
  erp_manager: 'ERP Manager',
  admin: 'Admin',
  user: 'Utilisateur',
};

const STATUS_COLORS = {
  active: 'success',
  pending: 'warning',
  suspended: 'error',
};

const STATUS_LABELS = {
  active: 'Actif',
  pending: 'En attente',
  suspended: 'Suspendu',
};

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('approve'); // 'approve' or 'editRole'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formRole, setFormRole] = useState('user');
  const [formDepartment, setFormDepartment] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, user: null });
  const [tempPassword, setTempPassword] = useState('');
  const [searchName, setSearchName] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = useCallback(async () => {
    try {
      const [allUsers, pending] = await Promise.all([getUsers(), getPendingUsers()]);
      setUsers(allUsers);
      setPendingUsers(pending);
    } catch (err) {
      console.error('Error loading users:', err);
      setSnackbar({ open: true, message: 'Erreur lors du chargement des utilisateurs', severity: 'error' });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open approve dialog
  const handleApproveClick = (user) => {
    setSelectedUser(user);
    setDialogMode('approve');
    setFormRole('user');
    setFormDepartment('');
    setDialogOpen(true);
  };

  // Open edit role dialog
  const handleEditRoleClick = (user) => {
    setSelectedUser(user);
    setDialogMode('editRole');
    setFormRole(user.role);
    setFormDepartment(user.department || '');
    setDialogOpen(true);
  };

  // Submit approve or role change
  const handleDialogSubmit = async () => {
    try {
      if (dialogMode === 'approve') {
        await approveUser(selectedUser._id, {
          role: formRole,
          department: (formRole === 'admin' || formRole === 'user') ? formDepartment : null,
        });
        setSnackbar({ open: true, message: `${selectedUser.name} approuvé avec succès`, severity: 'success' });
      } else {
        await updateUserRole(selectedUser._id, {
          role: formRole,
          department: (formRole === 'admin' || formRole === 'user') ? formDepartment : null,
        });
        setSnackbar({ open: true, message: `Rôle de ${selectedUser.name} modifié avec succès`, severity: 'success' });
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erreur lors de l\'opération',
        severity: 'error',
      });
    }
  };

  // Confirm action (suspend, reactivate, delete)
  const handleConfirmAction = async () => {
    const { action, user } = confirmDialog;
    try {
      if (action === 'suspend') {
        await suspendUser(user._id);
        setSnackbar({ open: true, message: `${user.name} suspendu`, severity: 'success' });
      } else if (action === 'reactivate') {
        await reactivateUser(user._id);
        setSnackbar({ open: true, message: `${user.name} réactivé`, severity: 'success' });
      } else if (action === 'delete') {
        await deleteUser(user._id);
        setSnackbar({ open: true, message: `${user.name} supprimé`, severity: 'success' });
      } else if (action === 'reset_password') {
        if (!tempPassword || tempPassword.length < 4) {
          setSnackbar({ open: true, message: 'Le mot de passe temporaire doit faire au moins 4 caractères', severity: 'error' });
          return;
        }
        await resetUserPassword(user._id, tempPassword);
        setSnackbar({ open: true, message: `Mot de passe réinitialisé. Le compte est réactivé.`, severity: 'success' });
      }
      setConfirmDialog({ open: false, action: null, user: null });
      setTempPassword('');
      fetchData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erreur lors de l\'opération',
        severity: 'error',
      });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchName = u.name.toLowerCase().includes(searchName.toLowerCase());
    const matchDept = filterDept ? u.department === filterDept : true;
    return matchName && matchDept;
  });

  const filteredPending = pendingUsers.filter((u) => {
    const matchName = u.name.toLowerCase().includes(searchName.toLowerCase());
    const matchDept = filterDept ? u.department === filterDept : true;
    return matchName && matchDept;
  });

  const renderUserTable = (userList, showApprove = false) => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.main' }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nom</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rôle</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Département</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Inscrit le</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {userList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">Aucun utilisateur trouvé</Typography>
              </TableCell>
            </TableRow>
          ) : (
            userList.map((u) => (
              <TableRow key={u._id} hover>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Chip
                    label={ROLE_LABELS[u.role] || u.role}
                    color={ROLE_COLORS[u.role] || 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{u.department || '—'}</TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_LABELS[u.status] || u.status}
                    color={STATUS_COLORS[u.status] || 'default'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    {showApprove && u.status === 'pending' && (
                      <Tooltip title="Approuver">
                        <IconButton
                          color="success"
                          onClick={() => handleApproveClick(u)}
                          size="small"
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {u.status === 'active' && (
                      <>
                        <Tooltip title="Réinitialiser le mot de passe">
                          <IconButton
                            color="info"
                            onClick={() => setConfirmDialog({ open: true, action: 'reset_password', user: u })}
                            size="small"
                          >
                            <LockResetIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier le rôle">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditRoleClick(u)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Suspendre">
                          <IconButton
                            color="warning"
                            onClick={() => setConfirmDialog({ open: true, action: 'suspend', user: u })}
                            size="small"
                          >
                            <BlockIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    {u.status === 'suspended' && (
                      <Tooltip title="Réactiver">
                        <IconButton
                          color="success"
                          onClick={() => setConfirmDialog({ open: true, action: 'reactivate', user: u })}
                          size="small"
                        >
                          <RestoreIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Supprimer">
                      <IconButton
                        color="error"
                        onClick={() => setConfirmDialog({ open: true, action: 'delete', user: u })}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des Utilisateurs
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Rechercher par nom"
            variant="outlined"
            size="small"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            sx={{ minWidth: 250 }}
          />
          <TextField
            select
            label="Filtrer par département"
            variant="outlined"
            size="small"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            sx={{ minWidth: 250 }}
          >
            <MenuItem value="">Tous les départements</MenuItem>
            {DEPARTMENTS.map((d) => (
              <MenuItem key={d} value={d}>{d}</MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Tous les utilisateurs
                  <Chip label={filteredUsers.length} size="small" />
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  En attente d'approbation
                  <Chip
                    label={filteredPending.length}
                    size="small"
                    color={filteredPending.length > 0 ? 'warning' : 'default'}
                  />
                </Box>
              }
            />
          </Tabs>
        </Box>

        {tab === 0 && renderUserTable(filteredUsers, false)}
        {tab === 1 && renderUserTable(filteredPending, true)}

        {/* Approve / Edit Role Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialogMode === 'approve'
              ? `Approuver ${selectedUser?.name}`
              : `Modifier le rôle de ${selectedUser?.name}`}
          </DialogTitle>
          <DialogContent>
            <TextField
              select
              label="Rôle"
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              fullWidth
              margin="normal"
            >
              {ROLES.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>

            {(formRole === 'admin' || formRole === 'user') && (
              <TextField
                select
                label="Département"
                value={formDepartment}
                onChange={(e) => setFormDepartment(e.target.value)}
                fullWidth
                margin="normal"
                required
                helperText="Requis pour les rôles Admin et Utilisateur"
              >
                {DEPARTMENTS.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {dialogMode === 'approve' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                L'utilisateur pourra se connecter une fois approuvé.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button
              onClick={handleDialogSubmit}
              variant="contained"
              color={dialogMode === 'approve' ? 'success' : 'primary'}
              disabled={(formRole === 'admin' || formRole === 'user') && !formDepartment}
            >
              {dialogMode === 'approve' ? 'Approuver' : 'Enregistrer'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Dialog */}
        <Dialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, action: null, user: null })}
        >
          <DialogTitle>Confirmer l'action</DialogTitle>
          <DialogContent>
            <Typography>
              {confirmDialog.action === 'suspend' &&
                `Êtes-vous sûr de vouloir suspendre ${confirmDialog.user?.name} ? L'utilisateur ne pourra plus se connecter.`}
              {confirmDialog.action === 'reactivate' &&
                `Êtes-vous sûr de vouloir réactiver ${confirmDialog.user?.name} ?`}
              {confirmDialog.action === 'delete' &&
                `Êtes-vous sûr de vouloir supprimer définitivement ${confirmDialog.user?.name} ? Cette action est irréversible.`}
              {confirmDialog.action === 'reset_password' &&
                `Définissez un mot de passe temporaire pour ${confirmDialog.user?.name}. Le compte sera automatiquement réactivé et l'utilisateur devra modifier ce mot de passe à la prochaine connexion.`}
            </Typography>
            {confirmDialog.action === 'reset_password' && (
              <TextField
                autoFocus
                margin="dense"
                label="Mot de passe temporaire"
                type="text"
                fullWidth
                variant="outlined"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                sx={{ mt: 2 }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setConfirmDialog({ open: false, action: null, user: null });
              setTempPassword('');
            }}>
              Annuler
            </Button>
            <Button
              onClick={handleConfirmAction}
              variant="contained"
              color={confirmDialog.action === 'delete' ? 'error' : 'primary'}
              disabled={confirmDialog.action === 'reset_password' && tempPassword.length < 4}
            >
              Confirmer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            severity={snackbar.severity}
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}

export default UserManagementPage;
