import React, { useRef, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box,
  Snackbar, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, ThemeProvider, CssBaseline
} from '@mui/material';
import {
  Upload as UploadIcon, Download as DownloadIcon,
  ClearAll as ClearAllIcon
} from '@mui/icons-material';

import { theme } from './components/common/Theme';
import { SideMenu } from './components/menu/SideMenu';
import { MainPage } from './components/pages/MainPage';
import { ObjectsPage } from './components/pages/ObjectsPage';
import { TreePage } from './components/pages/TreePage';
import { useScenaryData } from './hooks/useScenaryData';

function App() {
  const {
    scenaryObjects,
    selectedIndex,
    blueprints,
    selectedBlueprintIndex,
    setScenaryObjects,
    setBlueprints,
    setSelectedIndex,
    setSelectedBlueprintIndex,
    addScenaryObject,
    deleteScenaryObject,
    updateScenaryObject,
    addListItem,
    removeListItem,
    selectScenary,
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
    clearAllData
  } = useScenaryData();

  const [currentPage, setCurrentPage] = useState('main');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const fileInputRef = useRef(null);

  const updateTransitionTasks = (index, newTasks) => {
  if (index < 0 || index >= scenaryObjects.length) return;
  const updated = [...scenaryObjects];
  updated[index] = { ...updated[index], 'Transition Tasks': newTasks };
  setScenaryObjects(updated);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);

        if (data && typeof data === 'object' && 'scenaryObjects' in data && 'blueprints' in data) {
          if (Array.isArray(data.scenaryObjects)) {
            setScenaryObjects(data.scenaryObjects);
          }
          if (Array.isArray(data.blueprints)) {
            setBlueprints(data.blueprints);
          }
          setSelectedIndex(null);
          setSelectedBlueprintIndex(null);
          setSnackbar({
            open: true,
            message: `Импортировано: ${data.scenaryObjects?.length || 0} этапов и ${data.blueprints?.length || 0} объектов`,
            severity: 'success'
          });
        }
        else if (Array.isArray(data)) {
          setScenaryObjects(data);
          setBlueprints([]);
          setSelectedIndex(null);
          setSelectedBlueprintIndex(null);
          setSnackbar({
            open: true,
            message: `Импортировано ${data.length} этапов (старый формат)`,
            severity: 'success'
          });
        } else {
          setSnackbar({ open: true, message: 'Некорректный формат файла', severity: 'error' });
        }
      } catch (err) {
        setSnackbar({ open: true, message: 'Ошибка парсинга JSON: ' + err.message, severity: 'error' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExport = () => {
    const data = { scenaryObjects, blueprints };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stages_and_objects.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSnackbar({ open: true, message: 'Данные успешно экспортированы', severity: 'success' });
  };

  const handleClearAll = () => {
    clearAllData();
    setClearDialogOpen(false);
    setSnackbar({ open: true, message: 'Все данные очищены', severity: 'info' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'main':
        return (
            <MainPage
                scenaryObjects={scenaryObjects}
                selectedIndex={selectedIndex}
                blueprints={blueprints}
                addScenaryObject={addScenaryObject}
                deleteScenaryObject={deleteScenaryObject}
                updateScenaryObject={updateScenaryObject}
                addListItem={addListItem}
                removeListItem={removeListItem}
                selectScenary={selectScenary}
            />
        );
      case 'objects':
        return (
            <ObjectsPage
                blueprints={blueprints}
                selectedBlueprintIndex={selectedBlueprintIndex}
                addBlueprint={addBlueprint}
                deleteBlueprint={deleteBlueprint}
                updateBlueprint={updateBlueprint}
                addMethodToBlueprint={addMethodToBlueprint}
                removeMethodFromBlueprint={removeMethodFromBlueprint}
                updateMethodParameters={updateMethodParameters}
                updateMethodDescription={updateMethodDescription}
                addFieldToBlueprint={addFieldToBlueprint}
                removeFieldFromBlueprint={removeFieldFromBlueprint}
                selectBlueprint={selectBlueprint}
            />
        );
        case 'tree':
        return (
          <TreePage
            scenaryObjects={scenaryObjects}
            blueprints={blueprints}
            addScenaryObject={addScenaryObject}
            deleteScenaryObject={deleteScenaryObject}
            updateScenaryObject={updateScenaryObject}
            addListItem={addListItem}
            removeListItem={removeListItem}
            updateTransitionTasks={updateTransitionTasks} 
          />
        );
      default:
        return (
            <MainPage
                scenaryObjects={scenaryObjects}
                selectedIndex={selectedIndex}
                blueprints={blueprints}
                addScenaryObject={addScenaryObject}
                deleteScenaryObject={deleteScenaryObject}
                updateScenaryObject={updateScenaryObject}
                addListItem={addListItem}
                removeListItem={removeListItem}
                selectScenary={selectScenary}
            />
        );
    }
  };

  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <AppBar position="static" sx={{ backgroundColor: '#003366' }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                Редактор сценариев
              </Typography>
              <Button color="inherit" startIcon={<UploadIcon />} onClick={() => fileInputRef.current?.click()}>
                Импорт
              </Button>
              <input
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleImport}
                  style={{ display: 'none' }}
              />
              <Button color="inherit" startIcon={<DownloadIcon />} onClick={handleExport}>
                Экспорт
              </Button>
              <Button color="inherit" startIcon={<ClearAllIcon />} onClick={() => setClearDialogOpen(true)}>
                Очистить все
              </Button>
            </Toolbar>
          </AppBar>

          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <Box sx={{ width: 240, flexShrink: 0 }}>
              <SideMenu currentPage={currentPage} onPageChange={setCurrentPage} />
            </Box>

            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              {renderPage()}
            </Box>
          </Box>

          <Snackbar
              open={snackbar.open}
              autoHideDuration={3000}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
              {snackbar.message}
            </Alert>
          </Snackbar>

          <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
            <DialogTitle>Очистить все данные?</DialogTitle>
            <DialogContent>
              <Typography>
                Это действие удалит все этапы сценария и сценарные объекты из localStorage.
                Восстановить данные будет невозможно.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setClearDialogOpen(false)}>Отмена</Button>
              <Button
                  onClick={handleClearAll}
                  color="error"
                  variant="contained"
                  startIcon={<ClearAllIcon />}
              >
                Очистить все
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </ThemeProvider>
  );
}

export default App;