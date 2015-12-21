import {grabCartridge, releaseCartridge, grabPlayhead, releasePlayhead, updateTime, movePlayhead} from './controls';
import {playSong, pauseSong, seek, currentSong} from './audio';
//import './polyfills';

require('./style.css');

const qs = document.querySelector.bind(document)
  , qsa = document.querySelectorAll.bind(document)
  , platter = qs('canvas.platter')
  , platterContext = platter.getContext('2d')
  , platterImage = qs('img.platter')
  , tonearmImage = qs('.tonearm')
  , currentTimeSpan = qs('#current-time')
  , totalTimeSpan = qs('#total-time')
  , playhead = qs('#header')
  , scrubber = qs('.scrubber')
  , rail = qs('.rail')
  , scrubberCenterOffset = 20
  , fps = 30
  , rpm = 34.6
//, tableRotationDeg = 38.65

  , platterTranslateYPercent = 22.505
  , platterTranslateXPercent = 1.929
  , platterToPhoneWidthRatio = 559.424
  , numberOfSongs = 9
  , cartridgeDefaultY = 343 //NOTE: identical to element's starting `top` css property
  , cartridgeYStart = 0 //59
  , cartridgeYEnd = 216 //213 //295
  , range = (cartridgeYEnd - cartridgeYStart) // the range of vertical motion of the cartridge
  , dotStep = Math.abs(range / numberOfSongs)
  , tonearmToPhoneWidthRatio = 447.770
  , tonearmAspectRatio = 1.744
  , tonearmRotate = qs('#tonearmRotate')
  , scrubberDefaultY = 6
  , scrubberDefaultX = 0
  , songList = {
  0: {index: 0, id: 'bh', title: 'Bohemian Rhapsody', file: 'songs/bohemian-rhapsody.mp3', duration: '05:53'},
  1: {index: 1, id: 'wwry', title: 'We Will Rock You', file: 'songs/we-will-rock-you.mp3', duration: '02:03'},
  2: {index: 2, id: 'kq', title: 'Killer Queen', file: 'songs/killer-queen.mp3', duration: '03:01'},
  3: {index: 3, id: 'watc', title: 'We Are the Champions', file: 'songs/we-are-the-champions.mp3', duration: '03:03'},
  4: {
    index: 4,
    id: 'aobtd',
    title: 'Another One Bites the Dust',
    file: 'songs/another-one-bites-the-dust.mp3',
    duration: '03:37'
  },
  5: {index: 5, id: 'ssor', title: 'Seven Seas Of Rhye', file: 'songs/seven-seas-of-rhye.mp3', duration: '02:49'},
  6: {index: 6, id: 'loml', title: 'Love Of My Life', file: 'songs/love-of-my-life.mp3', duration: '03:38'},
  7: {index: 7, id: 'ptg', title: 'Play The Game', file: 'songs/play-the-game.mp3', duration: '03:32'},
  8: {index: 8, id: 'tsmgo', title: 'The Show Must Go On', file: 'songs/the-show-must-go-on.mp3', duration: '04:32'}
};


const context = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext)();

var tonearmRotationDeg = 0
  , rotateIntervalId = 0
  , platterRotationDeg = 0
  , cartridgeUp = false
  , lastTouch = null
  , dotSongLookup = []
  , lastSelectedSong = null
  , fingerCartridgeOffset
  , cartridgeFirstTouch
  , scrubberFingerXOffset
  , railWidth = parseInt(window.getComputedStyle(qs('.rail'), null).getPropertyValue('width'), 10)
  , sources = []
  ;


function between(x, min, max) {
  return x >= min && x <= max;
}

function init() {
  /* Create a lookup map for matching cartridge y pos to dot/song numbers */
  dotSongLookup = [];
  let start = cartridgeYStart + dotStep;//first position of the first song dot
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
    sources[index] = context.createMediaElementSource(songElement);
  }
  //Object.keys(songList).forEach((item, index) => {
  //  let songElement = document.querySelector('#' + songList[item].id);
  //  sources[index] = context.createMediaElementSource(songElement);
  //});


}

function draw() {
  //var width = platter.width = window.innerWidth
  platter.width = window.innerWidth;
  platter.height = window.innerHeight;

  var width = 320
  //, height = platter.height = window.innerHeight
    , height = 480
    , recordDiameter = width * (platterToPhoneWidthRatio / 100)
  //, tonearmWidth = window.innerWidth * (tonearmToPhoneWidthRatio / 100)
  //, tonearmHeight = tonearmWidth / tonearmAspectRatio
    ;

  platterContext.translate(
    -(recordDiameter * (platterTranslateXPercent / 100)),
    -(recordDiameter * (platterTranslateYPercent / 100))
  );

  platterContext.rotate(degToRad(platterRotationDeg));

  platterContext.drawImage(
    platterImage,
    -recordDiameter / 2,
    -recordDiameter / 2,
    recordDiameter,
    recordDiameter
  );
}

const rotate = ()=> {
  rotateIntervalId = setInterval(() => {
    platterRotationDeg = platterRotationDeg + 360 / ((60 / rpm) * fps);
    draw();
  }, 1000 / fps)
};

const stopRotate = () => {
  clearInterval(rotateIntervalId);
};

const degToRad = (degrees) => {
  return degrees * (Math.PI / 180)
};

const deactivateDots = () => {
  [].map.call(document.querySelectorAll('.dot'), function (el) {
    el.classList.remove('active');
  });
};

const cartrigeLifted = () => {
  cartridgeUp = true;
  //hide playhead
  playhead.classList.add('invisible');
  pauseSong();
};

const cleanUp = () => {
  currentTimeSpan.innerText = '';
  totalTimeSpan.innerText = '';
  deactivateDots();
  playhead.classList.add('invisible');
  qs('.buttons').classList.toggle('hidden');
  qs('.instructions').classList.toggle('hidden');
  document.querySelector('.song-title').innerText = '';//TODO: refactor
};

function hideInstructions() {
  qs('.buttons').classList.remove('hidden');
  qs('.instructions').classList.add('hidden');
  qs('.down-arrow').classList.add('hidden');
}

function showInstructions() {
  qs('.buttons').classList.add('hidden');
  qs('.instructions').classList.remove('hidden');
  qs('.down-arrow').classList.remove('hidden');
}

const cartridgePlaced = (position) => {
  cartridgeUp = false;

  if (lastSelectedSong > -1 && position < cartridgeYStart) {
    //show playhead
    playhead.classList.remove('invisible');
    hideInstructions();
    totalTimeSpan.innerText = songList[lastSelectedSong].duration;
    //start song
    playSong(context, sources, songList[lastSelectedSong], currentTimeSpan);
  } else if (position == cartridgeYStart) {
    //clean up
    cleanUp();
  }
};

//helper methods
const getOffsetOfTouchObject = (e) => {
  let yOffset = e.touches[0].clientY - e.currentTarget.offsetTop;
  let xOffset = e.touches[0].clientX - e.currentTarget.offsetLeft;
  return {xOffset, yOffset};
};

const cartridgeTouchStartHandler = (e) => {
  /*  this is needed to prevent the dark outline
   from forming on touch of image */
  e.preventDefault();
  cartridgeFirstTouch = e.touches[0].clientY;
  fingerCartridgeOffset = getOffsetOfTouchObject(e).yOffset;

  console.log({
    cartridgeFirstTouch: cartridgeFirstTouch,
    cartrigeY: e.currentTarget.offsetTop,
    finger_cart_offset: fingerCartridgeOffset
  });
  hideInstructions();
  cartrigeLifted();
  //simulate lift effect
  tonearmImage.style.marginLeft = '10px';
};

const cartrigeTouchMoveHandler = (e) => {
  let newPosition = (e.touches[0].clientY - fingerCartridgeOffset - cartridgeDefaultY)
    , lowerLimit = 22
    , upperLimit = -213
    ;
  let direction = (e.touches[0].clientY < cartridgeFirstTouch) ? 'UP' : 'DOWN';
  //console.log('direction', direction, 'offsetTop', e.currentTarget.offsetTop, 'newPosition', newPosition);

  if ((e.currentTarget.offsetTop > cartridgeDefaultY) && (direction == 'DOWN')) {
    cleanUp();
    showInstructions();
  } else if (lowerLimit > newPosition && newPosition > upperLimit) {
    hideInstructions();
    calculateCartridgePos(-newPosition);
    tonearmImage.style.marginTop = newPosition + 'px';
    lastTouch = e.touches[0];
  } else if (lowerLimit < newPosition) {
    hideInstructions();
    calculateCartridgePos(-lowerLimit);
    tonearmImage.style.marginTop = lowerLimit + 'px';
  } else if (newPosition < upperLimit) {
    hideInstructions();
    calculateCartridgePos(-upperLimit);
    tonearmImage.style.marginTop = upperLimit + 'px';
  }

};

const cartridgeTouchEndHandler = (e) => {
  tonearmImage.style.marginLeft = '0px';
  cartridgePlaced(lastTouch.clientY - fingerCartridgeOffset - cartridgeDefaultY);
};

const calculateCartridgePos = (position) => {
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
};

const scrubberTouchStartHandler = (e)=> {
  e.preventDefault();
  scrubberFingerXOffset = getOffsetOfTouchObject(e).xOffset;
  scrubber.addEventListener('touchmove', scrubberTouchMoveHandler);

};

const reportTimelinePercentage = (currentPos) => {
  return ((parseInt(currentPos, 10) - scrubberDefaultX) / railWidth) * 100;
};

const scrubberTouchMoveHandler = (e) => {
  let newPosition = (e.touches[0].clientX - scrubberFingerXOffset - scrubberDefaultX)
    , lowerLimit = 0
    , upperLimit = railWidth;
  let newX = newPosition < lowerLimit ? lowerLimit :
    (newPosition >= upperLimit ? upperLimit : newPosition);
  scrubber.style.marginLeft = newX + 'px';

};

const scrubberTouchEndHandler = (e)=> {
  scrubber.removeEventListener('touchmove', scrubberTouchMoveHandler);
  seek(currentSong, (parseInt(scrubber.style.marginLeft, 10) / railWidth) * 100, sources);
  console.log(reportTimelinePercentage(scrubber.style.marginLeft));
};

//-- INIT
init();
draw();
rotate();

tonearmImage.addEventListener('touchstart', cartridgeTouchStartHandler);
tonearmImage.addEventListener('touchmove', cartrigeTouchMoveHandler);
tonearmImage.addEventListener('touchend', cartridgeTouchEndHandler);

scrubber.addEventListener('touchstart', scrubberTouchStartHandler);
scrubber.addEventListener('touchend', scrubberTouchEndHandler);


