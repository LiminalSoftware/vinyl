import Controls from './controls';
import Audio from './audio';

require('script!./../node_modules/brim/dist/brim.js');
require('script!./../node_modules/scream/dist/scream.js');
require('script!./../node_modules/platform/platform.js');

document.addEventListener('DOMContentLoaded', function () {

  require('./style.css');

  const qs = document.querySelector.bind(document)
    , platter = qs('canvas.platter')
    , platterContext = platter.getContext('2d')
    , platterImage = qs('img.platter')
    , cartridgeYStart = 0
    , cartridgeYEnd = 216
    , selectors = {
    playButton: '#playbtn',
    tonearm: '.tonearm',
    currentTimeSpan: '#current-time',
    totalTimeSpan: '#total-time',
    playhead: '#header',
    scrubber: '.scrubber',
    rail: '.rail'
  }
    , scrubberCenterOffset = 20
    , fps = 30
    , rpm = 34.6
    , platterTranslateYPercent = 22.505
    , platterTranslateXPercent = 1.929
    , platterToPhoneWidthRatio = 559.424
    , numberOfSongs = 9
    , railWidth = parseInt(window.getComputedStyle(qs('.scrubber-container'), null).getPropertyValue('width'), 10) - (scrubberCenterOffset / 2)
    , songList = {
    0: {index: 0, id: 'nu-disco', title: 'Nu Disco', file: 'mixes/nu-disco.mp3', duration: '04:12'},
    1: {index: 1, id: 'cafe-del-mar', title: 'Cafe Del Mar', file: 'mixes/cafe-del-mar.mp3', duration: '05:41'},
    2: {index: 2, id: 'cosy-chill', title: 'Cosy Chill', file: 'mixes/cosy-chill.mp3', duration: '04:07'},
    3: {
      index: 3,
      id: 'chillout-dreams',
      title: 'Chillout Dreams',
      file: 'mixes/chillout-dreams.mp3',
      duration: '07:33'
    },
    4: {index: 4, id: 'club-hits-1', title: 'Club Hits 1', file: 'mixes/club-hits-1.mp3', duration: '05:03'},
    5: {index: 5, id: 'club-hits-2', title: 'Club Hits 2', file: 'mixes/club-hits-2.mp3', duration: '03:34'},
    6: {index: 6, id: 'club-hits-3', title: 'Club Hits 3', file: 'mixes/club-hits-3.mp3', duration: '03:17'},
    7: {index: 7, id: 'monster-beat', title: 'Monster Beat', file: 'mixes/monster-beat.mp3', duration: '05:34'},
    8: {index: 8, id: 'tsmgo', title: 'The Show Must Go On', file: 'songs/the-show-must-go-on.mp3', duration: '04:32'}
  };

  for (let song in songList) {
    let [min, sec] = songList[song].duration.split(':');
    songList[song].durationInMillisec = parseInt(min, 10) * 60 * 1000 + parseInt(sec, 10) * 1000;
  }


  const audio = new Audio({songList, numberOfSongs, cartridgeYStart, cartridgeYEnd});
  const controls = new Controls({audio, selectors, railWidth, cartridgeYStart});
  const {playSong, pauseSong, seek} = audio;
  const {togglePlayPause, cartridgePlaced, cartridgeLifted} = controls;

  var rotateIntervalId = 0
    , platterRotationDeg = 0
    ;


  function draw() {
    platter.width = window.innerWidth;
    platter.height = window.innerHeight;

    var width = 320// TODO: do we need to set this absolute width?
      , height = 480
      , recordDiameter = width * (platterToPhoneWidthRatio / 100)
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
  function initApp() {
    //remove hidden from #brim-main
    document.querySelector('#brim-main').classList.remove('hidden');
    draw();
    rotate();
  }

  window.initApp = initApp;

});
