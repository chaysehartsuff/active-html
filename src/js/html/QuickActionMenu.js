import Element from './Element.js';

/**
 * A class dropdown with quick action triggers
 */
export default class QuickActionMenu extends Element {

    /**
     * The element that triggers this menu to open.
     * @type {HTMLElement}
     */
    triggerElement;

    static get onCloseEvent() { return 'onClose'; }

    /**
     * 
     * @param {Element} triggerElement 
     */
    constructor(triggerElement = null) {
        super();
        this.triggerElement = null;

        if(triggerElement instanceof Element) {
            this.setTrigger(triggerElement);
        }

        // --- Dropdown Container Styling ---
        // Position absolutely to float over other content
        this.addClass('absolute');
        // Style the container
        this.addClass('bg-white');
        this.addClass('border');
        this.addClass('border-gray-200');
        this.addClass('rounded-md');
        this.addClass('shadow-lg');
        // Set a width
        this.addClass('w-48');
        // Ensure it appears on top of other elements
        this.addClass('z-10');
    }

    bindEvents() {
        super.bindEvents();

        document.addEventListener('click', (e) => {
            const isClickInsideMenu = this.bindedElement && this.bindedElement.contains(e.target);
            const isClickOnTrigger = this.triggerElement && this.triggerElement.contains(e.target);

            if (!isClickInsideMenu && !isClickOnTrigger) {
                this.onClose(e);
            }
        });
    }

    /**
     * Sets the element that triggers the menu.
     * @param {Element} element 
     */
    setTrigger(element) {
        this.triggerElement = element.bindedElement;
        return this;
    }


    /**
     * 
     * @param {string} value
     * @param {string} label 
     * @param {Function} callback 
     */
    addAction(value, label, callback) {
        if(!label){
            throw new Error('Label cannot be empty');
        }
        // Corrected check for function
        if (typeof callback !== 'function')  {
            throw new Error('Callback must be a function');
        }
        let actionElement = new Element();
        actionElement.addContent(label);
        actionElement.onEvent('click', (e) => {
            callback(value);
            this.onClose(e);
        });

        // --- Menu Item Styling ---
        actionElement.addClass('block');
        actionElement.addClass('w-full');
        actionElement.addClass('px-4');
        actionElement.addClass('py-2');
        actionElement.addClass('text-sm');
        actionElement.addClass('text-gray-700');
        actionElement.addClass('hover:bg-gray-100');
        actionElement.addClass('cursor-pointer');
        actionElement.addClass('text-left');

        this.addContent(actionElement);
        return this;
    }

    onClose(e) {
        this.hide();
        this.event(QuickActionMenu.onCloseEvent, e);
    }
}