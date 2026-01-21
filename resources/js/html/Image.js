import Element from './Element.js';

export default class Image extends Element {
    rootTag = 'img';


    constructor(src = null){
        super();
        
        if(src){
            this.setAttribute('src', src);
        }
    }
}