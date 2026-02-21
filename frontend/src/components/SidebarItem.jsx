import { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';
import { ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

const SidebarItem = forwardRef(function SidebarItem(
  { to, label, icon, showLabel = true, onClick },
  ref
) {
  return (
    <ListItemButton
      ref={ref}
      component={NavLink}
      to={to}
      onClick={onClick}
      sx={{
        mx: 1,
        borderRadius: 2,
        mb: 0.5,
        py: 1.25,
        position: 'relative',
        overflow: 'hidden',
        transition: 'background-color 0.2s ease, color 0.2s ease',
        ...(!showLabel && {
          justifyContent: 'center',
          minHeight: 44,
        }),
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 3,
          height: 0,
          borderRadius: '0 2px 2px 0',
          bgcolor: 'primary.main',
          transition: 'height 0.2s ease',
        },
        '&:hover': {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
        },
        '&.active': {
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
          color: 'primary.main',
          '& .MuiListItemIcon-root': { color: 'primary.main' },
          '&::before': { height: '70%' },
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: showLabel ? 40 : 36,
          color: 'inherit',
          justifyContent: 'center',
          ...(!showLabel && { marginRight: 0 }),
        }}
      >
        {icon}
      </ListItemIcon>
      {showLabel && (
        <ListItemText
          primary={label}
          primaryTypographyProps={{
            variant: 'body2',
            fontWeight: 500,
            noWrap: false,
          }}
          sx={{ '& .MuiListItemText-primary': { overflow: 'visible', whiteSpace: 'nowrap' } }}
        />
      )}
    </ListItemButton>
  );
});

export default SidebarItem;
