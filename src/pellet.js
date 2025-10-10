import Sprite from "./sprite";

export default class Pellet extends Sprite {    
    constructor( {powered, x, y, size }) {
        super( {x, y, size })   
        this.size = this.size;
        this.powered = powered
        this.eaten = false
    }  

    get radius() 
    {
        return this.size * (this.powered ? .22 : .11);
    }
    
    munch() {
        this.eaten = true;
        return this.powered == true ? 50 : 10;
    }

    draw( ctx ) {
        if( this.eaten == true ) return;

        ctx.beginPath()
        ctx.arc( 
            this.position.x, 
            this.position.y, 
            this.radius, 
            0, 
            Math.PI * 2 )
        ctx.fillStyle = this.powered ? '#FFC5CB' : 'white'
        ctx.fill()
        ctx.closePath()
    }
}