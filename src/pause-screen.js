import Utils from './utils.js';
import Config from './config.js';

export default class PauseScreen {
    constructor(game) {
        this.game = game;
    }

    async draw(ctx) {                    
        var dimensions = Utils.drawScaledImage({ ctx, image: Config.Banner, x: 0, y: 20 } );    
        var yStart = dimensions.height + (Config.TileSize*2);

        var measurement = Utils.measureHeader({ctx, text: "Wy"});
        Utils.writeHeader({ctx, text: "The game has been paused!", color: 'cyan', x: 10, y: yStart});
        yStart += (4 * (measurement.fontBoundingBoxAscent + measurement.fontBoundingBoxDescent))

        measurement = Utils.measureText({ctx, text: "Wy"});            
        let textHeight = measurement.fontBoundingBoxAscent + measurement.fontBoundingBoxDescent; 
        this.game.keys.forEach( key => {                 
            var text = key.printHelp();        
            Utils.writeText({ ctx, text, x: 10, y: yStart });                               
            yStart += textHeight * 1.1;
        })        
    }
}
