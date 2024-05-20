import wavesurfer from'wavesurfer.js';
import { Howl } from "howler";
import * as Tone from "tone";

const instruments = "music/instruments.mp3";
const vocals = "music/vocals.mp3";

let playbackPlayer = new Howl({src:[instruments], onload: onLoad})
let vocalsPlayer = new Howl({src:[vocals]})
let pitch = 0;
let pitchShift = null;

const playButton = document.getElementById('play');
const pauseButton = document.getElementById('pause');
const pitchShiftPlus = document.getElementById('pitshiftPlus');
const pitchShiftMinus = document.getElementById('pitshiftMinus');
const PitchShiftResult = document.getElementById('pitchshift');

const waveform = wavesurfer.create({
  container: '#waveform',
  waveColor: '#86efac',
  progressColor: '#22c55e',
  url: instruments,
})

function onLoad() {
  Tone.setContext(Howler.ctx);
  Howler.masterGain.disconnect();
  pitchShift = new Tone.PitchShift({ pitch: 0, wet: 1}).toDestination();
  // reverb = new Tone.Reverb({decay: 3,wet: 0.5}).toDestination();
  Tone.connect(Howler.masterGain, pitchShift);
}


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

pitchShiftPlus.addEventListener('click', () => {
  pitch += 0.5;
  pitchShift.pitch = pitch;
  updatePitchShift()
});

pitchShiftMinus.addEventListener('click', () => {
  pitch -= 0.5;
  pitchShift.pitch = pitch;
  updatePitchShift();
});

function updatePitchShift() {
  PitchShiftResult.innerHTML = pitch;
}

function play() {
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

