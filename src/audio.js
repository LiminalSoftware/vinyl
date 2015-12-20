import { movePlayhead } from './controls';

export var currentSong = {};
var timer;

function setSongTitle(title) {
  document.querySelector('.song-title').innerText = title;
}

const formatCurrentTime = (val) => {
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
};

const timeToMilliseconds = (time) => {
  let [min, sec] = time.split(':');
  let songLengthInMillisec = parseInt(min, 10) * 60 * 1000 + parseInt(sec, 10) * 1000;
  return songLengthInMillisec;
};

export function seek(song, percentage, sources) {
//  let percent = percentage / 100;
//  let songLengthInSec = timeToMilliseconds(song.duration) / 1000;
//  let skipTo = songLengthInSec * percent;
//  console.log('songLengthInSec', songLengthInSec, 'percent', percent);
//  sources[song.index].mediaElement.currentTime = skipTo;
}

export function playSong(context, sources, song, currentTimeSpan) {
  //set current song so that we could stop/pause it later

  sources[song.index].connect(context.destination);


  sources[song.index].mediaElement.play();

  console.log(sources[song.index].mediaElement.currentTime);
  /*
   this.element.onended = function() {
   sound.disconnect();
   sound = null;
   }
   */

  let scrubber = document.querySelector('.scrubber')
    , rail = document.querySelector('.rail')
    , scrubberCenterOffset = 20;

  currentSong = song;
  //TODO: move this to the init function and add it to the songList: { duration: {mil: 23432, label: "03:45"}...}
  let songLengthInMillisec = timeToMilliseconds(song.duration);

  setSongTitle(song.title);

  timer = setInterval(()=> {
    let cTime = sources[song.index].mediaElement.currentTime;
    currentTimeSpan.innerText = formatCurrentTime(cTime);
    let percentage = ((cTime * 1000) / songLengthInMillisec) * 100;
    console.log('percentage', percentage);
    console.log('current time: ', cTime, 'songLengthInMillisec', songLengthInMillisec);
    movePlayhead(233, percentage, scrubberCenterOffset, scrubber);
  }, 1000);
}

export function pauseSong() {
  clearInterval(timer);
  if (currentSong && currentSong.id) {
    document.querySelector('#' + currentSong.id).pause();
    console.log('pausing song: ', currentSong.file);
  }
}
