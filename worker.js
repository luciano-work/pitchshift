import { BasicPitch, addPitchBendsToNoteEvents, noteFramesToTime, outputToNotesPoly } from './basic-pitch';

self.addEventListener("message", async (event) => {
    const message = event.data;

    const midiNotes = await getMidNotes(message.decodedSong);

    if (midiNotes === null) return;

    // Send the result back to the main thread
    self.postMessage({
        status: "complete",
        task: "decoded-midi",
        data: midiNotes,
    });
});

async function getMidNotes(audioBuffer) {
  console.log('decode To Midi...');
  const frames = [];
  const onsets = [];
  const contours = [];
  let pct = 0;
  // const model = './model/model.json';
  const basicPitch = new BasicPitch();
  await basicPitch.evaluateModel(
    audioBuffer,
    (f, o, c) => {
      frames.push(...f);
      onsets.push(...o);
      contours.push(...c);
    },
    (p) => {
      pct = p;
      console.clear();
      console.log(`Decoding: ${(pct * 100).toFixed()}%`);
    },
  );
  console.log('Init outputToNotesPoly');
  const notesPoly = outputToNotesPoly(frames, onsets, 0.5, 0.3, 11, true, null, null, false, 11)
  console.log('noteEvents');
  const noteEvents = addPitchBendsToNoteEvents(contours, notesPoly)
  console.log('noteFramesToTime');
  const notes = noteFramesToTime(noteEvents);
  console.log('decode To Midi Done!');
  return notes;
}

