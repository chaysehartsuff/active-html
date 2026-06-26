import Element from './Element.js';

/**
 * A class dropdown with quick action triggers
 */
export default class QuickActionMenu extends Element {

    /**
     * The element that triggers this menu to open.
     * @type {Element|null}
     */
    triggerElement;

    /**
     * Global click handler reference for cleanup.
     * @type {Function|null}
     */
    outsideClickHandler;

    static get onCloseEvent() { return 'onClose'; }

    /**
     * 
     * @param {Element} triggerElement 
     */
    constructor(triggerElement = null) {
        super();
        this.triggerElement = null;
        this.outsideClickHandler = null;

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

        if (this.outsideClickHandler) {
            return;
        }

        this.outsideClickHandler = (e) => {
            const menuElement = this.bindedElement;
            const triggerDomElement = this.getTriggerDomElement();
            const target = e.target;

            const isClickInsideMenu = Boolean(menuElement && target && menuElement.contains(target));
            const isClickOnTrigger = Boolean(triggerDomElement && target && triggerDomElement.contains(target));

            // Close only when click is outside both the menu and its trigger.
            if (!isClickInsideMenu && !isClickOnTrigger) {
                this.onClose(e);
            }
        };

        // Delay attachment so the click that opens the menu doesn't instantly close it.
        setTimeout(() => {
            if (this.outsideClickHandler) {
                document.addEventListener('click', this.outsideClickHandler);
            }
        }, 0);
    }

    /**
     * Sets the element that triggers the menu.
     * @param {Element} element 
     */
    setTrigger(element) {
        this.triggerElement = element;
        return this;
    }

    getTriggerDomElement() {
        if (!this.triggerElement) {
            return null;
        }
        return this.triggerElement.bindedElement || document.getElementById(this.triggerElement.getId());
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
        if (this.outsideClickHandler) {
            document.removeEventListener('click', this.outsideClickHandler);
            this.outsideClickHandler = null;
        }
        this.hide();
        this.event(QuickActionMenu.onCloseEvent, e);
    }
}