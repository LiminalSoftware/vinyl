var
  qs = document.querySelector.bind(document)
  , platter = qs('canvas.platter')
  , platterContext = platter.getContext('2d')
  , platterImage = qs('img.platter')
  , tonearmImage = qs('img.tonearm')
  , fps = 30
  , rpm = 34.6
  , platterRotationDeg = 0
  , tonearmRotationDeg = 0
  //, tableRotationDeg = 38.65
  , rotateIntervalId

  , platterTranslateYPercent = 22.505
  , platterTranslateXPercent = 1.929
  , platterToPhoneWidthRatio = 559.424

  //, tonearmTranslateXPercent = 80.816
  //, tonearmTranslateYPercent = 12.052
  //, tonearmDrawXOffsetPercent = 77.763
  //, tonearmDrawYOffsetPercent = 26.626
  , tonearmToPhoneWidthRatio = 447.770
  , tonearmAspectRatio = 1.744
  , tonearmRotate = qs('#tonearmRotate')
  ;

tonearmRotate.oninput = function(){
  tonearmRotationDeg = -360 * (((tonearmRotate.value * 0.05) + 95) / 100) + 360;
};

function draw() {
  var width = platter.width =  window.innerWidth
    , height = platter.height = window.innerHeight
    , recordDiameter = width * (platterToPhoneWidthRatio/100)
    , tonearmWidth = window.innerWidth * (tonearmToPhoneWidthRatio/100)
    //, tonearmHeight = tonearmWidth / tonearmAspectRatio
    ;

  platterContext.translate(
    -(recordDiameter * (platterTranslateXPercent/100)),
    -(recordDiameter * (platterTranslateYPercent/100))
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

function rotate() {
  rotateIntervalId = setInterval(function(){
    platterRotationDeg =  platterRotationDeg + 360 / ((60/rpm) * fps);
    draw();
  }, 1000 / fps)
}

function stopRotate() {
  clearInterval(rotateIntervalId);
}

function degToRad(degrees) {
  return degrees * (Math.PI / 180)
}

//-- INIT
draw();
rotate();
