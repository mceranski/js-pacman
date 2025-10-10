import Ghost from './ghost.js';
import Utils from './utils.js';
import Config from './config.js';

export default class IntroScreen {
    constructor(game) {
        this.game = game;
        this.animationSequence = 0;
        this.startButton = null;

        this.ghosts = Ghost.Characters.map( (x, index) => 
            new Ghost( { name: x.name, screen: this, size: Config.TileSize, x: (Config.TileSize*1.1) * (index+1), y: -100} )
        );
    }

    async draw(ctx) {                    
        var dimensions = Utils.drawScaledImage({ ctx, image: Config.Banner, x: 0, y: 20 } );    
        var yStart = dimensions.height + (Config.TileSize*1.5);        

        this.drawGhosts( ctx, yStart );
        yStart += (Config.TileSize * 2.5)

        var measurement = Utils.measureText({ctx, text: "A"});            
        let textHeight = measurement.fontBoundingBoxAscent + measurement.fontBoundingBoxDescent; 
        this.game.keys.forEach( key => {                 
            var text = key.printHelp();        
            Utils.writeText({ ctx, text, x: 10, y: yStart });                               
            yStart += textHeight * 1.1;
        })
        
        yStart += textHeight*2;         
        Utils.writeText({ ctx, text: "Developed by Michael Ceranski", color: 'aqua', x: 10, y: yStart })        
        yStart += textHeight*2;         
        this.startButton = Utils.createButton({ ctx, text: "Start", x: 10, y: yStart});

        this.animationSequence++;
        if( this.animationSequence > 30 ) this.animationSequence = 0;
    }

    handleMouseClick( game, mousePosition ) {                
        let button = this.startButton;
        if (mousePosition.x > button.rect.x && mousePosition.x < button.rect.x + button.rect.width &&
            mousePosition.y > button.rect.y && mousePosition.y < button.rect.y + button.rect.height) {
            game.start();
        }
    }

    drawGhosts( ctx, y ){    
        this.ghosts.forEach( (ghost,idx) => {
            if( ghost.position.y < 0 )
                ghost.position.y = y;
            
            if( ghost.position.x > Config.Bounds.x2 || ghost.position.x < 0 ) {
                ghost.position.x = 0;
                ghost.position.y = y;
            }

            var velocity = {x: 0, y: 0};
            velocity.x += 1;

            //animate ghosts in a wave pattern
            if( (idx+1)%2 == 0 ) velocity.y += this.animationSequence < 15 ? 2 : -2;
            else velocity.y += this.animationSequence < 15 ? -2 : 2;
            
            ghost.move(velocity.x, velocity.y);
            ghost.draw(ctx);
        } );
    }
}
