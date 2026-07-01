import React, { useState, useRef } from 'react';
import {Card, CardHeader, CardContent, Stack, TextField, Divider, Typography, Box, Chip, IconButton, Button, Alert} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

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

    if (!blueprint) return null;
    const bp = blueprint;

    const handleAddMethod = () => {
        // Защита от множественных вызовов
        if (isAdding) {
            console.log('⛔ Уже добавляем, игнорируем');
            return;
        }

        const name = methodName.trim();
        const description = methodDescription.trim();

        console.log('🖱️ handleAddMethod ВЫЗВАН, имя:', name);

        if (!name) {
            setError('Имя метода не может быть пустым');
            return;
        }

        setIsAdding(true);

        try {
            // ВЫЗЫВАЕМ ТОЛЬКО ОДИН РАЗ
            console.log('📤 Вызываем onAddMethod...');
            const result = onAddMethod(name, description);
            console.log('📤 Результат:', result);

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
        // Аналогичная защита для полей
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
                                                    <Chip key={pi} label={p} size="small" />
                                                ))}
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            <TextField
                                                size="small"
                                                placeholder="Новый параметр"
                                                id={`param-input-${idx}`}
                                                sx={{ flex: 1, minWidth: 120 }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const input = e.target;
                                                        const val = input.value.trim();
                                                        if (val) {
                                                            const newParams = [...method.parameters, val];
                                                            onUpdateMethodParameters(idx, newParams);
                                                            input.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => {
                                                    const input = document.getElementById(`param-input-${idx}`);
                                                    const val = input.value.trim();
                                                    if (val) {
                                                        const newParams = [...method.parameters, val];
                                                        onUpdateMethodParameters(idx, newParams);
                                                        input.value = '';
                                                    }
                                                }}
                                            >
                                                Добавить
                                            </Button>
                                        </Box>
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