import Element from '../Element.js';
import Path from '../Path.js';

/**
 * A simple SVG icon for a folder
 */
export default class FolderIcon extends Element {

    rootTag = 'svg';

    constructor() {
        super();
        this.addClass('w-full');
        this.addProperty('viewBox', '0 0 24 24');
        this.addProperty('fill', 'none');
        this.addProperty('stroke', 'currentColor');
        this.addProperty('stroke-width', '2');
        this.addProperty('stroke-linecap', 'round');
        this.addProperty('stroke-linejoin', 'round');

        let path = new Path();
        path.addProperty('d', "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z");
        this.addContent(path);
    }
}