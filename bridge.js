(function() {
  function sendData() {
    var mp = document.getElementById("movie_player");
    if (!mp) return;
    try {
      document.dispatchEvent(new CustomEvent("DelayBridgeData", { detail: {
        latency: typeof mp.getLiveLatency === "function" ? mp.getLiveLatency() : -1,
        playbackRate: typeof mp.getPlaybackRate === "function" ? mp.getPlaybackRate() : 1.0,
        isLive: typeof mp.getVideoData === "function" && mp.getVideoData() && mp.getVideoData().isLive ? true : false,
        isAtLiveHead: typeof mp.isAtLiveHead === "function" ? mp.isAtLiveHead() : true
      }}));
    } catch(e) {}
  }
  setInterval(sendData, 500);

  document.addEventListener("DelayBridgeSeek", function() {
    var mp = document.getElementById("movie_player");
    if (!mp) return;
    try {
      if (typeof mp.seekToLiveHead === "function") mp.seekToLiveHead();
    } catch(e) {}
  });
})();
