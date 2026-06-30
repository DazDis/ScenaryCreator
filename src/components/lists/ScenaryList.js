import React, { useState } from 'react';
import {
    Box, Typography, IconButton, ListItemButton, ListItemText,
    TextField, InputAdornment
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    Search as SearchIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { StyledList } from '../common/StyledComponents';

export const ScenaryList = ({ scenaryObjects, selectedIndex, onSelect, onAdd, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredObjects = scenaryObjects.filter((obj, index) => {
        const name = obj.Name || `Этап ${index + 1}`;
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Закрепленная верхняя часть */}
            <Box sx={{ flexShrink: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                        Этапы сценария ({scenaryObjects.length})
                    </Typography>
                    <Box>
                        <IconButton size="small" onClick={onAdd} color="primary">
                            <AddIcon />
                        </IconButton>
                        <IconButton size="small" onClick={onDelete} color="error">
                            <RemoveIcon />
                        </IconButton>
                    </Box>
                </Box>

                <TextField
                    size="small"
                    placeholder="Поиск этапов..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 1 }}
                    fullWidth
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={handleClearSearch}>
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }
                    }}
                />
            </Box>

            {/* Прокручиваемая часть со списком */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                <StyledList dense>
                    {filteredObjects.length === 0 ? (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                {searchTerm ? 'Ничего не найдено' : 'Нет этапов'}
                            </Typography>
                        </Box>
                    ) : (
                        filteredObjects.map((obj, idx) => {
                            const originalIndex = scenaryObjects.indexOf(obj);
                            return (
                                <ListItemButton
                                    key={originalIndex}
                                    selected={originalIndex === selectedIndex}
                                    onClick={() => onSelect(originalIndex)}
                                >
                                    <ListItemText primary={obj.Name || `Этап ${originalIndex + 1}`} />
                                </ListItemButton>
                            );
                        })
                    )}
                </StyledList>
            </Box>
        </Box>
    );
};