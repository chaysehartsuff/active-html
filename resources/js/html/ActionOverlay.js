import Element from './Element.js';
import Button from './Button.js';

/**
 * A friendly overlay with button actions on hover
 */
export default class ActionOverlay extends Element {

    rootTag = 'div';
    /**
     * All buttons to display on hover.
     * @type {Button[]}
     */
    actionButtons = [];

    /**
     * 
     * @param {Button[]} actionButtons 
     */
    constructor(actionButtons = []) {
        super();
        this.actionButtons = actionButtons;

        // The main container should be transparent and not block mouse events
        this.addClass('absolute inset-0 pointer-events-none');

        // 1. Create a new element for the background highlight
        const backgroundOverlay = new Element();
        backgroundOverlay.addClass('absolute inset-0');
        backgroundOverlay.addClass('bg-gray-900 bg-opacity-0'); // Subtle dark highlight
        backgroundOverlay.addClass('opacity-0 group-hover:opacity-5 transition-opacity duration-300');
        backgroundOverlay.addClass('border-2 rounded-bl-lg shadow-lg p-4');
        this.addContent(backgroundOverlay);

        const buttonContainer = new Element();
        buttonContainer.addClass('absolute top-0 right-0 p-2');
        buttonContainer.addClass('bg-white rounded-bl-lg shadow-lg');
        buttonContainer.addClass('opacity-0 group-hover:opacity-100 transition-opacity duration-300');
        buttonContainer.addClass('flex items-center space-x-2');
        buttonContainer.addClass('pointer-events-auto'); // Allow clicking the buttons

        this.actionButtons.forEach(button => {
            button.addClass('text-gray-700');
            buttonContainer.addContent(button);
        });
        this.addContent(buttonContainer);
    }
}