import Element from './Element.js';


export default class Option extends Element {
    rootTag = 'option';

    constructor(value, text) {
        super();
        this.addAttribute('value', value);
        this.addContent(text);

        // Basic styling for option elements
        this.addClass('bg-white text-gray-900');
    }

    /**
     * Sets this option as the default selected option.
     * @returns {Option}
     */
    setDefault() {
        this.addAttribute('selected', true);
        return this;
    }

    /**
     * Set conditional selected state for this option.
     * @param {*} selected 
     * @returns 
     */
    selected(selected = true) {
        if (selected) {
            this.addAttribute('selected', true);
        } else {
            this.removeAttribute('selected');
        }
        return this;
    }
}