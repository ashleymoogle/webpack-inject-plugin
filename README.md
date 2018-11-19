# Webpack inject plugin
This plugin is useful when you have hashed bundles and a HTML entry point, it injects the newly hashed bundles in the entry point. It uses either the chunks or your manifest.

*WARNING*: For dev purpose you should NOT use hashed bundles because webpack dev server will NOT rewrite them and the memory taken will keep piling up.
## usage: 
in your `webpack.config.js`
```js
plugins: [
        new InjectPlugin({
            in: 'src/index.html',
            publicPath: '/dist/',
            outputPath: 'assets/',
            outName: 'index.html',
            manifest: 'assets/manifest.json' //OPTIONAL
        })
    ]
```

in your HTML entry point add `<!-- inject js -->` where you want your ouputted files to be.
You can also add `<!-- inject css -->` if you use extracttext or minicssextract
```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1.0">
        <title>My app</title>
        <noscript id="deferred-styles">
            <!-- inject css -->
        </noscript>
        <script>
            var loadDeferredStyles = function() {
                var addStylesNode = document.getElementById("deferred-styles");
                var replacement = document.createElement("div");
                replacement.innerHTML = addStylesNode.textContent;
                document.body.appendChild(replacement)
                addStylesNode.parentElement.removeChild(addStylesNode);
            };
            var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
            if (raf) raf(function() { window.setTimeout(loadDeferredStyles, 0); });
            else window.addEventListener('load', loadDeferredStyles);
        </script>
    </head>
    <body>
    <div id="app"></div>
        <!-- inject js -->
    </body>
</html>
```
## Options

### in:
Where your Html entry point is located

### publicPath:
the public path to serve your content

### outputPath:
Where you want to output the newly inject html file

### outName:
Name of the outputted file

### manifest:
*OPTIONAL*: You can specify the oath to your manifest and the plugin with use it for injections

TODO:
- tests
- More cases
