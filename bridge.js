(function() {
  var mp = null;
  var caps = null;

  function probePlayer() {
    mp = document.getElementById("movie_player");
    if (!mp) { caps = null; return; }
    caps = {
      latency: typeof mp.getLiveLatency === "function",
      rate: typeof mp.getPlaybackRate === "function",
      setRate: typeof mp.setPlaybackRate === "function",
      videoData: typeof mp.getVideoData === "function",
      liveHead: typeof mp.isAtLiveHead === "function",
      seekLive: typeof mp.seekToLiveHead === "function",
      stats: typeof mp.getStatsForNerds === "function"
    };
  }

  function sendData() {
    if (!mp || !document.contains(mp)) { probePlayer(); }
    if (!mp || !caps) return;
    var d = {
      latency: -1,
      playbackRate: 1.0,
      isLive: false,
      isAtLiveHead: true,
      bufferHealth: -1,
      playerRate: -1,
      statsAvailable: !!caps.stats
    };
    try {
      if (caps.latency) d.latency = mp.getLiveLatency();
      if (caps.rate) { d.playbackRate = mp.getPlaybackRate(); d.playerRate = mp.getPlaybackRate(); }
      if (caps.videoData) { var vd = mp.getVideoData(); d.isLive = !!(vd && vd.isLive); }
      if (caps.liveHead) d.isAtLiveHead = mp.isAtLiveHead();
      if (caps.stats) {
        var s = mp.getStatsForNerds();
        if (s && s.live_latency_style === "") {
          var bh = parseFloat(s.buffer_health_seconds);
          if (isFinite(bh)) d.bufferHealth = bh;
          var ll = parseFloat(s.live_latency_secs);
          if (isFinite(ll)) d.latency = ll;
        }
      }
    } catch(e) {}
    document.dispatchEvent(new CustomEvent("DelayBridgeData", { detail: d }));
  }

  probePlayer();
  setInterval(sendData, 400);

  document.addEventListener("DelayBridgeSeek", function() {
    if (!mp || !caps) probePlayer();
    if (!mp) return;
    try { if (caps && caps.seekLive) mp.seekToLiveHead(); } catch(e) {}
  });

  document.addEventListener("DelayBridgeSetRate", function(e) {
    if (!mp || !caps) probePlayer();
    if (!mp) return;
    try {
      var rate = e.detail && e.detail.rate;
      if (rate && caps && caps.setRate) mp.setPlaybackRate(rate);
    } catch(e) {}
  });

  document.addEventListener("yt-navigate-finish", function() {
    mp = null;
    caps = null;
    probePlayer();
  });
})();
