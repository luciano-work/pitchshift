import wavesurfer from'wavesurfer.js';
import { Howl } from "howler";
import * as Tone from "tone";

const instruments = "music/instruments.mp3";
const vocals = "music/vocals.mp3";

let playbackPlayer = new Howl({src:[instruments], onend: nextSong})
let vocalsPlayer = new Howl({src:[vocals]})
let pitch = 0;

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
  Tone.setContext(Howler.ctx);
  const pShift = new Tone.PitchShift(pitch);
  Howler.masterGain.disconnect();
  Tone.connect(Howler.masterGain, pShift);
  pShift.toDestination();
  updatePitchShift()
  console.log(pShift.context === Howler.ctx);
});

pitchShiftMinus.addEventListener('click', () => {
  pitch -= 0.5;
  Tone.setContext(Howler.ctx);
  const pShift = new Tone.PitchShift(pitch);
  Howler.masterGain.disconnect();
  Tone.connect(Howler.masterGain, pShift);
  pShift.toDestination();
  updatePitchShift();
});

function updatePitchShift() {
  PitchShiftResult.innerHTML = pitch;
}


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