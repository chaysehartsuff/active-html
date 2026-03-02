import Element from './Element.js';

/**
 * A component to display progress, with a visual bar and text.
 */
export default class ProgressBar extends Element {

    /**
     * @type {Element} The inner bar that represents the progress percentage.
     */
    bar;

    /**
     * @type {Element} The text element to display progress status.
     */
    text;

    constructor() {
        super('div');

        // Main container for the progress bar
        this.addClass('w-full').addClass('bg-gray-200').addClass('rounded-full').addClass('h-6')
            .addClass('relative').addClass('overflow-hidden').addClass('hidden'); // Hidden by default

        // Inner bar that shows the progress
        this.bar = new Element('div')
            .addClass('bg-blue-600').addClass('h-6').addClass('rounded-full')
            .addClass('transition-all').addClass('duration-500').addClass('ease-in-out')
            .addAttribute('style', 'width: 0%');

        // Text overlay
        this.text = new Element('div')
            .addClass('absolute').addClass('inset-0').addClass('flex').addClass('items-center')
            .addClass('justify-center').addClass('text-xs').addClass('font-medium').addClass('text-white');

        this.addContent(this.bar);
        this.addContent(this.text);
    }

    /**
     * Updates the progress bar's width and text.
     * @param {number} current - The current progress value.
     * @param {number} total - The total value.
     */
    update(current, total) {
        if (total > 0) {
            const percentage = Math.min(100, Math.max(0, (current / total) * 100));
            this.bar.addAttribute('style', `width: ${percentage}%`);
            this.text.setContent(`Uploading ${current} of ${total}...`);
        }
    }

    /**
     * Shows the progress bar.
     */
    show() {
        this.removeClass('hidden');
    }

    /**
     * Hides the progress bar and resets it.
     */
    hide() {
        this.addClass('hidden');
        this.bar.addAttribute('style', 'width: 0%');
        this.text.clearContent();
    }
}