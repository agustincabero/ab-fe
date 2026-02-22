import { Container, AppBar, Toolbar, Typography, Tabs, Tab, Box } from '@mui/material'
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import MarketGroupsManager from './components/MarketGroupsManager'
import MarketsManager from './components/MarketsManager'

const routes = [
  { path: '/market-groups', label: 'Market Groups' },
  { path: '/markets', label: 'Markets' },
];

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = routes.findIndex((route) => location.pathname === route.path);
  const tabValue = currentTab === -1 ? 0 : currentTab;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    navigate(routes[newValue].path);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            Admin Backend
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
            {routes.map((route, index) => (
              <Tab
                key={route.path}
                label={route.label}
                id={`tab-${index}`}
                aria-controls={`tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>
        <Box sx={{ py: 3 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/market-groups" replace />} />
            <Route path="/market-groups" element={<MarketGroupsManager />} />
            <Route path="/markets" element={<MarketsManager />} />
          </Routes>
        </Box>
      </Container>
    </>
  )
}

export default App
