import {grabCartridge, releaseCartridge, grabPlayhead, releasePlayhead, updateTime} from './controls';
import {playSong, pauseSong} from './audio';

require('./style.css');

const qs = document.querySelector.bind(document)
  , qsa = document.querySelectorAll.bind(document)
  , platter = qs('canvas.platter')
  , platterContext = platter.getContext('2d')
  , platterImage = qs('img.platter')
  , tonearmImage = qs('.tonearm')
  , currentTimeSpan = qs('#current-time')
  , totalTimeSpan = qs('#total-time')
  , playhead = qs('#playhead')
  , fps = 30
  , rpm = 34.6
//, tableRotationDeg = 38.65

  , platterTranslateYPercent = 22.505
  , platterTranslateXPercent = 1.929
  , platterToPhoneWidthRatio = 559.424
  , numberOfSongs = 9
  , cartridgeDefaultY = 320 //NOTE: identical to element's starting `top` css property
  , cartridgeYStart = 320
  , cartridgeYEnd = -489
  , range = (cartridgeYEnd - cartridgeYStart) // the range of vertical motion of the cartridge
  , dotStep = Math.abs(range / numberOfSongs)
  , tonearmToPhoneWidthRatio = 447.770
  , tonearmAspectRatio = 1.744
  , tonearmRotate = qs('#tonearmRotate')
  , songList = {
    0: {title: 'Bohemian Rhapsody', file: 'songs/bohemian-rhapsody.mp3', duration: '05:53'},
    1: {title: 'We Will Rock You', file: 'songs/we-will-rock-you.mp3', duration: '02:03'},
    2: {title: 'Killer Queen', file: 'songs/killer-queen.mp3', duration: '03:01'},
    3: {title: 'We Are the Champions', file: 'songs/we-are-the-champions.mp3', duration: '03:03'},
    4: {title: 'Another One Bites the Dust', file: 'songs/another-one-bites-the-dust.mp3', duration: '03:37'},
    5: {title: 'Seven Seas Of Rhye', file: 'songs/seven-seas-of-rhye.mp3', duration: '02:49'},
    6: {title: 'Love Of My Life', file: 'songs/love-of-my-life.mp3', duration: '03:38'},
    7: {title: 'Play The Game', file: 'songs/play-the-game.mp3', duration: '03:32'},
    8: {title: 'The Show Must Go On', file: 'songs/the-show-must-go-on.mp3', duration: '04:32'}
  }
  , audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  ;

var tonearmRotationDeg = 0
  , rotateIntervalId = 0
  , platterRotationDeg = 0
  , cartridgeUp = false
  , lastTouch = null
  , dotSongLookup = []
  , lastSelectedSong = null
  , fingerCartridgeOffset
  ;

function between(x, min, max) {
  return x <= min && x >= max;
}

function init() {
  /* Create a lookup map for matching cartridge y pos to dot/song numbers */
  dotSongLookup = [];
  let start = cartridgeYStart - dotStep;//first position of the first song dot
  Array.from(Array(numberOfSongs).keys()).forEach((n)=> {
    let base = (start - (n * dotStep));
    let from = base + dotStep;
    let to = base - dotStep;
    dotSongLookup.push([from, to]);
    //dotSongLookup[(start - (n * dotStep))] = n;
  });
  console.log(dotSongLookup);
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
}

const cartrigeLifted = () => {
  cartridgeUp = true;
  //hide playhead
  playhead.classList.add('invisible');
  pauseSong();
};

const cleanUp = () => {
  console.log('cleaning up');
  currentTimeSpan.innerText = '';
  totalTimeSpan.innerText = '';
  deactivateDots();
  playhead.classList.add('invisible');
  document.querySelector('.song-title').innerText = '';//TODO: refactor
}

const cartrigePlaced = (position) => {
  cartridgeUp = false;
  if (lastSelectedSong > -1 && position < cartridgeYStart) {
    //show playhead
    playhead.classList.remove('invisible');
    totalTimeSpan.innerText = songList[lastSelectedSong].duration;
    //start song
    playSong(songList[lastSelectedSong], currentTimeSpan);
  } else if (position == cartridgeYStart) {
    //clean up
    cleanUp();
  }
};


const cartridgeTouchStartHandler = (e) => {
  fingerCartridgeOffset = (e.touches[0].clientY - e.currentTarget.offsetTop);
  console.log({fingerY: e.touches[0].clientY, cartrigeY: e.currentTarget.offsetTop, finger_cart_offset: e.touches[0].clientY - e.currentTarget.offsetTop});
  //console.log(the_offset);

  cartrigeLifted();
  tonearmImage.style.marginLeft = '10px';
};

const cartridgeTouchEndHandler = (e) => {
  tonearmImage.style.marginLeft = '0px';
  cartrigePlaced(e.target.y);
  console.log(e.target.y);
};

const calculateCartridgePos = (position) => {
  //if e.target.y is within range of [-281, -333]

  //console.log(e.touches[0].clientY);
  //console.log(e.currentTarget.offsetTop);
  //console.log({fingerY: e.touches[0].clientY, cartrigeY: e.currentTarget.offsetTop, finger_cart_offset: e.touches[0].clientY - e.currentTarget.offsetTop});
  let validDotIndex = dotSongLookup.findIndex((arr)=> {
    //return between(e.target.y, ...arr);
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

const cartrigeTouchMoveHandler = (e) => {
  //console.log(e);
  //console.log({fingerY: e.touches[0].clientY, cartrigeY: e.currentTarget.offsetTop, finger_cart_offset: e.touches[0].clientY - e.currentTarget.offsetTop});
  var newPosition = (e.touches[0].clientY - fingerCartridgeOffset - 320)
  //, lowerLimit = 35
    , lowerLimit = 45
  //, upperLimit = -200
    , upperLimit = -190
    ;

  calculateCartridgePos(newPosition);
  if (lowerLimit > newPosition && newPosition > upperLimit) {
    tonearmImage.style.marginTop = newPosition + 'px';
    lastTouch = e.touches[0];
  } else if (lowerLimit < newPosition) {
    tonearmImage.style.marginTop = lowerLimit + 'px';
  } else if (newPosition < upperLimit) {
    tonearmImage.style.marginTop = upperLimit + 'px';
  }
};

//-- INIT
init();
draw();
rotate();

tonearmImage.addEventListener('touchstart', cartridgeTouchStartHandler);
tonearmImage.addEventListener('touchmove', cartrigeTouchMoveHandler);
tonearmImage.addEventListener('touchend', cartridgeTouchEndHandler);
