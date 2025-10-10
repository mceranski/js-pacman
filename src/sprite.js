export default class Sprite {    
    constructor( {x, y, size} ) {
        this.size = size;
        this.position = { x: x, y: y } 
        this.velocity = { x: 0, y: 0 }     
    }

    initPosition({ rowIndex: rowIndex, colIndex: colIndex, yOffset: yOffset, xOffset: xOffset }) {
        this.position = { 
            x: colIndex * this.size + (this.size/2) + (xOffset || 0),
            y: rowIndex * this.size + (this.size/2) + (yOffset || 0)
        }        
    }

    move( x, y ) {
        this.position.x += x || 0;
        this.position.y += y || 0;
    }
}