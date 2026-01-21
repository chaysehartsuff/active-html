
import Element from './Element.js';
import Button from './Button.js';

/**
 * A container for footer action buttons, displayed as a simple div.
 */
export default class FooterActions extends Element {
    /**
     * @param {Button[]} buttons An array of Button elements to display.
     */
    constructor(buttons = []) {
        super();

        // Add styling for a footer bar appearance
        this.addClass('flex');
        this.addClass('justify-end');
        this.addClass('space-x-2');
        this.addClass('p-4');
        this.addClass('bg-gray-200');
        this.addClass('rounded-b-lg');
        this.addClass('mt-2');

        // Add the provided buttons to the container
        buttons.forEach(button => {
            this.addContent(button);
        });
    }
}
