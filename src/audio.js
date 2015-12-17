var currentSong = {};

function setSongTitle(title) {
  document.querySelector('.song-title').innerText = title;
}

export function playSong(song, currentTimeSpan) {
  //set current song so that we could stop/pause it later
  currentSong = song;
  setSongTitle(song.title);
  currentTimeSpan.innerText = '00:00'
  console.log('playing song: ', song.file);
}

export function pauseSong() {
  console.log('pausing song: ', currentSong.file);
}
