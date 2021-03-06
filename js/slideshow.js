// Indicates manual (true) or automatic (false) slideshow
var MANUAL_SLIDESHOW     = false;
// Automatic slideshow interval in milliseconds
var SLIDESHOW_INTERVAL   = 3000;
// Indicates audio (true) or no audio (false) during slideshow
var SLIDESHOW_AUDIO      = false;
// Indicates beginning slide (-1 indicates none)
var SLIDESHOW_INDEX_FROM = -1;
// Indicates ending slide (-1 indicates none)
var SLIDESHOW_INDEX_TO   = -1;

// Current slide index
var slideIndex;
// Timeout object (Number representing timer ID)
var slideshowTimeout = null;
// Sound object (HTMLAudioElement object)
var slideshowSound = null;
// Array of slides with class "tripPix"
var slideshowElems = document.getElementsByClassName("tripPix");
// Indicates if slideshow has valid from/to specified
var slideshowFromTo = false;

// Allow for override of default behavior in URL via query parameters
if ("URLSearchParams" in window) {
  var urlParams = new URLSearchParams(window.location.search);
  var urlParam = urlParams.get('mode');
  if (urlParam === 'manual') {
    MANUAL_SLIDESHOW = true;
  }
  urlParam = urlParams.get('interval');
  if (urlParam != null && urlParam.match(/^\d+$/)) {
    SLIDESHOW_INTERVAL = parseInt(urlParam);
  }
  urlParam = urlParams.get('from');
  if (/^\d+$/.test(urlParam)) {
    SLIDESHOW_INDEX_FROM = parseInt(urlParam, 10);
    if (isNaN(SLIDESHOW_INDEX_FROM) || SLIDESHOW_INDEX_FROM < 0) SLIDESHOW_INDEX_FROM = -1;
  }
  urlParam = urlParams.get('to');
  if (/^\d+$/.test(urlParam)) {
    SLIDESHOW_INDEX_TO = parseInt(urlParam, 10);
    if (isNaN(SLIDESHOW_INDEX_TO) || SLIDESHOW_INDEX_TO < 0) SLIDESHOW_INDEX_TO = -1;
  }
  if (SLIDESHOW_INDEX_FROM > -1 || SLIDESHOW_INDEX_TO > -1) {
    slideshowFromTo = true;
  }
}

// reduceSlideshow removes elements from slideshowElems that are outside specified from/to range
function reduceSlideshow() {
  var i;

  // Start at end so that remove() does not affect index
  for (i = slideshowElems.length - 1; i > -1; i--) {
    var path = slideshowElems[i].src;
    var index = path.lastIndexOf('/');
    if (index >= 0 && path.lastIndexOf('.jpg') > index) {
      var file = path.substring(index + 1, path.lastIndexOf('.'));
      if (file.match(/^[0-9]{3}_/)) {
        num = parseInt(file.substring(0, 3), 10);
        if (!isNaN(num)) {
          if ((SLIDESHOW_INDEX_FROM > -1 && num < SLIDESHOW_INDEX_FROM) ||
              (SLIDESHOW_INDEX_TO > -1 && num > SLIDESHOW_INDEX_TO)) {
            slideshowElems[i].remove();
          }
        }
      }
    }
  }
  slideshowFromTo = false;
}

// hidePlayButton hides play/pause button for manual slideshows
function hidePlayButton() {
  document.getElementById("buttonPlayPause").style.display = "none";
}

// toggleFlow plays/pauses slideshow where elem is play/pause button
function toggleFlow(elem) {
  if (slideshowTimeout != null) {
    // Pause slideshow
    clearInterval(slideshowTimeout);
    slideshowTimeout = null;

    // Set button text to ">" (play)
    elem.innerHTML = "&#9658;";

    // Pause audio if it exists
    if (slideshowSound != null) {
      slideshowSound.pause();
    }
  } else {
    // Play slideshow
    slideshow();

    // Set button text to "||" (pause)
    elem.innerHTML = "&#10074;&#10074;";

    // Play audio if it exists
    if (slideshowSound != null) {
      slideshowSound.play();
    }
  }
}

// changePic changes slide index where n is delta (+1 or -1)
function changePic(n) {
  showPic(slideIndex += n);

  if (!MANUAL_SLIDESHOW) {
    // Automatic slideshow

    if (slideshowTimeout != null) {
      clearInterval(slideshowTimeout);
      slideshowTimeout = setInterval(slideshow, SLIDESHOW_INTERVAL);

      // Play audio if it exists
      if (slideshowSound != null) {
        slideshowSound.play();
      }
    }
  } else {
    // Manual slideshow

    // Play audio if it exists
    if (slideshowSound != null) {
      slideshowSound.play();
    }
  }
}

// showPic displays slide where n is slide index
function showPic(n) {
  // Reduce slideshow to from/to range (one time only)
  if (slideshowFromTo) reduceSlideshow();

  // Handle wrapping past end of slideshow
  if (n > slideshowElems.length) {slideIndex = 1}

  // Handle wrapping before beginning of slideshow
  if (n < 1) {slideIndex = slideshowElems.length}

  // Set all slides to hidden
  var i;
  for (i = 0; i < slideshowElems.length; i++) {
    slideshowElems[i].style.display = "none";
  }

  // Set current slide to visible
  slideshowElems[slideIndex-1].style.display = "block";

  // Set slide description
  document.getElementById("slideName").innerHTML = getDescription(slideshowElems[slideIndex-1].src);
}

// slideshow begins automatic slideshow
function slideshow() {
  // Reduce slideshow to from/to range (one time only)
  if (slideshowFromTo) reduceSlideshow();

  slideIndex++;

  // Handle wrapping past end of slideshow
  if (slideIndex > slideshowElems.length) {slideIndex = 1}

  // Set all slides to hidden
  var i;
  for (i = 0; i < slideshowElems.length; i++) {
    slideshowElems[i].style.display = "none";
  }

  // Set current slide to visible
  slideshowElems[slideIndex-1].style.display = "block";

  // Set slide description
  document.getElementById("slideName").innerHTML = getDescription(slideshowElems[slideIndex-1].src);

  // Play slideshow if paused
  if (slideshowTimeout == null) {
    slideshowTimeout = setInterval(slideshow, SLIDESHOW_INTERVAL);
  }
}

// Handle left and right arrow keys
document.onkeydown = function(event) {
  switch (event.key) {
    case 'ArrowLeft':
      changePic(-1);
      break;
    case 'ArrowRight':
      changePic(1);
      break;
  }
}

// Load and play audio if configured
if (SLIDESHOW_AUDIO) {
  // Create audio object
  slideshowSound = new Audio("media/audio.mp3");

  // Set audio object to loop
  if (typeof slideshowSound.loop == 'boolean') {
    slideshowSound.loop = true;
  } else {
    slideshowSound.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
    }, false);
  }

  // Play audio object, catching/ignoring any errors
  promise = slideshowSound.play();
  if (promise) {
    promise.catch(function(error) { });
  }
}
