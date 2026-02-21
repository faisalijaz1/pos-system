import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import { useSidebarState } from '../hooks/useSidebarState';
import Sidebar, { WIDTH_FULL, WIDTH_SLIM, TRANSITION_MS } from '../components/Sidebar';

const menuItems = [
  { to: '/', label: 'Dashboard', icon: <DashboardIcon />, roles: ['ADMIN', 'MANAGER'] },
  { to: '/pos', label: 'POS Billing', icon: <PointOfSaleIcon />, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { to: '/products', label: 'Products', icon: <InventoryIcon />, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { to: '/customers', label: 'Customers', icon: <PeopleIcon />, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { to: '/purchases', label: 'Purchases', icon: <ShoppingCartIcon />, roles: ['ADMIN', 'MANAGER'] },
  { to: '/stock', label: 'Stock', icon: <ReceiptIcon />, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { to: '/ledger', label: 'Ledger', icon: <AccountBalanceIcon />, roles: ['ADMIN', 'MANAGER'] },
];

export default function MainLayout({ themeMode, onThemeToggle }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const { expanded, isSlim, hoverExpanded, setHoverExpanded, toggle } = useSidebarState();

  const filteredMenu = menuItems.filter((item) => hasRole(...item.roles));

  const sidebarWidth = expanded ? WIDTH_FULL : WIDTH_SLIM;
  const mainMargin = isMobile ? 0 : sidebarWidth;

  const sidebarContent = (options = {}) => (
    <Box
      sx={{
        pt: 0,
        pb: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        width: options.width || sidebarWidth,
      }}
    >
      <Sidebar
        menuItems={filteredMenu}
        user={user}
        expanded={expanded}
        isSlim={isSlim}
        hoverExpanded={hoverExpanded}
        setHoverExpanded={setHoverExpanded}
        toggle={toggle}
        onItemClick={() => isMobile && setMobileOpen(false)}
        showAsOverlay={!!options.showAsOverlay}
      />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile menu button in AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${mainMargin}px)` },
          ml: { md: `${mainMargin}px` },
          transition: theme.transitions.create(['margin', 'width'], { duration: TRANSITION_MS }),
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { md: 'none' } }}
            aria-label="Open menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Munir Copy House
          </Typography>
          <IconButton onClick={onThemeToggle} color="inherit" sx={{ mr: 1 }}>
            {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer (temporary) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: WIDTH_FULL,
            borderRight: 1,
            borderColor: 'divider',
            transition: theme.transitions.create('width', { duration: TRANSITION_MS }),
          },
        }}
      >
        <Box sx={{ width: WIDTH_FULL, height: '100%' }}>
          <Sidebar
            menuItems={filteredMenu}
            user={user}
            expanded
            isSlim={false}
            hoverExpanded={false}
            setHoverExpanded={() => {}}
            toggle={() => setMobileOpen(false)}
            onItemClick={() => setMobileOpen(false)}
            showAsOverlay={false}
          />
        </Box>
      </Drawer>

      {/* Desktop: permanent sidebar (click chevron to expand/collapse; no hover overlay) */}
      <Box
        component="nav"
        sx={{
          width: { xs: 0, md: sidebarWidth },
          flexShrink: { md: 0 },
          transition: theme.transitions.create('width', { duration: TRANSITION_MS }),
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: sidebarWidth,
              top: 0,
              bottom: 0,
              transition: theme.transitions.create('width', { duration: TRANSITION_MS }),
              borderRight: 1,
              borderColor: 'divider',
              overflowX: 'hidden',
              overflowY: 'auto',
            },
          }}
        >
          {sidebarContent({})}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${mainMargin}px)` },
          mt: 8,
          minHeight: '100vh',
          transition: theme.transitions.create(['margin', 'width'], { duration: TRANSITION_MS }),
        }}
      >
        <Outlet />
      </Box>

    </Box>
  );
}
