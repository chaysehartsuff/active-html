import Element from './Element.js';
import XMarkIcon from './icons/XMarkIcon.js';
import SuccessIcon from './icons/SuccessIcon.js';
import InfoIcon from './icons/InfoIcon.js';
import WarningIcon from './icons/WarningIcon.js';
import ErrorIcon from './icons/ErrorIcon.js';

/**
 * A friendly button element styled with Tailwind CSS.
 */
export default class Toast extends Element {
    /**
     * The container element for the toast notifications.
     * @type {Element}
     */
    toast_container;

    /**
     * The content to render inside the toast body.
     * @type {Element|string}
     */
    slot;

    /**
     * Auto dismiss timeout in milliseconds.
     * @type {number}
     */
    duration_ms;

    /**
     * Exit transition duration in milliseconds.
     * @type {number}
     */
    exit_duration_ms;

    /**
     * Timer id for auto-dismiss.
     * @type {number|null}
     */
    dismiss_timeout_id;

    /**
     * Timer id for delayed remove after exit transition.
     * @type {number|null}
     */
    remove_timeout_id;

    /**
     * Tracks whether dismiss has already been triggered.
     * @type {boolean}
     */
    is_dismissed;

    /**
     * Create a new toast notification that is visible immediately
     * @param {Element|string} slot 
     * @param {string} toast_container_id
     */
    constructor(slot, toast_container_id = 'toast-container', options = {}) {
        super();

        this.slot = slot;
        this.duration_ms = Number.isFinite(options.duration_ms) ? options.duration_ms : 10000;
        this.exit_duration_ms = Number.isFinite(options.exit_duration_ms) ? options.exit_duration_ms : 300;
        this.dismiss_timeout_id = null;
        this.remove_timeout_id = null;
        this.is_dismissed = false;

        // ensure toast container exists
        this.toast_container = Element.createInstanceFromId(toast_container_id);
        if(!this.toast_container){
            this.toast_container = new Element();
            this.toast_container.setId(toast_container_id);
            this.toast_container.bindToDom();
        }

        this.toast_container.addClass('fixed');
        this.toast_container.addClass('bottom-4');
        this.toast_container.addClass('right-4');
        this.toast_container.addClass('z-50');
        this.toast_container.addClass('flex');
        this.toast_container.addClass('flex-col');
        this.toast_container.addClass('items-end');
        this.toast_container.addClass('gap-3');
        this.toast_container.addClass('pointer-events-none');
    }

    // applies success styling
    success(options = {}){
        return this.popup({
            ...options,
            icon: options.icon || new SuccessIcon(),
            toastClass: options.toastClass || 'border-green-200 bg-green-50 text-green-900',
            iconClass: options.iconClass || 'text-green-600',
        });
    }
    // applies info styling
    info(options = {}){
        return this.popup({
            ...options,
            icon: options.icon || new InfoIcon(),
            toastClass: options.toastClass || 'border-blue-200 bg-blue-50 text-blue-900',
            iconClass: options.iconClass || 'text-blue-600',
        });
    }
    // applies warning styling
    warning(options = {}){
        return this.popup({
            ...options,
            icon: options.icon || new WarningIcon(),
            toastClass: options.toastClass || 'border-amber-200 bg-amber-50 text-amber-900',
            iconClass: options.iconClass || 'text-amber-600',
        });
    }
    // applies error styling
    error(options = {}){
        return this.popup({
            ...options,
            icon: options.icon || new ErrorIcon(),
            toastClass: options.toastClass || 'border-red-200 bg-red-50 text-red-900',
            iconClass: options.iconClass || 'text-red-600',
        });
    }
    // applies baseline styling
    popup(options = {}){
        this.clearContent();

        const resolvedDuration = Number.isFinite(options.duration_ms)
            ? options.duration_ms
            : this.duration_ms;
        const resolvedExitDuration = Number.isFinite(options.exit_duration_ms)
            ? options.exit_duration_ms
            : this.exit_duration_ms;

        this.duration_ms = resolvedDuration;
        this.exit_duration_ms = resolvedExitDuration;
        this.is_dismissed = false;

        this.addClass('relative');
        this.addClass('pointer-events-auto');
        this.addClass('w-full');
        this.addClass('max-w-sm');
        this.addClass('rounded-lg');
        this.addClass('border');
        this.addClass('shadow-lg');
        this.addClass('p-4');
        this.addClass('pr-10');
        this.addClass('transition-all');
        this.addClass('duration-300');
        this.addClass('ease-out');
        this.addClass('opacity-0');
        this.addClass('translate-y-3');
        this.addClass('bg-white');
        this.addClass('text-gray-800');
        this.addClass('border-gray-200');

        if (options.toastClass) {
            this.addClass(options.toastClass);
        }

        const body = new Element();
        body.addClass('flex');
        body.addClass('items-start');
        body.addClass('gap-3');

        if (options.icon instanceof Element) {
            const iconWrapper = new Element();
            iconWrapper.addClass('h-5');
            iconWrapper.addClass('w-5');
            iconWrapper.addClass('shrink-0');
            iconWrapper.addClass('mt-0.5');
            iconWrapper.addClass(options.iconClass || 'text-gray-600');
            iconWrapper.addContent(options.icon);
            body.addContent(iconWrapper);
        }

        const message = new Element();
        message.addClass('text-sm');
        message.addClass('leading-5');

        if (this.slot instanceof Element) {
            message.addContent(this.slot);
        } else if (this.slot !== null && this.slot !== undefined) {
            message.addContent(String(this.slot));
        }
        body.addContent(message);

        const closeButton = new Element('button');
        closeButton.addClass('absolute');
        closeButton.addClass('top-2');
        closeButton.addClass('right-2');
        closeButton.addClass('h-6');
        closeButton.addClass('w-6');
        closeButton.addClass('rounded-md');
        closeButton.addClass('text-gray-400');
        closeButton.addClass('hover:text-gray-700');
        closeButton.addClass('focus:outline-none');
        closeButton.addClass('focus:ring-2');
        closeButton.addClass('focus:ring-offset-1');
        closeButton.addClass('focus:ring-gray-300');
        closeButton.setAttribute('type', 'button');

        const closeIconWrapper = new Element();
        closeIconWrapper.addClass('h-4');
        closeIconWrapper.addClass('w-4');
        closeIconWrapper.addClass('mx-auto');
        closeIconWrapper.addClass('my-auto');
        closeIconWrapper.addContent(new XMarkIcon());
        closeButton.addContent(closeIconWrapper);

        closeButton.onEvent('click', (e) => {
            this.dismiss(e);
        });

        this.addContent(body);
        this.addContent(closeButton);

        this.toast_container.addContent(this, this.getId());

        // Enter transition starts after the element is bound and painted.
        setTimeout(() => {
            this.removeClass('opacity-0');
            this.removeClass('translate-y-3');
        }, 20);

        this.dismiss_timeout_id = setTimeout(() => {
            this.dismiss();
        }, this.duration_ms);

        return this;
    }

    dismiss(e = null) {
        if (e && typeof e.stopPropagation === 'function') {
            e.stopPropagation();
        }

        if (this.is_dismissed) {
            return this;
        }

        this.is_dismissed = true;

        if (this.dismiss_timeout_id !== null) {
            clearTimeout(this.dismiss_timeout_id);
            this.dismiss_timeout_id = null;
        }

        if (this.remove_timeout_id !== null) {
            clearTimeout(this.remove_timeout_id);
            this.remove_timeout_id = null;
        }

        this.addClass('opacity-0');
        this.addClass('translate-y-2');

        this.remove_timeout_id = setTimeout(() => {
            this.toast_container.removeContent(this);
            this.remove_timeout_id = null;
        }, this.exit_duration_ms);

        return this;
    }
}