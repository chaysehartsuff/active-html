import Dao from './Dao.js';

/**
 * The base Model class for interacting with our active models
 */
export default class Model {
    errors;
    /**
     * Gathers all instance properties and adds the class name to create a body object for requests.
     * @returns {object}
     */
    getBody() {
        const body = {
            active_class: this.constructor.name
        };

        // Iterate over own properties of the instance
        for (const key of Object.keys(this)) {
            // Exclude functions and private properties (by convention, starting with _)
            if (typeof this[key] !== 'function' && !key.startsWith('_')) {
                body[key] = this[key];
            }
        }

        return body;
    }

    extractModelFromResponse(response) {
        if (response.hasOwnProperty('model')) {
            Object.assign(this, response.model);
        }
    }

    /**
     * Fetches the model's data from the server.
     * @returns {Promise<Model>}
     */
    get(parameters = {}, callback = null) {
        const response = Dao.modelRequestSync('get', this, parameters);
        this.extractModelFromResponse(response);
        if (callback) {
            callback(response);
        }
        return this;
    }
    /**
     * Fetches the model's data from the server synchronously.
     * @param {object} parameters 
     * @returns string
     */
    getSync(parameters = {}) {
        const response = Dao.modelRequestSync('get', this, parameters);
        this.extractModelFromResponse(response);
        return this;
    }

    /**
     * Creates a new record on the server.
     * @returns {Promise<Model>}
     */
    create(parameters = {}, callback = null) {
        const response = Dao.modelRequestSync('create', this, parameters);
        this.extractModelFromResponse(response);
        if (callback) {
            callback(response);
        }
        return this;
    }
    /**
     * Creates a new record on the server synchronously.
     * @param {object} parameters 
     * @returns {Model}
     */
    createSync(parameters = {}) {
        const response = Dao.modelRequestSync('create', this, parameters);
        this.extractModelFromResponse(response);
        return this;
    }

    /**
     * Updates the record on the server.
     * @returns {Promise<Model>}
     */
    update(parameters = {}, callback = null) {
        const response = Dao.modelRequestSync('update', this, parameters);
        this.extractModelFromResponse(response);
        if (callback) {
            callback(response);
        }
        return this;
    }
    /**
     * Updates the record on the server synchronously.
     * @param {object} parameters 
     * @returns {Model}
     */
    updateSync(parameters = {}) {
        const response = Dao.modelRequestSync('update', this, parameters);
        this.extractModelFromResponse(response);
        return this;
    }

    /**
     * Deletes the record from the server.
     * @returns {Promise<string>}
     */
    delete(parameters = {}, callback = null) {
        const response = Dao.modelRequestSync('delete', this, parameters);
        if (callback) {
            callback(response);
        }
        return response;
    }
    /**
     * Deletes the record from the server synchronously.
     * @param {object} parameters 
     * @returns {string}
     */
    deleteSync(parameters = {}) {
        const response = Dao.modelRequestSync('delete', this, parameters);
        return response;
    }
}
