import wavesurfer from'wavesurfer.js';
import Pizzicator from 'pizzicato';

const instruments = "music/instruments.mp3";
const vocals = "music/vocals.mp3";

const playbackPlayer = new Pizzicator.Sound(instruments);
const vocalsPlayer = new Pizzicator.Sound(vocals);

const playButton = document.getElementById('play');
const pauseButton = document.getElementById('pause');

const waveform = wavesurfer.create({
  container: '#waveform',
  waveColor: '#86efac',
  progressColor: '#22c55e',
  url: instruments,
})

waveform.on('click', function (value) {
  const duration = playbackPlayer.getRawSourceNode().buffer.duration
  const time = value * duration;
  seekTo(time);
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
  playbackPlayer.stop();
  vocalsPlayer.stop();
}

function seekTo(time) {
  pause();
  playbackPlayer.play(0,time);
  vocalsPlayer.play(0,time);
  console.log('seeking to', time);
}
