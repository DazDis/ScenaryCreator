import React, { useState } from 'react';
import {
    Box, Stack, Chip, TextField, Button, Typography, Tooltip,
    Autocomplete, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';

export const MethodPicker = ({ items, onAddItem, onRemoveItem, blueprints }) => {
    const [selectedBlueprint, setSelectedBlueprint] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [paramValues, setParamValues] = useState([]);
    const [errors, setErrors] = useState({});

    const selectedBlueprintObj = blueprints.find(b => b.name === selectedBlueprint?.name);
    const methods = selectedBlueprintObj ? selectedBlueprintObj.methods : [];
    const selectedMethodObj = methods.find(m => m.name === selectedMethod?.name);
    const parameters = selectedMethodObj ? selectedMethodObj.parameters : [];

    const resetParamValues = (paramsCount) => {
        setParamValues(Array(paramsCount).fill(''));
        setErrors({});
    };

    const handleBlueprintChange = (newValue) => {
        setSelectedBlueprint(newValue);
        setSelectedMethod(null);
        setParamValues([]);
        setErrors({});
    };

    const handleMethodChange = (newValue) => {
        setSelectedMethod(newValue);
        const method = methods.find(m => m.name === newValue?.name);
        if (method) {
            resetParamValues(method.parameters.length);
        } else {
            setParamValues([]);
            setErrors({});
        }
    };

    const handleParamChange = (idx, value) => {
        const newVals = [...paramValues];
        newVals[idx] = value;
        setParamValues(newVals);
        setErrors(prev => ({ ...prev, [idx]: '' }));
    };

    const validateParam = (value, type) => {
        if (type === 'number') {
            if (value === '') return { valid: true };
            const num = Number(value);
            if (isNaN(num)) return { valid: false, message: 'Введите число' };
            return { valid: true, value: num };
        }
        if (type === 'boolean') {
            if (value !== 'true' && value !== 'false') {
                return { valid: false, message: 'Выберите true или false' };
            }
            return { valid: true, value: value === 'true' };
        }
        return { valid: true, value };
    };

    const handleAdd = () => {
        if (!selectedBlueprint || !selectedMethod) {
            alert('Выберите сценарный объект и метод');
            return;
        }

        const methodObj = methods.find(m => m.name === selectedMethod.name);
        if (!methodObj) return;

        const paramErrors = {};
        let hasError = false;
        const validatedValues = [];

        methodObj.parameters.forEach((param, idx) => {
            const rawValue = paramValues[idx] || '';
            const result = validateParam(rawValue, param.type);
            if (!result.valid) {
                paramErrors[idx] = result.message;
                hasError = true;
            } else {
                validatedValues.push(result.value);
            }
        });

        if (hasError) {
            setErrors(paramErrors);
            return;
        }

        let methodCall = `${selectedBlueprint.name}.${selectedMethod.name}`;
        if (validatedValues.length > 0) {
            const formattedValues = validatedValues.map((val, idx) => {
                const paramType = methodObj.parameters[idx].type;
                if (paramType === 'string' || paramType === 'any') {
                    return `"${String(val)}"`;
                }
                if (paramType === 'number') {
                    return String(val);
                }
                if (paramType === 'boolean') {
                    return val ? 'true' : 'false';
                }
                return String(val);
            });
            methodCall += `(${formattedValues.join(', ')})`;
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
        setErrors({});
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Stack spacing={1}>
                {/* Список добавленных методов */}
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
                                    '&:hover': { color: 'error.main' },
                                },
                            }}
                        />
                    ))}
                </Box>

                {/* Форма добавления */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'flex-start' }}>
                    <Autocomplete
                        size="small"
                        options={blueprints}
                        getOptionLabel={(option) => option.name}
                        value={selectedBlueprint}
                        onChange={(event, newValue) => handleBlueprintChange(newValue)}
                        sx={{ minWidth: 180, flex: '1 1 180px' }}
                        renderInput={(params) => (
                            <TextField {...params} label="Сценарный объект" placeholder="Поиск объекта..." size="small" />
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
                            <TextField {...params} label="Метод" placeholder="Поиск метода..." size="small" />
                        )}
                        isOptionEqualToValue={(option, value) => option.name === value?.name}
                        noOptionsText="Нет доступных методов"
                        renderOption={(props, option) => (
                            <li {...props}>
                                <Tooltip title={option.description || 'Нет описания'} placement="right" arrow>
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
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, flex: '1 1 120px' }}>
                            {parameters.map((param, idx) => {
                                const value = paramValues[idx] || '';
                                let input;

                                if (param.type === 'boolean') {
                                    input = (
                                        <FormControl size="small" sx={{ minWidth: 80, flex: '1 1 80px' }}>
                                            <InputLabel id={`param-boolean-label-${idx}`}>{param.name}</InputLabel>
                                            <Select
                                                labelId={`param-boolean-label-${idx}`}
                                                value={value || 'false'}
                                                onChange={(e) => handleParamChange(idx, e.target.value)}
                                                label={param.name}
                                                error={!!errors[idx]}
                                            >
                                                <MenuItem value="true">true</MenuItem>
                                                <MenuItem value="false">false</MenuItem>
                                            </Select>
                                            {errors[idx] && (
                                                <Typography variant="caption" color="error">{errors[idx]}</Typography>
                                            )}
                                        </FormControl>
                                    );
                                } else if (param.type === 'number') {
                                    input = (
                                        <TextField
                                            size="small"
                                            type="number"
                                            placeholder={param.name}
                                            value={value}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '' || !isNaN(val)) {
                                                    handleParamChange(idx, val);
                                                }
                                            }}
                                            error={!!errors[idx]}
                                            helperText={errors[idx] || ''}
                                            sx={{ minWidth: 80, flex: '1 1 80px' }}
                                        />
                                    );
                                } else {
                                    input = (
                                        <TextField
                                            size="small"
                                            placeholder={param.name}
                                            value={value}
                                            onChange={(e) => handleParamChange(idx, e.target.value)}
                                            error={!!errors[idx]}
                                            helperText={errors[idx] || ''}
                                            sx={{ minWidth: 80, flex: '1 1 80px' }}
                                        />
                                    );
                                }

                                return (
                                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary">{param.name}:</Typography>
                                        {input}
                                    </Box>
                                );
                            })}
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