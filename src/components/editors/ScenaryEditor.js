import React, { useState, useEffect } from 'react';
import {
    Card, CardHeader, CardContent, Stack, TextField, Divider, Typography,
    Box, Paper, IconButton, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Collapse, Tooltip, MenuItem, Select, FormControl, InputLabel,
    FormHelperText
} from '@mui/material';
import {
    Edit as EditIcon,
    Close as CloseIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Help as HelpIcon
} from '@mui/icons-material';
import { MethodPicker } from '../pickers/MethodPicker';
import { TransitionPicker } from '../pickers/TransitionPicker';
import { PARAM_TYPE_LABELS, PARAM_TYPE_ICONS } from '../common/Constants';

// ---- Функция форматирования перехода для отображения ----
const formatTransitionDisplay = (item) => {
    const parts = item.split('.');
    if (parts.length === 3) {
        return `${parts[0]} => "${parts[1]}"; => '${parts[2]}'`;
    } else if (parts.length === 2) {
        return `${parts[0]} => "${parts[1]}";`;
    } else {
        return item;
    }
};

// ---- Функция форматирования метода для отображения ----
const formatMethodDisplay = (item) => {
    const parts = item.split('.');
    if (parts.length >= 2) {
        const methodPart = parts.slice(1).join('.');
        // Если есть параметры в скобках
        if (methodPart.includes('(')) {
            return `${parts[0]}.${methodPart}`;
        }
        return `${parts[0]}.${methodPart}()`;
    }
    return item;
};

// ---- MethodList компонент - для отображения списков методов и переходов ----
const MethodList = ({ items, onRemove, title, children, listKey, onUpdateListItem, blueprints, stages }) => {
    const [editIndex, setEditIndex] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    // Состояния для редактирования
    const [editBlueprint, setEditBlueprint] = useState('');
    const [editMethod, setEditMethod] = useState('');
    const [editParams, setEditParams] = useState([]);
    const [editStage, setEditStage] = useState('');
    const [paramErrors, setParamErrors] = useState({});

    // Функция валидации параметра
    const validateParam = (value, type) => {
        if (value === '') return { valid: false, message: 'Параметр не может быть пустым' };

        switch (type) {
            case 'Int':
                if (/^-?\d+$/.test(value.trim())) {
                    return { valid: true, message: '' };
                }
                return { valid: false, message: '⚠️ Введите целое число' };
            case 'Float':
                if (/^-?\d*\.?\d+$/.test(value.trim())) {
                    return { valid: true, message: '' };
                }
                return { valid: false, message: '⚠️ Введите число' };
            case 'Boolean':
                if (value === 'true' || value === 'false') {
                    return { valid: true, message: '' };
                }
                return { valid: false, message: '⚠️ Выберите true или false' };
            case 'String':
            default:
                if (value.trim().length > 0) {
                    return { valid: true, message: '' };
                }
                return { valid: false, message: 'Параметр не может быть пустым' };
        }
    };

    const handleEdit = (index) => {
        const item = items[index];
        setEditIndex(index);
        setParamErrors({});

        // Разбираем строку метода
        const parts = item.split('.');
        if (parts.length >= 2) {
            setEditBlueprint(parts[0]);
            const methodPart = parts.slice(1).join('.');
            // Парсим метод и параметры
            const methodMatch = methodPart.match(/^([^(]+)(?:\(([^)]*)\))?/);
            if (methodMatch) {
                setEditMethod(methodMatch[1].trim());
                if (methodMatch[2]) {
                    const params = methodMatch[2].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
                    setEditParams(params);
                } else {
                    setEditParams([]);
                }
            }
        }

        // Для переходов
        if (parts.length === 3) {
            setEditBlueprint(parts[0]);
            setEditMethod(parts[1]);
            setEditStage(parts[2]);
        }

        setEditDialogOpen(true);
    };

    const handleParamChange = (idx, value) => {
        const newParams = [...editParams];
        newParams[idx] = value;
        setEditParams(newParams);

        // Валидация при вводе
        const blueprintObj = blueprints.find(b => b.name === editBlueprint);
        const methodObj = blueprintObj?.methods.find(m => m.name === editMethod);
        if (methodObj && methodObj.parameters[idx]) {
            const validation = validateParam(value, methodObj.parameters[idx].type);
            setParamErrors(prev => ({
                ...prev,
                [idx]: validation.valid ? '' : validation.message
            }));
        }
    };

    const handleSaveEdit = () => {
        if (editIndex !== null) {
            let newValue = '';

            // Проверяем тип списка по ключу
            if (listKey === 'Transition Tasks') {
                // Это переход
                if (editBlueprint && editMethod && editStage) {
                    newValue = `${editBlueprint}.${editMethod}.${editStage}`;
                } else {
                    alert('Заполните все поля для перехода');
                    return;
                }
            } else {
                // Это метод - проверяем валидацию параметров
                if (editBlueprint && editMethod) {
                    // Получаем объект с методами
                    const blueprintObj = blueprints.find(b => b.name === editBlueprint);
                    const methodObj = blueprintObj?.methods.find(m => m.name === editMethod);

                    // Проверяем все параметры
                    let hasError = false;
                    const errors = {};

                    if (methodObj && methodObj.parameters.length > 0) {
                        methodObj.parameters.forEach((param, idx) => {
                            const value = editParams[idx] || '';
                            const validation = validateParam(value, param.type);
                            if (!validation.valid) {
                                errors[idx] = validation.message;
                                hasError = true;
                            }
                        });
                    }

                    if (hasError) {
                        setParamErrors(errors);
                        alert('Исправьте ошибки в параметрах');
                        return;
                    }

                    // Формируем строку метода
                    newValue = `${editBlueprint}.${editMethod}`;
                    if (editParams.length > 0) {
                        const paramsStr = editParams.map(p => {
                            const trimmed = p.trim();
                            // Для чисел не добавляем кавычки
                            if (!isNaN(trimmed) && trimmed !== '') {
                                return trimmed;
                            }
                            // Для boolean
                            if (trimmed === 'true' || trimmed === 'false') {
                                return trimmed;
                            }
                            // Для остальных - с кавычками
                            return `"${trimmed}"`;
                        }).join(', ');
                        newValue += `(${paramsStr})`;
                    } else {
                        newValue += '()';
                    }
                } else {
                    alert('Заполните объект и метод');
                    return;
                }
            }

            onUpdateListItem(listKey, editIndex, newValue);
            setEditDialogOpen(false);
            setEditIndex(null);
            setEditBlueprint('');
            setEditMethod('');
            setEditParams([]);
            setEditStage('');
            setParamErrors({});
        }
    };

    const handleCloseEdit = () => {
        setEditDialogOpen(false);
        setEditIndex(null);
        setEditBlueprint('');
        setEditMethod('');
        setEditParams([]);
        setEditStage('');
        setParamErrors({});
    };

    // Получаем методы для выбранного объекта
    const selectedBlueprintObj = blueprints.find(b => b.name === editBlueprint);
    const methods = selectedBlueprintObj ? selectedBlueprintObj.methods : [];

    // Получаем поля для перехода
    const fields = selectedBlueprintObj ? selectedBlueprintObj.fields : [];

    // Параметры выбранного метода
    const selectedMethodObj = methods.find(m => m.name === editMethod);
    const methodParams = selectedMethodObj ? selectedMethodObj.parameters : [];

    // Обновляем параметры при выборе метода
    useEffect(() => {
        if (selectedMethodObj) {
            const paramCount = selectedMethodObj.parameters.length;
            if (editParams.length === 0) {
                setEditParams(Array(paramCount).fill(''));
            } else if (editParams.length !== paramCount) {
                const newParams = [...editParams];
                if (paramCount > editParams.length) {
                    newParams.push(...Array(paramCount - editParams.length).fill(''));
                } else {
                    newParams.splice(paramCount);
                }
                setEditParams(newParams);
            }
            setParamErrors({});
        }
    }, [editMethod, selectedMethodObj]);

    const stageOptions = stages.map((stage, index) => ({
        Name: stage.Name || `Этап ${index + 1}`,
        index: index
    }));

    const isTransition = listKey === 'Transition Tasks';

    return (
        <Paper
            variant="outlined"
            sx={{
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider'
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.5,
                    bgcolor: 'action.hover',
                    cursor: 'pointer',
                    '&:hover': {
                        bgcolor: 'action.selected',
                    }
                }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <Typography variant="subtitle1" fontWeight="bold">
                    {title} ({items.length})
                </Typography>
                <IconButton size="small">
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>

            <Collapse in={isExpanded}>
                <Box sx={{ p: 2 }}>
                    <Box sx={{ mb: 2 }}>
                        {children}
                    </Box>

                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            maxHeight: 300,
                            overflow: 'hidden',
                            bgcolor: 'background.default'
                        }}
                    >
                        <Typography variant="subtitle2" sx={{ mb: 1, flexShrink: 0, color: 'text.secondary' }}>
                            Список ({items.length})
                        </Typography>
                        <Box sx={{
                            flex: 1,
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                            pr: 1
                        }}>
                            {items.length === 0 ? (
                                <Typography color="text.secondary" sx={{ p: 1, fontSize: 14, textAlign: 'center' }}>
                                    Нет добавленных элементов
                                </Typography>
                            ) : (
                                items.map((item, idx) => {
                                    // Форматируем отображение в зависимости от типа списка
                                    let displayText = item;
                                    if (listKey === 'Transition Tasks') {
                                        displayText = formatTransitionDisplay(item);
                                    } else {
                                        displayText = formatMethodDisplay(item);
                                    }

                                    return (
                                        <Box
                                            key={idx}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                p: 1,
                                                bgcolor: 'background.paper',
                                                borderRadius: 1,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                }
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontFamily: 'monospace',
                                                    fontSize: 13,
                                                    flex: 1,
                                                    wordBreak: 'break-word',
                                                    mr: 1
                                                }}
                                            >
                                                {displayText}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEdit(idx)}
                                                    sx={{ fontSize: 16 }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onRemove(idx)}
                                                    sx={{ fontSize: 16, color: 'error.main' }}
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    );
                                })
                            )}
                        </Box>
                    </Paper>
                </Box>
            </Collapse>

            {/* Диалог редактирования с полями */}
            <Dialog open={editDialogOpen} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {isTransition ? 'Редактирование перехода' : 'Редактирование метода'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Сценарный объект</InputLabel>
                            <Select
                                value={editBlueprint}
                                onChange={(e) => {
                                    setEditBlueprint(e.target.value);
                                    setEditMethod('');
                                    setEditParams([]);
                                    setParamErrors({});
                                }}
                                label="Сценарный объект"
                            >
                                <MenuItem value="">Выберите объект</MenuItem>
                                {blueprints.map((bp) => (
                                    <MenuItem key={bp.name} value={bp.name}>
                                        {bp.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {isTransition ? (
                            <>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Сообщение</InputLabel>
                                    <Select
                                        value={editMethod}
                                        onChange={(e) => setEditMethod(e.target.value)}
                                        label="Сообщение"
                                        disabled={!editBlueprint}
                                    >
                                        <MenuItem value="">Выберите сообщение</MenuItem>
                                        {fields.map((field) => (
                                            <MenuItem key={field} value={field}>
                                                {field}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth size="small">
                                    <InputLabel>Целевой этап</InputLabel>
                                    <Select
                                        value={editStage}
                                        onChange={(e) => setEditStage(e.target.value)}
                                        label="Целевой этап"
                                    >
                                        <MenuItem value="">Выберите этап</MenuItem>
                                        {stageOptions.map((stage) => (
                                            <MenuItem key={stage.index} value={stage.Name}>
                                                {stage.Name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </>
                        ) : (
                            <>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Метод</InputLabel>
                                    <Select
                                        value={editMethod}
                                        onChange={(e) => {
                                            setEditMethod(e.target.value);
                                            const method = methods.find(m => m.name === e.target.value);
                                            if (method) {
                                                const oldParams = [...editParams];
                                                const newParams = Array(method.parameters.length).fill('');
                                                method.parameters.forEach((param, idx) => {
                                                    if (idx < oldParams.length && oldParams[idx] !== undefined) {
                                                        newParams[idx] = oldParams[idx];
                                                    }
                                                });
                                                setEditParams(newParams);
                                            }
                                            setParamErrors({});
                                        }}
                                        label="Метод"
                                        disabled={!editBlueprint}
                                    >
                                        <MenuItem value="">Выберите метод</MenuItem>
                                        {methods.map((m) => (
                                            <MenuItem key={m.name} value={m.name}>
                                                {m.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {methodParams.length > 0 && (
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                            Параметры:
                                        </Typography>
                                        <Stack spacing={1}>
                                            {methodParams.map((param, idx) => {
                                                if (param.type === 'Boolean') {
                                                    return (
                                                        <FormControl key={idx} fullWidth size="small" error={!!paramErrors[idx]}>
                                                            <InputLabel>{`${PARAM_TYPE_ICONS[param.type] || '📌'} ${param.name}`}</InputLabel>
                                                            <Select
                                                                value={editParams[idx] || ''}
                                                                onChange={(e) => handleParamChange(idx, e.target.value)}
                                                                label={`${PARAM_TYPE_ICONS[param.type] || '📌'} ${param.name}`}
                                                            >
                                                                <MenuItem value="">Выберите значение</MenuItem>
                                                                <MenuItem value="true">true</MenuItem>
                                                                <MenuItem value="false">false</MenuItem>
                                                            </Select>
                                                            {paramErrors[idx] && (
                                                                <FormHelperText>{paramErrors[idx]}</FormHelperText>
                                                            )}
                                                            <FormHelperText>Тип: {PARAM_TYPE_LABELS[param.type]}</FormHelperText>
                                                        </FormControl>
                                                    );
                                                }

                                                return (
                                                    <Box key={idx}>
                                                        <TextField
                                                            size="small"
                                                            label={`${PARAM_TYPE_ICONS[param.type] || '📌'} ${param.name}`}
                                                            value={editParams[idx] || ''}
                                                            onChange={(e) => handleParamChange(idx, e.target.value)}
                                                            fullWidth
                                                            placeholder={`Введите значение для ${param.name}`}
                                                            error={!!paramErrors[idx]}
                                                            helperText={paramErrors[idx] || `Тип: ${PARAM_TYPE_LABELS[param.type] || param.type}`}
                                                        />
                                                    </Box>
                                                );
                                            })}
                                        </Stack>
                                    </Box>
                                )}
                            </>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEdit}>Отмена</Button>
                    <Button onClick={handleSaveEdit} variant="contained" color="primary">
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

// ---- ScenaryEditor - основной компонент ----
export const ScenaryEditor = ({
                                  scenaryObject,
                                  onUpdate,
                                  onAddListItem,
                                  onRemoveListItem,
                                  onUpdateListItem,
                                  blueprints,
                                  stages
                              }) => {
    if (!scenaryObject) return null;
    const obj = scenaryObject;

    const fieldDescriptions = {
        name: 'Название этапа сценария. Используется для идентификации этапа в списке и в переходах между этапами.',
        expression: 'Выводимое сообщение - текст, который будет отображаться пользователю при выполнении данного этапа сценария.'
    };

    return (
        <Card>
            <CardHeader title="Редактирование этапа сценария" />
            <CardContent>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                            label="Название"
                            value={obj.Name || ''}
                            onChange={(e) => onUpdate('Name', e.target.value)}
                            fullWidth
                            size="small"
                        />
                        <Tooltip
                            title={fieldDescriptions.name}
                            placement="top"
                            arrow
                            enterDelay={300}
                        >
                            <IconButton size="small" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                                <HelpIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                            label="Выводимое сообщение"
                            value={obj.Expression || ''}
                            onChange={(e) => onUpdate('Expression', e.target.value)}
                            fullWidth
                            size="small"
                        />
                        <Tooltip
                            title={fieldDescriptions.expression}
                            placement="top"
                            arrow
                            enterDelay={300}
                        >
                            <IconButton size="small" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                                <HelpIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Divider />

                    <MethodList
                        items={obj['Actions on Start'] || []}
                        onRemove={(idx) => onRemoveListItem('Actions on Start', idx)}
                        title="Действия при старте этапа"
                        listKey="Actions on Start"
                        onUpdateListItem={onUpdateListItem}
                        blueprints={blueprints}
                        stages={stages}
                    >
                        <MethodPicker
                            items={[]}
                            onAddItem={(item) => onAddListItem('Actions on Start', item)}
                            onRemoveItem={(idx) => onRemoveListItem('Actions on Start', idx)}
                            blueprints={blueprints}
                        />
                    </MethodList>

                    <MethodList
                        items={obj['Actions on End'] || []}
                        onRemove={(idx) => onRemoveListItem('Actions on End', idx)}
                        title="Действия при завершении этапа"
                        listKey="Actions on End"
                        onUpdateListItem={onUpdateListItem}
                        blueprints={blueprints}
                        stages={stages}
                    >
                        <MethodPicker
                            items={[]}
                            onAddItem={(item) => onAddListItem('Actions on End', item)}
                            onRemoveItem={(idx) => onRemoveListItem('Actions on End', idx)}
                            blueprints={blueprints}
                        />
                    </MethodList>

                    <MethodList
                        items={obj['Transition Tasks'] || []}
                        onRemove={(idx) => onRemoveListItem('Transition Tasks', idx)}
                        title="Переходы между этапами"
                        listKey="Transition Tasks"
                        onUpdateListItem={onUpdateListItem}
                        blueprints={blueprints}
                        stages={stages}
                    >
                        <TransitionPicker
                            items={[]}
                            onAddItem={(item) => onAddListItem('Transition Tasks', item)}
                            onRemoveItem={(idx) => onRemoveListItem('Transition Tasks', idx)}
                            blueprints={blueprints}
                            stages={stages}
                        />
                    </MethodList>
                </Stack>
            </CardContent>
        </Card>
    );
};