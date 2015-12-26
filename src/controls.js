import {entries} from './util';

const qs = document.querySelector.bind(document)
  , scrubberDefaultY = 6
  , scrubberDefaultX = 0;

var cartridgeUp = false;
//set the playbutton to default paused state
var stateIsPause = true;
var scrubberFingerXOffset = 0;

export default class Controls {
  constructor({ audio, selectors, railWidth, cartridgeYStart }) {
    Object.keys(selectors).map((name)=> {
      this[name] = qs(selectors[name]);
    });
    //-- current selectors
    //playButton
    //tonearm
    //currentTimeSpan
    //totalTimeSpan
    //playhead
    //scrubber
    //rail

    this.audio = audio;
    this.railWidth = railWidth;
    this.cartridgeYStart = cartridgeYStart;
    this.playToPauseLeft = qs('#playToPauseLeft');
    this.playToPauseRight = qs('#playToPauseRight');
    this.pauseToPlayLeft = qs('#pauseToPlayLeft');
    this.pauseToPlayRight = qs('#pauseToPlayRight');
    this.disclaimerBtn = qs('.disclaimer-btn');

    this.cartridgeDefaultY = 348; //NOTE: identical to element's starting `top` css property

    this.suspendAutoScubberMovement = false;
    this.playToPauseLeft.beginElement();
    this.playToPauseRight.beginElement();

    this.playButton.addEventListener('touchend', togglePlayPauseHandler.bind(this));

    this.tonearm.addEventListener('touchstart', cartridgeTouchStartHandler.bind(this));
    this.tonearm.addEventListener('touchmove', cartrigeTouchMoveHandler.bind(this));
    this.tonearm.addEventListener('touchend', cartridgeTouchEndHandler.bind(this));

    this.scrubber.addEventListener('touchstart', scrubberTouchStartHandler.bind(this));
    this.scrubber.addEventListener('touchend', scrubberTouchEndHandler.bind(this));

    //set up custom event listener for moveHead
    document.addEventListener('moveHead', (e) => {
      let {currentSong, railWidth, percentage, scrubberCenterOffset, scrubber} = e.detail;
      if (!this.suspendAutoScubberMovement) {
        this.movePlayhead(this.railWidth, percentage, scrubberCenterOffset, this.scrubber);
      }
    }, false);


    function songEndHandler(e) {
      let {currentSong, target} = e.detail;
      target.pause();
      //check if there's a next song
      let lastSongIndex = this.audio.getLastSongIndex();
      let {index} = currentSong;
      if (index == lastSongIndex) {
        target.currentTime = 0;
        togglePlayPause(this)
      } else {
        //get the next song target
        //move the cartridge up by a predetermined amount (i.e., the space between dots 25px)
        this.tonearm.style.marginTop = (parseInt(this.tonearm.style.marginTop, 10) - 25) + 'px';
        deactivateDots();
        activateSongDot(index + 1);
        console.log('play next song: ', index + 1);
        this.totalTimeSpan.innerText = this.audio.songList[index + 1].duration;
        this.audio.playSong(index + 1)
      }

    }


    document.addEventListener('songEnd', songEndHandler.bind(this), false);
    this.disclaimerBtn.addEventListener('touchend', preprocessFiles.bind(this));
  }


  cartridgeLifted() {
    //simulate lift effect
    this.tonearm.classList.add('up');
    cartridgeUp = true;
    //hide playhead
    this.playhead.classList.add('invisible');
    this.audio.pauseSong();
    console.log('cartLifted');
  }

  cartridgePlaced(position) {
    console.log('cartridgePlaced');
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
    //TODO: different from `this.railWidth`?
    //let newpos = ((railWidth * (percentage / 100)) + scrubberCenterOffset).toString() + 'px';
    let newpos = ((this.railWidth * (percentage / 100))).toString() + 'px';
    //TODO: different from `this.scrubber`?
    console.log(`movePlayhead, railWidth ${this.railWidth}, percentage ${percentage} newpos ${newpos}`);
    this.scrubber.style.left = newpos;
    //console.log('moved scrubber', newpos);
    return newpos;
  }

  cleanUp() {
    this.currentTimeSpan.innerText = '';
    this.totalTimeSpan.innerText = '';
    deactivateDots();
    //this.playhead.classList.add('invisible');
    //qs('.buttons').classList.toggle('hidden');
    //qs('.instructions').classList.toggle('hidden');
    qs('.song-title').innerText = '';//TODO: refactor
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
  hideInstructions();
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
  //console.log('direction', direction, 'offsetTop', e.currentTarget.offsetTop, 'newPosition', newPosition);

  //CASE we are moving DOWN and we have reached the resting position
  if ((e.currentTarget.offsetTop > this.cartridgeDefaultY) && (direction == 'DOWN')) {
    this.cleanUp();
    showInstructions();
    this.playButton.classList.remove('bounce-up-show');
  } else if (lowerLimit > newPosition && newPosition > upperLimit) {
    hideInstructions();
    validDotIndex = this.audio.getValidDotIndex(-newPosition);
    if (validDotIndex !== null) {
      this.audio.currentSong = this.audio.selectSong(validDotIndex);
    }
    this.tonearm.style.marginTop = newPosition + 'px';
    this.lastTouch = e.touches[0];

  } else if (lowerLimit < newPosition) {
    hideInstructions();
    validDotIndex = this.audio.getValidDotIndex(-lowerLimit);
    if (validDotIndex !== null) {
      this.audio.currentSong = this.audio.selectSong(validDotIndex);
    }
    this.tonearm.style.marginTop = lowerLimit + 'px';

  } else if (newPosition < upperLimit) {
    hideInstructions();
    validDotIndex = this.audio.getValidDotIndex(-upperLimit);
    if (validDotIndex !== null) {
      this.audio.currentSong = this.audio.selectSong(validDotIndex);
    }
    console.log('currentSongTitle', currentSongTitle);
    this.tonearm.style.marginTop = upperLimit + 'px';
  }

  this.cleanUp();
  //TODO: refactor --v
  if (this.audio.currentSong && validDotIndex != null) {
    activateSongDot(validDotIndex);
    if (this.audio.currentSong) qs('.song-title').innerText = this.audio.currentSong.title;
  }
}

function cartridgeTouchEndHandler(e) {
  let currentCartridgePosY = e.changedTouches[0].clientY - e.currentTarget.offsetTop;
  //this.cartridgePlaced(this.lastTouch.clientY - this.lastFingerCartridgeOffset - this.cartridgeDefaultY);
  this.cartridgePlaced(currentCartridgePosY);
}

function scrubberTouchStartHandler(e) {
  e.preventDefault();
  this.suspendAutoScubberMovement = true;
  scrubberFingerXOffset = getOffsetOfTouchObject(e).xOffset;
  this.scrubber.addEventListener('touchmove', scrubberTouchMoveHandler.bind(this));
}

function reportTimelinePercentage(currentPos) {
  return ((parseInt(currentPos, 10) - scrubberDefaultX) / this.railWidth) * 100;
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
  //this.audio.seek((parseInt(this.scrubber.style.left, 10) - scrubberDefaultX / this.railWidth) * 100);
  this.audio.seek((parseInt(this.scrubber.style.left, 10) / this.railWidth) * 100);
}

function preprocessFiles(e) {
    //loop through all sources and trigger play/pause

  //remove .blocker
  this.audio.preprocessFiles()
  qs('#main').removeChild(qs('.blocker'));
}

//helper methods
function deactivateDots() {
  [].map.call(document.querySelectorAll('.dot'), function (el) {
    el.classList.remove('active');
  });
};

function activateSongDot(validDotIndex) {
  qs('#dot' + validDotIndex).className = 'dot active'
}

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

const getOffsetOfTouchObject = (e) => {
  let yOffset = e.touches[0].clientY - e.currentTarget.offsetTop;
  let xOffset = e.touches[0].clientX - e.currentTarget.offsetLeft;
  return {xOffset, yOffset};
};


