### Byte Music Player for Web

Caveats:
- Only plays melodies for now, drums aren't implemented yet
- Playback sounds a little different from the iOS app (pitch change is different, slight echo on some notes)
- Uses very large soundfonts for each sample (didn't spend any time optimizing)

I'm using the [MIDI.js](https://github.com/mudcube/MIDI.js) player and SoundFont conversion (see my modifications in `misc/soundfont_builder.rb`). I had trouble with the conversion of the 7th instrument which I had to rename from "clavichord" to "clavinet" for it to load properly. The converter uses General MIDI names for the output files by default, so they don't correspond to the byte names or emoji characters.

Try it!

    npm install
    npm start
    open http://localhost:9966
