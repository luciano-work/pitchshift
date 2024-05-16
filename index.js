import wavesurfer from'wavesurfer.js';
import { Howl } from "howler";

const instruments = "music/instruments.mp3";
const vocals = "music/vocals.mp3";

// let playbackPlayer = Sonorous.addSonor(instruments, {id: 'playback'});
// let vocalsPlayer = Sonorous.addSonor(vocals, {id: 'vocals'});

let playbackPlayer = new Howl({src:[instruments], onend: nextSong})
let vocalsPlayer = new Howl({src:[vocals]})

const playButton = document.getElementById('play');
const pauseButton = document.getElementById('pause');

const waveform = wavesurfer.create({
  container: '#waveform',
  waveColor: '#86efac',
  progressColor: '#22c55e',
  url: instruments,
})

// seek waveform to playback position
waveform.on('click', function (value) {
  const duration = playbackPlayer.duration();
  const seekTime = value * duration;
  playbackPlayer.seek(seekTime);
  vocalsPlayer.seek(seekTime);
});

playButton.addEventListener('click', () => {
  play();
});

pauseButton.addEventListener('click', () => {
  pause();
});

function play() {
  // Sonorous.sonors.forEach(sonor => { 
  //   sonor.play();
  // });
  playbackPlayer.play();
  vocalsPlayer.play();
}

function pause() {
  playbackPlayer.pause();
  vocalsPlayer.pause();
}

setInterval(()=>{
  if (playbackPlayer.playing() && playbackPlayer.duration() !== 0) {
    let currentTime = Math.round(playbackPlayer.seek());
    let percentComplete = currentTime / playbackPlayer.duration();
    waveform.seekTo(percentComplete);
  }
}, 100);


async function nextSong() {

  console.log("Next song");

  const instruments = "music/Earth, Wind & Fire - September - (Instrumental).mp3";
  const vocals = "music/Earth, Wind & Fire - September - (Vocals).mp3";
  playbackPlayer = null;
  vocalsPlayer = null;
  playbackPlayer = new Howl({src:[instruments], onend: nextSong})
  vocalsPlayer = new Howl({src:[vocals]})
  waveform.load(instruments);

  //await 2 seconds promise
  await new Promise(resolve => setTimeout(resolve, 2000));
  play();

}