export default class SoundFx {   
    constructor(){        
        this.userInteracted = false;
        this.muted = false;
        this.cache = [];
        this.volume = .5;        
    }

    siren = () => this.play('siren')
    extraLife = () => this.play('extra_life')
    ghostEaten = () => this.play('ghost_eaten')
    fruitEaten = () => this.play('fruit_eaten')
    powerPellet = () => this.play('power_pellet')
    pellet = () => this.play('pellet')
    dead = () => this.play('pacman_dead')
    buttonClick = () => this.play('button');
    startGame = () => this.play('start_game')    
    intermission = () => this.play('intermission')

    toggle() {
        this.muted = !this.muted;
        this.buttonClick();
    }

    getAudio(uri) {
        var cached = this.cache.find(x => x.uri === uri );

        if( cached == null ) {
            let audio = new Audio('./snd/' + uri + '.mp3')            
            cached = { uri : uri, audio: audio };
            this.cache.push( cached )
        }
        
        return cached.audio;
    }

    canPlay() {
        return !this.muted && this.userInteracted;
    }

    play( uri ) {
        if( !this.canPlay() ) return;
        var audio = this.getAudio(uri);
        audio.volume = this.volume;
        audio.play();
    }
}