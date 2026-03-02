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
        this.addAttribute('viewBox', '0 0 24 24');
        this.addAttribute('fill', 'none');
        this.addAttribute('stroke', 'currentColor');
        this.addAttribute('stroke-width', '2');
        this.addAttribute('stroke-linecap', 'round');
        this.addAttribute('stroke-linejoin', 'round');

        let path = new Path();
        path.addAttribute('d', "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z");
        this.addContent(path);
    }
}