import React from 'react';
import {
    Card, CardHeader, CardContent, Stack, TextField, Divider, Typography
} from '@mui/material';
import { MethodPicker } from '../pickers/MethodPicker';
import { TransitionPicker } from '../pickers/TransitionPicker';

export const ScenaryEditor = ({
                                  scenaryObject,
                                  onUpdate,
                                  onAddListItem,
                                  onRemoveListItem,
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
                    <Typography variant="subtitle2">Действия при старте этапа</Typography>
                    <MethodPicker
                        items={obj['Actions on Start'] || []}
                        onAddItem={(item) => onAddListItem('Actions on Start', item)}
                        onRemoveItem={(idx) => onRemoveListItem('Actions on Start', idx)}
                        blueprints={blueprints}
                    />
                    <Divider />
                    <Typography variant="subtitle2">Действия при завершении этапа</Typography>
                    <MethodPicker
                        items={obj['Actions on End'] || []}
                        onAddItem={(item) => onAddListItem('Actions on End', item)}
                        onRemoveItem={(idx) => onRemoveListItem('Actions on End', idx)}
                        blueprints={blueprints}
                    />
                    <Divider />
                    <Typography variant="subtitle2">Переходы между этапами</Typography>
                    <TransitionPicker
                        items={obj['Transition Tasks'] || []}
                        onAddItem={(item) => onAddListItem('Transition Tasks', item)}
                        onRemoveItem={(idx) => onRemoveListItem('Transition Tasks', idx)}
                        blueprints={blueprints}
                        stages={stages}
                    />
                </Stack>
            </CardContent>
        </Card>
    );
};