
import Element from './Element.js';
import Option from './Option.js';

export default class Select extends Element  {
    rootTag ='select';

    static get itemSelectedEvent() { return 'itemSelected'; }

    /**
     * Creates a styled select dropdown.
     * @param {(Option|object)[]} options - An array of Option instances, structured objects, or a mix of both.
     */
    constructor(options = []){
        super();

        // --- Basic Styling ---
        this.addClass(
            'bg-white border border-gray-300 rounded-md py-2 px-3 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
        );

        // --- Option Population ---
        options.forEach(optionData => {
            this.addOption(optionData);
        });

        // --- Event Handling ---
        // Listen for the 'change' event on the <select> element itself
        this.onEvent('change', this.onItemSelected.bind(this));
    }

    /**
     * Adds an option to the select dropdown. It can handle an Option instance,
     * a structured object { value, name, default? }, or a simple { value: name } object.
     * @param {Option|object} optionData - The option to add.
     */
    addOption(optionData) {
        let optionElement;

        if (optionData instanceof Option) {
            // 1. Handle Option instance
            optionElement = optionData;
        } else if (typeof optionData === 'object' && optionData !== null) {
            // 2. Handle structured object: { value, name, default? }
            if ('value' in optionData && 'name' in optionData) {
                optionElement = new Option(optionData.value, optionData.name);
                if (optionData.default === true) {
                    optionElement.setDefault();
                }
            } else {
                // 3. Handle simple key-value object: { value: name }
                const keys = Object.keys(optionData);
                if (keys.length === 1) {
                    const value = keys[0];
                    const name = optionData[value];
                    optionElement = new Option(value, name);
                } else {
                    console.error('Invalid object format for option. Expected { value, name } or a single key-value pair.', optionData);
                    return;
                }
            }
        } else {
            console.error('Invalid data type for addOption. Expected Option or object.', optionData);
            return;
        }

        this.addContent(optionElement);
    }

    /**
     * Creates a new Option instance and adds it to the select dropdown.
     * @param {string} value 
     * @param {string} name 
     * @param {boolean} defaultOption 
     */
    newOption(value, name, defaultOption = false) {
        const option = new Option(value, name);
        if (defaultOption) {
            option.setDefault();
        }
        this.addOption(option);
    }

    onItemSelected(e){
        const selectedValue = e.target.value;
        this.event(Select.itemSelectedEvent, { value: selectedValue });
    }
}
