import Element from './Element.js';

/**
 * A friendly button element styled with Tailwind CSS.
 */
export default class Button extends Element {

    /**
     * Creates an instance of a Button.
     * @param {string} [text='Click Me'] - The display text for the button.
     * @param {string|null} [color=null] - An optional hex color for the background.
     */
    constructor(text = '', color = null) {
        super(); // Call the parent Element constructor

        this.rootTag = 'button';
        this.addContent(text);

        // Add standard button styling using Tailwind CSS classes
        //this.addClass('font-bold');
        this.addClass('py-1');
        this.addClass('px-4');
        this.addClass('rounded');
        this.addClass('text-white');
        this.addClass('shadow-md');
        this.addClass('hover:shadow-lg');
        this.addClass('focus:outline-none');
        this.addClass('focus:ring-2');
        this.addClass('focus:ring-opacity-75');
        this.addClass('transition');
        this.addClass('duration-150');
        this.addClass('ease-in-out');

        // Handle the color parameter
        if (color) {
            // Use an inline style for a dynamic background color
            this.addProperty('style', `background-color: ${color};`);
            // Set a default focus ring color, which can be overridden
            this.addClass('focus:ring-gray-500');
        } else {
            // Apply a default background color if none is provided
            this.addClass('bg-blue-500');
            this.addClass('hover:bg-blue-700');
            this.addClass('focus:ring-blue-400');
        }
    }
}