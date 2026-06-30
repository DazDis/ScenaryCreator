import React, { useState } from 'react';
import {
    Box, Stack, Chip, TextField, Button, Typography, Tooltip,
    Autocomplete
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';

export const MethodPicker = ({ items, onAddItem, onRemoveItem, blueprints }) => {
    const [selectedBlueprint, setSelectedBlueprint] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [paramValues, setParamValues] = useState([]);

    const selectedBlueprintObj = blueprints.find(b => b.name === selectedBlueprint?.name);
    const methods = selectedBlueprintObj ? selectedBlueprintObj.methods : [];
    const selectedMethodObj = methods.find(m => m.name === selectedMethod?.name);
    const parameters = selectedMethodObj ? selectedMethodObj.parameters : [];

    const resetParamValues = (paramsCount) => {
        setParamValues(Array(paramsCount).fill(''));
    };

    const handleBlueprintChange = (newValue) => {
        setSelectedBlueprint(newValue);
        setSelectedMethod(null);
        setParamValues([]);
    };

    const handleMethodChange = (newValue) => {
        setSelectedMethod(newValue);
        const method = methods.find(m => m.name === newValue?.name);
        if (method) {
            resetParamValues(method.parameters.length);
        } else {
            setParamValues([]);
        }
    };

    const handleParamChange = (idx, value) => {
        const newVals = [...paramValues];
        newVals[idx] = value;
        setParamValues(newVals);
    };

    const handleAdd = () => {
        if (!selectedBlueprint || !selectedMethod) {
            alert('Выберите сценарный объект и метод');
            return;
        }
        const methodObj = methods.find(m => m.name === selectedMethod.name);
        let methodCall = `${selectedBlueprint.name}.${selectedMethod.name}`;
        if (methodObj && methodObj.parameters.length > 0) {
            const values = paramValues.map(v => v.trim() || '""');
            methodCall += `(${values.join(', ')})`;
        } else {
            methodCall += '()';
        }
        if (items.includes(methodCall)) {
            alert('Этот вызов уже добавлен');
            return;
        }
        onAddItem(methodCall);
        setSelectedBlueprint(null);
        setSelectedMethod(null);
        setParamValues([]);
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Stack spacing={1}>
                {/* Список добавленных методов с крестиками */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {items.map((item, idx) => (
                        <Chip
                            key={idx}
                            label={item}
                            onDelete={() => onRemoveItem(idx)}
                            deleteIcon={<CloseIcon />}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{
                                '& .MuiChip-deleteIcon': {
                                    color: 'primary.main',
                                    '&:hover': {
                                        color: 'error.main',
                                    },
                                },
                            }}
                        />
                    ))}
                </Box>

                {/* Форма добавления */}
                <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    alignItems: 'flex-start'
                }}>
                    <Autocomplete
                        size="small"
                        options={blueprints}
                        getOptionLabel={(option) => option.name}
                        value={selectedBlueprint}
                        onChange={(event, newValue) => handleBlueprintChange(newValue)}
                        sx={{ minWidth: 180, flex: '1 1 180px' }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Сценарный объект"
                                placeholder="Поиск объекта..."
                                size="small"
                            />
                        )}
                        isOptionEqualToValue={(option, value) => option.name === value?.name}
                        noOptionsText="Ничего не найдено"
                    />

                    <Autocomplete
                        size="small"
                        options={methods}
                        getOptionLabel={(option) => option.name}
                        value={selectedMethod}
                        onChange={(event, newValue) => handleMethodChange(newValue)}
                        disabled={!selectedBlueprint}
                        sx={{ minWidth: 180, flex: '1 1 180px' }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Метод"
                                placeholder="Поиск метода..."
                                size="small"
                            />
                        )}
                        isOptionEqualToValue={(option, value) => option.name === value?.name}
                        noOptionsText="Нет доступных методов"
                        renderOption={(props, option) => (
                            <li {...props}>
                                <Tooltip
                                    title={option.description || 'Нет описания'}
                                    placement="right"
                                    arrow
                                >
                                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                        <Typography variant="body2">{option.name}</Typography>
                                        {option.description && (
                                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                {option.description.length > 50 ? option.description.substring(0, 50) + '...' : option.description}
                                            </Typography>
                                        )}
                                    </Box>
                                </Tooltip>
                            </li>
                        )}
                    />

                    {parameters.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, flex: '1 1 120px' }}>
                            {parameters.map((param, idx) => (
                                <TextField
                                    key={idx}
                                    size="small"
                                    placeholder={param}
                                    value={paramValues[idx] || ''}
                                    onChange={(e) => handleParamChange(idx, e.target.value)}
                                    sx={{ minWidth: 80, flex: '1 1 80px' }}
                                />
                            ))}
                        </Box>
                    )}

                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleAdd}
                        startIcon={<AddIcon />}
                        sx={{ flexShrink: 0 }}
                    >
                        Добавить
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
};