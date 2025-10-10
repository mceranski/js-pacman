import Sprite from './sprite.js';
import Utils from './utils.js';

export default class Tile extends Sprite {    
    static spriteImage = Utils.createImage('map_sprites');
     
    static Symbols = [         
        { code: 'b', name: 'block' },
        { code: '_', name: 'cap_bottom' },  
        { code: '[', name: 'cap_left' },        
        { code: ']', name: 'cap_right' },   
        { code: '^', name: 'cap_top' },
        { code: '7', name: 'pipe_bottom' },        
        { code: '1', name: 'pipe_corner1' },
        { code: '2', name: 'pipe_corner2' },        
        { code: '3', name: 'pipe_corner3' },        
        { code: '4', name: 'pipe_corner4', },        
        { code: '+', name: 'pipe_cross' },
        { code: 'd', name: 'pipe_down'},        
        { code: '-', name: 'pipe_horizontal' },
        { code: '8', name: 'pipe_left' },
        { code: '6', name: 'pipe_right' },        
        { code: '5', name: 'pipe_top' },
        { code: '|', name: 'pipe_vertical' },
        { code: '<', name: 'portal_left' },
        { code: '>', name: 'portal_right' }
    ];

    constructor( {symbol, size, x, y }) {
        super({size, x, y})
        this.symbol = symbol      
        this.type = "tile"
        this.id = null;               
        this.spriteIndex = Tile.Symbols.findIndex(x => x.code == symbol );                       
        if( this.spriteIndex > -1 ) {     
            this.type = (symbol == '<' || symbol == '>') ? "portal" : "boundary"
        }                
    }

    draw( ctx ) {
        if( this.spriteIndex < 0 ) return;
        var x = this.position.x-this.size/2;
        var y = this.position.y-this.size/2;

        ctx.drawImage( 
            Tile.spriteImage, //sprite image 
            this.spriteIndex*40, //x for upper left corner of sprite
            0, //y for upper left corner of sprite
            40, //width based on sprite size
            40, //height based on sprite size
            x,
            y,
            this.size,
            this.size )
    }
}