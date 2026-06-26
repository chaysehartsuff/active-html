import Element from '../Element.js';
import Path from '../Path.js';

/**
 * A simple SVG icon for a check mark
 */
export default class CheckMarkIcon extends Element {

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
		path.addAttribute('d', 'M5 13L9 17L19 7');
		this.addContent(path);
	}
}
