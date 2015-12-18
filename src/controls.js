export function movePlayhead(railWidth, percentage, scrubberCenterOffset, scrubber) {
  let newpos = ((railWidth * (percentage/100)) + scrubberCenterOffset).toString()  + 'px';
  scrubber.style.left = newpos;
  return newpos;
}

export function grabCartridge() {
  console.log('grabbing cartridge');
}

export function releaseCartridge() {
  console.log('releasing cartridge');
}

export function grabPlayhead() {
  console.log('grabbing Playhead');
}

export function releasePlayhead() {
  console.log('grabbing Playhead');
}

export function updateTime(time) {
  console.log('updating time: ', time);
}


