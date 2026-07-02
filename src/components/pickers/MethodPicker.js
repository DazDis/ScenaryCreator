import React, { useState } from 'react';
import {
    Box, Stack, Chip, TextField, Button, Typography, Tooltip,
    Autocomplete, IconButton, FormControl, InputLabel, Select, MenuItem,
    FormHelperText, Alert, Paper
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, Help as HelpIcon } from '@mui/icons-material';
import { PARAM_TYPES, PARAM_TYPE_LABELS, PARAM_TYPE_ICONS } from '../common/Constants';

// Функция валидации значения по типу
const validateValue = (value, type) => {
    if (value === '') return { valid: true, message: '' };

    switch (type) {
        case PARAM_TYPES.INT:
            if (/^-?\d+$/.test(value.trim())) {
                return { valid: true, message: '' };
            }
            return { valid: false, message: 'Введите целое число' };
        case PARAM_TYPES.FLOAT:
            if (/^-?\d*\.?\d+$/.test(value.trim())) {
                return { valid: true, message: '' };
            }
            return { valid: false, message: 'Введите число' };
        case PARAM_TYPES.BOOLEAN:
            if (value === 'true' || value === 'false') {
                return { valid: true, message: '' };
            }
            return { valid: false, message: 'Выберите true/false' };
        case PARAM_TYPES.STRING:
        default:
            return { valid: true, message: '' };
    }
};

// Компонент для ввода параметра
const ParamInput = ({
                        param,
                        value,
                        onChange,
                        onFocus,
                        onBlur,
                        error,
                        helperText
                    }) => {
    const [localValue, setLocalValue] = useState(value || '');
    const [localError, setLocalError] = useState(null);
    const [touched, setTouched] = useState(false);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        setTouched(true);

        const validation = validateValue(newValue, param.type);
        if (validation.valid || newValue === '') {
            setLocalError(null);
            onChange(newValue, null);
        } else {
            setLocalError(validation.message);
            onChange(newValue, validation.message);
        }
    };

    const handleBlur = (e) => {
        setTouched(true);
        const validation = validateValue(localValue, param.type);
        if (!validation.valid && localValue !== '') {
            setLocalError(validation.message);
            onBlur?.(validation.message);
        } else {
            setLocalError(null);
            onBlur?.(null);
        }
    };

    if (param.type === 'Boolean') {
        return (
            <FormControl size="small" sx={{ minWidth: 120 }} error={!!(error || localError)}>
                <Select
                    value={localValue}
                    onChange={(e) => {
                        const newValue = e.target.value;
                        setLocalValue(newValue);
                        setTouched(true);
                        setLocalError(null);
                        onChange(newValue, null);
                    }}
                    onBlur={handleBlur}
                    displayEmpty
                    size="small"
                >
                    <MenuItem value="">Выберите</MenuItem>
                    <MenuItem value="true">true</MenuItem>
                    <MenuItem value="false">false</MenuItem>
                </Select>
                {(error || localError) && (
                    <FormHelperText>{error || localError}</FormHelperText>
                )}
            </FormControl>
        );
    }

    return (
        <TextField
            size="small"
            placeholder={param.name}
            value={localValue}
            onChange={handleChange}
            onFocus={onFocus}
            onBlur={handleBlur}
            sx={{ minWidth: 120 }}
            error={!!(error || localError)}
            helperText={error || localError || ''}
            
        />
    );
};

export const MethodPicker = ({ items, onAddItem, onRemoveItem, blueprints }) => {
    const [selectedBlueprint, setSelectedBlueprint] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [paramValues, setParamValues] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});
    const [error, setError] = useState(null);

    const selectedBlueprintObj = blueprints.find(b => b.name === selectedBlueprint?.name);
    const methods = selectedBlueprintObj ? selectedBlueprintObj.methods : [];
    const selectedMethodObj = methods.find(m => m.name === selectedMethod?.name);
    const parameters = selectedMethodObj ? selectedMethodObj.parameters : [];

    const resetParamValues = (paramsCount) => {
        setParamValues(Array(paramsCount).fill(''));
        setValidationErrors({});
    };

    const handleBlueprintChange = (newValue) => {
        setSelectedBlueprint(newValue);
        setSelectedMethod(null);
        setParamValues([]);
        setValidationErrors({});
        setError(null);
    };

    const handleMethodChange = (newValue) => {
        setSelectedMethod(newValue);
        const method = methods.find(m => m.name === newValue?.name);
        if (method) {
            resetParamValues(method.parameters.length);
        } else {
            setParamValues([]);
        }
        setError(null);
    };

    const handleParamChange = (idx, value, errorMsg) => {
        const newVals = [...paramValues];
        newVals[idx] = value;
        setParamValues(newVals);

        const newErrors = { ...validationErrors };
        if (errorMsg) {
            newErrors[idx] = errorMsg;
        } else {
            delete newErrors[idx];
        }
        setValidationErrors(newErrors);
    };

    const handleParamBlur = (idx, errorMsg) => {
        if (errorMsg) {
            setValidationErrors(prev => ({
                ...prev,
                [idx]: errorMsg
            }));
        } else {
            const newErrors = { ...validationErrors };
            delete newErrors[idx];
            setValidationErrors(newErrors);
        }
    };

    const handleAdd = () => {
        if (!selectedBlueprint || !selectedMethod) {
            setError('Выберите сценарный объект и метод');
            return;
        }

        const paramObj = methods.find(m => m.name === selectedMethod.name);
        if (paramObj && paramObj.parameters.length > 0) {
            let hasError = false;
            const errors = {};

            paramObj.parameters.forEach((param, idx) => {
                const value = paramValues[idx] || '';

                if (value === '') {
                    errors[idx] = '⚠️ Параметр не может быть пустым';
                    hasError = true;
                    return;
                }

                let validationError = '';
                if (param.type === 'Int' && !/^-?\d+$/.test(value.trim())) {
                    validationError = '⚠️ Введите целое число';
                } else if (param.type === 'Float' && !/^-?\d*\.?\d+$/.test(value.trim())) {
                    validationError = '⚠️ Введите число';
                } else if (param.type === 'Boolean' && !['true', 'false'].includes(value.trim().toLowerCase())) {
                    validationError = '⚠️ Выберите true/false';
                }

                if (validationError) {
                    errors[idx] = validationError;
                    hasError = true;
                }
            });

            if (hasError) {
                setValidationErrors(errors);
                setError('❌ Заполните все параметры корректно');
                return;
            }
        }

        let methodCall = `${selectedBlueprint.name}.${selectedMethod.name}`;
        if (paramObj && paramObj.parameters.length > 0) {
            const values = paramValues.map(v => {
                const trimmed = v.trim();
                if (!isNaN(trimmed) && trimmed !== '') return trimmed;
                if (trimmed === 'true' || trimmed === 'false') return trimmed;
                return `"${trimmed}"`;
            });
            methodCall += `(${values.join(', ')})`;
        } else {
            methodCall += '()';
        }

        if (items.includes(methodCall)) {
            setError('Этот вызов уже добавлен');
            return;
        }

        onAddItem(methodCall);
        setSelectedBlueprint(null);
        setSelectedMethod(null);
        setParamValues([]);
        setValidationErrors({});
        setError(null);
    };

    const fieldDescriptions = {
        blueprint: 'Сценарный объект - это контейнер, содержащий набор методов.',
        method: 'Метод - это функция, выполняющая определенное действие.',
        parameters: 'Параметры - значения, передаваемые в метод.',
        addButton: 'Нажмите для добавления метода в список действий.'
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Stack spacing={1.5}>
                {error && (
                    <Alert severity="error" onClose={() => setError(null)} size="small">
                        {error}
                    </Alert>
                )}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {items.map((item, idx) => (
                        <Chip
                            key={idx}
                            label={item}
                            onDelete={() => onRemoveItem(idx)}
                            deleteIcon={<CloseIcon />}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    ))}
                </Box>

                <Stack spacing={1}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Autocomplete
                                size="small"
                                options={blueprints}
                                getOptionLabel={(option) => option.name}
                                value={selectedBlueprint}
                                onChange={(event, newValue) => handleBlueprintChange(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Сценарный объект"
                                        placeholder="Поиск..."
                                        size="small"
                                    />
                                )}
                                isOptionEqualToValue={(option, value) => option.name === value?.name}
                                sx={{ flex: 1 }}
                            />
                            <Tooltip title={fieldDescriptions.blueprint} placement="top" arrow enterDelay={300}>
                                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                    <HelpIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Autocomplete
                                size="small"
                                options={methods}
                                getOptionLabel={(option) => option.name}
                                value={selectedMethod}
                                onChange={(event, newValue) => handleMethodChange(newValue)}
                                disabled={!selectedBlueprint}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Метод"
                                        placeholder="Поиск..."
                                        size="small"
                                    />
                                )}
                                isOptionEqualToValue={(option, value) => option.name === value?.name}
                                sx={{ flex: 1 }}
                            />
                            <Tooltip title={fieldDescriptions.method} placement="top" arrow enterDelay={300}>
                                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                    <HelpIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    {parameters.length > 0 && (
                        <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.default' }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5, fontWeight: 'bold' }}>
                                    Параметры:
                                </Typography>
                                <Tooltip title={fieldDescriptions.parameters} placement="top" arrow enterDelay={300}>
                                    <IconButton size="small" sx={{ color: 'text.secondary', fontSize: 14 }}>
                                        <HelpIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                {parameters.map((param, idx) => (
                                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Chip
                                            label={PARAM_TYPE_LABELS[param.type] || param.type}
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.6rem',
                                                fontWeight: 'bold',
                                                mr: 0.5,
                                                borderColor: 'primary.light',
                                                color: 'white',
                                                bgcolor: 'primary.light'
                                            }}
                                        />
                                        <ParamInput
                                            param={param}
                                            value={paramValues[idx] || ''}
                                            onChange={(value, errorMsg) => handleParamChange(idx, value, errorMsg)}
                                            onFocus={() => {
                                                const newErrors = { ...validationErrors };
                                                delete newErrors[idx];
                                                setValidationErrors(newErrors);
                                            }}
                                            onBlur={(errorMsg) => handleParamBlur(idx, errorMsg)}
                                            error={validationErrors[idx]}
                                        />
                                        {validationErrors[idx] && (
                                            <Tooltip title={validationErrors[idx]}>
                                                <Typography variant="caption" color="error" sx={{ fontSize: '10px' }}>
                                                    ⚠️
                                                </Typography>
                                            </Tooltip>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title={fieldDescriptions.addButton} placement="top" arrow enterDelay={300}>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleAdd}
                                startIcon={<AddIcon />}
                            >
                                Добавить метод
                            </Button>
                        </Tooltip>
                    </Box>
                </Stack>
            </Stack>
        </Box>
    );
};