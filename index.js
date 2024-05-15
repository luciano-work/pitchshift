import wavesurfer from'wavesurfer.js';
import Sonorous from 'sonorous';

const instruments = "music/instruments.mp3";
const vocals = "music/vocals.mp3";

let playbackPlayer = Sonorous.addSonor(instruments, {id: 'playback'});
let vocalsPlayer = Sonorous.addSonor(vocals, {id: 'vocals'});

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
  Sonorous.sonors.forEach(sonor => {
    console.log(sonor.id);
    const duration = sonor.duration;
    sonor.seek(value * duration)
  })
});

playButton.addEventListener('click', () => {
  play();
});

pauseButton.addEventListener('click', () => {
  pause();
});

function play() {
  Sonorous.sonors.forEach(sonor => { 
    sonor.play();
  });
}

function pause() {
  playbackPlayer.stop();
  vocalsPlayer.stop();
  Sonorous.removeSonor('playback');
  Sonorous.removeSonor('vocals');
  Sonorous.reload();
  playbackPlayer = Sonorous.addSonor(instruments, {id: 'playback'});
  // vocalsPlayer = Sonorous.addSonor(vocals, {id: 'vocals'});

  Sonorous.sonors.forEach(sonor => {
    console.log(sonor.id);
  })
}

setInterval(()=>{
  if (playbackPlayer.isPlaying && playbackPlayer.duration !== 0) {
    let currentTime = playbackPlayer.playbackPosition;
    let percentComplete = currentTime / playbackPlayer.duration;
    waveform.seekTo(percentComplete);
  }
}, 100);

