import Element from '../Element.js';
import Path from '../Path.js';

/**
 * A simple success icon (check inside a circle).
 */
export default class SuccessIcon extends Element {

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

		const check = new Path();
		check.addAttribute('d', 'M8 12.5L11 15.5L16 9.5');

		this.addContent(circle);
		this.addContent(check);
	}
}
