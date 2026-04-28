import Element from '../Element.js';
import Path from '../Path.js';

/**
 * A simple SVG icon for reply actions.
 */
export default class ReplyIcon extends Element {

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

		const arrowHead = new Path();
		arrowHead.addAttribute('d', 'm9 17-5-5 5-5');

		const arrowBody = new Path();
		arrowBody.addAttribute('d', 'M4 12h10a6 6 0 0 1 6 6v1');

		this.addContent(arrowHead);
		this.addContent(arrowBody);
	}
}
