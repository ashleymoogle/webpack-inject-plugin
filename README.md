# Webpack inject plugin
This plugin is useful when you have hashed bundles and a HTML entry point, it injects the newly hashed bundles in the entry point. It uses either the chunks or your manifest.

*WARNING*: For dev purpose you should NOT use hashed bundles because webpack dev server will NOT rewrite them and the memory taken will keep piling up.
## usage: 

```js
yarn add webpack-inject-bundles-plugin
```

in your `webpack.config.js`
```js
import InjectPlugin from 'webpack-inject-bundles-plugin'

const config = {
    entry: {
        app: path.resolve(__dirname, "src"),
    },
    plugins: [
        new InjectPlugin({
            in: 'src/index.html',
            publicPath: '/dist/',
            outputPath: 'assets/',
            outName: 'index.html',
            manifest: 'assets/manifest.json' //OPTIONAL
        })
    ]
}
```

in your HTML entry point add `<!-- inject js -->` and `<!-- end inject -->` where you want your ouputted files to be.
You can also add `<!-- inject css -->` and `<!-- end inject -->` if you use extracttext or minicssextract
```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1.0">
        <title>My app</title>
        <noscript id="deferred-styles">
            <!-- inject css --><!-- end inject -->
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
        <!-- end inject -->
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

### verbose:
For debug, lots of logs will be displayed

## Known issues:
Scripts keeps piling up with webpack-dev-server, to avoid that you should create a script that builds with a parameter and then another one for your server
Example:

in package.json
```js
    "scripts": {
        "build": "webpack --progress",
        "start": "yarn build && webpack-dev-server --host 0.0.0.0 --env='dev-serv'",
        "buildProd": "rm -rf assets/dist/* && rm -r assets/index.html && yarn build && webpack --env=production"
    },
```
In webpack config
```js
    const SERVE = process.env.npm_lifecycle_event || 'build';
    if ((SERVE === 'start') || (SERVE === undefined)) {
        console.log('start dev server');
        conf = merge(config, {
            debug: true,
            plugins: [
                new InjectPlugin({
                    //...options
                })
            }) ],
        devtool: 'eval'
    });

    conf = merge(config, developmentConfig.devServer())
    }
},
```

