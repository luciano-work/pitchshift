import wavesurfer from'wavesurfer.js';

const playback = "music/instruments.mp3";
const vocals = "music/vocals.mp3";
const playButton = document.getElementById('play');
const pauseButton = document.getElementById('pause');
const results = document.getElementById('results');

const playButton2 = document.getElementById('play2');
const pauseButton2 = document.getElementById('pause2');
const vocalPlayer = document.getElementById('vocalPlayer');
const playbackPlayer = document.getElementById('playbackPlayer');

playbackPlayer.src = playback;
playbackPlayer.load();
vocalPlayer.src = vocals;
vocalPlayer.load();

playbackPlayer.onseeked = function () {
  vocalPlayer.currentTime = playbackPlayer.currentTime;
};

vocalPlayer.onseeked = function () {
  console.log('playbackPlayer seeked')
};

playButton2.addEventListener('click', function () {
  playbackPlayer.play();
  vocalPlayer.play();
});

pauseButton2.addEventListener('click', function () {
  playbackPlayer.pause();
  vocalPlayer.pause();
});


const playbackWave = wavesurfer.create({
  container: '#waveform',
  waveColor: '#86efac',
  progressColor: '#22c55e',
  url: playback,
})

const vocalWave = wavesurfer.create({
  container: '#vocalWaveform',
  waveColor: '#fde047',
  progressColor: '#eab308',
  url: vocals,
});


playbackWave.on('ready', function () {
});

playbackWave.on('seeking', function () {
 vocalWave.setTime(playbackWave.getCurrentTime())
});

// vocalWave.on('seeking', function (time) {
//  console.log(time)
//  console.log(time / playbackWave.getDuration())
//  playbackWave.seekTo(time / playbackWave.getDuration())
// });

playButton.addEventListener('click', function () {
  playbackWave.play();
  vocalWave.play();
});

pauseButton.addEventListener('click', function () {
  playbackWave.pause();
  vocalWave.pause();

  const playbackTime = playbackWave.getCurrentTime();
  const vocalTime = vocalWave.getCurrentTime();
  console.log(`playback Time ${playbackTime}`)
  console.log(`Vocal Time ${vocalTime}`)

  results.innerHTML = `
    <p>Playback Time ${playbackTime}</p> 
    <p>Vocal Time ${vocalTime}</p>
  `
});
