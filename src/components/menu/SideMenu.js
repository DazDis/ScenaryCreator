import React from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography
} from '@mui/material';
import {
    Home as HomeIcon,
    AccountTree as AccountTreeIcon
} from '@mui/icons-material';

const menuItems = [
    { id: 'main', label: 'Этапы сценария', icon: <HomeIcon /> },
    { id: 'objects', label: 'Сценарные объекты', icon: <AccountTreeIcon /> },
];

export const SideMenu = ({ currentPage, onPageChange }) => {
    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider'
        }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                    Меню
                </Typography>
            </Box>
            <List sx={{ flex: 1, pt: 1 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.id} disablePadding>
                        <ListItemButton
                            selected={currentPage === item.id}
                            onClick={() => onPageChange(item.id)}
                            sx={{
                                borderRadius: 1,
                                mx: 1,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'white',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">
                    
                </Typography>
            </Box>
        </Box>
    );
};