import Element from './Element.js';

/**
 * Standard checkbox element.
 */
export default class Checkbox extends Element {

    rootTag = 'input';

    static get onCheckedEvent() { return 'onChecked'; }
    static get onUncheckedEvent() { return 'onUnchecked'; }

    constructor(){
        super();
        this.addClass('h-4 w-4');
        this.setAttribute('type', 'checkbox');
        this.onEvent('change', this.onChange.bind(this));
    }

    checked() {
        return this.bindedElement ? this.bindedElement.checked : null;
    }

    onChange(e) {
        if(e.target === this.bindedElement) {
            if(!this.checked()){
                this.event(Checkbox.onUncheckedEvent, e);
            } else {
                this.event(Checkbox.onCheckedEvent, e);
            }
        }
    }
}