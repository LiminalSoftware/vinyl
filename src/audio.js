//import { movePlayhead, cartridgeLifted, cartridgePlaced, calculateCartridgePosition } from './controls';
const qs = document.querySelector.bind(document)
  ;

export default class Audio {
  constructor({songList, numberOfSongs, cartridgeYStart, cartridgeYEnd}) {
    this.songList = songList;

    let range = (cartridgeYEnd - cartridgeYStart) // the range of vertical motion of the cartridge
      , dotStep = Math.abs(range / numberOfSongs)
      ;

    this.currentSong = null;
    //this.lastSelectedSong = null;

    //-- INIT
    [this.dotSongLookup, this.sources] = buildDotSongLookup({
      cartridgeYStart,
      dotStep,
      songList
    });
  }

  //get songList() {
  //  return this.songList;
  //}

  playSong(song) {
    let currentTimeSpan = qs('#current-time'); //TODO: fix this duplication
    if (!song || !song.index) song = this.currentSong;
    //set current song so that we could stop/pause it later
    this.sources[song.index].play();
    //console.log(this.sources[song.index].currentTime);

    let scrubber = document.querySelector('.scrubber')
      , rail = document.querySelector('.rail')
      , scrubberCenterOffset = 20;

    this.currentSong = song;
    //TODO: move this to the init function and add it to the songList: { duration: {mil: 23432, label: "03:45"}...}
    let [min, sec] = song.duration.split(':');
    let songLengthInMillisec = parseInt(min, 10) * 60 * 1000 + parseInt(sec, 10) * 1000;

    setSongTitle(song.title);

    this.timer = setInterval(()=> {
      let cTime = this.sources[song.index].currentTime;
      currentTimeSpan.innerText = formatCurrentTime(cTime);
      let percentage = ((cTime * 1000) / songLengthInMillisec) * 100;
      //console.log('percentage', percentage);
      //console.log('current time: ', cTime, 'songLengthInMillisec', songLengthInMillisec);

      //TODO: this is a `control` concern
      let event = new CustomEvent('moveHead', {
        detail: {
          currentSong: this.currentSong,
          railWidth: 233,
          percentage,
          scrubberCenterOffset,
          scrubber
        }
      });
      document.dispatchEvent(event);
      //movePlayhead(233, percentage, scrubberCenterOffset, scrubber);
    }, 1000);
  }

  pauseSong() {
    if (this.timer) clearInterval(this.timer);
    if (this.currentSong && this.currentSong.id) {
      qs('#' + this.currentSong.id).pause();
      //console.log('pausing song: ', this.currentSong.file);
      //TODO: disable scrubber here
    }
  }

  //resumeSong() {
  //  cartridgePlaced(calculateCartridgePosition());
  //
  //  //if (currentSong && currentSong.id) {
  //  //  document.querySelector('#' + currentSong.id).play();
  //  //  console.log('resumeSong');
  //  //} else {
  //  //  console.log('tried to resume song with no currentSong and/or currentSong.id');
  //  //}
  //}

  seek(position) {
    console.log(`'seeking position ' ${position} 'on song' ${this.currentSong.title}`);
    this.playSong(position);
  }

  getValidDotIndex(position) {
    return this.dotSongLookup.findIndex((arr)=> {
      return between(position, ...arr);
    });
  }

  //returns [currentSong, validDotIndex]
  selectSong(validDotIndex) {
    this.currentSong = this.songList[validDotIndex];
    return this.currentSong;
  }
}

function buildDotSongLookup({cartridgeYStart, dotStep, songList}) {
  /* Create a lookup map for matching cartridge y pos to dot/song numbers */
  let dotSongLookup = []
    , sources = []
    , start = cartridgeYStart + dotStep //first position of the first song dot
    ;

  [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((n)=> {
    let base = (start + (n * dotStep));
    let from = base - dotStep / 2;
    let to = base + dotStep / 2;
    dotSongLookup.push([from, to]);
    //dotSongLookup[(start - (n * dotStep))] = n;
  });
  //console.log('dotSongLookup.length', dotSongLookup.length, dotSongLookup);

  /* batch init audio sources */
  for (let index in songList) {
    sources[index] = document.querySelector('#' + songList[index].id);
  }

  return [dotSongLookup, sources]
}

function setSongTitle(title) {
  document.querySelector('.song-title').innerText = title;
}

function formatCurrentTime(val) {
  let ms = val * 1000
    , minuteVal = parseInt(ms / 1000 / 60, 10)
    , minute = minuteVal > 9 ?
      minuteVal :
    '0' + minuteVal
    , seconds = parseInt(ms / 1000 % 60, 10)
    ;
  return (minute > 0) ?
  minute + ':' + seconds :
  '00' + ':' + seconds;
}

function between(x, min, max) {
  return x >= min && x <= max;
}
