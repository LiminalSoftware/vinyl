//import { movePlayhead, cartridgeLifted, cartridgePlaced, calculateCartridgePosition } from './controls';
import platform from 'platform';

const qs = document.querySelector.bind(document)
  ;

export default class Audio {
  constructor({songList, numberOfSongs, cartridgeYStart, cartridgeYEnd}) {
    this.songList = songList;

    let range = (cartridgeYEnd - cartridgeYStart) // the range of vertical motion of the cartridge
      , dotStep = Math.abs(range / numberOfSongs)
      ;

    this.currentSong = null;

    //-- INIT
    [this.dotSongLookup, this.sources] = buildDotSongLookup({
      cartridgeYStart,
      dotStep,
      songList,
      that: this
    });
  }


  playSong(songIndex) {

    let currentTimeSpan = qs('#current-time'); //TODO: fix this duplication
    if (songIndex !== null && songIndex !== undefined) {
      this.currentSong = this.songList[songIndex];
    }
    this.sources[this.currentSong.index].play();

    let scrubber = document.querySelector('.scrubber')
      , rail = document.querySelector('.rail')
      , scrubberCenterOffset = 20;

    setSongTitle(this.currentSong.title);

    this.timer = setInterval(()=> {
      let cTime = this.sources[this.currentSong.index].currentTime;
      currentTimeSpan.innerText = formatCurrentTime(cTime);
      let percentage = ((cTime * 1000) / this.currentSong.durationInMillisec) * 100;

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
    }, 1000);
  }

  pauseSong() {
    if (this.timer) clearInterval(this.timer);
    if (this.currentSong && this.currentSong.id) {
      qs('#' + this.currentSong.id).pause();
    }
  }

  seek(percentage) {
    let currentSongElement = qs(`#${this.currentSong.id}`);
    let newPos = getSongPositionFromPercentage(percentage, this.currentSong);
    //console.log(`'seeking position ' ${percentage} 'on song' ${this.currentSong.title} ${this.currentSong.duration}
    // ${this.currentSong.durationInMillisec} newPos: ${newPos}`);
    currentSongElement.currentTime = newPos;
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

  getLastSongIndex() {
    let indices = [];
    for (let song in this.songList) {
      indices.push(this.songList[song].index);
    }
    return Math.max(...indices);
  }

  preprocessFiles() {
    console.log('platform', platform.os.family);
    if (platform.os.family == 'iOS') {
      this.sources.map((s)=> {
        s.play();
        s.pause();
      })
    }
  }
}

function buildDotSongLookup({cartridgeYStart, dotStep, songList, that}) {
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
  });

  /* batch init audio sources */
  for (let index in songList) {
    sources[index] = document.querySelector('#' + songList[index].id);
    sources[index].addEventListener('ended', (e) => {
      let event = new CustomEvent('songEnd', {
        detail: {
          currentSong: that.currentSong,
          target: e.target
        }
      });
      /* emit stop play event passing
         songElement and reset playPauseButton */
      document.dispatchEvent(event);
    }, false);
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

function getSongPositionFromPercentage(percent, song) {
  //get millisecond value of the whole song ex: 100% of 247000 = 4.07
  let songDurationInSec = song.durationInMillisec / 1000;
  let newSongPositionInSec = songDurationInSec * percent / 100;
  let formattedString = formatCurrentTime(newSongPositionInSec * 60);
  let value = parseFloat(formattedString);
  console.log('getSongPositionFromPercentage', value);
  return value;
}