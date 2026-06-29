import React, { useState, useRef, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, Paper, List, ListItem,
  ListItemText, ListItemButton, TextField, IconButton, Chip, Stack,
  Divider, Alert, Snackbar, Card, CardContent, CardHeader, Dialog,
  DialogTitle, DialogContent, DialogActions, ThemeProvider, createTheme,
  CssBaseline, MenuItem, Select, FormControl, InputLabel, Tooltip
} from '@mui/material';
import {
  Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon,
  Upload as UploadIcon, Download as DownloadIcon, ClearAll as ClearAllIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// ---- Тема Material Design ----
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    background: { default: '#f5f5f5' },
  },
  typography: {
    fontFamily: '"Lato", "Roboto", "Helvetica", "Arial", sans-serif'
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' },
      },
    },
  },
});

// ---- Стилизованные компоненты ----
const StyledListContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const StyledList = styled(List)(({ theme }) => ({
  overflowY: 'auto',
  flex: 1,
  '& .MuiListItemButton-root': {
    borderRadius: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

// ---- Вспомогательные функции ----
const createEmptyScenaryObject = () => ({
  Name: '',
  Expression: '',
  'Actions on Start': [],
  'Actions on End': [],
  'Transition Tasks': [],
});

const createEmptyBlueprint = () => ({
  name: 'Новый сценарный объект',
  methods: [],
  fields: [],
});

// ---- Ключ для localStorage ----
const STORAGE_KEY = 'scenary_blueprint_data';

// ---- Компонент для добавления метода с параметрами (без изменений) ----
const MethodPicker = ({ items, onAddItem, onRemoveItem, blueprints }) => {
  const [selectedBlueprint, setSelectedBlueprint] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paramValues, setParamValues] = useState([]);

  const selectedBlueprintObj = blueprints.find(b => b.name === selectedBlueprint);
  const methods = selectedBlueprintObj ? selectedBlueprintObj.methods : [];
  const selectedMethodObj = methods.find(m => m.name === selectedMethod);
  const parameters = selectedMethodObj ? selectedMethodObj.parameters : [];

  const resetParamValues = (paramsCount) => {
    setParamValues(Array(paramsCount).fill(''));
  };

  const handleBlueprintChange = (bp) => {
    setSelectedBlueprint(bp);
    setSelectedMethod('');
    setParamValues([]);
  };

  const handleMethodChange = (methodName) => {
    setSelectedMethod(methodName);
    const method = methods.find(m => m.name === methodName);
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
    const methodObj = methods.find(m => m.name === selectedMethod);
    let methodCall = `${selectedBlueprint}.${selectedMethod}`;
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
    setSelectedBlueprint('');
    setSelectedMethod('');
    setParamValues([]);
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
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 150, flex: 1 }}>
            <InputLabel>Сценарный объект</InputLabel>
            <Select
              value={selectedBlueprint}
              onChange={(e) => handleBlueprintChange(e.target.value)}
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

          <FormControl size="small" sx={{ minWidth: 150, flex: 1 }} disabled={!selectedBlueprint}>
            <InputLabel>Метод</InputLabel>
            <Select
              value={selectedMethod}
              onChange={(e) => handleMethodChange(e.target.value)}
              label="Метод"
              renderValue={(value) => {
                const method = methods.find(m => m.name === value);
                return method ? method.name : value;
              }}
            >
              <MenuItem value="">Выберите метод</MenuItem>
              {methods.map((m) => (
                <MenuItem key={m.name} value={m.name}>
                  <Tooltip
                    title={m.description || 'Нет описания'}
                    placement="right"
                    arrow
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <Typography variant="body2">{m.name}</Typography>
                      {m.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          {m.description.length > 50 ? m.description.substring(0, 50) + '...' : m.description}
                        </Typography>
                      )}
                    </Box>
                  </Tooltip>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {parameters.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ flex: 1 }}>
              {parameters.map((param, idx) => (
                <TextField
                  key={idx}
                  size="small"
                  placeholder={param}
                  value={paramValues[idx] || ''}
                  onChange={(e) => handleParamChange(idx, e.target.value)}
                  sx={{ minWidth: 80, flex: 1 }}
                />
              ))}
            </Stack>
          )}
          <Button
            variant="contained"
            size="small"
            onClick={handleAdd}
            startIcon={<AddIcon />}
          >
            Добавить
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

// ---- НОВЫЙ КОМПОНЕНТ для переходов (заменяет FieldPicker) ----
const TransitionPicker = ({ items, onAddItem, onRemoveItem, blueprints, stages }) => {
  const [selectedBlueprint, setSelectedBlueprint] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [selectedStage, setSelectedStage] = useState('');

  const selectedBlueprintObj = blueprints.find(b => b.name === selectedBlueprint);
  const fields = selectedBlueprintObj ? selectedBlueprintObj.fields : [];

  const handleAdd = () => {
    if (!selectedBlueprint || !selectedField || !selectedStage) {
      alert('Выберите сценарный объект, сообщение и целевой этап');
      return;
    }
    const transitionRef = `${selectedBlueprint}.${selectedField}.${selectedStage}`;
    if (items.includes(transitionRef)) {
      alert('Такой переход уже добавлен');
      return;
    }
    onAddItem(transitionRef);
    setSelectedBlueprint('');
    setSelectedField('');
    setSelectedStage('');
  };

  // Функция для разбора строки перехода (для отображения)
  const parseTransition = (item) => {
    const parts = item.split('.');
    if (parts.length === 3) {
      return { blueprint: parts[0], field: parts[1], stage: parts[2] };
    } else {
      return { blueprint: item, field: '(неполный)', stage: '' };
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Stack spacing={1}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {items.map((item, idx) => {
            const parsed = parseTransition(item);
            const displayText = parsed.stage
              ? `${parsed.blueprint} → ${parsed.field} → ${parsed.stage}`
              : `${item} (неполный переход)`;
            return (
              <Chip
                key={idx}
                label={displayText}
                onDelete={() => onRemoveItem(idx)}
                size="small"
                color="secondary"
                variant="outlined"
              />
            );
          })}
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 150, flex: 1 }}>
            <InputLabel>Сценарный объект</InputLabel>
            <Select
              value={selectedBlueprint}
              onChange={(e) => {
                setSelectedBlueprint(e.target.value);
                setSelectedField('');
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

          <FormControl size="small" sx={{ minWidth: 150, flex: 1 }} disabled={!selectedBlueprint}>
            <InputLabel>Сообщение</InputLabel>
            <Select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              label="Сообщение"
            >
              <MenuItem value="">Выберите сообщение</MenuItem>
              {fields.map((f) => (
                <MenuItem key={f} value={f}>
                  {f}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150, flex: 1 }} disabled={stages.length === 0}>
            <InputLabel>Целевой этап</InputLabel>
            <Select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              label="Целевой этап"
            >
              <MenuItem value="">Выберите этап</MenuItem>
              {stages.map((stage, idx) => (
                <MenuItem key={idx} value={stage.Name || `Этап ${idx+1}`}>
                  {stage.Name || `Этап ${idx+1}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            size="small"
            onClick={handleAdd}
            startIcon={<AddIcon />}
          >
            Добавить переход
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

// ---- Главный компонент App ----
function App() {
  const [scenaryObjects, setScenaryObjects] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [blueprints, setBlueprints] = useState([]);
  const [selectedBlueprintIndex, setSelectedBlueprintIndex] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const fileInputRef = useRef(null);

  // ---- Загрузка из localStorage ----
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data && typeof data === 'object') {
          if (Array.isArray(data.scenaryObjects)) {
            setScenaryObjects(data.scenaryObjects);
          }
          if (Array.isArray(data.blueprints)) {
            setBlueprints(data.blueprints);
          }
        }
      } catch (err) {
        console.error('Ошибка загрузки из localStorage:', err);
      }
    }
  }, []);

  // ---- Автосохранение ----
  useEffect(() => {
    const timer = setTimeout(() => {
      const data = { scenaryObjects, blueprints };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        console.error('Ошибка автосохранения:', err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [scenaryObjects, blueprints]);

  // ---- Очистка всех данных ----
  const handleClearAll = () => {
    setScenaryObjects([]);
    setBlueprints([]);
    setSelectedIndex(null);
    setSelectedBlueprintIndex(null);
    localStorage.removeItem(STORAGE_KEY);
    setClearDialogOpen(false);
    setSnackbar({ open: true, message: 'Все данные очищены', severity: 'info' });
  };

  // ---- Импорт ----
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data)) {
          setScenaryObjects(data);
          setBlueprints([]);
          setSelectedIndex(null);
          setSelectedBlueprintIndex(null);
          setSnackbar({ open: true, message: 'Данные успешно импортированы (старый формат)', severity: 'success' });
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data.scenaryObjects)) setScenaryObjects(data.scenaryObjects);
          else setScenaryObjects([]);
          if (Array.isArray(data.blueprints)) setBlueprints(data.blueprints);
          else setBlueprints([]);
          setSelectedIndex(null);
          setSelectedBlueprintIndex(null);
          setSnackbar({ open: true, message: 'Данные успешно импортированы', severity: 'success' });
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

  // ---- Экспорт ----
  const handleExport = () => {
    const data = { scenaryObjects, blueprints };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stages_and_objects.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- Операции со сценарными объектами (этапами) ----
  const addScenaryObject = () => {
    const newObj = createEmptyScenaryObject();
    setScenaryObjects([...scenaryObjects, newObj]);
    setSelectedIndex(scenaryObjects.length);
    setSelectedBlueprintIndex(null);
  };

  const deleteScenaryObject = () => {
    if (selectedIndex === null) {
      setSnackbar({ open: true, message: 'Сначала выберите этап', severity: 'warning' });
      return;
    }
    const newList = [...scenaryObjects];
    newList.splice(selectedIndex, 1);
    setScenaryObjects(newList);
    if (newList.length === 0) setSelectedIndex(null);
    else if (selectedIndex >= newList.length) setSelectedIndex(newList.length - 1);
  };

  const updateScenaryObject = (field, value) => {
    if (selectedIndex === null) return;
    const updated = [...scenaryObjects];
    updated[selectedIndex] = { ...updated[selectedIndex], [field]: value };
    setScenaryObjects(updated);
  };

  const addListItem = (listKey, newItem) => {
    if (selectedIndex === null) return;
    const updated = [...scenaryObjects];
    const currentList = updated[selectedIndex][listKey] || [];
    updated[selectedIndex][listKey] = [...currentList, newItem];
    setScenaryObjects(updated);
  };

  const removeListItem = (listKey, itemIndex) => {
    if (selectedIndex === null) return;
    const updated = [...scenaryObjects];
    const currentList = updated[selectedIndex][listKey] || [];
    currentList.splice(itemIndex, 1);
    updated[selectedIndex][listKey] = currentList;
    setScenaryObjects(updated);
  };

  // ---- Операции с Blueprint (сценарными объектами) ----
  const addBlueprint = () => {
    const newBp = createEmptyBlueprint();
    const baseName = 'Новый сценарный объект';
    let name = baseName;
    let counter = 1;
    while (blueprints.some(b => b.name === name)) {
      name = `${baseName} ${counter++}`;
    }
    newBp.name = name;
    setBlueprints([...blueprints, newBp]);
    setSelectedBlueprintIndex(blueprints.length);
    setSelectedIndex(null);
  };

  const deleteBlueprint = () => {
    if (selectedBlueprintIndex === null) {
      setSnackbar({ open: true, message: 'Сначала выберите сценарный объект', severity: 'warning' });
      return;
    }
    const newList = [...blueprints];
    newList.splice(selectedBlueprintIndex, 1);
    setBlueprints(newList);
    if (newList.length === 0) setSelectedBlueprintIndex(null);
    else if (selectedBlueprintIndex >= newList.length) setSelectedBlueprintIndex(newList.length - 1);
  };

  const updateBlueprint = (field, value) => {
    if (selectedBlueprintIndex === null) return;
    const updated = [...blueprints];
    updated[selectedBlueprintIndex] = { ...updated[selectedBlueprintIndex], [field]: value };
    setBlueprints(updated);
  };

  const addMethodToBlueprint = (methodName, parameters, description) => {
    if (selectedBlueprintIndex === null) return;
    if (!methodName.trim()) {
      setSnackbar({ open: true, message: 'Имя метода не может быть пустым', severity: 'warning' });
      return;
    }
    const updated = [...blueprints];
    const bp = updated[selectedBlueprintIndex];
    if (bp.methods.some(m => m.name === methodName.trim())) {
      setSnackbar({ open: true, message: 'Метод с таким именем уже существует', severity: 'warning' });
      return;
    }
    bp.methods.push({
      name: methodName.trim(),
      parameters: parameters || [],
      description: description || ''
    });
    setBlueprints(updated);
  };

  const removeMethodFromBlueprint = (methodIndex) => {
    if (selectedBlueprintIndex === null) return;
    const updated = [...blueprints];
    updated[selectedBlueprintIndex].methods.splice(methodIndex, 1);
    setBlueprints(updated);
  };

  const updateMethodParameters = (methodIndex, newParams) => {
    if (selectedBlueprintIndex === null) return;
    const updated = [...blueprints];
    updated[selectedBlueprintIndex].methods[methodIndex].parameters = newParams;
    setBlueprints(updated);
  };

  const updateMethodDescription = (methodIndex, newDescription) => {
    if (selectedBlueprintIndex === null) return;
    const updated = [...blueprints];
    updated[selectedBlueprintIndex].methods[methodIndex].description = newDescription;
    setBlueprints(updated);
  };

  const addFieldToBlueprint = (fieldName) => {
    if (selectedBlueprintIndex === null) return;
    if (!fieldName.trim()) {
      setSnackbar({ open: true, message: 'Имя сообщения не может быть пустым', severity: 'warning' });
      return;
    }
    const updated = [...blueprints];
    const bp = updated[selectedBlueprintIndex];
    if (bp.fields.includes(fieldName.trim())) {
      setSnackbar({ open: true, message: 'Такое сообщение уже существует', severity: 'warning' });
      return;
    }
    bp.fields.push(fieldName.trim());
    setBlueprints(updated);
  };

  const removeFieldFromBlueprint = (fieldIndex) => {
    if (selectedBlueprintIndex === null) return;
    const updated = [...blueprints];
    updated[selectedBlueprintIndex].fields.splice(fieldIndex, 1);
    setBlueprints(updated);
  };

  // ---- Рендер списка этапов (левая панель) ----
  const renderScenaryList = () => (
    <StyledListContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Этапы сценария ({scenaryObjects.length})
        </Typography>
        <Box>
          <IconButton size="small" onClick={addScenaryObject} color="primary">
            <AddIcon />
          </IconButton>
          <IconButton size="small" onClick={deleteScenaryObject} color="error">
            <RemoveIcon />
          </IconButton>
        </Box>
      </Box>
      <StyledList dense>
        {scenaryObjects.map((obj, idx) => (
          <ListItemButton
            key={idx}
            selected={idx === selectedIndex}
            onClick={() => {
              setSelectedIndex(idx);
              setSelectedBlueprintIndex(null);
            }}
          >
            <ListItemText primary={obj.Name || `Этап ${idx + 1}`} />
          </ListItemButton>
        ))}
      </StyledList>
    </StyledListContainer>
  );

  // ---- Рендер списка сценарных объектов (бывшие Blueprint) ----
  const renderBlueprintList = () => (
    <StyledListContainer sx={{ borderTop: 1, borderColor: 'divider', pt: 1, mt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Сценарные объекты ({blueprints.length})
        </Typography>
        <Box>
          <IconButton size="small" onClick={addBlueprint} color="primary">
            <AddIcon />
          </IconButton>
          <IconButton size="small" onClick={deleteBlueprint} color="error">
            <RemoveIcon />
          </IconButton>
        </Box>
      </Box>
      <StyledList dense>
        {blueprints.map((bp, idx) => (
          <ListItemButton
            key={idx}
            selected={idx === selectedBlueprintIndex}
            onClick={() => {
              setSelectedBlueprintIndex(idx);
              setSelectedIndex(null);
            }}
          >
            <ListItemText primary={bp.name || `Объект ${idx + 1}`} />
          </ListItemButton>
        ))}
      </StyledList>
    </StyledListContainer>
  );

  // ---- Редактор этапа сценария ----
  const renderScenaryEditor = () => {
    if (selectedIndex === null || !scenaryObjects[selectedIndex]) return null;
    const obj = scenaryObjects[selectedIndex];
    return (
      <Card>
        <CardHeader title="Редактирование этапа сценария" />
        <CardContent>
          <Stack spacing={2}>
            <TextField
              label="Название"
              value={obj.Name || ''}
              onChange={(e) => updateScenaryObject('Name', e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Выражение"
              value={obj.Expression || ''}
              onChange={(e) => updateScenaryObject('Expression', e.target.value)}
              fullWidth
              size="small"
            />
            <Divider />
            <Typography variant="subtitle2">Действия при старте</Typography>
            <MethodPicker
              items={obj['Actions on Start'] || []}
              onAddItem={(item) => addListItem('Actions on Start', item)}
              onRemoveItem={(idx) => removeListItem('Actions on Start', idx)}
              blueprints={blueprints}
            />
            <Divider />
            <Typography variant="subtitle2">Действия при завершении</Typography>
            <MethodPicker
              items={obj['Actions on End'] || []}
              onAddItem={(item) => addListItem('Actions on End', item)}
              onRemoveItem={(idx) => removeListItem('Actions on End', idx)}
              blueprints={blueprints}
            />
            <Divider />
            <Typography variant="subtitle2">Переходы</Typography>
            <TransitionPicker
              items={obj['Transition Tasks'] || []}
              onAddItem={(item) => addListItem('Transition Tasks', item)}
              onRemoveItem={(idx) => removeListItem('Transition Tasks', idx)}
              blueprints={blueprints}
              stages={scenaryObjects}
            />
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // ---- Редактор сценарного объекта (бывший Blueprint) ----
  const renderBlueprintEditor = () => {
    if (selectedBlueprintIndex === null || !blueprints[selectedBlueprintIndex]) return null;
    const bp = blueprints[selectedBlueprintIndex];
    return (
      <Card>
        <CardHeader title="Редактирование сценарного объекта" />
        <CardContent>
          <Stack spacing={2}>
            <TextField
              label="Имя"
              value={bp.name || ''}
              onChange={(e) => updateBlueprint('name', e.target.value)}
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
                            onChange={(e) => updateMethodDescription(idx, e.target.value)}
                            fullWidth
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                        <IconButton size="small" onClick={() => removeMethodFromBlueprint(idx)} color="error">
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
                      <Stack direction="row" spacing={1}>
                        <TextField
                          size="small"
                          placeholder="Новый параметр"
                          id={`param-input-${idx}`}
                          fullWidth
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target;
                              const val = input.value.trim();
                              if (val) {
                                const newParams = [...method.parameters, val];
                                updateMethodParameters(idx, newParams);
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
                              updateMethodParameters(idx, newParams);
                              input.value = '';
                            }
                          }}
                        >
                          Добавить
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="Имя нового метода"
                  id="new-method-name"
                  fullWidth
                />
                <TextField
                  size="small"
                  placeholder="Описание метода"
                  id="new-method-description"
                  fullWidth
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    const nameInput = document.getElementById('new-method-name');
                    const descInput = document.getElementById('new-method-description');
                    const name = nameInput.value.trim();
                    const description = descInput.value.trim();
                    if (name) {
                      addMethodToBlueprint(name, [], description);
                      nameInput.value = '';
                      descInput.value = '';
                    }
                  }}
                >
                  Добавить
                </Button>
              </Stack>
            </Stack>

            <Divider />
            <Typography variant="subtitle2">Сообщения</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {bp.fields.map((field, idx) => (
                <Chip
                  key={idx}
                  label={field}
                  onDelete={() => removeFieldFromBlueprint(idx)}
                  color="secondary"
                />
              ))}
            </Box>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                placeholder="Новое сообщение"
                id="new-field-input"
                fullWidth
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target;
                    addFieldToBlueprint(input.value);
                    input.value = '';
                  }
                }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  const input = document.getElementById('new-field-input');
                  addFieldToBlueprint(input.value);
                  input.value = '';
                }}
              >
                Добавить
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // ---- Правая панель ----
  const renderRightPanel = () => {
    if (selectedIndex !== null) return renderScenaryEditor();
    if (selectedBlueprintIndex !== null) return renderBlueprintEditor();
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography color="text.secondary">Выберите элемент из списка</Typography>
      </Box>
    );
  };

  // ---- Основной рендер ----
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', fontSize: '160%' }}>
              Редактор сценариев
            </Typography>
            <Button color="inherit" startIcon={<UploadIcon />} onClick={() => fileInputRef.current.click()}>
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

        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', p: 2, gap: 2 }}>
          <Paper sx={{ width: 280, p: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {renderScenaryList()}
            {renderBlueprintList()}
          </Paper>
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {renderRightPanel()}
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
            <Button onClick={handleClearAll} color="error" variant="contained" startIcon={<ClearAllIcon />}>
              Очистить все
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default App;