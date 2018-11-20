const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const _ = require('lodash');
const plugin = require('../index.js');
const merge = require('webpack-merge');

const OUTPUT_DIR = path.join(__dirname, './out');
const injectPath = path.join(OUTPUT_DIR, 'index.html');

const vueConfig = require('./webpack-helpers');

const webpackConfig = (webpackOpts, opts) => {
    let config = _.merge({
        output: {
            path: OUTPUT_DIR,
            filename: '[name].js'
        }
    }, webpackOpts);
    return merge.smart(opts, config);
};

function webpackCompile(webpackOpts, opts, cb) {
    let config;
    if (Array.isArray(webpackOpts)) {
        config = webpackOpts.map(function(x) {
            return webpackConfig(x, opts);
        });
    }
    else {
        config = webpackConfig(webpackOpts, opts);
    }

    const compiler = webpack(config);

    compiler.run(function(err, stats){
        let injected;
        try {
            injected = fs.readFileSync( injectPath, "utf8");
        } catch (e) {
            injected = null
        }
        //console.log(stats)

        if(err === 'no html file specified'){
            expect(err).toBeTruthy();
            injected = ''
        } else {
            expect(err).toBeFalsy();
            expect(stats.hasErrors()).toBe(false);
        }

        cb(injected, stats);
    });
}

describe('InjectPlugin', function() {

    it('exists', function () {
        expect(plugin).toBeDefined();
    });

    describe('primary functions', function() {
        it('shouldnt be happy without a name', function (done) {
            webpackCompile({
                context: __dirname,
                entry: './fixtures/index.js',
                plugins: [
                    new plugin({
                        publicPath: '',
                        outputPath: '/spec/out',
                        outName: 'index.html'
                    })
                ]
            }, {}, function (html) {
                expect(html).toBeDefined();
                expect(html).toEqual('');
                done();
            });
        });

        it('outputs a html file', function (done) {
            webpackCompile({
                context: __dirname,
                entry: './fixtures/index.js',
                plugins: [
                    new plugin({
                        in: path.join(__dirname, './fixtures/index-one.html'),
                        publicPath: '',
                        outputPath: '/spec/out',
                        outName: 'index.html'
                    })
                ]
            }, {}, function (html) {
                expect(html).toBeDefined();
                expect(html).toEqual(
                    `<html lang="en">
<script src="main.js" type="text/javascript"></script>
</html>`
                );
                done();
            });
        });

        it('outputs a html from multiple entrypoints', function (done) {
            webpackCompile({
                context: __dirname,
                entry: {
                    one: './fixtures/index.js',
                    two: './fixtures/index-le-second.js'
                },
                plugins: [
                    new plugin({
                        in: path.join(__dirname, './fixtures/index-one.html'),
                        publicPath: '',
                        outputPath: '/spec/out',
                        outName: 'index.html'
                    })
                ]
            }, {}, function (html) {
                expect(html).toBeDefined();
                expect(html).toEqual(
                    `<html lang="en">
<script src="one.js" type="text/javascript"></script>
<script src="two.js" type="text/javascript"></script>
</html>`);

                done();
            });
        });

        it('should inject js AND css', function (done) {
            webpackCompile({
                context: __dirname,
                entry: {
                    app:'./fixtures/index-vue.js'
                },
                plugins: [
                    new plugin({
                        in: path.join(__dirname, './fixtures/index-vue.html'),
                        publicPath: '',
                        outputPath: '/spec/out',
                        outName: 'index.html'
                    })
                ]
            }, vueConfig, function (html) {
                expect(html).toBeDefined();
                expect(html).toEqual(
                    `<html lang="en">
<head>
<link href="app.css" rel="stylesheet" media="screen" title="no title" charset="utf-8">
</head>
<body>
<div id="app"></div>
<script src="app.js" type="text/javascript"></script>
</body>
</html>`);

                done();
            });
        });

        it('outputs a html from a manifest', function (done) {
            webpackCompile({
                context: __dirname,
                entry: {
                    meow:'./fixtures/index-vue.js',
                    kek:'./fixtures/index-vue.js'
                },
                plugins: [
                    new plugin({
                        in: path.join(__dirname, './fixtures/index-vue.html'),
                        publicPath: '',
                        outputPath: '/spec/out',
                        outName: 'index.html',
                        manifest:'/spec/out/manifest.json',
                        verbose: true
                    })
                ]
            }, vueConfig, function (html) {
                expect(html).toBeDefined();
                expect(html).toEqual(
                    `<html lang="en">
<head>
<link href="super.css" rel="stylesheet" media="screen" title="no title" charset="utf-8">
<link href="super2.css" rel="stylesheet" media="screen" title="no title" charset="utf-8">
</head>
<body>
<div id="app"></div>
<script src="meow.js" type="text/javascript"></script>
<script src="kek.js" type="text/javascript"></script>
</body>
</html>`);

                done();
            });
        });

        it('should multiple js and css bundles', function (done) {
            webpackCompile({
                context: __dirname,
                entry: {
                    app:'./fixtures/index-vue.js',
                    app2:'./fixtures/index-vue.js'
                },
                plugins: [
                    new plugin({
                        in: path.join(__dirname, './fixtures/index-vue.html'),
                        publicPath: '',
                        outputPath: '/spec/out',
                        outName: 'index.html'
                    })
                ]
            }, vueConfig, function (html) {
                expect(html).toBeDefined();
                expect(html).toEqual(
                    `<html lang="en">
<head>
<link href="app.css" rel="stylesheet" media="screen" title="no title" charset="utf-8">
<link href="app2.css" rel="stylesheet" media="screen" title="no title" charset="utf-8">
</head>
<body>
<div id="app"></div>
<script src="app.js" type="text/javascript"></script>
<script src="app2.js" type="text/javascript"></script>
</body>
</html>`);

                done();
            });
        });
    })
});

