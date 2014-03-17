An Audio Player, By ToneDen
=============

A pure JS customizable audio player for your SoundCloud. 

JS API, 15 band equalizer visualization, responsive, customizable.

![alt tag](https://raw.github.com/tim-thimmaiah/tonedenplayer/master/img/mockupv1.png)

=============

Dev Setup:

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

=============

The MIT License (MIT)

Copyright (c) [2013] [ToneDen]

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
