const _ = require('lodash');
const path = require('path');
const fs = require('fs');

module.exports = class InjectPlugin {
    constructor(options) {
        this.options = options;
    }
    apply(compiler) {
        const manifest = this.options && this.options.manifest ? JSON.parse(fs.readFileSync(this.options.manifest)) : null;
        const htmlFileName = this.options.in || '';
        const html = fs.readFileSync( htmlFileName, "utf8");
        const publicPath = this.options.publicPath || '';
        let scripts = '';
        let styles = '';
        const verbose = this.options.verbose || false;
        const emit = (compilation) => {
            if (verbose) {
                console.log(compilation.hash);
                console.log(compilation.chunks[0].files.filter(file => file.split('.')[file.split('.').length -1] !== 'map'));
            }
            if(manifest) {
                if (verbose) {
                    console.log(manifest);
                }
                _.map(manifest, (key, val) => {
                    //console.log(key, val)
                    switch(val.split('.')[val.split('.').length -1]) {
                        case 'js':
                            scripts += `<script src="${publicPath}${key}" type="text/javascript"></script>`;
                            break;
                        case 'css':
                            styles += `<link href="${publicPath}${key}" rel="stylesheet" media="screen" title="no title" charset="utf-8">`;
                            break;
                    }
                });
            } else {
                compilation.chunks[0].files.filter(file => file.split('.')[file.split('.').length -1] !== 'map').map(file => {
                    switch(file.split('.')[file.split('.').length -1]) {
                        case 'js':
                            scripts += `<script src="${publicPath}${file}" type="text/javascript"></script>`;
                            break;
                        case 'css':
                            styles += `<link href="${publicPath}${file}" rel="stylesheet" media="screen" title="no title" charset="utf-8">`;
                            break;
                    }
                })
            }
            console.log('hey')
            let htmlOutput = html.replace (/<!-- inject js -->/i, scripts).replace (/<!-- inject css -->/i, styles);
            if (verbose) {
                console.log('-----');
                console.log('html output:');
                console.log(htmlOutput);
                console.log('-----');
                console.log('out path:');
                console.log(path.join(path.resolve("."), this.options.outputPath, this.options.outName))
            }
            fs.writeFileSync(
                path.join(path.resolve("."), this.options.outputPath, this.options.outName),
                htmlOutput);
        };

        const pluginOptions = {
            name: 'InjectPlugin',
            stage: Infinity
        };

        compiler.hooks.emit.tap(pluginOptions, emit);
    }
};