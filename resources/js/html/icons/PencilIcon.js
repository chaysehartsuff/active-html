
import Element from '../Element.js';
import Path from '../Path.js';

/**
 * A simple SVG icon for a pencil
 */
export default class PencilIcon extends Element {

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
        path.addAttribute('d', "M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z");
        this.addContent(path);
    }
}
