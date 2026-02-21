import {
  Box,
  Typography,
  List,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SidebarItem from './SidebarItem';

const WIDTH_FULL = 260;
const WIDTH_SLIM = 70;
const TRANSITION_MS = 220;

export default function Sidebar({
  menuItems,
  user,
  expanded,
  isSlim,
  hoverExpanded,
  setHoverExpanded,
  toggle,
  onItemClick,
  showAsOverlay = false,
}) {
  const theme = useTheme();

  const showLabels = expanded || (showAsOverlay && hoverExpanded);
  const showToggle = true;

  const content = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: showLabels ? 'space-between' : 'center',
          px: showLabels ? 2 : 0,
          py: 1.5,
          minHeight: 56,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        {showLabels && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              fontSize: '1.0625rem',
            }}
          >
            POS
          </Typography>
        )}
        {showToggle && (
          <IconButton
            onClick={toggle}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' },
            }}
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {expanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}
      </Box>
      <List sx={{ flex: 1, px: 0.5, py: 1 }}>
        {menuItems.map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            showLabel={showLabels}
            onClick={onItemClick}
          />
        ))}
      </List>
      <Box
        sx={{
          px: showLabels ? 2 : 1,
          py: 2,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
<Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          textAlign: showLabels ? 'left' : 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: showLabels ? 'normal' : 'nowrap',
          fontSize: '0.8125rem',
        }}
      >
          {user?.username}
          {showLabels && user?.role && ` · ${user.role}`}
        </Typography>
      </Box>
    </>
  );

  return content;
}

export { WIDTH_FULL, WIDTH_SLIM, TRANSITION_MS };
