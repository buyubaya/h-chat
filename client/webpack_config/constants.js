const path = require('path');
const fs = require('fs');
const appDirectory = fs.realpathSync(process.cwd());
const resolvePath = relativePath => path.resolve(appDirectory, relativePath);


/******************** PATHS ********************/
module.exports = function(environment='development'){
    const isProduction = environment === 'production';
    const version = 'production';

    return(
        {
            appPath: resolvePath('.'),
            srcPath: resolvePath('src'),
            entryPath: resolvePath('src/index'),
            outputPath: resolvePath('dist'),
            htmlTemplatePath: resolvePath('webpack_config/template.ejs'),
            jsPath: resolvePath('assets/scripts'),
            cssBundleFileName: isProduction ? `assets/${version}/stylesheets/bundle.css` : 'bundle.css',
            jsBundleFileName: isProduction ? `assets/${version}/scripts/bundle.js` : 'bundle.js',
            jsFileName: isProduction ? `assets/${version}/scripts/[name].[ext]` : 'assets/scripts/[name].[ext]',
            cssFileName: isProduction ? `assets/${version}/stylesheets/[name].[ext]` : 'assets/stylesheets/[name].[ext]',
            imageFileName: isProduction ? `assets/${version}/images/[name].[ext]` : 'assets/images/[name].[ext]',
            fontFileName: isProduction ? `assets/${version}/fonts/[name].[ext]` : 'assets/fonts/[name].[ext]',
            pdfFileName: isProduction ? `assets/${version}/pdf/[name].[ext]` : 'assets/pdf/[name].[ext]'
        }
    );
};