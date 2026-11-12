import Element from './Element.js';

/**
 * A flexible contenteditable input that mimics native single-line input behavior.
 */
export default class CustomInput extends Element {
	rootTag = 'div';

	static get onInputEvent() { return 'onInput'; }
	static get onChangeEvent() { return 'onChange'; }
	static get onFocusEvent() { return 'onFocus'; }
	static get onBlurEvent() { return 'onBlur'; }
	static get onKeyDownEvent() { return 'onKeyDown'; }
	static get onKeyUpEvent() { return 'onKeyUp'; }
	static get onSelectEvent() { return 'onSelect'; }

	value = '';
	defaultValue = '';
	hasFocus = false;

	isShowingPlaceholder = false;
	focusedStartValue = '';

	lastSelectionStart = 0;
	lastSelectionEnd = 0;

	internalHandlers = null;

	constructor() {
		super();

		this.placeholder = new Element().addClass('text-white/45').addContent(this.getAttribute('placeholder') || '');

		this.setAttribute('role', 'textbox');
		this.setAttribute('tabindex', 0);
		this.setAttribute('contenteditable', 'true');
		this.setAttribute('spellcheck', 'false');
		this.setAttribute('autocomplete', 'off');
		this.setAttribute('autocorrect', 'off');
		this.setAttribute('autocapitalize', 'off');

		this.addClass('whitespace-nowrap overflow-hidden');

		this.internalHandlers = {
			focus: (e) => this.handleFocus(e),
			blur: (e) => this.handleBlur(e),
			beforeinput: (e) => this.handleBeforeInput(e),
			input: (e) => this.handleInput(e),
			keydown: (e) => this.handleKeyDown(e),
			keyup: (e) => this.handleKeyUp(e),
			mouseup: () => this.emitSelectIfChanged(),
			selectstart: () => this.emitSelectIfChanged(),
		};
	}

	bindEvents() {
		super.bindEvents();
		this.bindInternalHandlers();
		this.syncDomWithState();
		return this;
	}

	bindInternalHandlers() {
		if (!this.bindedElement || !this.internalHandlers) {
			return;
		}

		for (const [eventName, handler] of Object.entries(this.internalHandlers)) {
			this.bindedElement.removeEventListener(eventName, handler);
			this.bindedElement.addEventListener(eventName, handler);
		}
	}

	getValue() {
		return this.value;
	}

	setValue(value, options = {}) {
		const safeValue = this.normalizeValue(value);
		const previousValue = this.value;

		this.value = safeValue;
		//this.syncDomWithState();

		if (options.emitInput === true && previousValue !== this.value) {
			this.emitNativeEvent('input');
			this.event(CustomInput.onInputEvent, this.value, this);
		}
		if (options.emitChange === true && previousValue !== this.value) {
			this.emitNativeEvent('change');
			this.event(CustomInput.onChangeEvent, this.value, this);
		}

		return this;
	}

	setDefaultValue(value) {
		this.defaultValue = this.normalizeValue(value);
		return this;
	}

	reset() {
		return this.setValue(this.defaultValue, {emitInput: true, emitChange: true});
	}

	clearContent() {
        super.clearContent();
		this.setValue('', {emitChange: true});;
		return this;
	}

	focus() {
		if (this.bindedElement) {
			this.bindedElement.focus();
		}
		return this;
	}

	blur() {
		if (this.bindedElement) {
			this.bindedElement.blur();
		}
		return this;
	}

	select() {
		return this.setSelectionRange(0, this.value.length);
	}

	setSelectionRange(start, end = start) {
		if (!this.bindedElement) {
			this.lastSelectionStart = this.clampIndex(start);
			this.lastSelectionEnd = this.clampIndex(end);
			return this;
		}

		const safeStart = this.clampIndex(Math.min(start, end));
		const safeEnd = this.clampIndex(Math.max(start, end));
		const selection = window.getSelection();
		if (!selection) {
			return this;
		}

		this.bindedElement.focus();

		if (this.isShowingPlaceholder) {
			this.hidePlaceholder();
		}

		const range = document.createRange();
		const textNode = this.ensureTextNode();
		if (textNode) {
			range.setStart(textNode, safeStart);
			range.setEnd(textNode, safeEnd);
		} else {
			range.setStart(this.bindedElement, 0);
			range.setEnd(this.bindedElement, 0);
		}
		selection.removeAllRanges();
		selection.addRange(range);

		this.lastSelectionStart = safeStart;
		this.lastSelectionEnd = safeEnd;
		return this;
	}

	getSelectionStart() {
		this.updateSelectionCache();
		return this.lastSelectionStart;
	}

	getSelectionEnd() {
		this.updateSelectionCache();
		return this.lastSelectionEnd;
	}

	handleFocus(e) {
		this.hasFocus = true;
		this.focusedStartValue = this.value;
		if (this.isShowingPlaceholder) {
			this.hidePlaceholder();
			this.setSelectionRange(0);
		}

		this.event(CustomInput.onFocusEvent, e, this);
	}

	handleBlur(e) {
		this.syncValueFromDom();
		this.hasFocus = false;
		this.updateSelectionCache();

		if (this.value !== this.focusedStartValue) {
			this.emitNativeEvent('change');
			this.event(CustomInput.onChangeEvent, this.value, this);
		}

		this.syncDomWithState();
		this.event(CustomInput.onBlurEvent, e, this);
	}

	handleInput(e) {
		if (!this.bindedElement) {
			return;
		}

		const changed = this.syncValueFromDom();

		if (changed) {
			this.event(CustomInput.onInputEvent, this.value, this);
		}

		this.updateSelectionCache();
		this.event(CustomInput.onSelectEvent, this.lastSelectionStart, this.lastSelectionEnd, this);
		this.syncDomWithState();

		if (e.inputType === 'insertParagraph') {
			this.emitNativeEvent('input');
		}
	}

	handleBeforeInput(e) {
		if (!this.bindedElement || !this.hasStaticContent()) {
			return;
		}

		const inputType = e.inputType || '';
		if (!inputType.startsWith('delete')) {
			return;
		}

		if (!this.selectionTouchesStaticContent()) {
			return;
		}

		e.preventDefault();

		const selectionStart = this.getSelectionStart();
		const selectionEnd = this.getSelectionEnd();
		let nextValue = this.value;
		let nextCaret = selectionStart;

		if (selectionStart !== selectionEnd) {
			nextValue = this.value.slice(0, selectionStart) + this.value.slice(selectionEnd);
		} else if (inputType === 'deleteContentBackward' && selectionStart > 0) {
			nextValue = this.value.slice(0, selectionStart - 1) + this.value.slice(selectionStart);
			nextCaret = selectionStart - 1;
		} else if (inputType === 'deleteContentForward' && selectionStart < this.value.length) {
			nextValue = this.value.slice(0, selectionStart) + this.value.slice(selectionStart + 1);
		}

		this.setValue(nextValue);
		this.syncDomWithState();
		this.setSelectionRange(nextCaret);
		this.emitNativeEvent('input');
	}

	syncValueFromDom() {
		if (!this.bindedElement) {
			return false;
		}

		const domText = this.normalizeValue(this.getEditableTextContent());
		const changed = domText !== this.value;
		this.value = domText;
		return changed;
	}

	handleKeyDown(e) {
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && this.hasStaticContent()) {
			e.preventDefault();
			this.setSelectionRange(0, this.value.length);
			return;
		}

		if (e.key === 'Enter') {
			e.preventDefault();
			return;
		}

		this.event(CustomInput.onKeyDownEvent, e, this);
	}

	handleKeyUp(e) {
		this.updateSelectionCache();
		this.emitSelectIfChanged();
		this.event(CustomInput.onKeyUpEvent, e, this);
	}

	emitSelectIfChanged() {
		const beforeStart = this.lastSelectionStart;
		const beforeEnd = this.lastSelectionEnd;
		this.updateSelectionCache();

		if (beforeStart !== this.lastSelectionStart || beforeEnd !== this.lastSelectionEnd) {
			this.event(CustomInput.onSelectEvent, this.lastSelectionStart, this.lastSelectionEnd, this);
			this.emitNativeEvent('select');
		}
	}

	syncDomWithState() {
		if (!this.bindedElement) {
			return;
		}
		let placeholder = this.getAttribute('placeholder') || '';
		if (!this.hasFocus && this.value.length === 0 && placeholder.length > 0) {
			this.showPlaceholder();
			return;
		}

		if (this.isShowingPlaceholder) {
			this.hidePlaceholder();
		}

		const textNode = this.ensureTextNode();
		if (textNode && textNode.textContent !== this.value) {
			textNode.textContent = this.value;
		}
	}

	showPlaceholder() {
		this.hidePlaceholder();
		this.isShowingPlaceholder = true;
		return this.addContent(this.placeholder.setContent(this.getAttribute('placeholder') || ''), 'placeholder');
	}

	hidePlaceholder() {
		this.isShowingPlaceholder = false;
		return this.removeContent('placeholder');
	}

	ensureTextNode() {
		if (!this.bindedElement) {
			return null;
		}

		const walker = document.createTreeWalker(this.bindedElement, NodeFilter.SHOW_TEXT, {
			acceptNode: (node) => this.isStaticNode(node)
				? NodeFilter.FILTER_REJECT
				: NodeFilter.FILTER_ACCEPT,
		});
		const existingTextNode = walker.nextNode();
		if (existingTextNode) {
			return existingTextNode;
		}

		if (!this.bindedElement.firstChild) {
			const textNode = document.createTextNode(this.value);
			this.bindedElement.appendChild(textNode);
			return textNode;
		}

		const textNode = document.createTextNode(this.value);
		this.bindedElement.appendChild(textNode);
		return textNode;
	}

	updateSelectionCache() {
		if (!this.bindedElement || !this.hasFocus || this.isShowingPlaceholder) {
			this.lastSelectionStart = 0;
			this.lastSelectionEnd = 0;
			return;
		}

		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) {
			return;
		}

		const range = selection.getRangeAt(0);
		if (!this.bindedElement.contains(range.startContainer) || !this.bindedElement.contains(range.endContainer)) {
			return;
		}

		const start = this.offsetFromNode(range.startContainer, range.startOffset);
		const end = this.offsetFromNode(range.endContainer, range.endOffset);

		this.lastSelectionStart = this.clampIndex(Math.min(start, end));
		this.lastSelectionEnd = this.clampIndex(Math.max(start, end));
	}

	offsetFromNode(node, offset) {
		if (!this.bindedElement) {
			return 0;
		}

		const walker = document.createTreeWalker(this.bindedElement, NodeFilter.SHOW_TEXT, {
			acceptNode: (currentNode) => this.isStaticNode(currentNode)
				? NodeFilter.FILTER_REJECT
				: NodeFilter.FILTER_ACCEPT,
		});
		let total = 0;
		let current = walker.nextNode();

		while (current) {
			if (current === node) {
				return total + offset;
			}
			total += current.textContent.length;
			current = walker.nextNode();
		}

		return this.value.length;
	}

	getEditableTextContent() {
		if (!this.bindedElement) {
			return '';
		}

		const walker = document.createTreeWalker(this.bindedElement, NodeFilter.SHOW_TEXT, {
			acceptNode: (node) => this.isStaticNode(node)
				? NodeFilter.FILTER_REJECT
				: NodeFilter.FILTER_ACCEPT,
		});

		let text = '';
		let current = walker.nextNode();
		while (current) {
			text += current.textContent || '';
			current = walker.nextNode();
		}

		return text;
	}

	isStaticNode(node) {
		let current = node;
		while (current && current !== this.bindedElement) {
			if (current.nodeType === Node.ELEMENT_NODE && current.getAttribute('data-static-content') === 'true') {
				return true;
			}
			current = current.parentNode;
		}

		return false;
	}

	hasStaticContent() {
		if (!this.bindedElement) {
			return false;
		}

		return this.bindedElement.querySelector('[data-static-content="true"]') !== null;
	}

	selectionTouchesStaticContent() {
		if (!this.bindedElement) {
			return false;
		}

		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) {
			return false;
		}

		const range = selection.getRangeAt(0);
		for (const staticNode of this.bindedElement.querySelectorAll('[data-static-content="true"]')) {
			if (range.intersectsNode(staticNode)) {
				return true;
			}
		}

		return false;
	}

	clampIndex(index) {
		const parsed = Number.isFinite(index) ? index : 0;
		return Math.max(0, Math.min(this.value.length, parsed));
	}

	normalizeValue(value) {
		return String(value ?? '').replace(/\r\n?/g, '\n').replace(/\n/g, ' ');
	}

	emitNativeEvent(eventName) {
		if (!this.bindedElement) {
			return;
		}

		this.bindedElement.dispatchEvent(new Event(eventName, {bubbles: true}));
	}

	/**
	 * Add content that cannot be edited by the user, such as a placeholder or a reply tag.
	 * @param {Element|string} content 
	 */
	addStaticContent(content, key = null, index = null){
		if(typeof content === 'string'){
			content = new Element().addContent(content);
		}

		const wrapper = new Element('span')
			.setAttribute('contenteditable', 'false')
			.setAttribute('data-static-content', 'true')
			.addClass('inline-flex items-center')
			.addContent(content)
			.addContent(new Element('span').setAttribute('aria-hidden', 'true').addContent('&nbsp;'));

		return this.addContent(wrapper, key, index);
	}
	/*
	 * Clear static content added with addStaticContent. Does not clear the user's input.
	 * @param {Element|string} content 
	 */
	setStaticContent(content, key = null){
		this.clearContent();
		return this.addStaticContent(content, key);
	}
}
