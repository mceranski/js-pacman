export default class Config {   
    constructor() {
        if (this instanceof Config) {
          throw Error('the Config class is static and cannot be instantiated.');
        }
    }

    static Map = [
        ['1','-','-','-','-','-','-','-','-','7','-','-','-','-','-','-','-','-','2',],                
        ['|','.','.','.','.','.','.','.','.','|','.','.','.','.','.','.','.','.','|',],               
        ['|','o','[',']','.','[','-',']','.','|','.','[','-',']','.','[',']','o','|',],
        ['|','.','.','.','.','.','.','.','.','_','.','.','.','.','.','.','.','.','|',],               
        ['|','.','^','.','[','-','2','.','.','.','.','.','1','-',']','.','^','.','|',],
        ['|','.','|','.','.','.','_','.','[','-',']','.','_','.','.','.','|','.','|',],               
        ['|','.','6','-',']','.','.','.','.','.','.','.','.','.','[','-','8','.','|',],
        ['|','.','|','.','.','.','^','.','[','-',']','.','^','.','.','.','|','.','|',],
        ['|','.','_','.','[','-','3','.','.','.','.','.','4','-',']','.','_','.','|'],
        ['<','.','.','.','.','.','.','.','h','h','h','.','.','.','.','.','.','.','>'],
        ['|','.','^','.','[','-','2','.','h','h','h','.','1','-',']','.','^','.','|',],
        ['|','.','|','.','.','.','_','.','.','.','.','.','_','.','.','.','|','.','|',],               
        ['|','.','6','-',']','.','.','.','[','-',']','.','.','.','[','-','8','.','|',],
        ['|','.','|','.','.','.','^','.','.','.','.','.','^','.','.','.','|','.','|',],               
        ['|','.','_','.','[','-','3','.','[','-',']','.','4','-',']','.','_','.','|',],
        ['|','.','.','.','.','.','.','.','.','p','.','.','.','.','.','.','.','.','|',],               
        ['|','o','[',']','.','[','-',']','.','^','.','[','-',']','.','[',']','o','|',],
        ['|','.','.','.','.','.','.','.','.','|','.','.','.','.','.','.','.','.','|',],
        ['4','-','-','-','-','-','-','-','-','5','-','-','-','-','-','-','-','-','3',],        
    ];


    static FontSize = 18;
    static FontFamily = "Courier";
    static TileSize = 40;
    static HeaderHeight = 40;
    static FooterHeight = 40;
    static Speed = 2;   
    static Bounds = {};

    static getHeaderFont = () => `${Config.FontSize*1.25}px ${Config.FontFamily}`;
    static getFont = () => `${Config.FontSize}px ${Config.FontFamily}`;

    static async createImageAsync(name) {
        const image = new Image()
        image.src = `./img/${name}.png`;  
        var imageLoader = () => new Promise((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true });      
        })
        
        await imageLoader();
        return image;
    }

    static async init( canvas, ctx ) {
        return new Promise( async (resolve) => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;                   

            var tilesAcross = Config.Map[0].length;
            var tilesDown = Config.Map.length;
                               
            //determine if the map is wider than longer or vice-versa
            var maxTiles = Math.max( tilesAcross, tilesDown );
            var screenWidth = canvas.width;
            var screenHeight = canvas.height - ( Config.HeaderHeight + Config.FooterHeight );        
            var screenMinDimension = Math.min( screenWidth, screenHeight );

            Config.FontSize = Math.floor((.04*screenMinDimension) * .75);;
            ctx.font = Config.getHeaderFont();
            var textMetrics = ctx.measureText("Wy");      

            Config.HeaderHeight = (textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent) * 1.1;
            Config.FooterHeight = Config.HeaderHeight;

            //Use an even number for the tile Size
            Config.TileSize = 2 * Math.floor((screenMinDimension / maxTiles)/2);            

            Config.Bounds = {
                x1: 0,
                y1: 0,
                x2: Config.TileSize * tilesAcross,
                y2: ( Config.TileSize * tilesDown ) + Config.HeaderHeight + Config.FooterHeight
            };

            //determines how fast pacman can move with each key press
            Config.Speed = Config.TileSize/16;

            Config.Banner = await Config.createImageAsync('banner');
            resolve();    
        })        
    }
}