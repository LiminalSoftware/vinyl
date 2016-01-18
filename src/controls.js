import {entries} from './util';
import platform from 'platform';
require('./vendor/modernizr-custom');

const qs = document.querySelector.bind(document)
  , scrubberDefaultX = 0;

var cartridgeUp = false;
var stateIsPause = true;
var scrubberFingerXOffset = 0;
// if platform is ios, initialize `isProcessed` to false; otherwize, set it to true so orientation check shows/hides message correctly
var isProcessed = !(platform.os.family == 'iOS' && parseInt(platform.os.version, 10) > 8 || platform.ua.indexOf('like Mac OS X') != -1);


export default class Controls {
  constructor({ audio, selectors, railWidth, cartridgeYStart }) {
    Object.keys(selectors).map((name)=> {
      this[name] = qs(selectors[name]);
    });
    /*
     -- current selectors:
     playButton
     tonearm
     currentTimeSpan
     totalTimeSpan
     playhead
     scrubber
     rail
     */

    this.audio = audio;
    this.railWidth = railWidth;
    this.cartridgeYStart = cartridgeYStart;
    this.playToPauseLeft = qs('#playToPauseLeft');
    this.songTitle = qs('.song-title');
    this.playToPauseRight = qs('#playToPauseRight');
    this.pauseToPlayLeft = qs('#pauseToPlayLeft');
    this.pauseToPlayRight = qs('#pauseToPlayRight');
    this.disclaimerBtn = qs('#confirm-to-play-button');
    this.cartridgeDefaultY = 348;
    this.suspendAutoScubberMovement = false;
    this.playToPauseLeft.beginElement();
    this.playToPauseRight.beginElement();

    /* EventListeners */
    this.playButton.addEventListener('touchend', togglePlayPauseHandler.bind(this));
    this.tonearm.addEventListener('touchstart', cartridgeTouchStartHandler.bind(this));
    this.tonearm.addEventListener('touchmove', cartridgeTouchMoveHandler.bind(this));
    this.tonearm.addEventListener('touchend', cartridgeTouchEndHandler.bind(this));
    this.scrubber.addEventListener('touchstart', scrubberTouchStartHandler.bind(this));
    this.scrubber.addEventListener('touchend', scrubberTouchEndHandler.bind(this));

    //set up custom event listener for moveHead
    document.addEventListener('moveHead', (e) => {
      let {percentage, scrubberCenterOffset} = e.detail;
      if (!this.suspendAutoScubberMovement) {
        this.movePlayhead(this.railWidth, percentage, scrubberCenterOffset, this.scrubber);
      }
    }, false);

    document.addEventListener('songEnd', songEndHandler.bind(this), false);
    this.disclaimerBtn.addEventListener('touchend', preprocessFiles.bind(this));

    //or use orientationchangeend
    let orientationChangeHandler = (e)=> {
      checkOrientation()
    };

    if (typeof(window.orientation) === 'undefined') {
      window.addEventListener('resize', function (e) {
        orientationChangeHandler(e);
      });
    }
    window.addEventListener('orientationchange', orientationChangeHandler);
  }


  cartridgeLifted() {
    /* simulate lift effect */
    cartridgeUp = true;
    this.tonearm.classList.add('up');
    this.playhead.classList.add('invisible');
    this.audio.pauseSong();
  }

  cartridgePlaced(position) {
    this.tonearm.classList.remove('up');
    cartridgeUp = false;
    let offsetTop = qs('.tonearm').getBoundingClientRect().top;
    if (offsetTop > this.cartridgeYStart && this.audio.currentSong) {
      this.playhead.classList.remove('invisible');
      this.totalTimeSpan.textContent = this.audio.songList[this.audio.currentSong.index].duration;
      this.audio.playSong();
      this.playButton.classList.add('bounce-up-show');
      resetPlayPauseButton(this);
    } else if (offsetTop > 348) {
      this.cleanUp(this);
      this.audio.pauseSong();
      togglePlayPause(this);
    } else {
      //-- case for playing a song different from what was playing last?
      this.playButton.classList.remove('bounce-up-show');
      this.audio.playSong();
      resetPlayPauseButton(this);
    }
  }

  calculateCartridgePosition(touch) {
    //console.log('last touch:');
    //console.log(this.lastTouch);
    //
    //console.log('\ntouch:');
    //console.log(touch);
    //console.log('clientY: ' + touch.clientY);
    //console.log('offset: ' + this.lastFingerCartridgeOffset);
    //console.log('defaultY: ' + this.cartridgeDefaultY);
    return (touch || this.lastTouch).clientY - this.lastFingerCartridgeOffset - this.cartridgeDefaultY
  }

  movePlayhead(railWidth, percentage, scrubberCenterOffset) {
    let newpos = ((this.railWidth * (percentage / 100))).toString() + 'px';
    this.scrubber.style.left = newpos;
    return newpos;
  }

  cleanUp() {
    this.currentTimeSpan.textContent = '';
    this.totalTimeSpan.textContent = '';
    this.songTitle.textContent = '';
    deactivateDots();
  }
}

function resetPlayPauseButton(that) {
  stateIsPause = true;
  that.playToPauseLeft.beginElement();
  that.playToPauseRight.beginElement();
}

function togglePlayPauseHandler(e) {
  e.preventDefault();
  togglePlayPause(this);
}

function playPlayback(that) {
  stateIsPause = true;
  that.playToPauseLeft.beginElement();
  that.playToPauseRight.beginElement();
  that.cartridgePlaced(that.calculateCartridgePosition())
}
function pausePlayback(that) {
  stateIsPause = false;
  that.pauseToPlayLeft.beginElement();
  that.pauseToPlayRight.beginElement();
  that.cartridgeLifted()
}
function togglePlayPause(that) {
  if (!stateIsPause) {
    playPlayback(that);
  } else {
    pausePlayback(that);
  }
}

function cartridgeTouchStartHandler(e) {
  /*  this is needed to prevent the dark outline
   from forming on touch of image */
  e.preventDefault();
  this.lastTouch = e.touches[0];
  this.cartridgeFirstTouch = e.touches[0].clientY;
  this.lastFingerCartridgeOffset = getOffsetOfTouchObject(e).yOffset;

  console.log({
    cartridgeFirstTouch: this.cartridgeFirstTouch,
    cartridgeY: e.currentTarget.getBoundingClientRect().top,
    lastFingerCartridgeOffset: this.lastFingerCartridgeOffset
  });
  showInstructions(false);
  pausePlayback(this, true);
}

function cartridgeTouchMoveHandler(e) {
  let newPosition = this.calculateCartridgePosition(e.touches[0])
    , lowerLimit = 22
    , upperLimit = -213
    , validDotIndex
    , currentSongTitle
    , currentSong
    , direction = (e.touches[0].clientY < this.cartridgeFirstTouch) ? 'UP' : 'DOWN'
    ;

  //console.log('new pos: ' + newPosition);

  //CASE we are moving DOWN and we have reached the resting position
  if ((e.currentTarget.getBoundingClientRect().top > this.cartridgeDefaultY) && (direction == 'DOWN')) {
    this.cleanUp();
    showInstructions(true);
    this.playButton.classList.remove('bounce-up-show');
  } else if (lowerLimit > newPosition && newPosition > upperLimit) {
    showInstructions(false);
    validDotIndex = this.audio.getValidDotIndex(-newPosition);
    if (validDotIndex !== null) {
      this.audio.currentSong = this.audio.selectSong(validDotIndex);
    }
    this.tonearm.style.transform = 'translateY(' + newPosition + 'px' + ')';
    this.lastTouch = e.touches[0];

  } else if (lowerLimit < newPosition) {
    showInstructions(false);
    validDotIndex = this.audio.getValidDotIndex(-lowerLimit);
    if (validDotIndex !== null) {
      this.audio.currentSong = this.audio.selectSong(validDotIndex);
    }
    this.tonearm.style.transform = 'translateY(' + lowerLimit + 'px' + ')';

  } else if (newPosition < upperLimit) {
    showInstructions(false);
    validDotIndex = this.audio.getValidDotIndex(-upperLimit);
    if (validDotIndex !== null) {
      this.audio.currentSong = this.audio.selectSong(validDotIndex);
    }
    this.tonearm.style.transform = 'translateY(' + upperLimit + 'px' + ')';
  }

  this.cleanUp();
  //TODO: refactor --v
  console.log('wait for it...');
  if (this.audio.currentSong && validDotIndex != null) {
    console.log('almost...');
    activateSongDot(validDotIndex);
    if (this.audio.currentSong) {
      console.log(this.songTitle);
      this.songTitle.textContent = this.audio.currentSong.title;
    }
  }
}

function cartridgeTouchEndHandler(e) {
  let currentCartridgePosY = e.changedTouches[0].clientY - e.currentTarget.getBoundingClientRect().top;
  this.cartridgePlaced(currentCartridgePosY);
}

function scrubberTouchStartHandler(e) {
  e.preventDefault();
  /* We need to suspend the auto scrubber movement when the user drags it */
  this.suspendAutoScubberMovement = true;
  scrubberFingerXOffset = getOffsetOfTouchObject(e).xOffset;
  this.scrubber.addEventListener('touchmove', scrubberTouchMoveHandler.bind(this));
}

function scrubberTouchMoveHandler(e) {
  let newPosition = (e.touches[0].clientX - scrubberFingerXOffset - scrubberDefaultX)
    , lowerLimit = 0
    , upperLimit = this.railWidth;
  let newX = newPosition < lowerLimit ? lowerLimit :
    (newPosition >= upperLimit ? upperLimit : newPosition);
  this.scrubber.style.left = newX + 'px';
}

function scrubberTouchEndHandler(e) {
  this.suspendAutoScubberMovement = false;
  this.scrubber.removeEventListener('touchmove', scrubberTouchMoveHandler);
  this.audio.seek((parseInt(this.scrubber.style.left, 10) / this.railWidth) * 100);
}

function songEndHandler(e) {
  let {currentSong, target} = e.detail;
  target.pause();
  /* check if there's a next song */
  let lastSongIndex = this.audio.getLastSongIndex();
  let {index} = currentSong;
  if (index == lastSongIndex) {
    target.currentTime = 0;
    togglePlayPause(this)
  } else {
    /*
     get the next song target
     move the cartridge up by a predetermined amount (i.e., the space between dots 25px)
     */
    this.tonearm.style.transform = (parseInt(this.tonearm.style.transform.match(/translateY\((\d+)\)/)[1], 10) - 25) + 'px';
    deactivateDots();
    activateSongDot(index + 1);
    this.totalTimeSpan.textContent = this.audio.songList[index + 1].duration;
    this.audio.playSong(index + 1)
  }
}

function preprocessFiles(e) {
  //loop through all sources and trigger play/pause
  this.audio.preprocessFiles();
  qs('#main').removeChild(qs('.button-blocker'));
  qs('.step-1').classList.remove('hidden');
  isProcessed = true;
  checkOrientation();
}

function showRotationWarning() {
  //insert blocker into DOM
  let blocker = document.createElement('div');
  let instr = document.createElement('p');
  let rotate = document.createElement('div');
  rotate.className = 'rotate';
  rotate.innerHTML = '<svg width="52px" height="52px" viewBox="0 0 52 52" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Group" transform="translate(26.000000, 26.000000) rotate(-90.000000) translate(-26.000000, -26.000000) " fill="#FFFFFF"> <path d="M47.992,39.47 L45.36,39.47 C49.39,35.793 51.596,31.072 51.596,26.067 C51.596,20.722 49.083,15.703 44.521,11.934 C44.31,11.759 43.994,11.788 43.817,12 C43.641,12.213 43.671,12.528 43.884,12.704 C48.212,16.279 50.596,21.024 50.596,26.065 C50.596,30.848 48.425,35.354 44.503,38.862 L44.503,36.129 C44.503,35.853 44.279,35.629 44.003,35.629 C43.728,35.629 43.503,35.853 43.503,36.129 L43.503,39.97 C43.503,40.246 43.728,40.47 44.003,40.47 L47.989,40.47 C48.265,40.47 48.489,40.246 48.489,39.97 C48.49,39.694 48.269,39.47 47.992,39.47 L47.992,39.47 Z" id="Shape"></path> <path d="M8.129,11.526 L4.142,11.526 C3.866,11.526 3.642,11.75 3.642,12.026 C3.642,12.302 3.866,12.526 4.142,12.526 L6.794,12.526 C2.668,16.221 0.403,20.995 0.403,26.065 C0.403,31.408 2.916,36.426 7.478,40.198 C7.571,40.274 7.684,40.311 7.796,40.311 C7.94,40.311 8.083,40.249 8.182,40.129 C8.358,39.916 8.328,39.602 8.115,39.426 C3.787,35.848 1.403,31.104 1.403,26.065 C1.403,21.224 3.621,16.667 7.629,13.147 L7.629,15.756 C7.629,16.032 7.853,16.256 8.129,16.256 C8.405,16.256 8.629,16.032 8.629,15.756 L8.629,12.027 C8.629,11.75 8.405,11.526 8.129,11.526 L8.129,11.526 Z" id="Shape"></path> <path d="M33.817,0.935 L18.185,0.935 C15.648,0.935 13.583,2.997 13.583,5.535 L13.583,46.459 C13.583,49 15.647,51.066 18.185,51.066 L33.818,51.066 C36.355,51.066 38.421,49 38.421,46.459 L38.421,5.533 C38.42,2.997 36.354,0.935 33.817,0.935 L33.817,0.935 Z M37.42,46.457 C37.42,48.446 35.805,50.063 33.817,50.063 L18.185,50.063 C16.199,50.063 14.583,48.446 14.583,46.457 L14.583,5.533 C14.583,3.548 16.199,1.933 18.185,1.933 L33.818,1.933 C35.804,1.933 37.421,3.547 37.421,5.533 L37.421,46.457 L37.42,46.457 Z" id="Shape"></path> <path d="M26,43.715 C24.574,43.715 23.413,44.877 23.413,46.306 C23.413,47.734 24.574,48.894 26,48.894 C27.425,48.894 28.585,47.734 28.585,46.306 C28.586,44.877 27.426,43.715 26,43.715 L26,43.715 Z M26,47.894 C25.125,47.894 24.413,47.181 24.413,46.306 C24.413,45.429 25.125,44.715 26,44.715 C26.875,44.715 27.585,45.429 27.585,46.306 C27.586,47.181 26.875,47.894 26,47.894 L26,47.894 Z" id="Shape"></path> <path d="M35.705,6.847 L16.296,6.847 C16.02,6.847 15.796,7.071 15.796,7.347 L15.796,42.339 C15.796,42.615 16.02,42.839 16.296,42.839 L35.705,42.839 C35.981,42.839 36.205,42.615 36.205,42.339 L36.205,7.347 C36.205,7.069 35.981,6.847 35.705,6.847 L35.705,6.847 Z M35.205,41.839 L16.796,41.839 L16.796,7.847 L35.205,7.847 L35.205,41.839 L35.205,41.839 Z" id="Shape"></path> </g> </g> </svg>'
  blocker.className = 'rotate-blocker';
  instr.className = 'instructions';
  instr.textContent = 'Dreh das Gerät';//Please rotate the device
  blocker.appendChild(instr);
  blocker.appendChild(rotate);
  qs('#main').insertBefore(blocker, qs('#header'));
}

function removeRotationWarning() {
  let rotateBlocker = qs('.rotate-blocker');
  if (rotateBlocker) qs('#main').removeChild(rotateBlocker);
}

function checkOrientation() {
  let p = platform.os.family;
  if (p === null) {
    return;
  }
  //-- TODO: refactor
  if (isProcessed) {
    if (window.orientation !== 0 ||
      (typeof(window.orientation) === 'undefined' && window.innerWidth > window.innerHeight)) {
      showRotationWarning()
    } else {
      removeRotationWarning();
    }
  }
}

//helper methods
function deactivateDots() {
  [].map.call(document.querySelectorAll('.dot'), function (el) {
    el.classList.remove('active');
  });
}

function activateSongDot(validDotIndex) {
  qs('#dot' + validDotIndex).className = 'dot active'
}

function showInstructions(show) {
  let action = show ? 'remove' : 'add';
  let actionInverse = show ? 'add' : 'remove';
  qs('.buttons').classList[actionInverse]('hidden');
  qs('.instructions').classList[action]('hidden');
  qs('.down-arrow').classList[action]('hidden');
}

function getOffsetOfTouchObject(e) {
  let boundingRect = e.currentTarget.getBoundingClientRect();
  let yOffset = e.touches[0].clientY - boundingRect.top;
  let xOffset = e.touches[0].clientX - boundingRect.left;
  return {xOffset, yOffset};
}


