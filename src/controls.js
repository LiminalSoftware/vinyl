import {pauseSong, resumeSong} from './audio';

var playButton = document.querySelector('#playbtn');
var playToPauseLeft = document.querySelector('#playToPauseLeft');
var playToPauseRight = document.querySelector('#playToPauseRight');
var pauseToPlayLeft = document.querySelector('#pauseToPlayLeft');
var pauseToPlayRight = document.querySelector('#pauseToPlayRight');
var stateIsPause = false;
playButton.addEventListener('touchend', togglePlayPause);


//set the button to a playing state, which should be the default
stateIsPause = true;
playToPauseLeft.beginElement();
playToPauseRight.beginElement();


export function togglePlayPause(e) {
  console.log('togglePlayPause', stateIsPause);
  e.preventDefault();
  if (!stateIsPause) {
    stateIsPause = true;
    playToPauseLeft.beginElement();
    playToPauseRight.beginElement();
    resumeSong();
  } else {
    stateIsPause = false;
    pauseToPlayLeft.beginElement();
    pauseToPlayRight.beginElement();
    pauseSong();
  }
}

export function movePlayhead(railWidth, percentage, scrubberCenterOffset, scrubber) {
  let newpos = ((railWidth * (percentage / 100)) + scrubberCenterOffset).toString() + 'px';
  scrubber.style.left = newpos;
  return newpos;
}