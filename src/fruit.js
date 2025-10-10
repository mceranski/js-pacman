import Sprite from './sprite.js';
import Utils from './utils.js';

export default class Fruit extends Sprite {    
    static spriteImage = Utils.createImage('fruit_sprites');

    static FruitTypes = [ 
        { name: 'cherry', points: 100 },
        { name: 'strawberry', points: 300 },
        { name: 'orange', points: 500 },
        { name: 'apple', points : 700 },
        { name: 'melon', points: 1000 },
        { name: 'galaxian', points: 2000 },
        { name: 'bell', points: 3000 },
        { name: 'key', points: 5000 },
    ];

    constructor({x, y, size }) 
    {        
        super({x, y, size});    
        this.index = 0;
        this.lastLevelShown = 0;
        this.displayUntil = null;
    }
    
    munch() {
        this.reset();
        return Fruit.FruitTypes[this.index].points;
    }

    isEdible() {
        return this.displayUntil != null;
    }

    getIndex( level ) {
        if( level < (Fruit.FruitTypes.length*2+1) ) 
                return ((level-1) % Fruit.FruitTypes.length)
        else
            return Fruit.FruitTypes.length-1;
    }

    activate( level ) {
        this.index = this.getIndex(level);
        this.displayUntil = Utils.getXSecondsFromNow(10);  
        this.lastLevelShown = level;    
    }

    reset() {
        this.displayUntil = null;
    }

    draw(ctx) {                        
        var size = this.size * .95;                
        ctx.drawImage( 
            Fruit.spriteImage,
            this.index*56,
            0,
            56,
            56,
            this.position.x-size/2, 
            this.position.y-size/2, 
            size, 
            size );
    }
}