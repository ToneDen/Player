Embeddable Goodness, by ToneDen
===

The ToneDen SDK is loaded asynchronously, which means your page doesn't have to wait for the SDK to load before rendering.
This means that loading it is a little more complicated than just including a `<script>` tag. Don't worry though, we've taken care of all the complicated stuff for you.
Just copy the snippet below into your HTML page, and replace the commented portion with your code calling the SDK.

```
<script>
    (function() {
        var script = document.createElement('script');

        script.type = 'text/javascript';
        script.async = true;
        script.src = '//d27qmwyi8yof1p.cloudfront.net/production/toneden.loader.js'

        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(script, entry);
    }());

    ToneDenReady = window.ToneDenReady || [];
    ToneDenReady.push(function() {
        // call SDK functions (ToneDen.player.create(), etc.)
    });
</script>
```

Player
---

A pure JS customizable audio player for your SoundCloud. 

JS API, responsive, customizable.

![alt tag](https://raw.github.com/tim-thimmaiah/tonedenplayer/master/mockupv1.png)

Sample Embed Code:
```
<script>
    (function() {
        var script = document.createElement('script');

        script.type = 'text/javascript';
        script.async = true;
        script.src = '//d27qmwyi8yof1p.cloudfront.net/production/toneden.loader.js'

        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(script, entry);
    }());

    ToneDenReady = window.ToneDenReady || [];
    ToneDenReady.push(function() {
        // This is where all the action happens:
        ToneDen.player.create({
            dom: '#player',
            eq: 'waves',
            skin: 'light',
            staticUrl: '//widget.dev/sdk/',
            tracksPerArtist: 4,
            urls: [
                'https://soundcloud.com/mutantbreakz/blacklist-vs-alt-a-fire'
            ]
        });
    });
</script>
```

API
---

**ToneDen**
* **.player**
  * **.create(params)**
    Creates and returns a new player instance according to the given parameters object.
    Parameters:
    * **debug**  
      *default: false*   
      True to output debug messages to the console.  
    * **keyboardEvents**  
      *default: false*   
      True to listen to keyboard events on the document body to control the player.  
      Left arrow key returns to the previous track, right arrow key skips to the next, and spacebar plays/pauses the current track.  
    * **single**  
      *default: false*   
      True to force the player to render as if there were only one track in the playlist.  
      This parameter is internally set to true if the playlist has only one track.  
    * **skin**  
      *default: 'light'*   
      The player color scheme to render. Options are 'light', 'dark', 'mojave', and 'aurora'.  
    * **staticUrl**  
      *default: 'sdkUrl'*   
      The URL path to load static files from. This should be left as the default, unless you are hosting the SDK yourself.  
    * **tracksPerArtist**  
      *default: 4*   
      How many tracks to load from an artist's SoundCloud account when the artist's SoundCloud URL is specified in the urls parameter.  
    * **visualizerType**  
      *default: 'waves'*   
      What type of visualizer to show. Can be 'bars' or 'waves' to show those types of visualizers.  
      Any falsy value or 'none' will hide the visualizer.  
  * **.getInstanceByDom(dom)**  
      Returns the player instance that is associated with the given dom item.  
      The dom argument can be either a selector string (will be passed to jQuery) or a jQuery dom object.

**Player Instance**
* **.destroy()**  
  Destroys the given player instance and clears the containing element's HTML.  
* **id**
  Randomly generated ID, unique to the player instance.
* **.pause()**  
  Pauses the track being played by the player.  
* **.parameters**  
  The parameters object that the player is using.  
* **.play()**  
  Play the currently selected track.  

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
VirtualHost *:80>  
    DocumentRoot "<repo location>/tonedenplayer/test"  
    ServerName publisher.dev  
</VirtualHost>  
VirtualHost *:80>  
    DocumentRoot "<repo location>/tonedenplayer"  
    ServerName widget.dev  
</VirtualHost>  
```
3. Restart Apache.
4. Install [NPM](https://github.com/npm/npm) and [Grunt](http://gruntjs.com/).
5. Run `npm install` in the sdk/ directory, and again in the loader directory if you're going to be modifying files there.
6. Navigate to publisher.dev in your browser of choice.
This will load test/index.html, which includes a script snippet that loads toneden.loader.js from the domain widget.dev to simulate a cross-origin environment.

Building
---

After modifying files in either the sdk/ or the loader/ directory, run Grunt to compile that directory's scripts into a single file (toneden.js for the sdk/ directory, and toneden.loader.js for the loader/ directory).

`grunt dev` will compile a readable, debug-friendly version of the scripts, while `grunt` will make a minified version.
You can also run `grunt watch` or `grunt watch dev` to automatically compile the scripts as you make changes to files.

Note that the build process for the SDK concatenates and minifies all CSS files in the css/ directory,
then inserts the resulting string as a variable at the top of the compiled SDK script.

Overview
---

The loader/ directory contains the scripts that manage (surprise!) loading the SDK when embedded in a webpage.
You probably won't have to touch anything in this directory, but here's how it works:

The loader script (toneden.loader.js) contains the [requirejs](http://requirejs.org/) source code,
and uses requirejs to asynchronously load the SDK script (toneden.js) from the ToneDen CDN.
This system allows embedding pages to include (either asynchronously or synchronously) the relatively small loading script,
which then loads the much larger SDK files in a non-blocking way.
When the SDK has been loaded, the loader calls all the functions in the global ToneDenReady array,
allowing developers to access the functionality of the SDK.
(Inspired by/copied from the [Shootitlive](https://github.com/shootitlive/widgetloader) folks, who are way smarter than me!)

The sdk/ directory contains all the good stuff. The file toneden.js is the hub of the action.
It loads all the functions of the SDK (currently only the player) as dependencies,
and returns them so that they can be attached to the global ToneDen object.
The other important function of toneden.js is to grab the CSS that has been minified and concatenated by Grunt and insert it into the page as a `<style>` element.

License
===

The MIT License (MIT)

Copyright (c) [2014] [ToneDen]

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE
