import React, { useState, useRef } from 'react';
import {
    Card, CardHeader, CardContent, Stack, TextField, Divider, Typography, Box, Chip, IconButton, Button, Alert,
    MenuItem, Select, FormControl, InputLabel, FormHelperText, Tooltip
} from '@mui/material';
import { Delete as DeleteIcon, Help as HelpIcon } from '@mui/icons-material';
import { PARAM_TYPES, PARAM_TYPE_LABELS, PARAM_TYPE_ICONS, createParameter } from '../common/Constants';

export const BlueprintEditor = ({
                                    blueprint,
                                    onUpdate,
                                    onAddMethod,
                                    onRemoveMethod,
                                    onUpdateMethodDescription,
                                    onUpdateMethodParameters,
                                    onAddField,
                                    onRemoveField
                                }) => {
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [methodName, setMethodName] = useState('');
    const [methodDescription, setMethodDescription] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Состояния для добавления параметра
    const [newParamName, setNewParamName] = useState('');
    const [newParamType, setNewParamType] = useState(PARAM_TYPES.STRING);
    const [currentMethodIndex, setCurrentMethodIndex] = useState(null);

    if (!blueprint) return null;
    const bp = blueprint;

    const handleAddMethod = () => {
        if (isAdding) {
            return;
        }

        const name = methodName.trim();
        const description = methodDescription.trim();

        if (!name) {
            setError('Имя метода не может быть пустым');
            return;
        }

        setIsAdding(true);

        try {
            const result = onAddMethod(name, description);

            if (result && result.success === false) {
                setError(result.error);
                setIsAdding(false);
                return;
            }

            setMethodName('');
            setMethodDescription('');
            setError(null);
            setSuccess('Метод успешно добавлен');

            setTimeout(() => {
                setSuccess(null);
                setIsAdding(false);
            }, 500);
        } catch (err) {
            console.error('💥 Ошибка:', err);
            setError(err.message || 'Ошибка при добавлении метода');
            setIsAdding(false);
        }
    };

    const handleAddField = () => {
        const input = document.getElementById('new-field-input');
        const value = input?.value?.trim() || '';

        if (!value) {
            setError('Имя сообщения не может быть пустым');
            return;
        }

        try {
            onAddField(value);
            if (input) input.value = '';
            setError(null);
            setSuccess('Сообщение успешно добавлено');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.message || 'Ошибка при добавлении сообщения');
        }
    };

    const handleAddParameter = (methodIndex) => {
        const name = newParamName.trim();
        if (!name) {
            setError('Имя параметра не может быть пустым');
            return;
        }

        const currentMethod = bp.methods[methodIndex];
        const newParam = createParameter(name, newParamType);
        const newParams = [...currentMethod.parameters, newParam];
        onUpdateMethodParameters(methodIndex, newParams);

        setNewParamName('');
        setNewParamType(PARAM_TYPES.STRING);
        setCurrentMethodIndex(null);
        setSuccess('Параметр успешно добавлен');
        setTimeout(() => setSuccess(null), 2000);
    };

    const handleRemoveParameter = (methodIndex, paramIndex) => {
        const currentMethod = bp.methods[methodIndex];
        const newParams = currentMethod.parameters.filter((_, idx) => idx !== paramIndex);
        onUpdateMethodParameters(methodIndex, newParams);
    };

    const handleParamTypeChange = (methodIndex, paramIndex, newType) => {
        const currentMethod = bp.methods[methodIndex];
        const newParams = currentMethod.parameters.map((param, idx) => {
            if (idx === paramIndex) {
                return { ...param, type: newType };
            }
            return param;
        });
        onUpdateMethodParameters(methodIndex, newParams);
    };

    return (
        <Card>
            <CardHeader title="Редактирование сценарного объекта" />
            <CardContent>
                <Stack spacing={2}>
                    {error && (
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success" onClose={() => setSuccess(null)}>
                            {success}
                        </Alert>
                    )}

                    <TextField
                        label="Имя"
                        value={bp.name || ''}
                        onChange={(e) => onUpdate('name', e.target.value)}
                        fullWidth
                        size="small"
                    />

                    <Divider />
                    <Typography variant="subtitle2">Методы</Typography>
                    <Stack spacing={1}>
                        {bp.methods.map((method, idx) => (
                            <Card key={idx} variant="outlined" size="small">
                                <CardContent sx={{ py: 1 }}>
                                    <Stack spacing={1}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" fontWeight="bold">{method.name}</Typography>
                                                <TextField
                                                    size="small"
                                                    placeholder="Описание метода"
                                                    value={method.description || ''}
                                                    onChange={(e) => onUpdateMethodDescription(idx, e.target.value)}
                                                    fullWidth
                                                    sx={{ mt: 0.5 }}
                                                />
                                            </Box>
                                            <IconButton size="small" onClick={() => onRemoveMethod(idx)} color="error">
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>

                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Параметры:</Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                                {method.parameters.map((p, pi) => (
                                                    <Chip
                                                        key={pi}
                                                        label={`${PARAM_TYPE_ICONS[p.type] || '📌'} ${p.name}: ${PARAM_TYPE_LABELS[p.type] || p.type}`}
                                                        size="small"
                                                        onDelete={() => handleRemoveParameter(idx, pi)}
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Box>
                                        </Box>

                                        {/* Добавление параметра */}
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                                            <TextField
                                                size="small"
                                                placeholder="Имя параметра"
                                                value={currentMethodIndex === idx ? newParamName : ''}
                                                onChange={(e) => {
                                                    setCurrentMethodIndex(idx);
                                                    setNewParamName(e.target.value);
                                                }}
                                                onFocus={() => setCurrentMethodIndex(idx)}
                                                sx={{ flex: 1, minWidth: 100 }}
                                            />
                                            <FormControl size="small" sx={{ minWidth: 130 }}>
                                                <Select
                                                    value={currentMethodIndex === idx ? newParamType : PARAM_TYPES.STRING}
                                                    onChange={(e) => {
                                                        setCurrentMethodIndex(idx);
                                                        setNewParamType(e.target.value);
                                                    }}
                                                    onFocus={() => setCurrentMethodIndex(idx)}
                                                    displayEmpty
                                                >
                                                    {Object.entries(PARAM_TYPE_LABELS).map(([value, label]) => (
                                                        <MenuItem key={value} value={value}>
                                                            {PARAM_TYPE_ICONS[value]} {label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleAddParameter(idx)}
                                            >
                                                Добавить параметр
                                            </Button>
                                        </Box>

                                        {/* Изменение типов существующих параметров */}
                                        {method.parameters.length > 0 && (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mt: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Изменить тип:
                                                </Typography>
                                                {method.parameters.map((p, pi) => (
                                                    <FormControl key={pi} size="small" sx={{ minWidth: 130 }}>
                                                        <Select
                                                            value={p.type || PARAM_TYPES.STRING}
                                                            onChange={(e) => handleParamTypeChange(idx, pi, e.target.value)}
                                                            size="small"
                                                        >
                                                            {Object.entries(PARAM_TYPE_LABELS).map(([value, label]) => (
                                                                <MenuItem key={value} value={value}>
                                                                    {PARAM_TYPE_ICONS[value]} {label}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                ))}
                                            </Box>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Форма добавления нового метода */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                            <TextField
                                size="small"
                                placeholder="Имя нового метода"
                                value={methodName}
                                onChange={(e) => setMethodName(e.target.value)}
                                sx={{ flex: 1, minWidth: 120 }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddMethod();
                                    }
                                }}
                            />
                            <TextField
                                size="small"
                                placeholder="Описание метода"
                                value={methodDescription}
                                onChange={(e) => setMethodDescription(e.target.value)}
                                sx={{ flex: 1, minWidth: 120 }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddMethod();
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleAddMethod}
                                disabled={isAdding || !methodName.trim()}
                            >
                                {isAdding ? 'Добавление...' : 'Добавить'}
                            </Button>
                        </Box>
                    </Stack>

                    <Divider />
                    <Typography variant="subtitle2">Сообщения</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                        {bp.fields.map((field, idx) => (
                            <Chip
                                key={idx}
                                label={field}
                                onDelete={() => onRemoveField(idx)}
                                color="secondary"
                            />
                        ))}
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <TextField
                            size="small"
                            placeholder="Новое сообщение"
                            id="new-field-input"
                            sx={{ flex: 1, minWidth: 120 }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddField();
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleAddField}
                        >
                            Добавить
                        </Button>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};