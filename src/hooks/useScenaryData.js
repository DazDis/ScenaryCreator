import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEY, createEmptyScenaryObject, createEmptyBlueprint } from '../components/common/Constants';

export const useScenaryData = () => {
    const [scenaryObjects, setScenaryObjects] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [blueprints, setBlueprints] = useState([]);
    const [selectedBlueprintIndex, setSelectedBlueprintIndex] = useState(null);

    // Загрузка из localStorage
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

    // Автосохранение
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

    // ---- Операции со сценарными объектами (этапами) ----
    const addScenaryObject = useCallback(() => {
        const newObj = createEmptyScenaryObject();
        setScenaryObjects(prev => [...prev, newObj]);
        setSelectedIndex(scenaryObjects.length);
        setSelectedBlueprintIndex(null);
    }, [scenaryObjects.length]);

    const deleteScenaryObject = useCallback(() => {
        if (selectedIndex === null) return;

        setScenaryObjects(prev => {
            const newList = [...prev];
            newList.splice(selectedIndex, 1);
            return newList;
        });

        setSelectedIndex(prev => {
            const newLength = scenaryObjects.length - 1;
            if (newLength === 0) return null;
            if (prev >= newLength) return newLength - 1;
            return prev;
        });
    }, [selectedIndex, scenaryObjects.length]);

    const updateScenaryObject = useCallback((field, value) => {
        if (selectedIndex === null) return;
        setScenaryObjects(prev => {
            const updated = [...prev];
            updated[selectedIndex] = { ...updated[selectedIndex], [field]: value };
            return updated;
        });
    }, [selectedIndex]);

    const addListItem = useCallback((listKey, newItem) => {
        if (selectedIndex === null) return;
        setScenaryObjects(prev => {
            const updated = [...prev];
            const currentList = updated[selectedIndex][listKey] || [];
            updated[selectedIndex][listKey] = [...currentList, newItem];
            return updated;
        });
    }, [selectedIndex]);

    const removeListItem = useCallback((listKey, itemIndex) => {
        if (selectedIndex === null) return;
        setScenaryObjects(prev => {
            const updated = [...prev];
            const currentList = updated[selectedIndex][listKey] || [];
            currentList.splice(itemIndex, 1);
            updated[selectedIndex][listKey] = currentList;
            return updated;
        });
    }, [selectedIndex]);

    // ---- Операции с Blueprint (сценарными объектами) ----
    const addBlueprint = useCallback(() => {
        const newBp = createEmptyBlueprint();
        const baseName = 'Новый сценарный объект';
        let name = baseName;
        let counter = 1;
        while (blueprints.some(b => b.name === name)) {
            name = `${baseName} ${counter++}`;
        }
        newBp.name = name;
        setBlueprints(prev => [...prev, newBp]);
        setSelectedBlueprintIndex(blueprints.length);
        setSelectedIndex(null);
    }, [blueprints]);

    const deleteBlueprint = useCallback(() => {
        if (selectedBlueprintIndex === null) return;

        setBlueprints(prev => {
            const newList = [...prev];
            newList.splice(selectedBlueprintIndex, 1);
            return newList;
        });

        setSelectedBlueprintIndex(prev => {
            const newLength = blueprints.length - 1;
            if (newLength === 0) return null;
            if (prev >= newLength) return newLength - 1;
            return prev;
        });
    }, [selectedBlueprintIndex, blueprints.length]);

    const updateBlueprint = useCallback((field, value) => {
        if (selectedBlueprintIndex === null) return;
        setBlueprints(prev => {
            const updated = [...prev];
            updated[selectedBlueprintIndex] = { ...updated[selectedBlueprintIndex], [field]: value };
            return updated;
        });
    }, [selectedBlueprintIndex]);

    const addMethodToBlueprint = useCallback((methodName, description = '') => {
        if (selectedBlueprintIndex === null) {
            return { success: false, error: 'Не выбран сценарный объект' };
        }

        const trimmedName = methodName.trim();
        if (!trimmedName) {
            return { success: false, error: 'Имя метода не может быть пустым' };
        }

        const currentBlueprint = blueprints[selectedBlueprintIndex];
        const existingMethod = currentBlueprint?.methods.find(m => m.name === trimmedName);

        if (existingMethod) {
            return { success: false, error: `Метод "${trimmedName}" уже существует в объекте "${currentBlueprint.name}"` };
        }

        const newMethod = {
            name: trimmedName,
            parameters: [],
            description: description.trim() || ''
        };

        setBlueprints(prev => {
            const bp = prev[selectedBlueprintIndex];
            const alreadyExists = bp.methods.some(m => m.name === trimmedName);

            if (alreadyExists) return prev;

            const updated = [...prev];
            updated[selectedBlueprintIndex] = {
                ...bp,
                methods: [...bp.methods, newMethod]
            };
            return updated;
        });

        return { success: true };
    }, [selectedBlueprintIndex, blueprints]);

    const removeMethodFromBlueprint = useCallback((methodIndex) => {
        if (selectedBlueprintIndex === null) return;
        setBlueprints(prev => {
            const updated = [...prev];
            updated[selectedBlueprintIndex].methods.splice(methodIndex, 1);
            return updated;
        });
    }, [selectedBlueprintIndex]);

    const updateMethodParameters = useCallback((methodIndex, newParams) => {
        if (selectedBlueprintIndex === null) return;
        setBlueprints(prev => {
            const updated = [...prev];
            updated[selectedBlueprintIndex].methods[methodIndex].parameters = newParams;
            return updated;
        });
    }, [selectedBlueprintIndex]);

    const updateMethodDescription = useCallback((methodIndex, newDescription) => {
        if (selectedBlueprintIndex === null) return;
        setBlueprints(prev => {
            const updated = [...prev];
            updated[selectedBlueprintIndex].methods[methodIndex].description = newDescription;
            return updated;
        });
    }, [selectedBlueprintIndex]);

    const addFieldToBlueprint = useCallback((fieldName) => {
        if (selectedBlueprintIndex === null) return;
        if (!fieldName.trim()) {
            throw new Error('Имя сообщения не может быть пустым');
        }
        setBlueprints(prev => {
            const updated = [...prev];
            const bp = updated[selectedBlueprintIndex];
            if (bp.fields.includes(fieldName.trim())) {
                throw new Error('Такое сообщение уже существует');
            }
            bp.fields.push(fieldName.trim());
            return updated;
        });
    }, [selectedBlueprintIndex]);

    const removeFieldFromBlueprint = useCallback((fieldIndex) => {
        if (selectedBlueprintIndex === null) return;
        setBlueprints(prev => {
            const updated = [...prev];
            updated[selectedBlueprintIndex].fields.splice(fieldIndex, 1);
            return updated;
        });
    }, [selectedBlueprintIndex]);

    // ---- Выбор элементов ----
    const selectScenary = useCallback((index) => {
        setSelectedIndex(index);
        setSelectedBlueprintIndex(null);
    }, []);

    const selectBlueprint = useCallback((index) => {
        setSelectedBlueprintIndex(index);
        setSelectedIndex(null);
    }, []);

    // ---- Очистка всех данных ----
    const clearAllData = useCallback(() => {
        setScenaryObjects([]);
        setBlueprints([]);
        setSelectedIndex(null);
        setSelectedBlueprintIndex(null);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return {
        // Состояния
        scenaryObjects,
        setScenaryObjects,
        selectedIndex,
        setSelectedIndex,
        blueprints,
        setBlueprints,
        selectedBlueprintIndex,
        setSelectedBlueprintIndex,

        // Операции с этапами
        addScenaryObject,
        deleteScenaryObject,
        updateScenaryObject,
        addListItem,
        removeListItem,
        selectScenary,

        // Операции с blueprint
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

        // Общие
        clearAllData
    };
};