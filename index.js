var music, bytes, playerInterval

function byteNoteToMidiNote(byteNote) {
  var notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  var noteArr = byteNote.split("/")
  var note = notes.indexOf(noteArr[0])
  var octave = parseInt(noteArr[1], 10)
  return note + ((octave + 2) * 12)
}

var emojiForBank = {
  "bleep": "",
  "meow": "🐱",
  "bass": "",
  "ping": "",
  "string": "",
  "reso": "",
  "arp": "",
  "bark": "🐶",
  "mono1": "",
  "mono2": "",
  "mono3": "",
  "funk": "",
  "sax": "",
  "bell": "🔔",
  "roboto": "",
  "do": ""
}

var banks = [
  "bleep",
  "meow",
  "bass",
  "ping",
  "string",
  "reso",
  "arp",
  "bark",
  "mono1",
  "mono2",
  "mono3",
  "funk",
  "sax",
  "bell",
  "roboto",
  "do"
]

var drumsAsNotes = {
  "Kick": 35,
  "Snare": 36,
  "Clap": 37,
  "Hat": 38,
  "Thump": 39,
  "Glitch": 40,
  "Tambourine": 41,
  "Whistle": 42,
  "Block": 43,
  "Stick": 44,
  "Shaker": 45,
  "Crash": 46,
  "Tom": 47,
  "Conga": 48,
  "Cowbell": 49,
  "Yeah": 50
}

// TODO use requestAnimationFrame loop, time delta to determine clock
var ticks = 0
var beat = 0
function tick() {
  // grab the next hits
  var hits = music.instructions[beat]

  var el = $('#hits')
  el.html('')

  for (var i = 0; i < hits.length; i++) {
    var hit = hits[i]

    if (hit.type == 0) { // notes

      var midiChannel = banks.indexOf(hit.bank)
      var note = byteNoteToMidiNote(hit.note)

			MIDI.setVolume(midiChannel, 127)
			MIDI.noteOn(midiChannel, note, hit.velo, 0)
			MIDI.noteOff(midiChannel, note, 0 + 0.75)

      el.append(
        $('<div>').html(hit.note + " " + emojiForBank[hit.bank])
      )
    }

    // TODO
    // drums
    // currently max'd out on 16 channels for soundfont
    // ALSO: soundfont conversion for drums did not go so well
    if (hit.type == 1) { // drums

			// play the note
			var delay = 0 // play one note every quarter second
			var note = drumsAsNotes[hit.note] // the MIDI note
			var velocity = 127 // how hard the note hits

			// MIDI.setVolume(10, 127)
			// MIDI.noteOn(10, note, velocity, delay)
			// MIDI.noteOff(10, note, delay + 0.75)
    }
  }

  beat = (beat + 1) % (music.length * 4)
  ticks = ticks + 1
}

function playByte(byte) {
  if (playerInterval) { clearInterval(playerInterval) }

  for (var i = 0; i < byte.package.objects.length; i++) {
    if (byte.package.objects[i].type == "music") {

      $('#output').html('')
      $('#hits').html('')

      music = byte.package.objects[i]
      playerInterval = setInterval(tick, 1000 * 60 / 4 / music.bpm)

    }
  }
}

$('#output').html('Loading instrument samples ...')

// named as general midi, because that's the way the converter exports them
window.onload = function () {
	MIDI.loadPlugin({
		soundfontUrl: "./soundfonts/",
		instruments: [
      "acoustic_grand_piano",
      "bright_acoustic_piano",
      "electric_grand_piano",
      "honkytonk_piano",
      "electric_piano_1",
      "electric_piano_2",
      "harpsichord",
      "clavinet",
      "celesta",
      "glockenspiel",
      "music_box",
      "vibraphone",
      "marimba",
      "xylophone",
      "tubular_bells",
      "dulcimer"
    ],
		onprogress: function(state, progress) {
			// console.log(state, progress)
      $('#output').html('Loading instrument samples ... ' + Math.floor(progress * 100) + '%')
      if (progress == 1) {
        $('#output').html('Loading Bytes ...')
      }
		},
		onsuccess: function() {
      // load the byte
      $.getJSON('bytes.json', function (result) {
        bytes = result

        var selector = $('#selector')
        for (var i = 0; i < bytes.data.posts.length; i++) {
          var name = bytes.data.posts[i].name
          selector.append($('<option>').attr('value', i).html(name))
        }
        selector.on('change', function() {
          var val = $(this).val()
          var byte = bytes.data.posts[val]
          playByte(byte)
        })
        $('#controls').show()

        var byte = bytes.data.posts[0]
        playByte(byte)

      })
		}
	})
}
