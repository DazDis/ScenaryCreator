import React, { useState } from 'react';
import {
    Box, Stack, Chip, TextField, Button, Typography, Tooltip,
    Autocomplete, IconButton
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon, Help as HelpIcon } from '@mui/icons-material';

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

    const fieldDescriptions = {
        blueprint: 'Сценарный объект - это контейнер, содержащий набор методов. Выберите объект, к которому относится вызываемый метод.',
        method: 'Метод - это функция, выполняющая определенное действие в рамках выбранного сценарного объекта.',
        parameters: 'Параметры - это значения, передаваемые в метод. Заполните их в соответствии с ожидаемыми типами данных метода.',
        addButton: 'Нажмите для добавления метода в список действий этапа. Метод будет выполняться при достижении данного этапа.'
    };

    const paramDescriptions = {
        'userId': 'Идентификатор пользователя в системе. Используется для персонализации и поиска данных конкретного пользователя.',
        'eventName': 'Название события для аналитики. Используется для отслеживания действий пользователя.',
        'eventType': 'Тип события: клик, просмотр, отправка формы и т.д. Определяет категорию аналитического события.',
        'properties': 'Объект с дополнительными свойствами события. Содержит метаданные о событии.',
        'data': 'Данные для обработки. Может содержать любую структуру в зависимости от метода.',
        'requestId': 'Уникальный идентификатор запроса. Используется для отслеживания и логирования.',
        'status': 'Статус операции: success, error, pending. Определяет результат выполнения.',
        'message': 'Текстовое сообщение. Используется для уведомлений и логирования.',
        'payload': 'Данные для отправки. Содержит основную информацию для передачи.',
        'deviceToken': 'Токен устройства для push-уведомлений. Идентифицирует устройство получателя.',
        'notificationId': 'Идентификатор уведомления. Используется для отслеживания статуса доставки.',
        'recipientId': 'Идентификатор получателя. Определяет кому адресовано уведомление или сообщение.',
        'content': 'Содержимое уведомления или сообщения. Основной текст для отображения.',
        'reportId': 'Идентификатор отчета. Используется для сохранения и получения отчетов.',
        'widgets': 'Данные для обновления виджетов. Содержит информацию для отображения на дашборде.',
        'limit': 'Лимит количества записей. Ограничивает объем возвращаемых данных.',
        'offset': 'Смещение для пагинации. Определяет с какой записи начинать выборку.',
        'filter': 'Фильтр для данных. Используется для уточнения выборки.',
        'sort': 'Параметры сортировки. Определяет порядок возвращаемых данных.',
        'userIdData': 'Данные пользователя. Содержит информацию о пользователе для кэширования.',
        'key': 'Ключ для кэша. Уникальный идентификатор для хранения данных.',
        'value': 'Значение для кэша. Данные для сохранения в кэше.',
        'ttl': 'Время жизни кэша в секундах. Определяет срок актуальности данных.',
        'config': 'Конфигурация. Содержит настройки для выполнения операции.',
        'options': 'Дополнительные опции. Расширяет функциональность метода.'
    };

    // Функция для получения описания параметра
    const getParamDescription = (paramName) => {
        return paramDescriptions[paramName] || `Параметр "${paramName}" - значение, передаваемое в метод.`;
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Stack spacing={1}>
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

                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                }}>
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        alignItems: 'center'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 180 }}>
                            <Autocomplete
                                size="small"
                                options={blueprints}
                                getOptionLabel={(option) => option.name}
                                value={selectedBlueprint}
                                onChange={(event, newValue) => handleBlueprintChange(newValue)}
                                sx={{ flex: 1 }}
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
                            <Tooltip
                                title={fieldDescriptions.blueprint}
                                placement="top"
                                arrow
                                enterDelay={300}
                            >
                                <IconButton size="small" sx={{ color: 'text.secondary', ml: 0.5 }}>
                                    <HelpIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 180 }}>
                            <Autocomplete
                                size="small"
                                options={methods}
                                getOptionLabel={(option) => option.name}
                                value={selectedMethod}
                                onChange={(event, newValue) => handleMethodChange(newValue)}
                                disabled={!selectedBlueprint}
                                sx={{ flex: 1 }}
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
                            <Tooltip
                                title={fieldDescriptions.method}
                                placement="top"
                                arrow
                                enterDelay={300}
                            >
                                <IconButton size="small" sx={{ color: 'text.secondary', ml: 0.5 }}>
                                    <HelpIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        alignItems: 'center'
                    }}>
                        {parameters.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                                {parameters.map((param, idx) => (
                                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <TextField
                                            size="small"
                                            placeholder={param}
                                            value={paramValues[idx] || ''}
                                            onChange={(e) => handleParamChange(idx, e.target.value)}
                                            sx={{ width: 120 }}
                                        />

                                    </Box>
                                ))}
                                <Tooltip
                                    title={fieldDescriptions.parameters}
                                    placement="top"
                                    arrow
                                    enterDelay={300}
                                >
                                    <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                        <HelpIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        )}

                        <Tooltip
                            title={fieldDescriptions.addButton}
                            placement="top"
                            arrow
                            enterDelay={300}
                        >
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleAdd}
                                startIcon={<AddIcon />}
                                sx={{ flexShrink: 0 }}
                            >
                                Добавить
                            </Button>
                        </Tooltip>
                    </Box>
                </Box>
            </Stack>
        </Box>
    );
};