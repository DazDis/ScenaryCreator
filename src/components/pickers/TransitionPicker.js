import React, { useState } from 'react';
import {
    Box, Stack, Chip, TextField, Button, Autocomplete, Tooltip, IconButton
} from '@mui/material';
import { Add as AddIcon, Help as HelpIcon } from '@mui/icons-material';

export const TransitionPicker = ({ items, onAddItem, onRemoveItem, blueprints, stages }) => {
    const [selectedBlueprint, setSelectedBlueprint] = useState(null);
    const [selectedField, setSelectedField] = useState(null);
    const [selectedStage, setSelectedStage] = useState(null);

    const selectedBlueprintObj = blueprints.find(b => b.name === selectedBlueprint?.name);
    const fields = selectedBlueprintObj ? selectedBlueprintObj.fields : [];

    const handleAdd = () => {
        if (!selectedBlueprint || !selectedField || !selectedStage) {
            alert('Выберите сценарный объект, сообщение и целевой этап');
            return;
        }
        const transitionRef = `${selectedBlueprint.name}.${selectedField}.${selectedStage.Name || selectedStage}`;
        if (items.includes(transitionRef)) {
            alert('Такой переход уже добавлен');
            return;
        }
        onAddItem(transitionRef);
        setSelectedBlueprint(null);
        setSelectedField(null);
        setSelectedStage(null);
    };

    const formatTransition = (item) => {
        const parts = item.split('.');
        if (parts.length === 3) {
            return `${parts[0]} =>"${parts[1]}"; => '${parts[2]}'`;
        } else if (parts.length === 2) {
            return `${parts[0]}=>"${parts[1]}";`;
        } else {
            return item;
        }
    };

    const stageOptions = stages.map((stage, index) => ({
        Name: stage.Name || `Этап ${index + 1}`,
        index: index
    }));

    const fieldDescriptions = {
        blueprint: 'Сценарный объект - содержит набор полей (сообщений). Выберите объект, в котором определено нужное сообщение.',
        field: 'Сообщение - это поле сценарного объекта, которое используется для передачи данных между этапами.',
        stage: 'Целевой этап - этап сценария, на который будет выполнен переход после завершения текущего этапа.',
        addButton: 'Нажмите для добавления перехода на указанный этап. Переход будет выполнен после завершения текущего этапа.'
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Stack spacing={1}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {items.map((item, idx) => {
                        const displayText = formatTransition(item);
                        return (
                            <Chip
                                key={idx}
                                label={displayText}
                                onDelete={() => onRemoveItem(idx)}
                                size="small"
                                color="secondary"
                                variant="filled"
                            />
                        );
                    })}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 160 }}>
                        <Autocomplete
                            size="small"
                            options={blueprints}
                            getOptionLabel={(option) => option.name}
                            value={selectedBlueprint}
                            onChange={(event, newValue) => {
                                setSelectedBlueprint(newValue);
                                setSelectedField(null);
                            }}
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

                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 160 }}>
                        <Autocomplete
                            size="small"
                            options={fields}
                            value={selectedField}
                            onChange={(event, newValue) => setSelectedField(newValue)}
                            disabled={!selectedBlueprint}
                            sx={{ flex: 1 }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Сообщение"
                                    placeholder="Поиск сообщения..."
                                    size="small"
                                />
                            )}
                            noOptionsText="Нет доступных сообщений"
                        />
                        <Tooltip
                            title={fieldDescriptions.field}
                            placement="top"
                            arrow
                            enterDelay={300}
                        >
                            <IconButton size="small" sx={{ color: 'text.secondary', ml: 0.5 }}>
                                <HelpIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 160 }}>
                        <Autocomplete
                            size="small"
                            options={stageOptions}
                            getOptionLabel={(option) => option.Name}
                            value={selectedStage}
                            onChange={(event, newValue) => setSelectedStage(newValue)}
                            disabled={stages.length === 0}
                            sx={{ flex: 1 }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Целевой этап"
                                    placeholder="Поиск этапа..."
                                    size="small"
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option.Name === value?.Name}
                            noOptionsText="Нет доступных этапов"
                        />
                        <Tooltip
                            title={fieldDescriptions.stage}
                            placement="top"
                            arrow
                            enterDelay={300}
                        >
                            <IconButton size="small" sx={{ color: 'text.secondary', ml: 0.5 }}>
                                <HelpIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

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
            </Stack>
        </Box>
    );
};