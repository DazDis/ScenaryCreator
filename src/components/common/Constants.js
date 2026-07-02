export const STORAGE_KEY = 'scenary_blueprint_data';

export const PARAM_TYPES = {
    BOOLEAN: 'Boolean',
    INT: 'Int',
    STRING: 'String',
    FLOAT: 'Float',
};

export const PARAM_TYPE_LABELS = {
    [PARAM_TYPES.BOOLEAN]: 'Логический',
    [PARAM_TYPES.INT]: 'Целое число',
    [PARAM_TYPES.STRING]: 'Текст',
    [PARAM_TYPES.FLOAT]: 'Вещественное число',
};

export const PARAM_TYPE_ICONS = {
    [PARAM_TYPES.BOOLEAN]: '🔘',
    [PARAM_TYPES.INT]: '🔢',
    [PARAM_TYPES.STRING]: '📝',
    [PARAM_TYPES.FLOAT]: '📊',
};

export const createEmptyScenaryObject = (index) => ({
    Name: `Этап ${index + 1}`,
    Expression: '',
    'Actions on Start': [],
    'Actions on End': [],
    'Transition Tasks': [],
});

export const createEmptyBlueprint = () => ({
    name: 'Новый сценарный объект',
    methods: [],
    fields: [],
});

export const createParameter = (name, type = PARAM_TYPES.STRING) => ({
    name: name,
    type: type,
});