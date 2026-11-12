import Element from './Element.js';
import FormInput from './form/FormInput.js';

/**
 * Generic form component will dynamic getters and setters
 */
export default class Form extends Element {

    static get onCloseEvent() { return 'onClose'; }
    static get onSaveEvent() { return 'onSave'; }

    // TYPES
    static FIELD_TYPE_TEXT = 'text';
    static FIELD_TYPE_TEXTAREA = 'textarea';
    static FIELD_TYPE_SELECT = 'select';
    static FIELD_TYPE_CHECKBOX = 'checkbox';
    static FIELD_TYPE_RADIO = 'radio';
    static FIELD_TYPE_DATE = 'date';
    static FIELD_TYPE_NUMBER = 'number';
    static FIELD_TYPE_DATETIME = 'datetime-local';
    static FIELD_TYPE_TIME = 'time';
    static FIELD_TYPE_EMAIL = 'email';
    static FIELD_TYPE_PASSWORD = 'password';
    static FIELD_TYPE_FILE = 'file';

    /**
     * @type {Object} inputs The form inputs to render in the form
     */
    inputs = {
        "example_field": {
            label: "Example Field",
            type: this.FIELD_TYPE_TEXT,
            value: "example value",
            options: [], // for select, checkbox, radio types
            selected: null, // for select, checkbox, radio types
            create_element_callback: this.createInputElement.bind(this)
        }
    };

    constructor(){
        super();
    }

    // TODO: MAke each input object have an optional callback method for creating it's element,
    // the default behavior will use this class instances default creation for all standard form types by the 'type' property
    createInputElement(inputObject){
        let formRow = new Element().addClass('mb-4');
        let label = new Element('label')
            .addClass('block text-gray-700 text-sm font-bold mb-2')
            .addContent(inputObject.label);
        formRow.addContent(label);

        let inputElement = new Element('input')
            .addClass('shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline')
            .setAttribute('type', inputObject.type)
            .setAttribute('value', inputObject.value);

        formRow.addContent(inputElement);

        switch(inputObject.type){
            case this.FIELD_TYPE_TEXTAREA:
                inputElement = new Element('textarea')
                    .addClass('shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline')
                    .setAttribute('value', inputObject.value);
                formRow.addContent(inputElement);
                break;
            case this.FIELD_TYPE_SELECT:
                let selectElement = new Element('select')
                    .addClass('shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline');
                for(let option of inputObject.options){
                    let optionElement = new Element('option')
                        .setAttribute('value', option.value)
                        .addContent(option.label);
                    if(option.value === inputObject.selected){
                        optionElement.setAttribute('selected', true);
                    }
                    selectElement.addContent(optionElement);
                }
                formRow.addContent(selectElement);
                break;
        }   
    }

}