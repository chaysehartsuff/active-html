import Element from './Element.js';


export default class Option extends Element {
    rootTag = 'option';

    constructor(value, text) {
        super();
        this.addProperty('value', value);
        this.addContent(text);

        // Basic styling for option elements
        this.addClass('bg-white text-gray-900');
    }

    /**
     * Sets this option as the default selected option.
     * @returns {Option}
     */
    setDefault() {
        this.addProperty('selected', true);
        return this;
    }
}