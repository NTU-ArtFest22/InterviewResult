window.onload = function() {
  $('canvas').each(function(i) {
    $(this).attr('name', 'canvas');
    $(this).attr('id', 'canvas');
    // $(this).css('display', 'none');
  });
  var audioSupport = window.AudioContext || window.webkitAudioContext;
  var safari = navigator.userAgent.match(/Safari/) && !navigator.userAgent.match(/Chrome/);
  if (safari || !audioSupport) {
    document.querySelector('#browser').style.display = 'block';
  }
};

var playJ = $('.play');
var play = document.querySelector('.play');
var loading = document.querySelector('#loading');
var playing = false;
play.onclick = function() {
  playJ.toggleClass('active');
  if (playing) {
    playing = false;
    audio.pause();
    ga('send', {
      hitType: 'event',
      eventCategory: 'Click pause',
      eventAction: 'click-pause',
      eventLabel: 'click-pause'
    });
  } else {
    playing = true;
    loadAudio();
    ga('send', {
      hitType: 'event',
      eventCategory: 'Click play',
      eventAction: 'click-play',
      eventLabel: 'click-play'
    });
  }
};


// Song info (experimental)
var songTimer = null;
var songInfo = 'http://fm.acko.net/status-json.xsl';
var trackSongInfo = function() {
  if (!songTimer) {
    songTimer = setTimeout(pingSong, 20000);
    pingSong();
  }
};
var untrackSongInfo = function() {
  if (songTimer) clearTimeout(songTimer);
  songTimer = null;
};
var pingSong = function() {
  fetch(songInfo, 'json', function(err, xhr) {
    if (xhr.response && xhr.response.icestats && xhr.response.icestats.source) {
      var song = xhr.response.icestats.source.title;

      if (songTimer) clearTimeout(songTimer);
      songTimer = setTimeout(pingSong, 20000);
    }
  });
}
var fetch = function(url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = type;
  xhr.addEventListener('load', function() {
    callback(xhr.status == 404, xhr);
  });
  xhr.send();
}

// Load audio
var audio;

function loadAudio(url) {
  if (!audio) {
    audio = new Audio();
    var sources = [
      ['audio/mpeg', 'http://fm.acko.net/1337.mp3'],
    ];

    sources.forEach(function(source) {
      if (!url && audio.canPlayType(source[0])) {
        url = source[1];
      }
    });
    audio.oncanplay = function() {
      if (!audioHandler) {
        makeAudioPipe(audio);
      }
    };
    audio.oncanplaythrough = function() {
      // loading.style.display = 'none';
      audio.play();
    };

    if (!url) {
      alert("Browser MP3 support required.");
      throw "Browser MP3 support required.";
    }
    audio.onplaying = function() {
      trackSongInfo();
    }
    audio.onended = function() {
      play.style.display = 'block';
    };
    loading.style.display = 'block';
    audio.crossOrigin = "anonymous";
    audio.src = url;
  } else {
    audio.play();
  }

};

// Audio analyzer
var audioHandler, audioCurrentTime;
var makeAudioPipe = function(element) {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var ctx = new AudioContext;

  var source = ctx.createMediaElementSource(element);

  var analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;

  var scratchTime = new Float32Array(analyser.fftSize);

  var bufferFreq = new Float32Array(analyser.frequencyBinCount);
  var bufferTime = new Float32Array(analyser.fftSize);
  three.on('update', audioHandler = function() {
    analyser.getFloatFrequencyData(bufferFreq);

    // Web Audio support is spotty
    if (analyser.getFloatTimeDomainData) {
      analyser.getFloatTimeDomainData(bufferTime);
    } else {
      analyser.getByteTimeDomainData(scratchTime);
      for (var i = 0; i < analyser.fftSize; ++i) {
        bufferTime[i] = scratchTime[i];
      }
    }
  });

  mathbox.select('#audioFreq').set('data', bufferFreq);
  mathbox.select('#audioTime').set('data', bufferTime);

  source.connect(analyser);
  analyser.connect(ctx.destination);
};

// Mathbox
var mathbox = mathBox({
  plugins: ['core', 'controls', 'fullscreen', 'ui'],
  renderer: {
    parameters: {
      antialias: false,
    },
  },
  controls: {
    klass: THREE.TrackballControls,
    parameters: {
      noZoom: true,
    },
  },
  size: {
    maxRenderWidth: 1920,
    maxRenderHeight: 1080,
  },
  loop: {
    start: window == top.window,
  },
});

var three = mathbox.three;
three.renderer.setClearColor(new THREE.Color(0x000000), 1.0);

var seed1 = Math.random();
var seed2 = Math.random();

// Mathbox DOM
mathbox
  .set({
    scale: 720
  })
  .camera({
    proxy: true,
    position: [.3, .1, 2],
  })
  .group()
  .array({
    id: 'audioTime',
    data: [],
    width: 1024,
    channels: 1
  })
  .array({
    id: 'audioFreq',
    data: [],
    width: 512,
    channels: 1,
  });

mathbox
  .rtt({
    id: 'render',
    width: 64 * 4,
    height: 36 * 4,
    type: 'unsignedByte',
    minFilter: 'nearest',
    magFilter: 'nearest',
  })
  .camera({
    position: [0, 0, 2.5]
  })
  .group()
  .swizzle({
    source: '#audioTime',
    order: 'yx',
  })
  .spread({
    width: [3.6, 0, 0, 0],
  })
  .shader({
    code: [
      "vec4 getSample(vec4 xyzw);",
      "vec4 getColor(vec4 xyzw) {",
      "  float h = (getSample(xyzw).y);",
      "  return vec4(vec3(h), 1.0);",
      "}",
    ].join("\n")
  })
  .resample({

  })
  .transform({
    scale: [1, 1, 1],
  })
  .line({
    points: '<<',
    colors: '<',
    width: 7,
    color: 0xFFFFFF,
    opacity: .4,
    blending: 'add',
  })
  .end()
  .end()

.cartesian({
    range: [
      [-2, 2],
      [-1, 1],
      [-1, 1]
    ],
    scale: [π / 2, 1 / 4, 1 / 4],
  }, {
    quaternion: function(t) {
      c = Math.cos(t / 3 + seed2);
      s = Math.sin(t / 3 + seed2);
      c2 = Math.cos(t / 8.71 + seed1);
      s2 = Math.sin(t / 8.71 + seed1);
      return [s * s2, s * c2, .2, c];
    }
  })
  .grid({
    divideX: 4,
    divideY: 4,
    zBias: 10,
    opacity: .1,
    color: 0xffdfe0,
    width: 6,
  })
  .end()
  .end()

.rtt({
    id: 'rtt1',
    history: 4,
    width: 64 * 4,
    height: 36 * 4,
    type: 'unsignedByte',
  })
  .shader({
    code: '#map-rotate'
  })
  .resample({
    id: 'resample1',
    indices: 3,
    channels: 4,
  })
  .compose({
    color: '#ffffff',
    zWrite: false,
  })
  .compose({
    source: '#render',
    blending: 'add',
    color: '#ffffff',
    zWrite: false,
  })
  .end()

var modulate = 0;
var warp = 0;
var pattern = 0;

mathbox
  .rtt({
    id: "rtt2",
    width: 64 * 4,
    height: 36 * 4,
    type: 'float',
  })
  .camera({
    position: [0, 0, 2.5]
  })
  .clock({}, {
    seek: function(t) {
      return audio ? audio.currentTime : t;
    }
  })
  .shader({
    code: '#map-temporal-blur'
  }, {
    time: function(t) {
      return t * 16.0;
    },
    modulate: function(t) {
      var bang = Math.max(0, Math.sin(t * .1 - 1 + seed1 + Math.sin(t * .0311)) * 3 - 2);
      modulate = bang * bang;
      return modulate;
    },
    pattern: function(t) {
      var bang = Math.max(0, Math.sin(t * .134 + 1 + seed2 + Math.sin(t * .0471)) * .5 + .5);
      pattern = bang * bang;
      return pattern;
    },
    warp: function(t) {
      var bang = Math.sin(t * .119 + 1 + Math.sin(t * .0771));
      warp = bang * bang;
      return warp;
    },
    shift: function(t) {
      var bang = Math.max(0, Math.sin(t * .116 + Math.sin(t * .0631)) * 3 - 2);
      shift = bang * bang;
      return shift;
    },
  })
  .resample({
    id: 'resample2',
    source: '#rtt1',
    indices: 3,
    channels: 4
  })
  .compose({
    color: '#fff',
    zWrite: false,
  })
  .end()
  .transform({
    scale: [1, .35, 1]
  })
  .swizzle({
    source: '#audioTime',
    order: 'yx',
  })
  .spread({
    width: [3.444, 0, 0, 0],
  })
  .shader({
    code: [
      "vec4 getSample(vec4 xyzw);",
      "vec4 getColor(vec4 xyzw) {",
      "  float h = getSample(xyzw).y;",
      "  return vec4(vec3(h) * .2, 1.0);",
      "}",
    ].join("\n")
  })
  .resample({

  })
  .line({
    points: '<<',
    colors: '<',
    width: 50,
    color: 0xFFFFFF,
    opacity: 1,
    blending: 'add',
  })
  .end()
  .end()
  .resample({
    width: 129,
    height: 73,
  })
  .repeat({
    depth: 2,
    id: 'lerp',
  })

.shader({
    code: '#map-xy-to-xyz'
  })
  .resample({
    indices: 3,
    channels: 3,
  })

.transpose({
  order: 'xywz',
  id: 'transpose',
})

.transpose({
  source: '#lerp',
  order: 'xywz',
  id: 'color',
})

.clock({}, {
    seek: function(t) {
      return audio ? audio.currentTime : t;
    }
  })
  .clock({
    id: 'disco',
  }, {
    speed: function(t) {
      var bang = Math.max(0, Math.sin(t * .081 - 1 + Math.sin(t * .0211)) * 5 - 4);
      return bang > 0 ? 1 : .2;
    },
  })

.shader({
    code: '#map-z-to-color'
  }, {
    modulate1: function(t) {
      return Math.cos((t + 1) * .417 + seed2 * 5) * .5 + .5;
    },
    modulate2: function(t) {
      return Math.cos((t + 1) * .617 + seed1 + Math.sin(t * .133)) * .5 + .5;
    },
    modulate3: function(t) {
      return Math.cos((t + 1) * .217 + seed2 + 2.0) * .5 + .5;
    },
    modulate4: function(t) {
      return Math.cos((t + 1) * .117 + seed2 * 3 + 3.0 + Math.sin(t * .133)) * .5 + .5;
    },
    modulate5: function(t) {
      return Math.cos((t + 1) * .017 + seed1 * 5 + 2.0 + Math.sin(t * .033)) * .5 + .5;
    },
  })
  .resample({
    source: '#lerp',
    id: 'color1',
    indices: 2,
    channels: 4,
  })

.shader({
    code: '#map-z-to-color-2'
  }, {
    modulate1: function(t) {
      return Math.cos((t + 1) * .417 + seed2 * 5) * .5 + .5;
    },
    modulate2: function(t) {
      return Math.cos((t + 1) * .617 + seed1 + Math.sin(t * .133)) * .5 + .5;
    },
    modulate3: function(t) {
      return Math.cos((t + 1) * .217 + seed2 + 2.0) * .5 + .5;
    },
    modulate4: function(t) {
      return Math.cos((t + 1) * .117 + seed2 * 3 + 3.0 + Math.sin(t * .133)) * .5 + .5;
    },
    modulate5: function(t) {
      return Math.cos((t + 1) * .017 + seed1 * 4 + 2.0 + Math.sin(t * .033)) * .5 + .5;
    },
  })
  .resample({
    source: '#lerp',
    id: 'color2',
    indices: 2,
    channels: 4,
  })

.end()


.polar({
    bend: 1,
  }, {
    quaternion: function(t) {
      t = t / 3;
      c = Math.cos(t / 4 + seed1);
      s = Math.sin(t / 4 + seed1);
      c2 = Math.cos(t / 11.71 + seed2) * 1.71;
      s2 = Math.sin(t / 11.71 + seed2) * 1.71;
      return [s * s2, s * c2, -.2, c];
    }
  })
  .cartesian({
    range: [
      [-16 / 9 - .001, 16 / 9 + .001],
      [-1, 1],
      [-1, 1]
    ],
    scale: [π, π * 9 / 16, π * 9 / 16],
    rotation: [π / 2, 0, 0],
    position: [0, 1, 0],
  })
  .play({
    pace: 1,
    loop: true,
    to: 233,
    script: {
      100: {
        props: {
          quaternion: [0, 0, 0, 1]
        }
      },
      115: {
        expr: {
          quaternion: function(t) {
            return [.4 + .3 * Math.cos(t * .00117), .5 + .3 * Math.sin(t * .001), .1, 0];
          }
        }
      },
      145: {
        expr: {
          quaternion: function(t) {
            return [.3, .6 * Math.sin(t * .00103), .2 * Math.sin(t * .00107), -1];
          }
        }
      },
      160: {
        props: {
          quaternion: [0, 0, 0, -1]
        }
      },
    }
  })
  .lerp({
    source: '#transpose',
    width: 33,
    height: 19,
  })
  .lerp({
    source: '#color2',
    width: 33,
    height: 19,
  })
  .transform()
  .line({
    points: '<<',
    colors: '<',
    color: '#ffffff',
    width: 2,
    zBias: 5,
  })
  .line({
    points: '<<',
    colors: '<',
    color: '#ffffff',
    width: 4,
    opacity: .5,
    zBias: 6,
    zWrite: false,
  })
  .end()
  .play({
    to: 160,
    loop: true,
    script: {
      19: {
        position: [0, 0, 0]
      },
      39: {
        position: [0, 0, 2]
      },
      57: {
        position: [0, 0, 0]
      },
    }
  })
  .transpose({
    source: '<<',
    order: 'yxzw'
  })
  .transpose({
    source: '<<',
    order: 'yxzw'
  })
  .transform()
  .line({
    points: '<<',
    colors: '<',
    color: '#ffffff',
    width: 2,
    zBias: 5,
  })
  .line({
    points: '<<',
    colors: '<',
    color: '#ffffff',
    width: 4,
    opacity: .5,
    zBias: 6,
    zWrite: false,
  })
  .end()
  .play({
    to: 160,
    loop: true,
    script: {
      19: {
        position: [0, 0, 0]
      },
      39: {
        position: [0, 0, -2]
      },
      57: {
        position: [0, 0, 0]
      },
    }
  })

.transform()
  .point({
    points: '<<',
    colors: '<',
    color: '#ffffff',
    size: 10,
    zBias: 5,
    zOrder: -1,
    blending: 'add',
    zWrite: false,
  })
  .end()
  .play({
    to: 160,
    loop: true,
    script: {
      19: {
        position: [0, 0, 0]
      },
      39: {
        position: [0, 0, -1]
      },
      57: {
        position: [0, 0, 0]
      },
    }
  })
  .transform()
  .point({
    points: '#transpose',
    colors: '#color2',
    color: '#ffffff',
    size: 5,
    zBias: 5,
    zOrder: -1,
    blending: 'add',
    zWrite: false,
  })
  .end()
  .play({
    to: 160,
    loop: true,
    script: {
      19: {
        position: [0, 0, 0]
      },
      39: {
        position: [0, 0, 1]
      },
      57: {
        position: [0, 0, 0]
      },
    }
  })
  .vector({
    points: '#transpose',
    colors: '#color1',
    color: '#ffffff',
    start: false,
    end: false,
    width: 40,
    opacity: .03,
    blending: 'add',
    zWrite: false,
    zOrder: 2
  })