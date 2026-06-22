import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Chip, Badge } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import BusinessIcon from '@mui/icons-material/Business';
import InboxIcon from '@mui/icons-material/Inbox';
import { useAuth } from '../context/AuthContext';
import { getHistory } from '../services/notificationService';

const ROLE_LABELS = {
  erp_manager: 'ERP Manager',
  admin: 'Admin',
  user: 'Utilisateur',
};

const ROLE_COLORS = {
  erp_manager: 'error',
  admin: 'warning',
  user: 'info',
};

function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isManager, isAdmin } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = () => {
      if (user) {
        getHistory(false).then((data) => {
          const unread = data.filter(log => !log.isRead).length;
          setUnreadCount(unread);
        }).catch(console.error);
      }
    };

    fetchUnread();

    // Listen for custom events to update badge instantly without reloading
    window.addEventListener('notification_updated', fetchUnread);
    return () => window.removeEventListener('notification_updated', fetchUnread);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <NotificationsIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          ERP Notifications
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
          <Button
            color="inherit"
            startIcon={<AddAlertIcon />}
            onClick={() => navigate('/alerts/create')}
          >
            Créer une Alerte
          </Button>

          {/* ERP Manager only: User Management */}
          {isManager() && (
            <Button
              color="inherit"
              startIcon={<PeopleIcon />}
              onClick={() => navigate('/admin/users')}
            >
              Utilisateurs
            </Button>
          )}

          {/* Admin only: Department users */}
          {isAdmin() && (
            <Button
              color="inherit"
              startIcon={<BusinessIcon />}
              onClick={() => navigate('/admin/department')}
            >
              Mon Département
            </Button>
          )}

          {/* Inbox / Notifications Actives */}
          <Button
            color="inherit"
            onClick={() => navigate('/notifications')}
            startIcon={
              <Badge badgeContent={unreadCount} color="error">
                <InboxIcon />
              </Badge>
            }
          >
            Notifications
          </Button>

          {/* User History (Archive) */}
          <Button
            color="inherit"
            startIcon={<HistoryIcon />}
            onClick={() => navigate('/history')}
          >
            Historique
          </Button>

          {/* User name + role badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1">
              {user?.name || 'Utilisateur'}
            </Typography>
            <Chip
              label={ROLE_LABELS[user?.role] || user?.role}
              color={ROLE_COLORS[user?.role] || 'default'}
              size="small"
              sx={{ color: 'white', fontWeight: 'bold' }}
            />
            {user?.department && (
              <Chip
                label={user.department}
                size="small"
                variant="outlined"
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
              />
            )}
          </Box>

          <Button color="inherit" onClick={handleLogout}>
            Déconnexion
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;