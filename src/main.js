import Game from './game.js';

 
const fps = 60;
const game = new Game(document);
game.measureClient().then(() => animate());

let prevTick = 0;    

function animate() 
{
    window.requestAnimationFrame(animate);

    // clamp to fixed framerate
    let now = Math.round(fps * Date.now() / 1000);
    if (now == prevTick) {
        return;
        console.log('skipped frame')
    }
    prevTick = now;
    game.loop();
}


