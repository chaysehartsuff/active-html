import Element from '../Element.js';
import Path from '../Path.js';

/**
 * The classic three-dot quick action menu icon
 */
export default class ThreeDotsIcon extends Element {

    rootTag = 'svg';

    constructor() {
        super();
        this.addClass('w-full');
        this.addAttribute('viewBox', '0 0 24 24');
        this.addAttribute('fill', 'currentColor'); // Changed from 'none' to 'currentColor'
        let path = new Path();
        // This path creates three horizontal dots centered in the 24x24 viewbox
        path.addAttribute('d', "M4 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm6 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm6 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0z");
        this.addContent(path);
    }
}