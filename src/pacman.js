import Sprite from './sprite.js';

export default class Pacman extends Sprite {    
    constructor({ x, y, size }) 
    {        
        super({x, y, size })   
        this.radians = .75
        this.openRate = .12
        this.rotation = 0
        this.startPosition = { x: x, y: y };
        this.dead = false
    }

    initPosition( { rowIndex, colIndex, yOffset } ) {
        super.initPosition({ rowIndex, colIndex, yOffset });
        this.startPosition = { ...this.position };
    }

    get radius() {
        return (this.size/2) * .85;
    }

    die() {        
        if( this.dead == true ) return;
        this.dead = true            
    }

    revive() {
        this.dead = false;
        this.position.x = this.startPosition.x;
        this.position.y = this.startPosition.y; 
    }

    draw(ctx) {      
        if( this.dead == true ) return;
        ctx.save()        
        //this rotates the image based on the direction we are moving
        ctx.translate( this.position.x, this.position.y )
        ctx.rotate( this.rotation );
        ctx.translate(-this.position.x, -this.position.y);

        //draw the circle with the pie removed
        ctx.beginPath()
        ctx.arc( 
            this.position.x, 
            this.position.y, 
            this.radius, 
            this.radians, 
            Math.PI * 2 - this.radians )
        ctx.lineTo( this.position.x, this.position.y )
        ctx.fillStyle = 'yellow'
        ctx.fill()
        ctx.closePath()
        ctx.restore() 
    }
    
    move( x, y) {  
        if( this.dead == true ) return;
        if( x && x > 0 ) this.rotation = 0;
        if( x && x < 0 ) this.rotation = Math.PI;
        if( y && y > 0 ) this.rotation = Math.PI / 2;
        if( y && y < 0 ) this.rotation = Math.PI * 1.5;
    
        if( this.radians < 0 || this.radians > .75 ) 
            this.openRate = -this.openRate;
        this.radians += this.openRate;               
        
        super.move(x,y);
    }
}