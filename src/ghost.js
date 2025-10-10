import Utils from './utils.js';
import Sprite from './sprite.js';
import Config from './config.js';

export default class Ghost extends Sprite {
    static Characters = [
        { name: 'Blinky', color: 'red' },
        { name: 'Pinky', color: 'pink' },
        { name: 'Inky', color: 'cyan' },
        { name: 'Clyde', color: 'orange' }
    ];

    constructor({ name, x, y, size }) {
        super({x, y, size })
        this.name = name;
        this.color = Ghost.Characters.find(x => x.name == name)?.color || 'white';        
        this.homePosition = null;
        this.freezeTil = null;
        this.scaredTil = null;
        this.dead = false;
        this.scared = false;
        this.targetTile = null;
        this.lastVelocity = null;
        this.movesTowardsTarget = 0;
    }

    canMove() {
        if(this.freezeTil == null ) return true;        
        return (new Date() >= this.freezeTil);
    } 

    spawn( tile ) {
        this.scared = false;
        this.dead = false;
        
        this.position.x = tile.position.x;
        this.position.y = tile.position.y;

        if( this.homePosition == null ) 
            this.homePosition = tile;
        
        var index = Ghost.Characters.findIndex(x=> x.name == this.name);        
        var delay = 3 + (index * 1.5);
        this.recharge(delay);
    }

    scare( duration ) {
        this.scaredTil = Utils.getXSecondsFromNow(duration);
        this.scared = true;
    }

    die() {
        this.dead = true;
        this.scared = false;
        this.freezeTil = null;
        this.targetTile = this.homePosition;
    }

    revive() {
        this.dead = false;
        this.targetTile = null;
        this.scared = false;
        this.position.x = this.homePosition.position.x;
        this.position.y = this.homePosition.position.y;
        this.recharge(3);
    }

    getColor() {
        if (this.scared == false) return this.color
        //code to determine how fast change the ghost's color, the blink rate will increase over time
        var elapsed = Math.floor((this.scaredTil - new Date()) / 1000);
        var blinksPerSecond = Math.abs((elapsed - 10) + 1)
        var blinkIndex = Math.ceil(new Date().getMilliseconds() / (1000 / blinksPerSecond))
        return blinkIndex % 2 == 0 ? 'blue' : 'white'
    }

    recharge( seconds ){
        this.freezeTil = Utils.getXSecondsFromNow(seconds);
     
        const wiggle = (ghost,index) => {
            if( ghost.freezeTil == null ||  (ghost.freezeTil != null && (new Date() >= ghost.freezeTil))) {
                ghost.position.x = ghost.homePosition.position.x;
                ghost.position.y = ghost.homePosition.position.y;           
                ghost.freezeTil = null;
                return;
            }
    
            if( !index ) index = 1;
            var alterationIndex = index % 2;
            ghost.move(0, (Config.TileSize * .1) * (alterationIndex == 0 ? -1 : 1));
            setTimeout(() => wiggle(ghost, index+1), 200 );
        };
        
        wiggle( this );
    }

    checkTimers() {
        //check scared timer
        if (this.scaredTil != null && (new Date() >= this.scaredTil)) {
            this.scaredTil = null;
            this.scared = false;
        }
    }

    move(x,y) {
        this.lastVelocity = {x, y};
        super.move(x,y);
    }

    draw(ctx) {
        var size = this.size * .9;
        let x = this.position.x - (size/2);        
        let y = this.position.y + (size/2);
        
        ctx.beginPath();

        if( !this.dead) {
            //draw the body
            ctx.fillStyle = this.getColor();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y-size*.5);
            ctx.bezierCurveTo(x, y-size*.785, x+size*.214, y-size, x+size*.5, y-size);
            ctx.bezierCurveTo(x+size*.785, y-size, x+size, y-size*.785, x+size, y-size*.5);
            ctx.lineTo(x+size, y);
            ctx.lineTo(x+size*.833, y-size*.166);
            ctx.lineTo(x+size*.666, y);
            ctx.lineTo(x+size*.5, y-size*.166);
            ctx.lineTo(x+size*.333, y);
            ctx.lineTo(x+size*.166, y-size*.166);
            ctx.lineTo(x, y);
            ctx.fill();
        }

        //draw the eye ball
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.moveTo(x+size*.286, y-size*.814);
        ctx.bezierCurveTo(x+size*.179, y-size*.814, x+size*.143, y-size*.707, x+size*.143, y-size*.707);
        ctx.bezierCurveTo(x+size*.143, y-size*.564, x+size*.179, y-size*.457, x+size*.286, y-size*.457);
        ctx.bezierCurveTo(x+size*.392, y-size*.45, x+size*.429, y-size*.564, x+size*.429, y-size*.564);
        ctx.bezierCurveTo(x+size*.429, y-size*.707, x+size*.392, y-size*.814, x+size*.286, y-size*.814);
        ctx.moveTo(x+size*.714, y-size*.814);
        ctx.bezierCurveTo(x+size*.607, y-size*.814, x+size*.571, y-size*.707, x+size*.571, y-size*.707);
        ctx.bezierCurveTo(x+size*.571, y-size*.564, x+size*.607, y-size*.457, x+size*.714, y-size*.457);
        ctx.bezierCurveTo(x+size*.821, y-size*.45, x+size*.857, y-size*.564, x+size*.857, y-size*.564);
        ctx.bezierCurveTo(x+size*.857, y-size*.707, x+size*.821, y-size*.814, x+size*.714, y-size*.814);
        ctx.fill();

        //draw the pupils        
        //the pupils should be facing the direction the ghost is moving
        var velocity = this.lastVelocity || { x: 0, y: 0};
        this.lastVelocity = velocity;

        var yPupil = y-size*.7;
        if( velocity.y > 0 ) yPupil = y - ( size * .54 );
        if( velocity.y < 0 ) yPupil = y - ( size * .66 );
        
        var xPupil = x + ( size * .72 );
        if( velocity.x > 0 ) xPupil = x + ( size * .78 );
        if( velocity.x < 0 ) xPupil = x + ( size * .66 );       

        //draw the scared mouth
        if( this.scared == true) {
            var am = size*.05;
            var tp = size*.1;
            var deg = 0;
            var waveStartY = y - (size*.35);
            var waveStartX = Math.floor(x+size*.25);
            var waveEndX = Math.floor(x+size*.75);
            ctx.beginPath();
            ctx.moveTo(waveStartX, waveStartY);
            for (var x1=waveStartX; x1 <= waveEndX; x1+= 1) {
                var y1 = -am*Math.sin((Math.PI/tp)*(deg+x1));
                ctx.lineTo(x1, y1+(waveStartY));
            }
            ctx.lineTo(waveEndX,waveStartY);
            ctx.lineWidth = 1;
            ctx.strokeStyle = this.getColor() == 'blue' ? 'white' : 'black'; //opacity 1
            ctx.stroke();
            ctx.closePath();
        }

        ctx.fillStyle = "navy";
        ctx.beginPath();
        ctx.arc(
            xPupil,
            yPupil, 
            size*.071, 0, Math.PI * 2, true);
        ctx.fill();

        xPupil = x + ( size * .28 );
        if( velocity.x > 0 ) xPupil = x + ( size * .34 );
        if( velocity.x < 0 ) xPupil = x + ( size * .22 );

        ctx.beginPath();
        ctx.arc(
            xPupil,
            yPupil, 
            size*.071, 0, Math.PI * 2, true);    
        ctx.fill();
    }
}