import React, { useState } from 'react';
import {
    Card, CardHeader, CardContent, Stack, TextField, Divider, Typography,
    Box, Paper, IconButton, Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Collapse
} from '@mui/material';
import {
    Edit as EditIcon,
    Close as CloseIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { MethodPicker } from '../pickers/MethodPicker';
import { TransitionPicker } from '../pickers/TransitionPicker';

// Компонент для списка методов с заголовком и сворачиванием
const MethodList = ({ items, onRemove, title, children, listKey, onUpdateListItem }) => {
    const [editIndex, setEditIndex] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    const handleEdit = (index) => {
        setEditIndex(index);
        setEditValue(items[index]);
        setEditDialogOpen(true);
    };

    const handleSaveEdit = () => {
        if (editIndex !== null && editValue.trim()) {
            onUpdateListItem(listKey, editIndex, editValue.trim());
            setEditDialogOpen(false);
            setEditIndex(null);
            setEditValue('');
        }
    };

    return (
        <Paper
            variant="outlined"
            sx={{
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider'
            }}
        >
            {/* Заголовок блока с кнопкой сворачивания */}
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
                    {/* Форма добавления - в одну строку сверху */}
                    <Box sx={{ mb: 2 }}>
                        {children}
                    </Box>

                    {/* Список методов с прокруткой */}
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
                                items.map((item, idx) => (
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
                                            {item}
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
                                ))
                            )}
                        </Box>
                    </Paper>
                </Box>
            </Collapse>

            {/* Диалог редактирования */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Редактирование элемента</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Значение"
                        fullWidth
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        multiline
                        rows={2}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
                    <Button onClick={handleSaveEdit} variant="contained" color="primary">
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

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

    return (
        <Card>
            <CardHeader title="Редактирование этапа сценария" />
            <CardContent>
                <Stack spacing={2}>
                    <TextField
                        label="Название"
                        value={obj.Name || ''}
                        onChange={(e) => onUpdate('Name', e.target.value)}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label="Выводимое сообщение"
                        value={obj.Expression || ''}
                        onChange={(e) => onUpdate('Expression', e.target.value)}
                        fullWidth
                        size="small"
                    />

                    <Divider />

                    <MethodList
                        items={obj['Actions on Start'] || []}
                        onRemove={(idx) => onRemoveListItem('Actions on Start', idx)}
                        title="Действия при старте этапа"
                        listKey="Actions on Start"
                        onUpdateListItem={onUpdateListItem}
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