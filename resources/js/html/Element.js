
/**
 * The base HTML elemement class
 */
export default class Element {
    /**
     * The tag name for the element
     * @type {string}
     */
    rootTag = 'div';
    /**
     * The inner content stack for nested elements and strings
     * @type {Map<string, Element|string>}
     */
    contentStack = new Map();

    /**
     * The attributes for the element
     * @type {object}
     */
    attributes = {};

    /**
     * The properties for the element
     * @type {object}
     */
    properties = {};

    /**
     * The event listeners for the element
     * @type {object}
     */
    events = {};

    /**
     * The DOM element associated with the Element
     * @type {HTMLElement}
     */
    bindedElement = null;

    /**
     * The event listeners for the entity.
     * @type {Map<string, Function[]>}
     */
    listeners;

    constructor(rootTag = null){
        if(rootTag){
            this.rootTag = rootTag;
        }
        this.listeners = new Map();
        this.setId(crypto.randomUUID());
    }

    /**
     * Adds element to the inner element for compilation
     * @param {Element|string} content
     * @param {string|null} key An optional key to associate with the content.
     * @returns {this}
     */
    addContent(content, key = null){
        if(content instanceof Element || typeof content === 'string'){
            let contentKey = key || crypto.randomUUID();
            if(content instanceof Element && key === null){
                contentKey = content.getId();
            }
            this.contentStack.set(contentKey, content);
        }else {
            console.error('Content must be of type Element or string');
        }

        if (this.bindedElement) {
            const compiledContent = content instanceof Element ? content.compile() : content;
            this.bindedElement.insertAdjacentHTML('beforeend', compiledContent);
            if (content instanceof Element) {
                content.bindEvents();
            }
        }

        return this;
    }

    /**
     * Removes content from the content stack and dom by key
     * @param {string|Element} key 
     */
    removeContent(key){
        if(key instanceof Element){
            key = key.getId();
        }
        if(!this.contentStack.has(key)){
            return this;
        }

        const contentToRemove = this.contentStack.get(key);

        // If the parent and the child element are rendered in the DOM, remove the child element directly.
        if (this.bindedElement && contentToRemove instanceof Element && contentToRemove.bindedElement) {
            contentToRemove.bindedElement.remove();
        } else if (this.bindedElement) {
            // This case handles strings or elements not properly bound.
            // The only reliable way to remove them is to re-render the parent's content.
            console.warn("Content is a string or not a bound element. Re-rendering parent to remove.");
            this.contentStack.delete(key); // Remove from map first
            this.bindedElement.innerHTML = Array.from(this.contentStack.values())
                .map(content => content instanceof Element ? content.compile() : content)
                .join('');
            
            // Re-bind events for remaining children
            for(const content of this.contentStack.values()) {
                if (content instanceof Element) {
                    content.bindEvents();
                }
            }
            return this;
        }

        // Finally, remove the content from the map.
        this.contentStack.delete(key);

        return this;
    }

    /**
     * Clears the content stack
     * @returns {this}
     */
    clearContent(){
        this.contentStack.clear();

        if (this.bindedElement) {
            this.bindedElement.innerHTML = '';
            this.bindedElement.textContent = '';
            if ('value' in this.bindedElement) {
                this.bindedElement.value = '';
            }
        }

        return this;
    }

    /**
     * Sets the inner content of the element
     * @param {Element|string} content
     * @returns {this}
     */
    setContent(content){
        this.clearContent();
        return this.addContent(content);
    }

    /**
     * Adds a CSS class to the element's class list, ensuring no duplicates.
     * @param {string} className The CSS class to add.
     */
    addClass(className) {
        if (!className || typeof className !== 'string') {
            throw new Error('Invalid class name');
        }

        // Ensure the 'class' property exists, initializing if it doesn't.
        if (!this.attributes.class) {
            this.attributes.class = '';
        }

        // Pad the existing classes and the new class with spaces for an exact match check.
        const paddedCurrentClasses = ` ${this.attributes.class} `;
        const paddedClassName = ` ${className} `;

        // If the class doesn't already exist, append it.
        if (!paddedCurrentClasses.includes(paddedClassName)) {
            // Append with a leading space and trim to handle the initial empty case.
            this.attributes.class = `${this.attributes.class} ${className}`.trim();

            if (this.bindedElement) {
                this.bindedElement.classList.add(className);
            }
        }
        return this;
    }

    /**
     * Removes a CSS class from the element's class list.
     * @param {string} className The CSS class to remove.
     */
    removeClass(className) {
        if (!className || typeof className !== 'string' || !this.attributes.class) {
                throw new Error('Invalid class name or class list');
        }

        // Pad with spaces for an exact match, just like in addClass.
        const paddedClassName = ` ${className} `;
        
        // Use a loop to handle cases where a class might have been added multiple times by mistake.
        while (` ${this.attributes.class} `.includes(paddedClassName)) {
            this.attributes.class = ` ${this.attributes.class} `.replace(paddedClassName, ' ').trim();
        }

        // Clean up any resulting double spaces.
        this.attributes.class = this.attributes.class.replace(/\s+/g, ' ');

        if (this.bindedElement) {
            this.bindedElement.classList.remove(className);
        }

        return this;
    }

    hasClass(className) {
        if (!className || typeof className !== 'string') {
            return false;
        }

        // If the element is bound to the DOM, use the reliable classList.contains method.
        if (this.bindedElement) {
            return this.bindedElement.classList.contains(className);
        }

        // If not bound, check the properties string.
        if (!this.attributes.class) {
            return false;
        }

        // Use the same padding trick as addClass/removeClass to ensure an exact match.
        const paddedCurrentClasses = ` ${this.attributes.class} `;
        const paddedClassName = ` ${className} `;

        return paddedCurrentClasses.includes(paddedClassName);
    }

    setStyle(property, value){
        if (!property || typeof property !== 'string') {
            throw new Error('Invalid style property');
        }
        if (!value || typeof value !== 'string') {
            throw new Error('Invalid style value');
        }

        this.setAttribute('style', `${this.attributes.style || ''}${property}: ${value};`);

        if (this.bindedElement) {
            this.bindedElement.style[property] = value;
        }
        return this;
    }

    /**
     * Adds or updates an attribute on the element.
     * If the element is bound to the DOM, updates the actual attribute value and syncs it with
     * @param {string} key The property key (attribute name).
     * @param {string|number|boolean} value The property value.
     */
    setAttribute(key, value) {
        if (!key || typeof key !== 'string') {
            throw new Error('Invalid attribute key');
        }
        this.attributes[key] = value;

        if (this.bindedElement) {
            this.bindedElement.setAttribute(key, value);
        }

        return this;
    }
    /**
     * Adds or updates an attribute on the element.
     * If the element is bound to the DOM, updates the actual attribute value and syncs it with
     * @param {*} key 
     * @param {*} value 
     * @returns 
     */
    addAttribute(key, value) {
        return this.setAttribute(key, value);
    }
    /**
     * Gets the attribute from the element.
     * If the element is bound to the DOM, retrieves the actual attribute value and syncs it with properties.
     * @param {string} key The property key to get.
     * @returns {string|number|boolean|null} The property value, or null if the property does not exist.
     */
    getAttribute(key) {
        if (!key || typeof key !== 'string') {
            console.warn(`Invalid attribute key '${key}'.`);
            return null;
        }

        // If element is bound to DOM, get the real attribute value
        if (this.bindedElement instanceof HTMLElement) {
            const domValue = this.bindedElement.getAttribute(key);
            // Sync the properties object with the actual DOM value (even if null)
            this.attributes[key] = domValue;
        }

        // If not bound, return from properties or null
        return this.attributes[key] || null;
    }

    /**
     * Sets or updates a property on the element.
     * If the element is bound to the DOM, updates the actual property value and syncs it with
     * @param {*} key 
     * @param {*} value 
     * @returns 
     */
    setProperty(key, value) {
        if (!key || typeof key!== 'string') {
            throw new Error('Invalid property key');
        }
        this.properties[key] = value;

        if (this.bindedElement) {
            this.bindedElement[key] = value;
        }

        return this;
    }

    /**
     * Gets the property from the element.
     * If the element is bound to the DOM, retrieves the actual property value and syncs it with properties.
     * @param {string} key The property key to get.
     * @returns {*|null} The property value, or null if the property does not exist.
     * */
    getProperty(key) {
        if (!key || typeof key!== 'string') {
            console.warn(`Invalid property key '${key}'.`);
            return null;
        }

        // If element is bound to DOM, get the real property value
        if (this.bindedElement instanceof HTMLElement) {
            const domValue = this.bindedElement[key];
            // Sync the properties object with the actual DOM value (even if null)
            this.properties[key] = domValue;
        }

        // If not bound, return from properties or null
        return this.properties[key] || null;
    }

    /**
     * Removes a property from the element.
     * @param {string} key The property key to remove.
     */
    removeProperty(key) {
        if (!key || typeof key !== 'string') {
            throw new Error('Invalid property key');
        }
        delete this.attributes[key];

        if (this.bindedElement) {
            this.bindedElement.removeAttribute(key);
        }

        return this;
    }

    /** ---- HELPER METHODS ----- */

    /**
     * Sets the ID for the element.
     * @param {string} id The ID to set.
     */
    setId(id) {
        this.setAttribute('id', id);
        this.setProperty('id', id);
        return this;
    }

    /**
     * Gets the ID of the element.
     * @returns {string|null} The ID of the element, or null if not set.
     */
    getId() {
        return this.attributes.id || null;
    }

    /**
     * Returns value of element.
     * @returns {string} The compiled HTML string.
     */
    getValue() {
        if (this.bindedElement) {
            return this.bindedElement.value;
        }
        return Array.from(this.contentStack.values()).join('');
    }
    /**
     * Sets value on element
     * @param {*} value 
     * @returns 
     */
    setValue(value) {
        if (this.bindedElement) {
            this.bindedElement.value = value;
        }
        return this;
    }

    hide() {
        return this.addClass('hidden');
    }
    reveal() {
        return this.removeClass('hidden');
    }

    /**
     * Stores an event listener function to be attached to the element later.
     * @param {string} eventName The name of the event (e.g., 'click', 'mouseover').
     * @param {Function} func The callback function to execute.
     */
    onEvent(eventName, func) {
        if (typeof eventName !== 'string' || !eventName) {
            throw new Error('Invalid event name provided.');
        }
        if (typeof func !== 'function') {
            throw new Error('Event handler must be a function.');
        }
        // Store the event listener, removing 'on' prefix if present (e.g., 'onclick' -> 'click')
        const cleanEventName = eventName.startsWith('on') ? eventName.substring(2) : eventName;
        
        if (this.bindedElement && this.events[cleanEventName]) {
            this.bindedElement.removeEventListener(cleanEventName, this.events[cleanEventName]);
        }

        this.events[cleanEventName] = func;

        if (this.bindedElement) {
            this.bindedElement.addEventListener(cleanEventName, func);
        }

        return this;
    }

    /**
     * Removes an event listener from the element.
     * @param {string} eventName The name of the event to remove (e.g., 'click', 'mouseover').
     * @returns {Element} The current element instance for chaining.
     */
    removeEvent(eventName) {
        if (typeof eventName !== 'string' || !eventName) {
            throw new Error('Invalid event name provided.');
        }
        const cleanEventName = eventName.startsWith('on') ? eventName.substring(2) : eventName;

        if (this.bindedElement && this.events[cleanEventName]) {
            this.bindedElement.removeEventListener(cleanEventName, this.events[cleanEventName]);
            delete this.events[cleanEventName];
        }

        return this;
    }

    /**
     * Binds all stored event listeners to the rendered element in the DOM.
     * Requires the element to have an ID and to exist in the DOM.
     */
    bindEvents() {
        const id = this.getId();
        if (!id) {
            console.error('Cannot bind events: Element has no ID set.');
            return;
        }

        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Cannot bind events: Element with ID "${id}" not found in the DOM.`);
            return this;
        }

        this.bindedElement = element;

        // bind event listeners to the element's DOM element
        for (const eventName in this.events) {
            if (Object.hasOwnProperty.call(this.events, eventName)) {
                const handler = this.events[eventName];
                this.bindedElement.addEventListener(eventName, handler);
            }
        }
        // call bindEvents on nested elements
        for (const content of this.contentStack.values()) {
            if (content instanceof Element) {
                content.bindEvents();
            }
        }
        return this;
    }

    /**
     * Binds all stored attributes to the binded element in the DOM.
     * @returns {Element} The current element instance for chaining.
     */
    bindAttributes() {
        if (!this.bindedElement) {
            console.error('Cannot bind attributes: Element is not bound to the DOM.');
            return this;
        }

        for (const [key, value] of Object.entries(this.attributes)) {
            this.bindedElement.setAttribute(key, value);
        }
        return this;
    }

    /**
     * Binds all stored properties to the binded element in the DOM.
     * @returns {Element} The current element instance for chaining.
     */
    bindProperties() {
        if (!this.bindedElement) {
            console.error('Cannot bind properties: Element is not bound to the DOM.');
            return this;
        }
        
        for (const [key, value] of Object.entries(this.properties)) {
            this.bindedElement[key] = value;
        }
        return this;
    }

    /**
     * Binds everything to the binded element in the DOM.
     * @returns 
     */
    bindAll() {
        return this.bindAttributes().bindProperties().bindEvents();
    }

    addListener(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
        return this;
    }
    event(key,...args) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => callback(...args));
        }
        return this;
    }

    compile(){
        const props = Object.entries(this.attributes)
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ');

        let contentHtml = '';
        for (const content of this.contentStack.values()) {
            if (content instanceof Element) {
                contentHtml += content.compile();
            } else {
                contentHtml += content;
            }
        }

        return `<${this.rootTag} ${props}>${contentHtml}</${this.rootTag}>`;
    }
}
