import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { ScenaryList } from '../lists/ScenaryList';
import { ScenaryEditor } from '../editors/ScenaryEditor';

export const MainPage = ({
                             scenaryObjects,
                             selectedIndex,
                             blueprints,
                             addScenaryObject,
                             deleteScenaryObject,
                             updateScenaryObject,
                             addListItem,
                             removeListItem,
                             updateListItem,
                             selectScenary,
                         }) => {
    const renderRightPanel = () => {
        if (selectedIndex !== null) {
            const obj = scenaryObjects[selectedIndex];
            return (
                <ScenaryEditor
                    scenaryObject={obj}
                    onUpdate={updateScenaryObject}
                    onAddListItem={addListItem}
                    onRemoveListItem={removeListItem}
                    onUpdateListItem={updateListItem}
                    blueprints={blueprints}
                    stages={scenaryObjects}
                />
            );
        }
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">Выберите этап из списка</Typography>
            </Box>
        );
    };

    return (
        <Box sx={{ display: 'flex', flex: 1, height: '100%', gap: 2, p: 2, overflow: 'hidden' }}>
            <Paper sx={{
                width: 320,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                height: '100%',
                overflow: 'hidden'
            }}>
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    <ScenaryList
                        scenaryObjects={scenaryObjects}
                        selectedIndex={selectedIndex}
                        onSelect={selectScenary}
                        onAdd={addScenaryObject}
                        onDelete={deleteScenaryObject}
                    />
                </Box>
            </Paper>

            <Box sx={{ flex: 1, height: '100%', overflowY: 'auto' }}>
                {renderRightPanel()}
            </Box>
        </Box>
    );
};