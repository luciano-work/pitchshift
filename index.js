import wavesurfer from'wavesurfer.js';
import Sonorous from 'sonorous';

const instruments = "music/instruments.mp3";
const vocals = "music/vocals.mp3";

const playbackPlayer = Sonorous.addSonor(instruments, {id: 'playback'});
const vocalsPlayer = Sonorous.addSonor(vocals, {id: 'vocals'});

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
  playbackPlayer.play();
  vocalsPlayer.play();
}

function pause() {
  playbackPlayer.pause();
  vocalsPlayer.pause();
}

let progressSonor = Sonorous.get('playback');
setInterval(()=>{
  if (progressSonor.isPlaying && progressSonor.duration !== 0) {
    let currentTime = progressSonor.playbackPosition;
    let percentComplete = currentTime / progressSonor.duration;
    waveform.seekTo(percentComplete);
  }else{
    waveform.seekTo(0);
  }
}, 100);