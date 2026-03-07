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

    /**
     * Fetches the model's data from the server.
     * @returns {Promise<Model>}
     */
    async get(parameters = {}) {
        const updatedInstance = await Dao.getSync(this, parameters);
        Object.assign(this, updatedInstance);
        return this;
    }

    /**
     * Creates a new record on the server.
     * @returns {Promise<Model>}
     */
    async create(parameters = {}) {
        const newInstance = await Dao.createSync(this, parameters);
        Object.assign(this, newInstance);
        return this;
    }

    /**
     * Updates the record on the server.
     * @returns {Promise<Model>}
     */
    async update(parameters = {}) {
        const updatedInstance = await Dao.updateSync(this, parameters);
        Object.assign(this, updatedInstance);
        return this;
    }

    /**
     * Deletes the record from the server.
     * @returns {Promise<string>}
     */
    async delete(parameters = {}) {
        return await Dao.deleteSync(this, parameters);
    }
}
