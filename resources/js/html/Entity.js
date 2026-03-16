import Element from './Element.js';

/**
 * Base entity class for serialization and deserialization.
 */
export default class Entity extends Element {
    constructor(){
        super();
    }
    static createInstanceFromObject(obj) {
        const entity = new this();
        return entity.importObject(obj);
    }

    /** ----- SERIALIZATION ----- */
    /**
     * Exports the essential properties of the class instance to a plain object.
     * Child classes should extend this object.
     * @returns {object}
     */
    exportObject() {
        return {
            class: this.constructor.name,
        };
    }

    /**
     * Exports the class instance to a JSON string.
     * @returns {string}
     */
    exportJson() {
        return JSON.stringify(this.exportObject(), null, 2);
    }

    /**
     * Imports properties from a plain object into the class instance.
     * This method is designed to be called on an instance of the correct child class.
     * @param {object} obj The plain object to import data from.
     */
    importObject(obj) {
        if (obj.class !== this.constructor.name) {
            throw new Error(`Class mismatch: Cannot import object of type '${obj.class}' into an instance of '${this.constructor.name}'.`);
        }

        for (const key in obj) {
            if (!Object.prototype.hasOwnProperty.call(this, key)) {
                console.warn(`Property mismatch: The property '${key}' from the import object does not exist on the class '${this.constructor.name}'.`);
                continue;
            }
            this[key] = obj[key];
        }
        return this;
    }

    /**
     * Imports properties from a JSON string.
     * @param {string} json The JSON string to import data from.
     */
    importJson(json) {
        const obj = JSON.parse(json);
        this.importObject(obj);
    }
}