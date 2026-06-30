import React, { useState } from 'react';
import {
    Box, Stack, Chip, TextField, Button, Autocomplete
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

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

    // Функция для красивого отображения перехода - ваш формат
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

    // Создаем массив с названиями этапов для Autocomplete
    const stageOptions = stages.map((stage, index) => ({
        Name: stage.Name || `Этап ${index + 1}`,
        index: index
    }));

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
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {/* Autocomplete для сценарных объектов */}
                    <Autocomplete
                        size="small"
                        options={blueprints}
                        getOptionLabel={(option) => option.name}
                        value={selectedBlueprint}
                        onChange={(event, newValue) => {
                            setSelectedBlueprint(newValue);
                            setSelectedField(null);
                        }}
                        sx={{ minWidth: 160, flex: 1 }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Сценарный объект"
                                placeholder="Поиск объекта..."
                            />
                        )}
                        isOptionEqualToValue={(option, value) => option.name === value?.name}
                        noOptionsText="Ничего не найдено"
                    />

                    {/* Autocomplete для сообщений */}
                    <Autocomplete
                        size="small"
                        options={fields}
                        value={selectedField}
                        onChange={(event, newValue) => setSelectedField(newValue)}
                        disabled={!selectedBlueprint}
                        sx={{ minWidth: 160, flex: 1 }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Сообщение"
                                placeholder="Поиск сообщения..."
                            />
                        )}
                        noOptionsText="Нет доступных сообщений"
                    />

                    {/* Autocomplete для этапов */}
                    <Autocomplete
                        size="small"
                        options={stageOptions}
                        getOptionLabel={(option) => option.Name}
                        value={selectedStage}
                        onChange={(event, newValue) => setSelectedStage(newValue)}
                        disabled={stages.length === 0}
                        sx={{ minWidth: 160, flex: 1 }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Целевой этап"
                                placeholder="Поиск этапа..."
                            />
                        )}
                        isOptionEqualToValue={(option, value) => option.Name === value?.Name}
                        noOptionsText="Нет доступных этапов"
                    />

                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleAdd}
                        startIcon={<AddIcon />}
                    >
                        Добавить переход
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
};