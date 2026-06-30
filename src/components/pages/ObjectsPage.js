import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { BlueprintList } from '../lists/BlueprintList';
import { BlueprintEditor } from '../editors/BlueprintEditor';

export const ObjectsPage = ({
                                blueprints,
                                selectedBlueprintIndex,
                                addBlueprint,
                                deleteBlueprint,
                                updateBlueprint,
                                addMethodToBlueprint,
                                removeMethodFromBlueprint,
                                updateMethodParameters,
                                updateMethodDescription,
                                addFieldToBlueprint,
                                removeFieldFromBlueprint,
                                selectBlueprint,
                            }) => {
    const renderRightPanel = () => {
        if (selectedBlueprintIndex !== null) {
            const bp = blueprints[selectedBlueprintIndex];
            return (
                <BlueprintEditor
                    blueprint={bp}
                    onUpdate={updateBlueprint}
                    onAddMethod={addMethodToBlueprint}
                    onRemoveMethod={removeMethodFromBlueprint}
                    onUpdateMethodDescription={updateMethodDescription}
                    onUpdateMethodParameters={updateMethodParameters}
                    onAddField={addFieldToBlueprint}
                    onRemoveField={removeFieldFromBlueprint}
                />
            );
        }
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">Выберите сценарный объект из списка</Typography>
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
                <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <BlueprintList
                        blueprints={blueprints}
                        selectedIndex={selectedBlueprintIndex}
                        onSelect={selectBlueprint}
                        onAdd={addBlueprint}
                        onDelete={deleteBlueprint}
                    />
                </Box>
            </Paper>

            <Box sx={{ flex: 1, height: '100%', overflow: 'hidden' }}>
                <Box sx={{ height: '100%', overflowY: 'auto', pr: 1 }}>
                    {renderRightPanel()}
                </Box>
            </Box>
        </Box>
    );
};