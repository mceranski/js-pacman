import MainScreen from './main-screen.js';
import IntroScreen from './intro-screen.js';
import SoundFx from './sound_fx.js';
import HotKey from './hot-key.js';
import Config from './config.js';
import PauseScreen from './pause-screen.js';

export default class Game {
    static States = {
        Running: "running",
        Intro: "intro",
        Paused: "paused"
    }

    constructor( document ) {
        this.canvas = document.querySelector("#canvas");                 
        this.ctx = canvas.getContext('2d');                                               
        this._state = "Intro";        
        this.soundFx = new SoundFx();

        this.keys = [
            new HotKey({name: "reset", keys: ['Enter'], description: 'reset game'}),
            new HotKey({name: "toggleSound", keys: ['m'], description: () => `toggle audio (${(this.soundFx.muted == true ? "off" : "on")})`}),
            new HotKey({name: "pause", keys: ['p'], description: 'pause game'}),
            new HotKey({name: "up", scope: 'game', keys: ['W', 'w', 'ArrowUp'], description: 'move up'}),
            new HotKey({name: "down", scope: 'game', keys: ['S', 's', 'ArrowDown'], description: 'move down'}),
            new HotKey({name: "left", scope: 'game', keys: ['A', 'a', 'ArrowLeft'], description : 'move left'}),
            new HotKey({name: "right", scope: 'game', keys: ['D', 'd', 'ArrowRight'], description: 'move right'})
        ];
        
        this.screens = [
            { state: Game.States.Intro, instance : new IntroScreen(this)},
            { state: Game.States.Running, instance: new MainScreen(this)},
            { state: Game.States.Paused, instance: new PauseScreen(this)}
        ]        
        this.state = Game.States.Intro;

        document.addEventListener('click', (event) => this.handleMouseClick(event));
        document.addEventListener('keydown', (event) => this.fireKey(event, 'keydown'));
        document.addEventListener('keyup', (event) => this.fireKey(event, 'keyup'));          
    }

    async measureClient() {
        await Config.init(this.canvas, this.ctx);
    }

    fireKey(event, eventName) {
        this.soundFx.userInteracted = true;

        var key = this.keys.find( x => x.keys.indexOf(event.key) >= 0 );

        if( !key ) return;

        if( key.scope == 'game' ) {
            key.pressed = eventName == 'keydown';
            event.preventDefault();
        }

        if( key.scope == '*' && eventName == 'keydown') {
            if( key.name == 'reset') this.reset();    
            if( key.name == 'toggleSound') this.soundFx.toggle();         
            if( key.name == 'pause' ) this.togglePause();   
        }
    }

    get state() { 
        return this._state; 
    }

    set state(value) {
        this._state = value;
        this.screen = this.screens.find( x=> x.state == value ).instance;    
    }

    handleMouseClick( event ) {
        this.soundFx.userInteracted = true;

        const getMousePosition = () => {
            var rect = this.canvas.getBoundingClientRect();
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            };
        }

        var mousePosition = getMousePosition(event);
        
        if( this.screen.handleMouseClick )
            this.screen.handleMouseClick( this, mousePosition );
    }

    togglePause() {
        if( this.state == Game.States.Running ) {
            this.state = Game.States.Paused;
        }
        else if( this.state == Game.States.Paused ) {
            this.state = Game.States.Running;
        }
    }

    reset() {
        this.state = Game.States.Intro;               
    }

    start() {
        this.soundFx.buttonClick();
        this.state = Game.States.Running;
        this.screen.reset();               
    }

    loop() {
        if( !this.screen) return;

        if( this.screen.handleKeyPresses ) {
            var gameKeys = this.keys.filter( x=> x.scope == "game" && x.pressed == true );
            this.screen.handleKeyPresses( gameKeys );
        }

        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);    

        if( this.screen.draw )
            this.screen.draw(this.ctx);
    }
}