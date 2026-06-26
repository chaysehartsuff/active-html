import Element from '../Element.js';
import Path from '../Path.js';

/**
 * A simple SVG icon for an x mark
 */
export default class XMarkIcon extends Element {

	rootTag = 'svg';

	constructor() {
		super();
		this.addClass('w-full');
		this.addAttribute('viewBox', '0 0 24 24');
		this.addAttribute('fill', 'none');
		this.addAttribute('stroke', 'currentColor');
		this.addAttribute('stroke-width', '2');
		this.addAttribute('stroke-linecap', 'round');
		this.addAttribute('stroke-linejoin', 'round');

		let path = new Path();
		path.addAttribute('d', 'M6 6L18 18M18 6L6 18');
		this.addContent(path);
	}
}
