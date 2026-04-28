import Element from './Element.js';

export default class ContentOverlay extends Element {

    rootTag = 'div';

    /**
     * The content element to display in the center.
     * @type {Element}
     */
    slot;

    static get onCloseEvent() { return 'onClose'; }

    /**
     * Creates a full-screen overlay to center content.
     * @param {Element} slot The content element to display in the center.
     */
    constructor(slot) {
        super();
        this.slot = slot;

        // --- Overlay Styling ---
        // Position fixed to cover the viewport
        this.addClass('fixed');
        // Cover all sides of the screen
        this.addClass('inset-0');
        // Add a semi-transparent black background
        this.addClass('bg-black/50');
        // Ensure it's on top of other page content
        this.addClass('z-100');

        // --- Content Centering ---
        // Use flexbox to center the child element (the slot)
        this.addClass('flex');
        this.addClass('items-center');
        this.addClass('justify-center');

        // Add the provided content into the overlay
        if (this.slot) {
            this.addContent(this.slot);
        }
        this.onEvent('click', this.onClose.bind(this));
    }

    onClose(e) {
        if (e.target === this.bindedElement) {
            this.hide();
            this.event(ContentOverlay.onCloseEvent, e);
        }
    }
}