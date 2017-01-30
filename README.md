Embeddable Goodness, by ToneDen
===

The ToneDen SDK is loaded asynchronously, which means your page doesn't have to wait for the SDK to load before rendering.
This means that loading it is a little more complicated than just including a `<script>` tag. Don't worry though, we've taken care of all the complicated stuff for you.
Just copy the snippet below into your HTML page, enter your SoundCloud consumer key, and replace the commented portion with your code calling the SDK.
If you don't have a SoundCloud consumer key, you can create one [here](http://soundcloud.com/you/apps).

```
<script>
    (function() {
        var script = document.createElement("script");

        script.type = "text/javascript";
        script.async = true;
        script.src = "//sd.toneden.io/production/v2/toneden.loader.js"

        var entry = document.getElementsByTagName("script")[0];
        entry.parentNode.insertBefore(script, entry);
    }());

    ToneDenReady = window.ToneDenReady || [];
    ToneDenReady.push(function() {
        ToneDen.configure({
            soundcloudConsumerKey: '<YOUR SOUNDCLOUD CONSUMER KEY HERE>'
        });
        // call SDK functions (ToneDen.player.create(), etc.)
    });
</script>
```

Player
---

A pure JS customizable audio player for your SoundCloud. 

JS API, responsive, customizable. Demo at https://www.toneden.io/player.

![alt tag](https://raw.github.com/toneden/toneden-sdk/master/mockupv1.png)

Sample Embed Code:
```
<script>
    (function() {
        var script = document.createElement("script");

        script.type = "text/javascript";
        script.async = true;
        script.src = "//sd.toneden.io/production/v2/toneden.loader.js"

        var entry = document.getElementsByTagName("script")[0];
        entry.parentNode.insertBefore(script, entry);
    }());

    ToneDenReady = window.ToneDenReady || [];
    ToneDenReady.push(function() {
        ToneDen.configure({
            soundcloudConsumerKey: '<YOUR SOUNDCLOUD CONSUMER KEY HERE>'
        });
        // This is where all the action happens:
        ToneDen.player.create({
            dom: "#player",
            eq: "waves",
            skin: "light",
            tracksPerArtist: 4,
            urls: [
                "https://soundcloud.com/mutantbreakz/blacklist-vs-alt-a-fire"
            ]
        });
    });
</script>
```

Global Player and Play Queues
---
Documentation coming soon!

API
---

**ToneDen**
* **.configure**
  * **configure(params)**
    Sets global SDK options.
    Parameters:
    * **debug**  
      *default: false*   
      True to output debug messages to the console.  
    * **soundcloudConsumerKey**  
      You now have to provide your own SoundCloud consumer key in order to stream tracks.  
      Because of [SoundCloud's new daily stream limits](https://developers.soundcloud.com/blog/limits), we can't afford to use a single consumer key for everyone using the player.  
      Sorry for the inconvenience!  
* **.player**
  * **.create(params)**  
    Creates and returns a new player instance according to the given parameters object.
    Parameters:
    * **feed**   
      *default: false*  
      True to display a simplified version of the player, no bells and whistles here.
    * **keyboardEvents**  
      *default: false*  
      True to listen to keyboard events on the document body to control the player.  
      Left arrow key returns to the previous track, right arrow key skips to the next, and spacebar plays/pauses the current track.  
    * **mini**  
      *default: false*   
      True to use the 'mini' version of the player. This renders as a narrower bar with controls laid out horizontally.
      For an example, check out the player on [ToneDen OneSheets](https://apedrums.toneden.io/onesheet).
    * **shrink**  
      *default: true*   
      By default, the player shrinks to the size of its parent container.
      Set this to false to disable that behavior.
    * **single**  
      *default: false*   
      True to force the player to render as if there were only one track in the playlist.  
      This parameter is internally set to true if the playlist has only one track,
      *unless* the single parameter is explicitly set to false.  
    * **skin**  
      *default: 'light'*   
      The player color scheme to render. Options are 'light', 'dark', 'mojave', and 'aurora'.  
    * **tracksPerArtist**  
      *default: 10*   
      How many tracks to load from an artist's SoundCloud account when the artist's SoundCloud URL is specified in the urls parameter.  
    * **useCustomPurchaseTitle**  
      *default: true*   
      Whether to use tracks' custom purchase titles. If false, the purchase link text will be 'BUY'.  
  * **.getInstanceByDom(dom)**  
      Returns the player instance that is associated with the given dom selector string.  
  * **.setRepeat(repeat)**  
      Sets whether players should repeat their songs.
  * **.setVolume(level)**  
      Sets the volume level on all players. Level should be an integer between 0 and 100, inclusive.
  * **.global**  
      These functions act on the page's global player instance, if one exists.  
    * **.nowPlaying()**  
      Returns the track that the global player is currently playing.  
    * **.playTrack(url)**  
      Loads and starts playing a track in the global player.  
    * **.queueTrack(track, index)**  
      Adds a track to the global player's queue.  
    * **.setDefaultTracks(tracks, insertLocation)  
      Sets the default list of tracks to be played if the global player's queue runs out of tracks.  
    * **.togglePause(paused)**  
      Sets the play state of the global player.  
    * **.unqueueIndex(index)**  
      Removes a track from the global play queue at the specified index.  


**Player Instance**
* **id**  
  Randomly generated ID, unique to the player instance.
* **.destroy()**  
  Destroys the player instance and clears the containing element's HTML.
* **.next(play)**  
  Skip to the next track, and play it if `play` is true.
* **.prev()**  
  Jumps to the previous track.
* **.skipTo(index)**  
  Jumps to track number `index`.
* **.togglePause(paused)**  
  Toggles the paused state of the player, or sets it to the value of the 'paused' argument if provided.
* **.update(params)**  
  Updates the player with the given parameters. All parameters are supported except 'dom'.

Sample API Usage:
``` 
ToneDen.player.getInstanceByDom("#player").togglePause(false); // The player will start playing, if it isn't already.
ToneDen.player.getInstanceByDom("#player").togglePause(true); // The player will pause.
ToneDen.player.getInstanceByDom("#player").next(); // Play the next track in the list.
```

Development
===

Setup
---

1. Add the following lines to /etc/hosts:
```
127.0.0.1 publisher.dev
127.0.0.1 widget.dev
```
2. Add the following lines to /etc/apache2/extra/https-vhosts.conf:  
```
<VirtualHost *:80>  
    DocumentRoot "<repo location>/toneden-sdk/test"  
    ServerName publisher.dev  
</VirtualHost>  
<VirtualHost *:80>  
    DocumentRoot "<repo location>/toneden-sdk"  
    ServerName widget.dev  
</VirtualHost>  
```
3. Restart Apache.
4. Install [NPM](https://github.com/npm/npm) and [Grunt](http://gruntjs.com/).
5. Run `npm install` in the root directory.
6. Navigate to publisher.dev in your browser of choice.
This will load test/index.html, which includes a script snippet that loads toneden.loader.js from the domain widget.dev to simulate a cross-origin environment.

Building
---

We use [Webpack](https://webpack.github.io) to compile the player and all of it's dependencies into a single file.
When you run `grunt` from the root directory, the Webpack dev server will start. From this point on, any changes you make
to files in the repo will cause Webpack to rebuild /toneden.js and /toneden.loader.js.

**Don't use files built by the webpack dev server in production- they're huge! Run grunt --production to build a minified version.**

`grunt --dev` will compile a readable, debug-friendly version of the scripts, while `grunt --production` will make a minified version.

Overview
---

The loader/ directory contains the scripts that manage (surprise!) loading the SDK when embedded in a webpage.
You probably won't have to touch anything in this directory, but here's how it works:

The loader script (toneden.loader.js) uses webpack to asynchronously load the SDK script (toneden.js) from the ToneDen CDN.
This system allows embedding pages to include (either asynchronously or synchronously) the relatively small loading script,
which then loads the much larger SDK files in a non-blocking way.
When the SDK has been loaded, the loader calls all the functions in the global ToneDenReady array,
allowing developers to access the functionality of the SDK.
(Inspired by/copied from the [Shootitlive](https://github.com/shootitlive/widgetloader) folks, who are way smarter than me!)

The sdk/ directory contains all the good stuff. The file index.js is the hub of the action.
It loads all the functions of the SDK (currently only the player) as dependencies,
and returns them so that they can be attached to the global ToneDen object.

Questions?
===

You can contact us on GitHub or on Twitter: [@tonedenmusic](https://twitter.com/tonedenmusic)

License
===

[MIT License](http://toneden.mit-license.org/)
