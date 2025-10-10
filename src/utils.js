import Config from './config.js';

export default class Utils {   
    constructor() {
        if (this instanceof Utils) {
          throw Error('the Utils class is static and cannot be instantiated.');
        }
    }

    

    static getXSecondsFromNow( seconds ){
        return new Date().setSeconds(new Date().getSeconds() + seconds)
    }

    static doesCollide( { sprite1, sprite2, velocity1, velocity2 } )
    {                
        if( !sprite1 || !sprite2 )
            return false;

        if( !sprite1.hasOwnProperty("position") || !sprite2.hasOwnProperty("position") )             
            return false;

        let p1 = {...sprite1.position}
        let p2 = {...sprite2.position}

        if( velocity1 ) {
            p1.x += velocity1.x
            p1.y += velocity1.y
        }

        if( velocity2 ) {
            p2.x += velocity2.x
            p2.y += velocity2.y
        }
        
        //check if two sprites have a radius and are colliding
        if( sprite1.hasOwnProperty("radius") && sprite2.hasOwnProperty("radius") )
        {     
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy); 
            return distance <= sprite1.radius + sprite2.radius; 
        }

        //check if two rectangles are colliding
        //adjust to the upper left corner of the sprite
        p1.x -= (sprite1.size / 2);
        p1.y -= (sprite1.size / 2);
        p2.x -= (sprite2.size / 2);
        p2.y -= (sprite2.size / 2);

        return Math.floor(p1.x) < Math.floor(p2.x + sprite2.size)  &&
            Math.floor(p1.x + sprite1.size) > Math.floor(p2.x) &&
            Math.floor(p1.y) < Math.floor(p2.y + sprite2.size) &&
            Math.floor(p1.y + sprite1.size) > Math.floor(p2.y)
    }

    static getDistance( position1, position2 ) {
        if( !position1 || !position2 ) return -1;
        var a = position1.x - position2.x;
        var b = position1.y - position2.y;        
        return Math.sqrt( a*a + b*b );
    
    
    }   

    static createImage(name) {
        const image = new Image()
        image.src = `./img/${name}.png`;  
        return image;
    }
    
    static getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min)) + min + 1;
    }

    static getRandomBoolean() {
        var min = Math.ceil(0);
        var max = Math.floor(1);
        return Math.floor(Math.random() * (max - min + 1) + min) == 0;         
    }

    static drawScaledImage( { ctx, image, x, y }) 
    {                
        var imageWidth = image.naturalWidth;
        var screenWidth  = Config.Bounds.x2; 
        var scaleX = 1;
        if (imageWidth > screenWidth) scaleX = screenWidth/imageWidth;
        var imageHeight = image.naturalHeight;
        var screenHeight = Config.Bounds.y2;
        var scaleY = 1;
        if (imageHeight > screenHeight)
            scaleY = screenHeight/imageHeight;
        var scale = scaleY;
        if(scaleX < scaleY)
        scale = scaleX;
        if(scale < 1){
            imageHeight = imageHeight*scale;
            imageWidth = imageWidth*scale;      
        }
        ctx.drawImage(image, x, y, imageWidth, imageHeight ); 
        return { width: imageWidth, height: imageHeight };
    }
    
    static writeHeader({ ctx, text, color, x, y }) {        
        ctx.font = Config.getHeaderFont();
        ctx.fillStyle = color || 'white';
        ctx.fillText((text || ""), x || 0, y || 0);
    }

    static writeText({ ctx, text, color, x, y }) {        
        ctx.font = Config.getFont();
        ctx.fillStyle = color || 'white';
        ctx.fillText((text || ""), x || 0, y || 0);        
    }

    static measureText({ctx, text}) {        
        ctx.font = Config.getFont();
        return ctx.measureText(text);
    }

    static measureHeader({ctx, text}) {        
        ctx.font = Config.getHeaderFont();
        return ctx.measureText(text);
    }

    static createButton({ctx, text, fontColor, fillColor, x, y}) { 
        var spacing = ctx.letterSpacing;
        ctx.letterSpacing = '2px';           
        var metrics = Utils.measureText({ctx, text});
        let fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        var actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        var width = metrics.width * 1.8;
        var height = fontHeight * 1.8;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, 8);
        ctx.fillStyle = fillColor || 'yellow';
        ctx.fill();
        ctx.lineWidth = 3;                
        ctx.strokeStyle = '#FF4500';
        ctx.stroke();
        ctx.closePath();
        ctx.font = Config.getFont();
        ctx.fillStyle = fontColor || 'black';
        var xOffset = (width - metrics.width) / 2;
        var yOffset = (height - actualHeight) / 2;
        
        ctx.fillText(text, x + xOffset, y + fontHeight/2 + yOffset);
        ctx.letterSpacing = spacing;
        return {rect: {x: x, y:y, width: width, height: height} };
    }
}