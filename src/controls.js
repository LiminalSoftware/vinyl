import {entries} from './util';

const qs = document.querySelector.bind(document)
  ;

export default class Controls {
  constructor({ audio, selectors, railWidth }) {
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
    this.playToPauseLeft = qs('#playToPauseLeft');
    this.playToPauseRight = qs('#playToPauseRight');
    this.pauseToPlayLeft = qs('#pauseToPlayLeft');
    this.pauseToPlayRight = qs('#pauseToPlayRight');
    this.stateIsPause = true;
    this.cartridgeDefaultY = 343; //NOTE: identical to element's starting `top` css property
    this.cartridgeUp = false;

    this.playButton.addEventListener('touchend', togglePlayPause(this));

    this.tonearm.addEventListener('touchstart', cartridgeTouchStartHandler(this));
    this.tonearm.addEventListener('touchmove', cartrigeTouchMoveHandler(this));
    this.tonearm.addEventListener('touchend', cartridgeTouchEndHandler(this));

    this.scrubber.addEventListener('touchstart', scrubberTouchStartHandler(this));
    this.scrubber.addEventListener('touchend', scrubberTouchEndHandler(this));
  }

  cartridgeLifted() {
    this.cartridgeUp = true;
    //hide playhead
    this.playhead.classList.add('invisible');
    this.audio.pauseSong();
  }

  cartridgePlaced(position) {
    this.cartridgeUp = false;

    if (this.lastSelectedSong > -1 && position < this.cartridgeYStart) {
      //show playhead
      this.playhead.classList.remove('invisible');
      hideInstructions();
      this.totalTimeSpan.innerText = this.audio.songList[lastSelectedSong].duration;
      //start song
      // v-- should this be factored out?
      this.audio.playSong(this.audio.sources, songList[lastSelectedSong], this.currentTimeSpan);

      //show play-pause-btn
      this.playButton.classList.add('bounce-up-show');

    } else if (position == this.cartridgeYStart) {
      //hide play-pause-btn
      //clean up
      cleanUp(this);
    } else {
      this.playButton.classList.remove('bounce-up-show');
    }
  }

  calculateCartridgePosition(touch) {
    return (touch || this.lastTouch).clientY - this.lastFingerCartridgeOffset - this.cartridgeDefaultY
  }

  movePlayhead(railWidth, percentage, scrubberCenterOffset, scrubber) {
    //TODO: different from `this.railWidth`?
    let newpos = ((railWidth * (percentage / 100)) + this.scrubberCenterOffset).toString() + 'px';
    //TODO: different from `this.scrubber`?
    scrubber.style.left = newpos;
    return newpos;
  }

}

//playToPauseLeft.beginElement();
//playToPauseRight.beginElement();
function togglePlayPause(that) {
  return (e)=> {
    console.log('togglePlayPause', that.stateIsPause);
    e.preventDefault();
    if (!stateIsPause) {
      that.stateIsPause = true;
      that.playToPauseLeft.beginElement();
      that.playToPauseRight.beginElement();
      that.cartridgePlaced(that.calculateCartridgePosition())
    } else {
      that.stateIsPause = false;
      that.pauseToPlayLeft.beginElement();
      that.pauseToPlayRight.beginElement();
      that.cartridgeLifted()
    }
  }
}

function cartridgeTouchStartHandler(that) {
  return (e)=> {
    /*  that is needed to prevent the dark outline
     from forming on touch of image */
    e.preventDefault();
    that.lastTouch = e.touches[0];
    that.cartridgeFirstTouch = e.touches[0].clientY;
    that.lastFingerCartridgeOffset = getOffsetOfTouchObject(e).yOffset;

    console.log({
      cartridgeFirstTouch: that.cartridgeFirstTouch,
      cartrigeY          : e.currentTarget.offsetTop,
      finger_cart_offset : that.lastFingerCartridgeOffset
    });
    hideInstructions();
    that.cartridgeLifted();
    //simulate lift effect
    that.tonearm.classList.add('up');
  }
}

function cartrigeTouchMoveHandler(that) {
  return (e)=> {
    let newPosition = that.calculateCartridgePosition(e.touches[0])
      , lowerLimit  = 22
      , upperLimit  = -213
      ;
    let direction = (e.touches[0].clientY < that.cartridgeFirstTouch) ? 'UP' : 'DOWN';
    //console.log('direction', direction, 'offsetTop', e.currentTarget.offsetTop, 'newPosition', newPosition);

    if ((e.currentTarget.offsetTop > that.cartridgeDefaultY) && (direction == 'DOWN')) {
      cleanUp();
      showInstructions();
    } else if (lowerLimit > newPosition && newPosition > upperLimit) {
      hideInstructions();
      that.audio.selectSong(-newPosition);
      that.tonearm.style.marginTop = newPosition + 'px';
      that.lastTouch = e.touches[0];
    } else if (lowerLimit < newPosition) {
      hideInstructions();
      that.audio.selectSong(-lowerLimit);
      that.tonearm.style.marginTop = lowerLimit + 'px';
    } else if (newPosition < upperLimit) {
      hideInstructions();
      that.audio.selectSong(-upperLimit);
      that.tonearm.style.marginTop = upperLimit + 'px';
    }
  }
}

function cartridgeTouchEndHandler(that) {
  return (e)=> {
    that.tonearm.classList.remove('up');
    that.cartridgePlaced(that.lastTouch.clientY - that.lastFingerCartridgeOffset - that.cartridgeDefaultY);
  }
}

function scrubberTouchStartHandler(that) {
  return (e)=> {
    e.preventDefault();
    that.scrubberFingerXOffset = getOffsetOfTouchObject(e).xOffset;
    that.scrubber.addEventListener('touchmove', that.scrubberTouchMoveHandler);
  }
}

function reportTimelinePercentage(currentPos) {
  return ((parseInt(currentPos, 10) - scrubberDefaultX) / this.railWidth) * 100;
}

function scrubberTouchMoveHandle(that) {
  return (e)=> {
    let newPosition = (e.touches[0].clientX - that.scrubberFingerXOffset - that.scrubberDefaultX)
      , lowerLimit  = 0
      , upperLimit  = that.railWidth;
    let newX = newPosition < lowerLimit ? lowerLimit :
      (newPosition >= upperLimit ? upperLimit : newPosition);
    that.scrubber.style.marginLeft = newX + 'px';
  }
}

function scrubberTouchEndHandler(that) {
  return (e)=> {
    scrubber.removeEventListener('touchmove', scrubberTouchMoveHandler);
    seek(currentSong, (parseInt(scrubber.style.marginLeft, 10) / that.railWidth) * 100, sources);
    console.log(reportTimelinePercentage(scrubber.style.marginLeft));
  }
}

//helper methods
function cleanUp(that) {
  that.currentTimeSpan.innerText = '';
  that.totalTimeSpan.innerText = '';
  //that.deactivateDots(); //TODO: needed?
  that.playhead.classList.add('invisible');
  qs('.buttons').classList.toggle('hidden');
  qs('.instructions').classList.toggle('hidden');
  qs('.song-title').innerText = '';//TODO: refactor
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

const getOffsetOfTouchObject = (e) => {
  let yOffset = e.touches[0].clientY - e.currentTarget.offsetTop;
  let xOffset = e.touches[0].clientX - e.currentTarget.offsetLeft;
  return {xOffset, yOffset};
};


