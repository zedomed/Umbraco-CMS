'use strict';

var config = require('../config');
var { watch, dest, src } = require('gulp');

var _ = require('lodash');

var processJs = require('../util/processJs');
var processLess = require('../util/processLess');

function watching() {
    
    var watchInterval = 500;
    
    // Setup a watcher for all groups of javascript files
    _.forEach(config.sources.js, function (group) {

            watch(group.files, { ignoreInitial: true, interval: watchInterval }).on('change', function (file) {

                console.info(file.path + " has changed, added to:  " + group.out);
                processJs(group.files, group.out);

            })

    });
    
    // Watch all less files and trigger the less task
    watch(config.sources.globs.less, { ignoreInitial: true, interval: watchInterval }, function () {
        console.info('Reprocessing the LESS files');
        processLess();
    })
    
    
    // Setup a watcher for all groups of view files
    _.forEach(config.sources.views, function (group) {
        
        watch(group.files, { interval: watchInterval }).on('change', function (path) {
            //console.info(`File ${path} was changed, and move to ` + config.root + config.targets.views + group.folder);
            src(group.files).pipe(dest(config.root + config.targets.views + group.folder) )
        });
        
    });
    
    
    // Watch all app js files that will not be merged - copy single file changes
    const jsAppWatcher = watch(config.sources.globs.js, { interval: watchInterval });
    
    jsAppWatcher.on('change', function (path) {
        console.info(`File ${path} was changed`);
        src(path).pipe(dest(config.root + config.targets.js))
    });
    
};

module.exports = { watch: watching };
