import React, { useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import { formatMoney } from './posUtils';

/**
 * Product search with dropdown of all matches (full names, no truncation).
 * Click a row to add; Enter adds highlighted/first. Arrow Up/Down move highlight.
 * Escape closes dropdown; click outside closes dropdown. High-contrast selected row.
 */
export default function ProductSearchBar(props) {
  const {
    search,
    onSearchChange,
    searchResults = [],
    highlightedIndex = 0,
    onSelectProduct,
    onCloseDropdown,
    onKeyDown,
    placeholder = 'Barcode / Code / Name (F2) - Enter to add',
  } = props;

  const containerRef = useRef(null);
  const showDropdown = search.trim().length >= 1 && searchResults.length > 0;

  useEffect(
    function () {
      if (!showDropdown || !onCloseDropdown) return;
      function handleClickOutside(ev) {
        if (containerRef.current && !containerRef.current.contains(ev.target)) {
          onCloseDropdown();
        }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return function () {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    },
    [showDropdown, onCloseDropdown]
  );

  return (
    <Box ref={containerRef} sx={{ p: 1.25, borderBottom: 1, borderColor: 'divider', position: 'relative' }}>
      <TextField
        fullWidth
        size="small"
        sx={{ '& .MuiInputBase-root': { minHeight: 44 }, '& .MuiInputBase-input': { fontSize: '0.9375rem' } }}
        placeholder={placeholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={onKeyDown}
        inputRef={props.inputRef}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ minWidth: 200, '& .MuiInputBase-input': { py: 0.75 } }}
        aria-label="Product search"
        aria-haspopup="listbox"
        aria-expanded={showDropdown}
        aria-controls="product-search-listbox"
        id="product-search-input"
      />
      <Typography
        variant="caption"
        color="text.secondary"
        component="span"
        sx={{ display: 'block', mt: 0.5, lineHeight: 1.4, fontSize: '0.875rem' }}
        aria-hidden
      >
        ↑↓ select · Enter add
      </Typography>
      {showDropdown && (
        <Paper
          id="product-search-listbox"
          role="listbox"
          elevation={4}
          sx={{
            position: 'absolute',
            left: 8,
            right: 8,
            top: '100%',
            mt: 0.5,
            maxHeight: 320,
            overflow: 'auto',
            zIndex: 1300,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <List dense disablePadding sx={{ py: 0 }}>
            {searchResults.map((p, idx) => (
              <ListItemButton
                key={p.productId}
                selected={idx === highlightedIndex}
                onClick={() => onSelectProduct && onSelectProduct(p)}
                sx={{
                  py: 0.75,
                  borderBottom: idx < searchResults.length - 1 ? 1 : 0,
                  borderColor: 'divider',
                  '& .MuiListItemText-primary': { whiteSpace: 'normal', wordBreak: 'break-word' },
                  '& .MuiListItemText-secondary': { whiteSpace: 'normal' },
                  ...(idx === highlightedIndex
                    ? {
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.18),
                        borderLeft: (theme) => `3px solid ${theme.palette.primary.main}`,
                        '&:hover': {
                          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.26),
                        },
                        '&.Mui-focusVisible': {
                          outline: '2px solid',
                          outlineOffset: -2,
                          outlineColor: (theme) => theme.palette.primary.main,
                        },
                      }
                    : {}),
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography component="span" variant="body2" fontWeight={600} color="primary">
                        {p.code}
                      </Typography>
                      <Typography component="span" variant="body2">
                        {p.nameEn || p.name_en || ''}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography component="span" variant="caption" color="text.secondary">
                      Stock: {formatMoney(p.currentStock)} · {formatMoney(p.sellingPrice ?? p.selling_price)} / {p.uomName || 'u'}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
