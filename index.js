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
        const publicPath = this.options.publicPath || '';
        let scripts = '';
        let styles = '';
        const verbose = this.options.verbose || false;
        const emit = (compilation) => {
            if(htmlFileName === '') {
                console.log('no html file specified');
                throw 'no html file specified'
            }
            const html = fs.readFileSync( htmlFileName, "utf8");
            if (verbose) {
                console.log(compilation.hash);
                console.log(compilation.chunks[0].files.filter(file => file.split('.')[file.split('.').length -1] !== 'map'));
            }
            let i = 0;
            let y = 0;
            if(manifest) {
                _.map(manifest, (key, val) => {
                    //console.log(key, val)
                    switch(val.split('.')[val.split('.').length -1]) {
                        case 'js':
                            scripts += `${i === 0 ? '' : '\n'}<script src="${publicPath}${key}" type="text/javascript"></script>`;
                            i++;
                            break;
                        case 'css':
                            styles += `${y === 0 ? '' : '\n'}<link href="${publicPath}${key}" rel="stylesheet" media="screen" title="no title" charset="utf-8">`;
                            y++;
                            break;
                    }
                });
            } else {
                compilation.chunks.map((chunk, i) => {
                    chunk.files.filter(file => file.split('.')[file.split('.').length -1] !== 'map').map(file => {
                        switch(file.split('.')[file.split('.').length -1]) {
                            case 'js':
                                scripts += `${i === 0 ? '' : '\n'}<script src="${publicPath}${file}" type="text/javascript"></script>`;
                                i++;
                                break;
                            case 'css':
                                styles += `${y === 0 ? '' : '\n'}<link href="${publicPath}${file}" rel="stylesheet" media="screen" title="no title" charset="utf-8">`;
                                y++;
                                break;
                        }
                    })
                })
            }
            let htmlOutput = html.replace (/<!-- inject js -->([\s\S]*)<!-- end inject -->/i, scripts).replace (/<!-- inject css -->([\s\S]*)<!-- end inject -->/i, styles);
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