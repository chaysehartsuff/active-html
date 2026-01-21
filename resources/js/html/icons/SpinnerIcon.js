import Element from '../Element.js';

/**
 * A simple CSS-based spinner icon.
 */
export default class SpinnerIcon extends Element {

    rootTag = 'div';

    constructor() {
        super();
        this.addClass('animate-spin');
        this.addClass('rounded-full');
        this.addClass('h-12');
        this.addClass('w-12');
        this.addClass('border-b-2');
        this.addClass('border-blue-500');
    }
}