
import Element from './Element.js';

export default class TextArea extends Element {
    rootTag = 'textarea';

    constructor(initialContent = '') {
        super();
        if (initialContent) {
            this.addContent(initialContent);
        }
        this.addClass('p-2');
        this.addClass('border-0');
        this.addClass('focus:ring-0');
        this.addClass('focus:outline-none');
        this.addClass('w-full');
    }

    /**
     * Adds content to the textarea. This sets the initial value.
     * @param {string} content
     * @returns {this}
     */
    addContent(content) {
        if (this.bindedElement) {
            this.bindedElement.value += content;
        }
        super.addContent(content);
        return this;
    }

    /**
     * Clears the content of the textarea.
     * @returns {this}
     */
    clearContent() {
        if (this.bindedElement) {
            // If bound, clear the value property
            this.bindedElement.value = '';
        }
        super.clearContent();
        return this;
    }

    /**
     * Gets the current value from the textarea.
     * @returns {string}
     */
    getValue() {
        if (this.bindedElement) {
            return this.bindedElement.value;
        }
        // Fallback to initial content if not bound to the DOM yet
        return this.contentStack.join('');
    }
}
