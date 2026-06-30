export const STORAGE_KEY = 'scenary_blueprint_data';

export const createEmptyScenaryObject = () => ({
    Name: '',
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