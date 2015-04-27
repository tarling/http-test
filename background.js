chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('main.html', {
    'innerBounds': {
      'width': 800,
      'height': 600
    },
    //frame: "chrome",
    id: "web-server-test", // Even an empty string is sufficient.
    singleton: true
  });
});
