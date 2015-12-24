import Controls from './controls';
import Audio from './audio';
//import './polyfills';

require('./style.css');

const qs                     = document.querySelector.bind(document)
  , qsa                      = document.querySelectorAll.bind(document)
  , platter                  = qs('canvas.platter')
  , platterContext           = platter.getContext('2d')
  , platterImage             = qs('img.platter')
  , cartridgeYStart          = 0
  , cartridgeYEnd            = 216
  , selectors                = {
        playButton     : '#playbtn',
        tonearm        : '.tonearm',
        currentTimeSpan: '#current-time',
        totalTimeSpan  : '#total-time',
        playhead       : '#header',
        scrubber       : '.scrubber',
        rail           : '.rail'
      }
  , scrubberCenterOffset     = 20
  , fps                      = 30
  , rpm                      = 34.6
      //, tableRotationDeg = 38.65

  , platterTranslateYPercent = 22.505
  , platterTranslateXPercent = 1.929
  , platterToPhoneWidthRatio = 559.424
  , tonearmToPhoneWidthRatio = 447.770
  , tonearmAspectRatio       = 1.744

  , numberOfSongs            = 9
  , railWidth                = parseInt(window.getComputedStyle(qs('.rail'), null).getPropertyValue('width'), 10)
  , songList                 = {
        0: {index: 0, id: 'nu-disco', title: 'Nu Disco', file: 'mixes/nu-disco.mp3', duration: '04:12'},
        1: {index: 1, id: 'cafe-del-mar', title: 'Cafe Del Mar', file: 'mixes/cafe-del-mar.mp3', duration: '05:41'},
        2: {index: 2, id: 'cosy-chill', title: 'Cosy Chill', file: 'mixes/cosy-chill.mp3', duration: '04:07'},
        3: {index: 3, id: 'chillout-dreams', title: 'Chillout Dreams', file: 'mixes/chillout-dreams.mp3', duration: '07:33'},
        4: {index: 4, id: 'club-hits-1', title: 'Club Hits 1', file: 'mixes/club-hits-1.mp3', duration: '05:03'},
        5: {index: 5, id: 'monster-beat', title: 'Monster Beat', file: 'mixes/monster-beat.mp3', duration: '05:34'},
        6: {index: 6, id: 'loml', title: 'Love Of My Life', file: 'songs/love-of-my-life.mp3', duration: '03:38'},
        7: {index: 7, id: 'ptg', title: 'Play The Game', file: 'songs/play-the-game.mp3', duration: '03:32'},
        8: {index: 8, id: 'tsmgo', title: 'The Show Must Go On', file: 'songs/the-show-must-go-on.mp3', duration: '04:32'}
};

const audio = new Audio({songList, numberOfSongs, cartridgeYStart, cartridgeYEnd});
const controls = new Controls({audio, selectors, railWidth, cartridgeYStart});

const {playSong, pauseSong, seek} = audio;
const {togglePlayPause, cartridgePlaced, cartridgeLifted} = controls;

var {currentSong} = audio;


var tonearmRotationDeg = 0
  , rotateIntervalId   = 0
  , platterRotationDeg = 0
  , scrubberFingerXOffset
  ;


function draw() {
  //var width = platter.width = window.innerWidth
  platter.width = window.innerWidth;
  platter.height = window.innerHeight;

  var width          = 320
      //, height = platter.height = window.innerHeight
    , height         = 480
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


//-- INIT
draw();
rotate();




