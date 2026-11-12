import Element from '../Element.js';
import Path from '../Path.js';

/**
 * A simple error icon (x inside a circle).
 */
export default class ErrorIcon extends Element {

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

		const circle = new Path();
		circle.addAttribute('d', 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0');

		const x = new Path();
		x.addAttribute('d', 'M9 9L15 15M15 9L9 15');

		this.addContent(circle);
		this.addContent(x);
	}
}
