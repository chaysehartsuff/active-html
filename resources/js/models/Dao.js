import Model from './Model.js';


export default class Dao {

    /**
     * Fetches a single model instance from the server.
     * @param {Model} model
     * @return {Model}
     */
    static get(model, callback, parameters = {}) {
        this.modelRequest('get', model, (response) => {
            callback(this.createInstanceFromResponse(model.constructor, response));
        }, parameters);
    }

    /**
     * Fetches all model instances from the server.
     * @param {Model} model
     * @return {Model[]}
     */
    static getAll(model, callback, parameters = {}) {
        this.modelRequest('getAll', model, (response) => {
            callback(this.createInstancesFromResponse(model.constructor, response));
        }, parameters);
    }

    /**
     * Creates a new model instance on the server.
     * @param {Model} model
     */
    static create(model, callback, parameters = {}){
        this.modelRequest('create', model, (response) => {
            callback(this.createInstanceFromResponse(model.constructor, response));
        }, parameters);
    }

    /**
     * Creates multiple new model instances on the server.
     * @param {Model[]} models
     */
    static createAll(models, callback, parameters = {}){
        this.modelRequest('createAll', models, (response) => {
            callback(this.createInstancesFromResponse(models[0].constructor, response));
        }, parameters);
    }

    /**
     * Updates an existing model instance on the server.
     * @param {Model} model
     */
    static update(model, callback, parameters = {}){
        this.modelRequest('update', model, (response) => {
            callback(this.createInstanceFromResponse(model.constructor, response));
        }, parameters);
    }

    /**
     * Updates multiple existing model instances on the server.
     * @param {Model[]} models
     *
     * */
    static updateAll(models, callback, parameters = {}){
        this.modelRequest('updateAll', models, (response) => {
            callback(this.createInstancesFromResponse(models[0].constructor, response));
        }, parameters);
    }

    /**
     * Deletes a model instance from the server.
     * @param {Model} model
     */
    static delete(model, callback, parameters = {}){
        this.modelRequest('delete', model, (response) => {
            callback(response);
        }, parameters);
    }

    /**
     * Deletes all instances of a model from the server.
     * @param {Model} model
     */
    static deleteAll(model, callback, parameters = {}){
        this.modelRequest('deleteAll', model, (response) => {
            callback(response);
        }, parameters);
    }


    /**
     * Prepares and sends a model-related request.
     * @param {string} action The action to perform (e.g., 'get', 'create').
     * @param {Model|Model[]} modelOrModels The model or models to act upon.
     * @param {function} callback The function to call with the response.
     * @param {object} [parameters={}] Additional query parameters to include in the request.
     * @param {object} [body={}] The request payload.
     */
    static modelRequest(action, modelOrModels, callback, parameters = {}, body = {}) {
        if (!modelOrModels) {
            throw new Error('A model or array of models must be provided.');
        }
        if (typeof action !== 'string') {
            throw new Error('Action must be a string.');
        }
        if (!callback || typeof callback !== 'function') {
            throw new Error('Callback must be a function.');
        }

        const isArray = Array.isArray(modelOrModels);
        const queryString = new URLSearchParams(Object.entries(parameters)).toString();
        const endpoint = queryString ? "/model/" + action + "?" + queryString : "/model/" + action;

        if (isArray) {
            body.models = modelOrModels.map(m => m.getBody());
        } else {
            body.model = modelOrModels.getBody();
        }

        return this.request(endpoint, body)
            .then((data) => {
                callback(data);
                return data;
            })
            .catch((error) => {
                console.error('DAO Request Error:', error);
                throw error;
            });
    }

    /**
     * Performs a generic fetch request to the server.
     * @param {string} endpoint The API endpoint to call.
     * @param {object} body The request payload.
     * @param {function} callback The function to call with the response data.
     * @param {string} [method='POST'] The HTTP method to use.
     */
    static async request(endpoint, body, callback, method = 'POST'){
        const tokenMeta = document.querySelector('meta[name="csrf-token"]');

        if (!tokenMeta || !tokenMeta.content) {
            throw new Error('CSRF token not found. Ensure a meta tag with name="csrf-token" is present in the document head.');
        }

        const headers = {
            'Accept': 'application/json',
            'X-CSRF-TOKEN': tokenMeta.content
        };

        const requestOptions = {
            method: method.toUpperCase(),
            headers: headers,
        };

        // If the body is FormData, let the browser set the Content-Type header.
        // Otherwise, set it to application/json and stringify the body.
        if (body instanceof FormData) {
            requestOptions.body = body;
        } else if (body && Object.keys(body).length > 0) {
            headers['Content-Type'] = 'application/json';
            requestOptions.body = JSON.stringify(body);
        }

        const response = await fetch(endpoint, requestOptions);
        if(callback && typeof callback === 'function'){
            response.json().catch(() => response.text())
            .then((data) => {
                callback(data);
                return data;
            })
            .catch((error) => {
                console.error('DAO Request Error:', error);
                throw error;
            });
        } else {
            return response.json().catch(() => response.text());
        }
    }

    /**
     * Fetches a single model instance from the server synchronously.
     * @param {Model} model
     * @returns {Promise<Model>}
     */
    static getSync(model, parameters = {}) {
        const response = this.modelRequestSync('get', model, parameters);
        const ModelClass = model.constructor;
        const newInstance = new ModelClass();
        if (response && response.hasOwnProperty('model')) {
            Object.assign(newInstance, response.model);
        }
        return newInstance;
    }

    /**
     * Creates a new model instance on the server synchronously.
     * @param {Model} model
     * @returns {Promise<Model>}
     */
    static createSync(model, parameters = {}) {
        const response = this.modelRequestSync('create', model, parameters);
        const ModelClass = model.constructor;
        const newInstance = new ModelClass();
        if (response && response.hasOwnProperty('model')) {
            Object.assign(newInstance, response.model);
        }
        return newInstance;
    }

    /**
     * Updates an existing model instance on the server synchronously.
     * @param {Model} model
     * @returns {Promise<Model>}
     */
    static updateSync(model, parameters = {}) {
        const response = this.modelRequestSync('update', model, parameters);
        const ModelClass = model.constructor;
        const newInstance = new ModelClass();
        if (response && response.hasOwnProperty('model')) {
            Object.assign(newInstance, response.model);
        }
        return newInstance;
    }

    /**
     * Deletes a model instance from the server synchronously.
     * @param {Model} model
     * @returns {Promise<string>}
     */
    static deleteSync(model, parameters = {}) {
        const response = this.modelRequestSync('delete', model, parameters);
        return response.message;
    }

    /**
     * Prepares and sends a model-related request synchronously.
     * @param {string} action The action to perform (e.g., 'get', 'create').
     * @param {Model|Model[]} modelOrModels The model or models to act upon.
     * @returns {Promise<any>}
     */
    static modelRequestSync(action, modelOrModels, parameters = {}) {
        if (!modelOrModels) {
            throw new Error('A model or array of models must be provided.');
        }
        if (typeof action !== 'string') {
            throw new Error('Action must be a string.');
        }

        const isArray = Array.isArray(modelOrModels);
        const queryString = new URLSearchParams(Object.entries(parameters)).toString();
        const endpoint = queryString ? "/model/" + action + "?" + queryString : "/model/" + action;
        let body = {};

        if (isArray) {
            body.models = modelOrModels.map(m => m.getBody());
        } else {
            body.model = modelOrModels.getBody();
        }

        return this.requestSync(endpoint, body);
    }
    /**
     * Performs a generic fetch request to the server synchronously.
     * @param {string} endpoint The API endpoint to call.
     * @param {object} body The request payload.
     * @param {string} [method='POST'] The HTTP method to use.
     * @returns {Promise<any>}
     */
    static requestSync(endpoint, body, method = 'POST') {
        const tokenMeta = document.querySelector('meta[name="csrf-token"]');

        if (!tokenMeta || !tokenMeta.content) {
            throw new Error('CSRF token not found. Ensure a meta tag with name="csrf-token" is present in the document head.');
        }

        const xhr = new XMLHttpRequest();
        xhr.open(method.toUpperCase(), endpoint, false);
        xhr.withCredentials = true;
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('X-CSRF-TOKEN', tokenMeta.content);

        let payload = null;
        if (body && Object.keys(body).length > 0) {
            payload = JSON.stringify(body);
        }

        xhr.send(payload);

        if (xhr.status === 0) {
            throw new Error('DAO Request Error: Unable to reach endpoint.');
        }

        const responseText = xhr.responseText || '';
        try {
            return JSON.parse(responseText);
        } catch (_error) {
            return responseText;
        }
    }

    static createInstanceFromResponse(ModelClass, response) {
        const newInstance = new ModelClass();
        if (response && response.hasOwnProperty('model')) {
            Object.assign(newInstance, response.model);
        }
        return newInstance;
    }
    static createInstancesFromResponse(ModelClass, response) {
        let newInstances = [];
        if (response && response.hasOwnProperty('models')) {
            newInstances = response.models.map(data => {
                const instance = new ModelClass();
                Object.assign(instance, data);
                return instance;
            });
        }
        return newInstances;
    }
}