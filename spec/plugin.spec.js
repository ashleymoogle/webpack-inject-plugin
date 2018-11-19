var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var _ = require('lodash');
var plugin = require('../index.js');

var OUTPUT_DIR = path.join(__dirname, './out');
var injectPath = path.join(OUTPUT_DIR, 'index.html');

function webpackConfig (webpackOpts, opts) {
    return _.merge({
        output: {
            path: OUTPUT_DIR,
            filename: '[name].js'
        },
        plugins: [
            new plugin(opts.manifestOptions)
        ]
    }, webpackOpts);
}

function webpackCompile(webpackOpts, opts, cb) {
    var config;
    if (Array.isArray(webpackOpts)) {
        config = webpackOpts.map(function(x) {
            return webpackConfig(x, opts);
        });
    }
    else {
        config = webpackConfig(webpackOpts, opts);
    }

    var compiler = webpack(config);

    compiler.run(function(err, stats){
        var injected;
        try {
            console.log(injectPath)
            injected = fs.readFileSync( injectPath, "utf8");
            console.log(injected)
        } catch (e) {
            console.log(err);
            injected = null
        }


        expect(err).toBeFalsy();
        expect(stats.hasErrors()).toBe(false);

        cb(injected, stats);
    });
}

describe('InjectPlugin', function() {

    it('exists', function () {
        expect(plugin).toBeDefined();
    });

    describe('primary functions', function() {
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
                expect(html).toEqual(`<html lang="en"><script src="main.js" type="text/javascript"></script></html>`);

                done();
            });
        });
    })
});