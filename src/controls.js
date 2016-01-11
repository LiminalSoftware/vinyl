import {entries} from './util';
import platform from 'platform';

const qs = document.querySelector.bind(document)
  , scrubberDefaultX = 0;

var cartridgeUp = false;
var stateIsPause = true;
var scrubberFingerXOffset = 0;
var isProcessed = false;


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
    this.tonearm.addEventListener('touchmove', cartrigeTouchMoveHandler.bind(this));
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
    window.addEventListener('orientationchange', (e)=> {
      checkOrientation()
    });
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
    let offsetTop = qs('.tonearm').offsetTop;
    if (offsetTop > this.cartridgeYStart && this.audio.currentSong) {
      this.playhead.classList.remove('invisible');
      this.totalTimeSpan.innerText = this.audio.songList[this.audio.currentSong.index].duration;
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
    return (touch || this.lastTouch).clientY - this.lastFingerCartridgeOffset - this.cartridgeDefaultY
  }

  movePlayhead(railWidth, percentage, scrubberCenterOffset) {
    let newpos = ((this.railWidth * (percentage / 100))).toString() + 'px';
    this.scrubber.style.left = newpos;
    return newpos;
  }

  cleanUp() {
    this.currentTimeSpan.innerText = '';
    this.totalTimeSpan.innerText = '';
    this.songTitle.innerText = '';
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

function togglePlayPause(that) {
  if (!stateIsPause) {
    stateIsPause = true;
    that.playToPauseLeft.beginElement();
    that.playToPauseRight.beginElement();
    that.cartridgePlaced(that.calculateCartridgePosition())
  } else {
    stateIsPause = false;
    that.pauseToPlayLeft.beginElement();
    that.pauseToPlayRight.beginElement();
    that.cartridgeLifted()
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
    cartrigeY: e.currentTarget.offsetTop,
    lastFingerCartridgeOffset: this.lastFingerCartridgeOffset
  });
  showInstructions(false);
  this.cartridgeLifted();
}

function cartrigeTouchMoveHandler(e) {
  let newPosition = this.calculateCartridgePosition(e.touches[0])
    , lowerLimit = 22
    , upperLimit = -213
    , validDotIndex
    , currentSongTitle
    , currentSong
    , direction = (e.touches[0].clientY < this.cartridgeFirstTouch) ? 'UP' : 'DOWN'
    ;

  //CASE we are moving DOWN and we have reached the resting position
  if ((e.currentTarget.offsetTop > this.cartridgeDefaultY) && (direction == 'DOWN')) {
    this.cleanUp();
    showInstructions(true);
    this.playButton.classList.remove('bounce-up-show');
  } else if (lowerLimit > newPosition && newPosition > upperLimit) {
    showInstructions(false);
    validDotIndex = this.audio.getValidDotIndex(-newPosition);
    if (validDotIndex !== null) {
      this.audio.currentSong = this.audio.selectSong(validDotIndex);
    }
    this.tonearm.style.marginTop = newPosition + 'px';
    this.lastTouch = e.touches[0];

  } else if (lowerLimit < newPosition) {
    showInstructions(false);
    validDotIndex = this.audio.getValidDotIndex(-lowerLimit);
    if (validDotIndex !== null) {
      this.audio.currentSong = this.audio.selectSong(validDotIndex);
    }
    this.tonearm.style.marginTop = lowerLimit + 'px';

  } else if (newPosition < upperLimit) {
    showInstructions(false);
    validDotIndex = this.audio.getValidDotIndex(-upperLimit);
    if (validDotIndex !== null) {
      this.audio.currentSong = this.audio.selectSong(validDotIndex);
    }
    this.tonearm.style.marginTop = upperLimit + 'px';
  }

  this.cleanUp();
  //TODO: refactor --v
  if (this.audio.currentSong && validDotIndex != null) {
    activateSongDot(validDotIndex);
    if (this.audio.currentSong) {
      this.songTitle.innerText = this.audio.currentSong.title;
    }
  }
}

function cartridgeTouchEndHandler(e) {
  let currentCartridgePosY = e.changedTouches[0].clientY - e.currentTarget.offsetTop;
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
    this.tonearm.style.marginTop = (parseInt(this.tonearm.style.marginTop, 10) - 25) + 'px';
    deactivateDots();
    activateSongDot(index + 1);
    this.totalTimeSpan.innerText = this.audio.songList[index + 1].duration;
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
  blocker.className = 'rotate-blocker';
  instr.className = 'instructions';
  instr.textContent = 'Please Rotate the Device';//TODO: translate this to German
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
  if (isProcessed) {
    if (window.orientation !== 0) {
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
  let yOffset = e.touches[0].clientY - e.currentTarget.offsetTop;
  let xOffset = e.touches[0].clientX - e.currentTarget.offsetLeft;
  return {xOffset, yOffset};
}


