import wavesurfer from'wavesurfer.js';
import { Howl } from "howler";
import * as Tone from "tone";
import AudioMotionAnalyzer from 'audiomotion-analyzer';

const instruments = "music/instruments.mp3";
const vocals = "music/vocals.mp3";

let playbackPlayer = new Howl({src:[instruments], onload: onLoad})
let vocalsPlayer = new Howl({src:[vocals]})
let pitch = 0;
let pitchShift = null;
let audioMotion = null;

const playButton = document.getElementById('play');
const pauseButton = document.getElementById('pause');
const pitchShiftPlus = document.getElementById('pitshiftPlus');
const pitchShiftMinus = document.getElementById('pitshiftMinus');
const PitchShiftResult = document.getElementById('pitchshift');
const audioMotionView = document.getElementById("audioMotion");

const waveform = wavesurfer.create({
  container: '#waveform',
  waveColor: '#86efac',
  progressColor: '#22c55e',
  url: instruments,
})


function onLoad() {
  // Howler.masterGain.disconnect();
  // Tone.setContext(Howler.ctx);
  // pitchShift = new Tone.PitchShift({ pitch: 0, wet: 1}).toDestination();
  // Tone.connect(Howler.masterGain, pitchShift);
  

  // init audioMotion
  audioMotion = new AudioMotionAnalyzer(audioMotionView, {
    audioCtx: Howler.ctx,
    // width: 800,
    height: 400,
    mode: 10,
    // channelLayout: 'dual-combined',
    fillAlpha: .1,
    colorMode: 'bar-level',
    // gradientLeft: 'myGradient',
    // gradientRight: 'orangered',
    linearAmplitude: true,
    linearBoost: 1.2,
    lineWidth: 0,
    maxFreq: 16000,
    minFreq: 30,
    peakLine: true,
    showScaleX: false,
    showPeaks: true,
    weightingFilter: 'D',
    overlay: true,
    showBgColor: false,
  });
  audioMotion.connectInput(Howler.masterGain);
    audioMotion.registerGradient( 'myGradient', {
    colorStops: [
      { color: '#7e22ce', level: .5 }
    ]
  });

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

