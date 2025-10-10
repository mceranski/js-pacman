import Utils from './utils.js';
import Config from './config.js';
import Ghost from './ghost.js';
import Pacman from './pacman.js';
import Pellet from './pellet.js';
import Tile from './tile.js';
import Fruit from './fruit.js';

export default class MainScreen {        
    constructor( game ) {                    
        this._score = 0;
        this.soundFx = game.soundFx;
        this.pacman = null
        this.tiles = []
        this.pellets = []
        this.level = 0;
        this.pelletsEaten = 0;
        this.ghosts = []
        this.ghostHomes = [];
        this.notReadyTil = null;        
        this.fruit = null;        
        this.reset();
    }

    get score() {
        return this._score;
    }

    set score(value) {
        const lifeInterval = 10000;

        if( value > lifeInterval ) {
            var addLifeAt = Math.ceil(this._score / lifeInterval) * lifeInterval;
            if( value >= addLifeAt ) { //add an extra life every 10000 points
                this.lives += 1;
                this.soundFx.extraLife();
            }
        }

        this._score = value;
    }

    isGhostHome(ghost) {
        var collisions = this.ghostHomes.filter(x => Utils.doesCollide({ sprite1: x, sprite2: ghost }));
        return collisions.length > 0;
    }

    isBoundary(tile, sprite) {
        if( sprite instanceof Ghost ){
            if( sprite.dead == false && !this.isGhostHome(sprite) ) return (tile.type == "boundary" || tile.type == "ghosthome");            
            //if the ghost is alive and not in home, then we do not allow it in a boundary or ghosthome tile
            return (tile.type == "boundary");
        }

        if( sprite instanceof Pacman )
            return tile.type == "boundary" || tile.type == "ghosthome";

        return false;
    }
    
    getDistanceToBoundary(sprite, x,y) {
        var tilesAhead = [];
        var boundaries = this.tiles.filter( tile => this.isBoundary(tile, sprite) );
        var tileSize = Config.TileSize;

        if( x > 0 ) { //moving east
            tilesAhead = boundaries.filter( tile => tile.position.x > sprite.position.x 
                && Math.abs(tile.position.y - sprite.position.y) < tileSize/2 )
                //get distance between western most point of tile and eastern most point of sprite
                .map( tile => ({ distance: Math.abs((tile.position.x-tileSize/2) - (sprite.position.x+sprite.size/2)), tile: tile }));
        }    
        if( x < 0 ) { //moving west
            tilesAhead = boundaries.filter( tile => tile.position.x < sprite.position.x 
                    && Math.abs(tile.position.y - sprite.position.y) < tileSize /2 )
                    //get distance between eastern most point of tile and western most point of sprite
                    .map( tile => ({ distance: Math.abs((tile.position.x+tileSize/2) - (sprite.position.x-sprite.size/2)), tile: tile }));
        }
        if( y > 0 ) { //moving south
            tilesAhead = boundaries.filter( tile => tile.position.y > sprite.position.y 
                    && Math.abs(tile.position.x - sprite.position.x) < tileSize /2 )
                    //get distance between north most point of tile and southern most point of sprite
                    .map( tile => ({ distance: Math.abs((tile.position.y-tileSize/2) - (sprite.position.y+sprite.size/2)), tile: tile }));
        }
        if( y < 0 ) { //moving north
            tilesAhead = boundaries.filter( tile => tile.position.y < sprite.position.y 
                    && Math.abs(tile.position.x - sprite.position.x) < tileSize /2 )
                    //get distance between southern most point of tile and northern most point of sprite
                    .map( tile => ({ distance: Math.abs((tile.position.y+tileSize/2) - (sprite.position.y-sprite.size/2)), tile: tile }));
        }

        //changed this from -1 to tileSize so ghost would go through portal
        if( tilesAhead.length == 0 ) return tileSize;
        var maxStep = tilesAhead.sort((a,b) => a.distance - b.distance);
        return maxStep[0].distance;
    }
    
    reset() {            
        this.score = 0
        this.lives = 3;
        this.level = 0;
        this.levelUp();
    }

    levelUp() {
        this.level += 1;
        this.killCounter = 0;
        this.initMap()
        
        this.ghosts = Ghost.Characters.map( x=> new Ghost( { name: x.name, size: Config.TileSize } ));
        
        this.pelletsEaten = 0;
        this.fruit.reset();      
        this.getReady();
        
        if( this.level == 1 ) 
           this.soundFx.startGame()
        else 
           this.soundFx.intermission()
    }

    initMap() {        
        this.tiles = [];
        this.pellets = [];
        this.ghostHomes = [];

        var yStart = Config.HeaderHeight;

        for( var rowIndex = 0; rowIndex < Config.Map.length; rowIndex++) {
            var row = Config.Map[rowIndex];

            for( var colIndex = 0; colIndex < row.length; colIndex++)
            {   
                var symbol = row[colIndex] 

                //every block has a tile
                let tile = new Tile({ symbol: symbol, size: Config.TileSize })
                tile.initPosition({ rowIndex: rowIndex, colIndex: colIndex, yOffset: yStart });
                this.tiles.push( tile )

                if( symbol.startsWith("h")) {     
                    tile.type = "ghosthome";
                    this.ghostHomes.push( tile );
                }
                                              
                if( symbol == 'p') {
                    let pacman = new Pacman({screen: this, size: Config.TileSize});
                    pacman.initPosition({ rowIndex: rowIndex, colIndex: colIndex, yOffset: yStart });                    
                    this.pacman = pacman;                                                            
                }
                else if( symbol === '.' || symbol === "o" ){
                    //add pellets
                    let pellet = new Pellet({screen: this, powered: symbol === "o", size: Config.TileSize })
                    pellet.initPosition({ rowIndex: rowIndex, colIndex: colIndex, yOffset: yStart });
                    this.pellets.push( pellet );
                }                                
            }
        }

        var spawnPoint = this.getFruitSpawnPoint();
        this.fruit = new Fruit({ x: spawnPoint.x, y: spawnPoint.y, size: Config.TileSize });        
    }

    getFruitSpawnPoint() {
        var maxY = Math.max(...this.ghostHomes.map(x => x.position.y));
        var lowerTiles = this.ghostHomes.filter( x=> x.position.y == maxY );
        const middleIndex = Math.floor(lowerTiles.length / 2);      
        var middleTile = (lowerTiles.length % 2 === 0) ? (lowerTiles[middleIndex - 1] + lowerTiles[middleIndex]) / 2: lowerTiles[middleIndex];
        var position = {...middleTile.position};
        position.y += Config.TileSize;
        return position;
    }

    getGhostSpawnPoint( index ) {
        var tile = ( index >= 0 && this.ghostHomes[index] )
                ? this.ghostHomes[index]
                : this.ghostHomes[Utils.getRandomNumber(0, this.ghostHomes.length) - 1];
        return tile;
    }

    getReady() {
        //while time is less than notReadyTil, show the ready message
        this.notReadyTil = Utils.getXSecondsFromNow(3);
        this.ghosts.forEach( (ghost,index) => {                        
            var spawnPoint = this.getGhostSpawnPoint(index);
            ghost.spawn( spawnPoint );
        } );   
        this.pacman.revive();
    }

    checkPellets() {        
        for( var i = this.pellets.length-1; i >=0; i--)
        {
            var pellet = this.pellets[i];
            var munchable = pellet.eaten == false && Utils.doesCollide({ sprite1: pellet, sprite2: this.pacman})
            if( !munchable) continue;

            if( pellet.powered == true ) 
                this.soundFx.powerPellet();
            else
                this.soundFx.pellet();     

            this.score += pellet.munch();
            
            this.pelletsEaten += 1;            
            if( pellet.powered == true ) this.scareGhosts();
            this.pellets.splice(i,1)
        }

        if( this.pellets.length == 0 ) this.levelUp()
    }

    checkFruit() {
        if( !this.fruit || !this.fruit.isEdible() ) return;
        if( !Utils.doesCollide({ sprite1: this.fruit, sprite2: this.pacman})) return;
        this.score +=this.fruit.munch();    
        this.soundFx.fruitEaten();
    }
    
    movePacman( { x, y } ) {        
        if( !this.pacman ) return;        

        this.move({sprite: this.pacman, x: x, y :y });

        //check to see what we collided with!
        this.checkPellets();
        this.checkFruit();  
    }

    moveGhost( ghost ) {
        const findTargetTile = () => {
            if(ghost.dead) return ghost.homePosition;            
            
            var tiles = this.tiles.filter( t => !this.isBoundary(t, ghost) )
                .map( tile => ({ distance : Utils.getDistance(tile.position, this.pacman.position ), tile : tile }));
    
            if( ghost.targetTile != null )
                tiles = tiles.filter( x=> x != ghost.targetTile )

            if( ghost.scared == true ) 
                tiles = tiles.sort((a,b) => b.distance - a.distance);                            
            else
                tiles = tiles.sort((a,b) => a.distance - b.distance);
         
            //console.log(tiles[0].tile.position, tiles[0].tile.type);
            return tiles[0].tile;                    
        }
        
        const canMove = (x,y) => {
            var collisionTiles = this.getNearbyTiles(ghost)
                .filter( tile => this.isBoundary(tile, ghost) )
                .filter( tile => Utils.doesCollide({ sprite1: tile, sprite2: ghost, velocity2: {x: x, y: y}}) );
            return collisionTiles.length == 0;
        }
        
        if( ghost.targetTile == null )
            ghost.targetTile = findTargetTile();
        
        if( Utils.doesCollide({ sprite1: ghost.targetTile, sprite2: ghost }) ) {
            //revive ghost if dead
            if( ghost.dead && ghost.targetTile.type == "ghosthome" ) ghost.revive();
            ghost.targetTile = findTargetTile();            
        } 
        

        var velocity = { x: 0, y: 0 };
        //with each level the ghost moves 5% faster
        var stepSize = ghost.scared || ghost.dead ? 1 : ((Config.Speed*.75) + (this.level * .05));

        //setup variables to determine if the ghost can move in a certain direction
        const isTileNorth = ghost.targetTile.position.y < ghost.position.y;
        const isTileSouth = ghost.targetTile.position.y > ghost.position.y;
        const isTileEast = ghost.targetTile.position.x > ghost.position.x;
        const isTileWest = ghost.targetTile.position.x < ghost.position.x;
        var northDistance = this.getDistanceToBoundary(ghost, 0, -stepSize);
        var southDistance = this.getDistanceToBoundary(ghost, 0, stepSize);
        var eastDistance = this.getDistanceToBoundary(ghost, stepSize, 0);
        var westDistance = this.getDistanceToBoundary(ghost, -stepSize, 0);
        var maxStepNorth = Math.max(-northDistance,-stepSize);
        var maxStepSouth = Math.min(southDistance,stepSize);
        var maxStepEast = Math.min(eastDistance,stepSize);
        var maxStepWest = Math.max(-westDistance,-stepSize);
        var canMoveNorth = northDistance > 0 && canMove(0, maxStepNorth);
        var canMoveSouth = southDistance > 0 && canMove(0, maxStepSouth);
        var canMoveEast = eastDistance > 0 && canMove(maxStepEast, 0);
        var canMoveWest = westDistance > 0 && canMove(maxStepWest, 0);
        var wasMovingNorth = ghost.lastVelocity != null && ghost.lastVelocity.y < 0;
        var wasMovingSouth = ghost.lastVelocity != null && ghost.lastVelocity.y > 0;
        var wasMovingEast = ghost.lastVelocity != null && ghost.lastVelocity.x > 0;
        var wasMovingWest = ghost.lastVelocity != null && ghost.lastVelocity.x < 0;

        //summarize the directions to allow for sorting and filtering
        var directions = [
            { name:"North", should: isTileNorth, can: canMoveNorth, was: wasMovingNorth, wasOpposed: wasMovingSouth, x: 0, y: maxStepNorth },
            { name:"South", should: isTileSouth, can: canMoveSouth, was: wasMovingSouth, wasOpposed: wasMovingNorth, x: 0, y: maxStepSouth },
            { name:"East", should: isTileEast, can: canMoveEast, was: wasMovingEast, wasOpposed: wasMovingWest, x: maxStepEast, y: 0 },
            { name:"West", should: isTileWest, can: canMoveWest, was: wasMovingWest, wasOpposed: wasMovingEast, x: maxStepWest, y: 0 }
        ];

        //filter out blocked directions or ones with a very small step size
        var possibleDirections = directions
            .filter( x=> x.can && (Math.abs(x.x) + Math.abs(x.y) > (stepSize*.05)))
            //sort by not opposed, should and was
            .sort((a,b) =>
                (b.should - a.should)
                || (b.was - a.was));

        if( possibleDirections.length > 1)
            possibleDirections = possibleDirections.filter( x=> !x.wasOpposed );

        if( possibleDirections.length > 0 ) {
            //select the direction to move in
            var direction = possibleDirections[0];            

            velocity.x = direction.x;
            velocity.y = direction.y;
        
            //update the ghost's velocity and position
            this.move({ sprite: ghost, x: velocity.x, y: velocity.y });
            ghost.movesTowardsTarget++;
        }
    }

    drawGhosts(ctx) {
        this.ghosts.forEach( (ghost) => {                                    
            if(ghost.canMove()) {
                this.moveGhost(ghost);                            
                
                if( Utils.doesCollide({ sprite1: ghost, sprite2: this.pacman})){
                    if( ghost.scared == true && !ghost.dead ) {                
                        ghost.die();
                        this.soundFx.ghostEaten();
                        self.score += (200 + (400*self.killCounter));              
                        self.killCounter++;
                    }
    
                    if( !ghost.scared && !ghost.dead && !this.pacman.dead ) {
                        this.pacman.die()
                        this.lives -= 1;
                        this.soundFx.dead();
                        
                        if( this.lives > 0 ) this.getReady();                  
                    }
                }                
            }
            ghost.checkTimers();
            ghost.draw(ctx);
        })
    }

    getNearbyTiles(sprite){
        var maxOffset = Config.TileSize * 1.5;
        return this.tiles.filter( tile => (Math.abs(tile.position.x - sprite.position.x) <= maxOffset)
                                    && (Math.abs(tile.position.y - sprite.position.y) <= maxOffset));
    }

    scareGhosts() {
        this.killCounter = 0;        
        this.soundFx.siren();
        this.ghosts.forEach( ghost => ghost.scare(9) )        
    }    

    isOutsideMap( sprite )  {        
        if( sprite.position.x < 0 || sprite.position.y < 0 ) return true;
        var collisions = this.tiles.filter( tile => Utils.doesCollide({ sprite1: sprite, sprite2: tile }));
        return collisions.length == 0;
    }

    isReady() {
        return this.notReadyTil == null 
        || (this.notReadyTil != null && new Date() >= this.notReadyTil)
    }
    
    move( { sprite, x, y } ) {  
        var velocity = { x: x || 0, y : y || 0  };  

        var collisions = this.tiles
            .filter( tile => this.isBoundary(tile, sprite) )
            .filter( tile => Utils.doesCollide({ sprite1: tile, sprite2: sprite, velocity2 : velocity }));

        if( collisions.length > 0 ) return;

        sprite.move(velocity.x, velocity.y); 

        if( this.isOutsideMap(sprite))            
            this.teleport(sprite)
    }

    teleport( sprite ) {
        //you are outside the map because you went through a portal
        var portals = this.tiles
            .filter( t => t.type == "portal")
            .map( (t) => { return { tile: t, distance: Utils.getDistance(t.position, sprite.position)}});
    
        if( portals.length >= 2 ) {
            //find the portal furthest away
            var sorted = portals.sort((a,b) => a.distance - b.distance)     
            var target = sorted[portals.length-1].tile.position     

            let x = target.x
            let y = target.y

            sprite.position.x = x;
            sprite.position.y = y;
        }            
    }

    draw(ctx) 
    {                         
        var textMetrics = Utils.measureHeader({ctx, text :`Lives: ${this.lives}`})
        let fontHeight = textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent;  
        var yStart = Config.HeaderHeight - (fontHeight/2);
        Utils.writeHeader({ ctx, text: `Level ${this.level}`, x: 0, y: yStart})  

        var textMetrics = Utils.measureHeader({ctx, text :`Lives: ${this.lives}`})
        Utils.writeHeader({ ctx, text: `Lives: ${this.lives}`, x: (Config.Bounds.x2/2) - (textMetrics.width/2), y: yStart })                        

        textMetrics = Utils.measureHeader({ctx, text: `Score: ${this.score}`})
        Utils.writeHeader({ ctx, text: `Score: ${this.score}`, x: Config.Bounds.x2-textMetrics.width, y: yStart})    

        if (!this.isReady()) this.drawBanner(ctx,"Ready!")
        if(this.lives == 0) this.drawBanner(ctx,"Game Over!")        
        
        this.drawGhostHomes(ctx);        
        this.pellets.forEach(x=> x.draw(ctx));
        this.tiles.forEach(x => x.draw(ctx)); 
        
        this.drawGhosts(ctx)        
        this.pacman.draw(ctx);       
        this.drawFruit(ctx);
    }

    handleKeyPresses( keys ) {        
        if( !this.isReady()) return;
        
        keys.forEach( x=> {
            if( x.name == "up") this.movePacman({y: -Config.Speed});                            
            if( x.name == "down") this.movePacman({y: Config.Speed});            
            if( x.name == "left") this.movePacman({x: -Config.Speed});            
            if( x.name == "right") this.movePacman({x: Config.Speed});
        });   
    }

    drawFruit(ctx) {        
        if( this.fruit.displayUntil == null && this.fruit.lastLevelShown < this.level ) {            
            //only display the fruit when at least 50% of the pellets are eaten
            if( this.pellets.length < this.pelletsEaten ) this.fruit.activate(this.level);      
        }

        if (this.fruit.displayUntil != null && (new Date() >= this.fruit.displayUntil)) {
            //hide the fruit
            this.fruit.reset();        
        }
        
        //only draw the fruit when its activated            
        if( this.fruit.displayUntil != null )
            this.fruit.draw(ctx);         
    }

    drawGhostHomes(ctx) {
        var minX = this.ghostHomes.sort((a,b) => a.position.x - b.position.x)[0];
        var maxX = this.ghostHomes.sort((a,b) => b.position.x - a.position.x)[0];
        
        var minY = this.ghostHomes.sort((a,b) => a.position.y - b.position.y)[0];
        var maxY = this.ghostHomes.sort((a,b) => b.position.y - a.position.y)[0];

        var x1 = minX.position.x - minX.size/2;
        var y1 = minY.position.y - minY.size/2;
        var x2 = maxX.position.x + maxX.size/2;
        var y2 = maxY.position.y + maxY.size/2;

        var rows = (y2 - y1) / Config.TileSize;
        var columns = (x2 - x1) / Config.TileSize;
        
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#203cd4";

        ctx.rect(x1, y1, columns * Config.TileSize, rows * Config.TileSize );
        ctx.stroke();
        ctx.strokeStyle = "white"
        var doorWidth = (x2-x1) /columns;
        ctx.fillRect(x1 + doorWidth, y1, doorWidth, 4 );
    }

    drawBanner( ctx, text ) {         
        var textMetrics = Utils.measureHeader({ctx, text })
        let fontHeight = textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent;        
        var y1 = (Config.HeaderHeight + Config.TileSize) - (fontHeight/2);

        var x1 = (Config.Bounds.x2 - textMetrics.width ) / 2;     
        Utils.writeHeader({ ctx, text: text, x: x1, y: y1, color: "yellow" })
    }
}