import Element from '../Element.js';
import Path from '../Path.js';

/**
 * A simple SVG icon for a trash
 */
export default class TrashIcon extends Element {

    rootTag = 'svg';

    constructor() {
        super();
        this.addClass('w-full');
        this.addAttribute('viewBox', '0 0 24 24');
        this.addAttribute('fill', 'currentColor'); // Set fill on the SVG element

        // Path for the lid
        const lidPath = new Path();
        lidPath.addAttribute('d', 'M20 6h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v1H4c-.55 0-1 .45-1 1s.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1z');
        this.addContent(lidPath);

        // Path for the can body (as vertical slats)
        const bodyPath1 = new Path();
        bodyPath1.addAttribute('d', 'M6 9v11c0 .55.45 1 1 1h2V9H6z');
        this.addContent(bodyPath1);

        const bodyPath2 = new Path();
        bodyPath2.addAttribute('d', 'M11 9v12h2V9h-2z');
        this.addContent(bodyPath2);

        const bodyPath3 = new Path();
        bodyPath3.addAttribute('d', 'M15 9v11c0 .55.45 1 1 1h2V9h-3z');
        this.addContent(bodyPath3);

        // Path for the bottom base of the can
        const basePath = new Path();
        basePath.addAttribute('d', 'M6 20c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-1H6v1z');
        this.addContent(basePath);
    }
}