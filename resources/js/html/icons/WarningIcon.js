import Element from '../Element.js';
import Path from '../Path.js';

/**
 * A simple warning icon (exclamation inside a triangle).
 */
export default class WarningIcon extends Element {

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

		const triangle = new Path();
		triangle.addAttribute('d', 'M12 3L2 21H22L12 3Z');

		const stem = new Path();
		stem.addAttribute('d', 'M12 9V13');

		const dot = new Path();
		dot.addAttribute('d', 'M12 17h.01');

		this.addContent(triangle);
		this.addContent(stem);
		this.addContent(dot);
	}
}
