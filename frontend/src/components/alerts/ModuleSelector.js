import { Grid, Card, CardContent, CardActionArea, Typography } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BuildIcon from '@mui/icons-material/Build';
import BadgeIcon from '@mui/icons-material/Badge';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { ERP_MODULES } from '../../config/alertConfig';
import { useAlertForm } from '../../context/AlertFormContext';

// Mappage des noms d'icônes vers les composants MUI
const ICON_MAP = {
  Inventory: <InventoryIcon sx={{ fontSize: 40 }} />,
  People: <PeopleIcon sx={{ fontSize: 40 }} />,
  Receipt: <ReceiptIcon sx={{ fontSize: 40 }} />,
  Build: <BuildIcon sx={{ fontSize: 40 }} />,
  Badge: <BadgeIcon sx={{ fontSize: 40 }} />,
  ShoppingCart: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
};

function ModuleSelector() {
  const { state, dispatch } = useAlertForm();

  const handleSelect = (moduleId) => {
    dispatch({ type: 'SET_MODULE', payload: moduleId });
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Sélectionnez le module ERP à surveiller
      </Typography>
      {state.errors.module && (
        <Typography color="error" sx={{ mb: 2 }}>
          {state.errors.module}
        </Typography>
      )}
      <Grid container spacing={2}>
        {ERP_MODULES.map((mod) => (
          <Grid item xs={12} sm={6} md={4} key={mod.id}>
            <Card
              variant={state.module === mod.id ? 'outlined' : 'elevation'}
              sx={{
                border: state.module === mod.id
                  ? '2px solid #1976d2'
                  : '2px solid transparent',
                backgroundColor: state.module === mod.id
                  ? 'rgba(25, 118, 210, 0.08)'
                  : 'inherit',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                },
              }}
            >
              <CardActionArea onClick={() => handleSelect(mod.id)} sx={{ p: 2 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  {ICON_MAP[mod.icon]}
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {mod.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {mod.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}

export default ModuleSelector;
