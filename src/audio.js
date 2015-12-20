import { movePlayhead } from './controls';

var currentSong = {};
var timer;

function setSongTitle(title) {
  document.querySelector('.song-title').innerText = title;
}

const formatCurrentTime = (val) => {
  let ms = val * 1000
    , minuteVal = parseInt(ms / 1000 / 60, 10)
    , minute = minuteVal > 9?
    minuteVal:
    '0'+ minuteVal
    , seconds = parseInt(ms / 1000 % 60, 10)
    ;
  return (minute > 0) ?
  minute + ':' + seconds :
  '00' + ':' + seconds;
};

export function playSong(context, sources, song, currentTimeSpan) {
  //set current song so that we could stop/pause it later

  sources[song.index].connect(context.destination);
  document.querySelector('#' + song.id).play();
  let scrubber = document.querySelector('.scrubber')
    , rail = document.querySelector('.rail')
    , scrubberCenterOffset = 20;

  currentSong = song;
  let [min, sec] = song.duration.split(':');
  let songLengthInMillisec = parseInt(min, 10) * 60 * 1000 + parseInt(sec, 10)  * 1000;

  setSongTitle(song.title);

  timer = setInterval(()=> {
    currentTimeSpan.innerText = formatCurrentTime(context.currentTime);
    let percentage = ((context.currentTime * 1000) / songLengthInMillisec) * 100;
    console.log('percentage', percentage);
    console.log('current time: ', context.currentTime, 'songLengthInMillisec', songLengthInMillisec);
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
