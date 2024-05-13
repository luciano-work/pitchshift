import wavesurfer from'wavesurfer.js';

const playback = "music/instruments.mp3";
const vocals = "music/vocals.mp3";
const playButton = document.getElementById('play');
const pauseButton = document.getElementById('pause');
const results = document.getElementById('results');

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

playbackWave.on('seeking', function (time) {
 vocalWave.seekTo(time / playbackWave.getDuration())
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
