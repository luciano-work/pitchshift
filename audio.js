const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioBuffer;
let source;
let gainNode = audioContext.createGain();
let isPlaying = false;
let isMuted = false;
let currentTime = 0;
let duration = 0;

// Carregar o arquivo MP3
fetch('music/instruments.mp3')
    .then(response => response.arrayBuffer())
    .then(data => audioContext.decodeAudioData(data))
    .then(buffer => {
        audioBuffer = buffer;
    })
    .catch(e => console.error(e));

// Função para tocar o áudio
function play() {
    if (isPlaying) return;

    source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    source.start(0);
    isPlaying = true;

    // Atualizar o slider de progresso
    const seekSlider = document.getElementById('seek');
    setInterval(() => {
        if (isPlaying && !isMuted) {
            const currentTime = audioContext.currentTime;
            seekSlider.value = (currentTime / audioBuffer.duration) * 100;

            if(seekSlider.value == 100) {
                isPlaying = false;
            }
        }
    }, 1000);
}

// Função para pausar o áudio
function pause() {
    if (!isPlaying) return;
    source.stop();
    isPlaying = false;
}

// Função para mutar o áudio
function mute() {
    isMuted = !isMuted;
    gainNode.gain.value = isMuted ? 0 : document.getElementById('volume').value;
}

// Função para alterar o volume
function volume() {
    if (!isMuted) {
        gainNode.gain.value = this.value;
    }
}

// Função para avançar a música
function seek() {
    const seekValue = parseFloat(this.value);
    const duration = audioBuffer.duration;
    const percentage = (seekValue / 100) * duration;

    if (isPlaying) {
        source.stop();
        isPlaying = false;
    }

    if (audioBuffer && percentage >= 0 && percentage < audioBuffer.duration) {
        playFromPosition(percentage);
    }
}

function playFromPosition(position) {
    console.log(position);
    source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    source.start(0, position);
    isPlaying = true;
}

// Eventos dos botões
document.getElementById('play').addEventListener('click', play);
document.getElementById('pause').addEventListener('click', pause);
document.getElementById('mute').addEventListener('click', mute);
document.getElementById('volume').addEventListener('input', volume);
document.getElementById('seek').addEventListener('input', seek);