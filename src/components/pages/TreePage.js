import React, { useCallback, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre'; // <-- импорт dagre

// ---- Кастомный узел ----
const StageNode = ({ data, selected, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(data.label || '');

  useEffect(() => {
    setName(data.label || '');
  }, [data.label]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (name.trim() !== data.label) {
      data.onRename(id, name.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setName(data.label || '');
      setIsEditing(false);
    }
  };

  return (
    <Box
      sx={{
        padding: '10px 15px',
        borderRadius: '8px',
        background: selected ? '#1976d2' : '#fff',
        color: selected ? '#fff' : '#000',
        border: '2px solid',
        borderColor: selected ? '#1976d2' : '#ccc',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        minWidth: '100px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        },
        position: 'relative',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Left} style={{ background: '#1976d2', width: 10, height: 10 }} />
      {isEditing ? (
        <TextField
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          size="small"
          autoFocus
          variant="standard"
          sx={{ input: { color: selected ? '#fff' : '#000' } }}
        />
      ) : (
        <Typography variant="body1" fontWeight="bold" noWrap>
          {name || 'Без названия'}
        </Typography>
      )}
      <Handle type="source" position={Position.Right} style={{ background: '#1976d2', width: 10, height: 10 }} />
      <Tooltip title="Удалить этап">
        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            top: -10,
            right: -10,
            background: '#dc3545',
            color: '#fff',
            '&:hover': { background: '#b71c1c' },
            width: 24,
            height: 24,
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Удалить этап "${data.label || 'Без названия'}" и все связанные переходы?`)) {
              data.onDelete(id);
            }
          }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const nodeTypes = {
  stage: StageNode,
};

// ---- Функция расчёта layout с помощью dagre ----
const getLayoutedElements = (nodes, edges, direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, align: 'UL', ranksep: 50, nodesep: 30 });

  // Добавляем узлы (задаём размеры)
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 150, height: 60 });
  });

  // Добавляем рёбра
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Выполняем расчёт
  dagre.layout(dagreGraph);

  // Обновляем позиции узлов
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 150 / 2,
        y: nodeWithPosition.y - 60 / 2,
      },
    };
  });

  return layoutedNodes;
};

// ---- Главный компонент ----
export const TreePage = ({
  scenaryObjects,
  blueprints,
  addScenaryObject,
  deleteScenaryObject,
  updateScenaryObject,
  addListItem,
  removeListItem,
  updateTransitionTasks,
}) => {
  const [edgeDialogOpen, setEdgeDialogOpen] = useState(false);
  const [edgeSource, setEdgeSource] = useState(null);
  const [edgeTarget, setEdgeTarget] = useState(null);
  const [selectedBlueprint, setSelectedBlueprint] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // ---- Обновление графа с расчётом layout ----
  useEffect(() => {
    // Строим узлы без позиций
    const newNodes = scenaryObjects.map((obj, index) => ({
      id: `stage-${index}`,
      type: 'stage',
      data: {
        label: obj.Name || `Этап ${index + 1}`,
        onRename: (nodeId, newName) => {
          const idx = parseInt(nodeId.split('-')[1], 10);
          if (!isNaN(idx) && idx >= 0 && idx < scenaryObjects.length) {
            updateScenaryObject(idx, 'Name', newName);
          }
        },
        onDelete: (nodeId) => {
          const idx = parseInt(nodeId.split('-')[1], 10);
          if (!isNaN(idx) && idx >= 0 && idx < scenaryObjects.length) {
            const stageName = scenaryObjects[idx]?.Name;
            scenaryObjects.forEach((obj, i) => {
              if (i !== idx) {
                const tasks = obj['Transition Tasks'] || [];
                const filtered = tasks.filter(task => {
                  const parts = task.split('.');
                  return parts.length === 3 ? parts[2] !== stageName : true;
                });
                if (filtered.length !== tasks.length && updateTransitionTasks) {
                  updateTransitionTasks(i, filtered);
                }
              }
            });
            deleteScenaryObject(idx);
          }
        },
      },
    }));

    // Строим рёбра
    const newEdges = [];
    scenaryObjects.forEach((obj, sourceIndex) => {
      const tasks = obj['Transition Tasks'] || [];
      tasks.forEach(task => {
        const parts = task.split('.');
        if (parts.length === 3) {
          const targetStageName = parts[2];
          const targetIndex = scenaryObjects.findIndex(s => s.Name === targetStageName);
          if (targetIndex !== -1) {
            const sourceId = `stage-${sourceIndex}`;
            const targetId = `stage-${targetIndex}`;
            const exists = newEdges.some(e => e.source === sourceId && e.target === targetId);
            if (!exists) {
              newEdges.push({
                id: `edge-${sourceIndex}-${targetIndex}-${Date.now()}`,
                source: sourceId,
                target: targetId,
                label: `${parts[0]}.${parts[1]}`,
                markerEnd: { type: MarkerType.ArrowClosed },
                style: { stroke: '#1976d2', strokeWidth: 2 },
                data: { task },
              });
            }
          }
        }
      });
    });

    // Применяем layout
    const layoutedNodes = getLayoutedElements(newNodes, newEdges, 'LR');

    setNodes(layoutedNodes);
    setEdges(newEdges);
  }, [scenaryObjects, updateScenaryObject, deleteScenaryObject, updateTransitionTasks, setNodes, setEdges]);

  // ---- Обработчик соединения ----
  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);
      if (sourceNode && targetNode) {
        const sourceIndex = parseInt(sourceNode.id.split('-')[1], 10);
        const targetIndex = parseInt(targetNode.id.split('-')[1], 10);
        if (!isNaN(sourceIndex) && !isNaN(targetIndex) && sourceIndex < scenaryObjects.length && targetIndex < scenaryObjects.length) {
          const sourceStage = scenaryObjects[sourceIndex];
          const targetStageName = scenaryObjects[targetIndex]?.Name;
          const existing = sourceStage['Transition Tasks']?.some(task => {
            const parts = task.split('.');
            return parts.length === 3 && parts[2] === targetStageName;
          });
          if (existing) {
            setSnackbar({ open: true, message: 'Такой переход уже существует', severity: 'warning' });
            return;
          }
          setEdgeSource(sourceIndex);
          setEdgeTarget(targetIndex);
          setEdgeDialogOpen(true);
        }
      }
    },
    [nodes, scenaryObjects]
  );

  // ---- Добавление перехода ----
  const handleEdgeDialogAdd = () => {
    if (!selectedBlueprint || !selectedField) {
      setSnackbar({ open: true, message: 'Выберите сценарный объект и сообщение', severity: 'warning' });
      return;
    }
    if (edgeSource === null || edgeTarget === null) {
      setSnackbar({ open: true, message: 'Не выбран исходный или целевой этап', severity: 'error' });
      return;
    }
    const targetStageName = scenaryObjects[edgeTarget]?.Name;
    if (!targetStageName) {
      setSnackbar({ open: true, message: 'Целевой этап не найден', severity: 'error' });
      return;
    }
    const newTask = `${selectedBlueprint}.${selectedField}.${targetStageName}`;
    const currentTasks = scenaryObjects[edgeSource]['Transition Tasks'] || [];
    const newTasks = [...currentTasks, newTask];
    if (updateTransitionTasks) {
      updateTransitionTasks(edgeSource, newTasks);
    }
    setEdgeDialogOpen(false);
    setSelectedBlueprint('');
    setSelectedField('');
    setEdgeSource(null);
    setEdgeTarget(null);
    setSnackbar({ open: true, message: 'Переход добавлен', severity: 'success' });
  };

  // ---- Удаление перехода ----
  const onEdgeClick = useCallback(
    (event, edge) => {
      if (window.confirm('Удалить этот переход?')) {
        const sourceIndex = parseInt(edge.source.split('-')[1], 10);
        if (!isNaN(sourceIndex) && sourceIndex < scenaryObjects.length) {
          const taskToRemove = edge.data?.task;
          if (taskToRemove) {
            const tasks = scenaryObjects[sourceIndex]['Transition Tasks'] || [];
            const filtered = tasks.filter(task => task !== taskToRemove);
            if (filtered.length !== tasks.length && updateTransitionTasks) {
              updateTransitionTasks(sourceIndex, filtered);
              setSnackbar({ open: true, message: 'Переход удалён', severity: 'info' });
            }
          }
        }
      }
    },
    [scenaryObjects, updateTransitionTasks]
  );

  const handleAddStage = () => {
    addScenaryObject();
  };

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right">
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddStage}>
            Добавить этап
          </Button>
        </Panel>
      </ReactFlow>

      <Dialog open={edgeDialogOpen} onClose={() => setEdgeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создать переход</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2">
              Выберите сценарный объект и его сообщение для перехода на этап "{scenaryObjects[edgeTarget]?.Name || ''}"
            </Typography>
            <FormControl fullWidth>
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
            <FormControl fullWidth disabled={!selectedBlueprint}>
              <InputLabel>Сообщение</InputLabel>
              <Select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                label="Сообщение"
              >
                <MenuItem value="">Выберите сообщение</MenuItem>
                {blueprints
                  .find(b => b.name === selectedBlueprint)
                  ?.fields?.map((f) => (
                    <MenuItem key={f} value={f}>
                      {f}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEdgeDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleEdgeDialogAdd} variant="contained" color="primary">
            Добавить переход
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};