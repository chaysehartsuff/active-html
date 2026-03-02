import Element from '../Element.js';
import Path from '../Path.js';

/**
 * A simple SVG icon for a plus sign
 */
export default class LeftAlignIcon extends Element {

    rootTag = 'svg';

    constructor() {
        super();
        this.addClass('w-full');
        this.addAttribute('viewBox', '0 0 24 24');
        this.addAttribute('fill', 'none');
        let path = new Path();
        path.addAttribute('d', "M0 30.016h20v-4h-20v4zM0 22.016h28v-4h-28v4zM0 14.016h24v-4h-24v4zM0 6.016h32v-4h-32v4z");
        path.addAttribute('fill', 'currentColor');
        this.addContent(path);
    }
}