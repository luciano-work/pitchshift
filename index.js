// import { BasicPitch, addPitchBendsToNoteEvents, noteFramesToTime, outputToNotesPoly } from './basic-pitch';
import { Midi } from '@tonejs/midi'
import { saveAs } from 'file-saver';
// import * as Tone from 'tone';

const downloadMidiBtn = document.querySelector("#download-midi-btn");
const downloadJsonBtn = document.querySelector("#download-json-btn");
const startBtn = document.querySelector("#start-btn");
const duration = document.querySelector("#duration");
const scoreView = document.querySelector("#scoreView");
const audio = document.querySelector("#audio");

/** Canvas */
const container = document.getElementById('midiCanvasContainer');
const canvas = document.getElementById('midiCanvas');
const ctx = canvas.getContext('2d');
let maxTime, canvasWidth;
const pixelsPerSecond = 100;

const instruments = "./music/instruments.mp3";
const vocals = "./music/vocals.mp3";
const midiFile = "./music/midi.json";
let midiNotes = null;
let midi = null;
let encodedMidi = null;
let score = 0;
let start = 0;

const worker = new Worker(new URL("./worker.js", import.meta.url), {
  type: "module",
});

worker.addEventListener("message", async (event) => {
  const message = event.data;
  if(message.status === "complete") {
    midiNotes = message.data;
    midi = createMidi(midiNotes);
    encodedMidi = await midiToBase64(midi);

    const end = Date.now();
    const time = (end - start) / 1000;
    duration.innerHTML = `Duration: ${time} seconds`;
    audio.play();
  }
});

audio.src = instruments;
audio.onplay = () => {
  sing();
}

audio.onpause = () => {
  intervalId && clearInterval(intervalId);
}

/** Start Generate Midi */
startBtn.addEventListener("click", async () => {

  /** DESENV */
  // const response = await fetch(midiFile);
  // midiNotes = await response.json();
  // drawNotes();
  // midi = createMidi(midiNotes);
  // encodedMidi = await midiToBase64(midi);
  // audio.play();  
  // return;
  /** DESENV */

  /** Calculate durantion process in set timeout */
  const decodedSong = await loadSong(vocals);
  start = Date.now();
  worker.postMessage({decodedSong});

});

/** Download MIDI File */
downloadMidiBtn.addEventListener("click", () => {
  if(!midi) return;
  const fileToSave = new Blob([midi.toArray()], {
      type: 'audio/midi'
  });
  saveAs(fileToSave, 'song.midi');
});

/** Download Json midi */
downloadJsonBtn.addEventListener("click", () => {
  if(!midiNotes) return;
  const fileToSave = new Blob([JSON.stringify(midiNotes)], {
      type: 'application/json'
  });
  saveAs(fileToSave, 'midi.json');
});

async function loadSong(audio) {
  const audioCtx = new AudioContext({sampleRate: 22050})
  const response = await fetch(audio);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  return audioBuffer.getChannelData(0);
}

function createMidi(notes) {
  console.log('Creating Midi 🎹...');
  const midi = new Midi();
  const track = midi.addTrack();
  notes.forEach((note) => {
    track.addNote({
      midi: note.pitchMidi,
      time: note.startTimeSeconds,
      duration: note.durationSeconds,
      velocity: note.amplitude,
    });
  });
  return midi;
}

async function midiToBase64(midi) {
  const midiBlob = new Blob([midi.toArray()], { type: 'audio/midi' });
  return await blobToBase64(midiBlob);
}

async function blobToBase64 (blob){
  return new Promise((res) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      res(event.target?.result);
    };
    reader.readAsDataURL(blob);
  });
};

var micSource;
var audioContext;
var analyser;
const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

var bufferLength;
var dataArray;
var micNote;
var micFrequency;
let intervalId = null;
// let startTime

function sing() {
  score = 0;
  scoreView.innerHTML = `Score: ${score}`;

if (!navigator?.mediaDevices?.getUserMedia) {
    alert('Sorry, getUserMedia is required for the app.')
    return;
  } else {
    const constraints = {audio: true};
    navigator.mediaDevices.getUserMedia(constraints)
      .then(
        function(stream) {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          analyser = audioContext.createAnalyser();
          analyser.minDecibels = -100;
          analyser.maxDecibels = -10;
          analyser.smoothingTimeConstant = 0.85;
          micSource = audioContext.createMediaStreamSource(stream);
          micSource.connect(analyser);

          captureAudio();

          drawNotes();

        }
      )
      .catch(function(err) {
        alert('Sorry, microphone permissions are required for the app. Feel free to read on without playing :)')
      });
  }
}

function captureAudio() {
  analyser.fftSize = 2048;
  // bufferLength = analyser.fftSize;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Float32Array(bufferLength);
  // analyser.getByteTimeDomainData(dataArray);
  analyser.getFloatTimeDomainData(dataArray);
  const autoCorrelateValue = autoCorrelate(dataArray, audioContext.sampleRate)
  
  const note = getNoteFromFrequency(autoCorrelateValue);
  micFrequency = note;
  micNote = noteStrings[note % 12];
  // console.log(note, micFrequency, micNote);
  checkNoteAtTime(audio.currentTime, micFrequency);

  requestAnimationFrame(captureAudio);
}

function getNoteFromFrequency(frequency) {
  const noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
  return Math.round( noteNum ) + 69;
}

function checkNoteAtTime(currentTime, note) {
  for (let midiNote of midiNotes) {
    if (Math.abs((midiNote.startTimeSeconds + midiNote.durationSeconds) - currentTime) < 0.1) { // Tolerância de 100ms
      if(!midiNote.score) {
        if (midiNote.pitchMidi == note) {
          score += 1;
          console.log(`Acertou: ${score}`);
          scoreView.innerHTML = `Score: ${score}`;
          midiNote.color = 'green';
          midiNote.score = 1;
        }
        break;
      }
    }
  }
}

function autoCorrelate(buffer, sampleRate) {
  // Perform a quick root-mean-square to see if we have enough signal
  var SIZE = buffer.length;
  var sumOfSquares = 0;
  for (var i = 0; i < SIZE; i++) {
    var val = buffer[i];
    sumOfSquares += val * val;
  }
  var rootMeanSquare = Math.sqrt(sumOfSquares / SIZE)
  if (rootMeanSquare < 0.01) {
    return -1;
  }

  // Find a range in the buffer where the values are below a given threshold.
  var r1 = 0;
  var r2 = SIZE - 1;
  var threshold = 0.2;

  // Walk up for r1
  for (var i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]) < threshold) {
      r1 = i;
      break;
    }
  }

  // Walk down for r2
  for (var i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buffer[SIZE - i]) < threshold) {
      r2 = SIZE - i;
      break;
    }
  }

  // Trim the buffer to these ranges and update SIZE.
  buffer = buffer.slice(r1, r2);
  SIZE = buffer.length

  // Create a new array of the sums of offsets to do the autocorrelation
  var c = new Array(SIZE).fill(0);
  // For each potential offset, calculate the sum of each buffer value times its offset value
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE - i; j++) {
      c[i] = c[i] + buffer[j] * buffer[j+i]
    }
  }

  // Find the last index where that value is greater than the next one (the dip)
  var d = 0;
  while (c[d] > c[d+1]) {
    d++;
  }

  // Iterate from that index through the end and find the maximum sum
  var maxValue = -1;
  var maxIndex = -1;
  for (var i = d; i < SIZE; i++) {
    if (c[i] > maxValue) {
      maxValue = c[i];
      maxIndex = i;
    }
  }

  var T0 = maxIndex;

  // Not as sure about this part, don't @ me
  // From the original author:
  // interpolation is parabolic interpolation. It helps with precision. We suppose that a parabola pass through the
  // three points that comprise the peak. 'a' and 'b' are the unknowns from the linear equation system and b/(2a) is
  // the "error" in the abscissa. Well x1,x2,x3 should be y1,y2,y3 because they are the ordinates.
  var x1 = c[T0 - 1];
  var x2 = c[T0];
  var x3 = c[T0 + 1]

  var a = (x1 + x3 - 2 * x2) / 2;
  var b = (x3 - x1) / 2
  if (a) {
    T0 = T0 - b / (2 * a);
  }

  return sampleRate/T0;
}

function drawNotes() {

  canvasWidth = maxTime * pixelsPerSecond;
  canvas.width = canvasWidth;

  maxTime = Math.max(...midiNotes.map(note => note.startTimeSeconds + note.durationSeconds));
  const maxPitch = Math.max(...midiNotes.map(note => note.pitchMidi));
  const minPitch = Math.min(...midiNotes.map(note => note.pitchMidi));
  const pitchRange = maxPitch - minPitch;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  midiNotes.forEach(note => {
    const x = (note.startTimeSeconds / maxTime) * canvas.width;
    const y = ((note.pitchMidi - minPitch) / pitchRange) * canvas.height;
    const width = (note.durationSeconds / maxTime) * canvas.width;
    const height = 10;

    ctx.fillStyle = note.color || 'black';
    ctx.fillRect(x, canvas.height - y - height, width, height);
  });

  // Draw the playback position indicator
  const playbackX = (audio.currentTime / maxTime) * canvas.width;
  ctx.fillStyle = 'red';
  ctx.fillRect(playbackX, 0, 2, canvas.height);

  // Draw the moving ball for the current frequency
  const frequencyY = ((micFrequency - minPitch) / pitchRange) * canvas.height;
  ctx.beginPath();
  ctx.arc(playbackX, canvas.height - frequencyY, 10, 0, 2 * Math.PI);
  ctx.fillStyle = 'green';
  ctx.fill();
  ctx.stroke();

  scrollMidiCanvas()

  requestAnimationFrame(drawNotes);

}

function scrollMidiCanvas() {
  /** Update width */
  const scrollLeft = (audio.currentTime * pixelsPerSecond) - (container.clientWidth / 2);
  container.scrollLeft = Math.max(scrollLeft, 0);
}