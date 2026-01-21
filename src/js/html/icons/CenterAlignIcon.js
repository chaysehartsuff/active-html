import Element from '../Element.js';
import Path from '../Path.js';

/**
 * A simple SVG icon for a plus sign
 */
export default class CenterAlignIcon extends Element {

    rootTag = 'svg';

    constructor() {
        super();
        this.addClass('w-full');
        this.addProperty('viewBox', '0 0 24 24');
        this.addProperty('fill', 'none');
        let path = new Path();
        path.addProperty('d', "M0 6.016h32v-4h-32v4zM2.016 22.016h28v-4h-28v4zM4 14.016h24v-4h-24v4zM6.016 30.016h20v-4h-20v4z");
        path.addProperty('fill', 'currentColor');
        this.addContent(path);
    }
}