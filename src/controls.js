//import {selectSong, pauseSong, resumeSong} from './audio';
export default function initControl(audio) {
  const {selectSong, pauseSong, resumeSong} = audio;
  const qs             = document.querySelector.bind(document)
    , playButton       = qs('#playbtn')
    , playToPauseLeft  = qs('#playToPauseLeft')
    , playToPauseRight = qs('#playToPauseRight')
    , pauseToPlayLeft  = qs('#pauseToPlayLeft')
    , pauseToPlayRight = qs('#pauseToPlayRight')
    , tonearm          = qs('.tonearm')
    , tonearmImage     = qs('.tonearm')
    , scrubber         = qs('.scrubber')
    ;


//set the button to a playing state, which should be the default
  var stateIsPause      = true //false
    , cartridgeUp       = false
    , lastFingerCartridgeOffset
    , cartridgeFirstTouch
    , lastTouch         = null
    , cartridgeDefaultY = 343 //NOTE: identical to element's starting `top` css property
    ;

  playToPauseLeft.beginElement();
  playToPauseRight.beginElement();

//helper methods
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
    lastFingerCartridgeOffset = getOffsetOfTouchObject(e).yOffset;

    console.log({
      cartridgeFirstTouch: cartridgeFirstTouch,
      cartrigeY          : e.currentTarget.offsetTop,
      finger_cart_offset : lastFingerCartridgeOffset
    });
    hideInstructions();
    cartridgeLifted();
    //simulate lift effect
    tonearmImage.classList.add('up');
  };

  const cartrigeTouchMoveHandler = (e) => {
    let newPosition = calculateCartridgePosition(e.touches[0])
      , lowerLimit  = 22
      , upperLimit  = -213
      ;
    let direction = (e.touches[0].clientY < cartridgeFirstTouch) ? 'UP' : 'DOWN';
    //console.log('direction', direction, 'offsetTop', e.currentTarget.offsetTop, 'newPosition', newPosition);

    if ((e.currentTarget.offsetTop > cartridgeDefaultY) && (direction == 'DOWN')) {
      cleanUp();
      showInstructions();
    } else if (lowerLimit > newPosition && newPosition > upperLimit) {
      hideInstructions();
      selectSong(-newPosition);
      tonearmImage.style.marginTop = newPosition + 'px';
      lastTouch = e.touches[0];
    } else if (lowerLimit < newPosition) {
      hideInstructions();
      selectSong(-lowerLimit);
      tonearmImage.style.marginTop = lowerLimit + 'px';
    } else if (newPosition < upperLimit) {
      hideInstructions();
      selectSong(-upperLimit);
      tonearmImage.style.marginTop = upperLimit + 'px';
    }

  };

  const cartridgeTouchEndHandler = (e) => {
    tonearmImage.classList.remove('up');
    cartridgePlaced(lastTouch.clientY - lastFingerCartridgeOffset - cartridgeDefaultY);
  };

//TODO: rename so something like "selectSong"
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
      , lowerLimit  = 0
      , upperLimit  = railWidth;
    let newX = newPosition < lowerLimit ? lowerLimit :
      (newPosition >= upperLimit ? upperLimit : newPosition);
    scrubber.style.marginLeft = newX + 'px';

  };

  const scrubberTouchEndHandler = (e)=> {
    scrubber.removeEventListener('touchmove', scrubberTouchMoveHandler);
    seek(currentSong, (parseInt(scrubber.style.marginLeft, 10) / railWidth) * 100, sources);
    console.log(reportTimelinePercentage(scrubber.style.marginLeft));
  };

//-- PUBLIC INTERFACE
  function togglePlayPause(e) {
    console.log('togglePlayPause', stateIsPause);
    e.preventDefault();
    if (!stateIsPause) {
      stateIsPause = true;
      playToPauseLeft.beginElement();
      playToPauseRight.beginElement();
      //resumeSong();
      cartridgePlaced(calculateCartridgePosition())
    } else {
      stateIsPause = false;
      pauseToPlayLeft.beginElement();
      pauseToPlayRight.beginElement();
      //pauseSong();
      cartridgeLifted()
    }
  }

  function movePlayhead(railWidth, percentage, scrubberCenterOffset, scrubber) {
    let newpos = ((railWidth * (percentage / 100)) + scrubberCenterOffset).toString() + 'px';
    scrubber.style.left = newpos;
    return newpos;
  }

  function cartridgeLifted() {
    cartridgeUp = true;
    //hide playhead
    playhead.classList.add('invisible');
    pauseSong();
  };

  function cartridgePlaced(position) {
    cartridgeUp = false;

    if (lastSelectedSong > -1 && position < cartridgeYStart) {
      //show playhead
      playhead.classList.remove('invisible');
      hideInstructions();
      totalTimeSpan.innerText = songList[lastSelectedSong].duration;
      //start song
      playSong(sources, songList[lastSelectedSong], currentTimeSpan);

      //show play-pause-btn
      document.querySelector('#playbtn').classList.add('bounce-up-show');

    } else if (position == cartridgeYStart) {
      //hide play-pause-btn
      //clean up
      cleanUp();
    } else {
      document.querySelector('#playbtn').classList.remove('bounce-up-show');
    }
  };

  function calculateCartridgePosition(touch) {
    return (touch || lastTouch).clientY - lastFingerCartridgeOffset - cartridgeDefaultY
  };


//-- INIT
  playButton.addEventListener('touchend', togglePlayPause);

  tonearmImage.addEventListener('touchstart', cartridgeTouchStartHandler);
  tonearmImage.addEventListener('touchmove', cartrigeTouchMoveHandler);
  tonearmImage.addEventListener('touchend', cartridgeTouchEndHandler);

  scrubber.addEventListener('touchstart', scrubberTouchStartHandler);
  scrubber.addEventListener('touchend', scrubberTouchEndHandler);

  return {
    togglePlayPause,
    movePlayhead,
    cartridgeLifted,
    cartridgePlaced,
    calculateCartridgePosition
  }
}
