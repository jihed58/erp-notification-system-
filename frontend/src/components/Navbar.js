import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
          <Typography variant="body1">
            {user.name || 'Utilisateur'}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Déconnexion
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
export default Navbar;