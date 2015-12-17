const qs = document.querySelector.bind(document)
  , platter = qs('canvas.platter')
  , platterContext = platter.getContext('2d')
  , platterImage = qs('img.platter')
  , tonearmImage = qs('img.tonearm')
  , fps = 30
  , rpm = 34.6
//, tableRotationDeg = 38.65

  , platterTranslateYPercent = 22.505
  , platterTranslateXPercent = 1.929
  , platterToPhoneWidthRatio = 559.424

  , tonearmToPhoneWidthRatio = 447.770
  , tonearmAspectRatio = 1.744
  , tonearmRotate = qs('#tonearmRotate')
  ;

var tonearmRotationDeg = 0;
var rotateIntervalId = 0;
var platterRotationDeg = 0;

tonearmRotate.oninput = function () {
  tonearmRotationDeg = -360 * (((tonearmRotate.value * 0.05) + 95) / 100) + 360;
};

function draw() {
  //var width = platter.width = window.innerWidth
  platter.width = window.innerWidth;
  platter.height = window.innerHeight;

  var width =  320
    //, height = platter.height = window.innerHeight
    , height = 480
    , recordDiameter = width * (platterToPhoneWidthRatio / 100)
    //, tonearmWidth = window.innerWidth * (tonearmToPhoneWidthRatio / 100)
  //, tonearmHeight = tonearmWidth / tonearmAspectRatio
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
draw();
rotate();
