//import { movePlayhead, cartridgeLifted, cartridgePlaced, calculateCartridgePosition } from './controls';

export default class Audio {
  constructor(songList, numberOfSongs) {
    this.songList = songList;
    this.numberOfSongs = numberOfSongs;
    this.cartridgeYStart = 0;
    this.cartridgeYEnd = 216;

    let range = (this.cartridgeYEnd - this.cartridgeYStart); // the range of vertical motion of the cartridge
    this.dotStep = Math.abs(range / numberOfSongs);

    this.currentSong = {};
    this.lastSelectedSong = null;

    //-- INIT
    [this.dotSongLookup, this.sources] = buildDotSongLookup();
  }

  playSong(sources, song, currentTimeSpan) {
    //set current song so that we could stop/pause it later
    sources[song.index].play();
    console.log(sources[song.index].currentTime);

    let scrubber             = document.querySelector('.scrubber')
      , rail                 = document.querySelector('.rail')
      , scrubberCenterOffset = 20;

    currentSong = song;
    //TODO: move this to the init function and add it to the songList: { duration: {mil: 23432, label: "03:45"}...}
    let [min, sec] = song.duration.split(':');
    let songLengthInMillisec = parseInt(min, 10) * 60 * 1000 + parseInt(sec, 10) * 1000;

    setSongTitle(song.title);

    this.timer = setInterval(()=> {
      let cTime = sources[song.index].currentTime;
      currentTimeSpan.innerText = formatCurrentTime(cTime);
      let percentage = ((cTime * 1000) / songLengthInMillisec) * 100;
      console.log('percentage', percentage);
      console.log('current time: ', cTime, 'songLengthInMillisec', songLengthInMillisec);
      movePlayhead(233, percentage, scrubberCenterOffset, scrubber);
    }, 1000);
  }

  pauseSong() {
    clearInterval(timer);
    if (currentSong && currentSong.id) {
      document.querySelector('#' + currentSong.id).pause();
      console.log('pausing song: ', currentSong.file);
      //TODO: disable scrubber here
    }
  }

  resumeSong() {
    cartridgePlaced(calculateCartridgePosition());

    //if (currentSong && currentSong.id) {
    //  document.querySelector('#' + currentSong.id).play();
    //  console.log('resumeSong');
    //} else {
    //  console.log('tried to resume song with no currentSong and/or currentSong.id');
    //}
  }

  selectSong(position) {
    let validDotIndex = dotSongLookup.findIndex((arr)=> {
      return between(position, ...arr);
    });

    if (validDotIndex > -1) {
      lastSelectedSong = validDotIndex;
      deactivateDots();
      qs('#dot' + validDotIndex).className = 'dot active';
      //show song title
      document.querySelector('.song-title').innerText = songList[lastSelectedSong].title;
    }
  }
}

function buildDotSongLookup() {
  /* Create a lookup map for matching cartridge y pos to dot/song numbers */
  let dotSongLookup = []
    , sources       = []
    , start         = cartridgeYStart + dotStep //first position of the first song dot
    ;

  [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((n)=> {
    let base = (start + (n * dotStep));
    let from = base - dotStep / 2;
    let to = base + dotStep / 2;
    dotSongLookup.push([from, to]);
    //dotSongLookup[(start - (n * dotStep))] = n;
  });
  console.log('dotSongLookup.length', dotSongLookup.length, dotSongLookup);

  /* batch init audio sources */
  for (let index in songList) {
    let songElement = document.querySelector('#' + songList[index].id);
    sources[index] = songElement;
  }

  return [dotSongLookup, sources]
}

function setSongTitle(title) {
  document.querySelector('.song-title').innerText = title;
}

function formatCurrentTime(val) {
  let ms        = val * 1000
    , minuteVal = parseInt(ms / 1000 / 60, 10)
    , minute    = minuteVal > 9 ?
        minuteVal :
      '0' + minuteVal
    , seconds   = parseInt(ms / 1000 % 60, 10)
    ;
  return (minute > 0) ?
  minute + ':' + seconds :
  '00' + ':' + seconds;
}

function between(x, min, max) {
  return x >= min && x <= max;
}
