import Element from '../Element.js';
import Path from '../Path.js';

/**
 * A simple SVG icon for a plus sign
 */
export default class RightAlignIcon extends Element {

    rootTag = 'svg';

    constructor() {
        super();
        this.addClass('w-full');
        this.addProperty('viewBox', '0 0 24 24');
        this.addProperty('fill', 'none');
        let path = new Path();
        path.addProperty('d', "M0 6.016v-4h32v4h-32zM4 22.016v-4h28v4h-28zM8 14.016v-4h24v4h-24zM12 30.016v-4h20v4h-20z");
        path.addProperty('fill', 'currentColor');
        this.addContent(path);
    }
}