// === gulpfile.js
// bunlding and building
//
//

const { src, dest, series } = require('gulp');

const clean = require('gulp-clean');
const uglify = require('gulp-uglify');
const csso = require('gulp-csso');
const htmlmin = require('gulp-htmlmin');
const sass = require("gulp-sass");
const cleancss = require('gulp-clean-css');
const shell = require('gulp-shell');
const babel = require('gulp-babel');
const replace = require('gulp-string-replace');
const stripdebug = require('gulp-strip-debug');
const concat = require('gulp-concat');
const order = require('gulp-order');
const removeCode = require('gulp-remove-code');
const inject = require('gulp-inject');
const zip = require('gulp-zip');
const replaceName = require('gulp-replace-name');

const awsIACID = 'ycr27oo9nl';

// ---
const localurl = 'http://localhost:1000';
const devurl = 'https://' + awsIACID + '.execute-api.us-east-1.amazonaws.com/dev';
const produrl = 'https://' + awsIACID + '.execute-api.us-east-1.amazonaws.com/prod';
//
const dynamolocal = ', endpoint_url="http://localhost:8000"'
const dynamocloud = ''
//
const defaultlocal = 'default_inputs_local';
const defaultdev = 'default_inputs_dev';
const defaultprod = 'default_inputs';

const inputslocal = 'plan_inputs_local';
const inputsdev = 'plan_inputs_dev';
const inputsprod = 'plan_inputs';
// 
const outputslocal = 'plan_outputs_local';
const outputsdev = 'plan_outputs_dev';
const outputsprod = 'plan_outputs';
// 
const savedlocal = 'saved_plans_local';
const saveddev = 'saved_plans_dev';
const savedprod = 'saved_plans';
//
const importDynamo = 'from ..dynamo_interaction import dynamoInteraction';
const importDynamo_ = 'import dynamoInteraction';
// 
const importRelativePackages = 'from . import';
const importRelativePackages_ = 'import';



// --- FRONT-END
// 
// 
// 

// 
// 
// === DEV COMPILATION
/**
 * cleans out the dist folder
 */
function dev_clean() {
    return src('WFOTool_ui/src/dev_cloud/', { read: false })
        .pipe(clean())
}
/**
 * cleans out the css frrom dev
 */
function dev_cleanCss() {
    return src('WFOTool_ui/src/dev/css/', { read: false })
        .pipe(clean())
}
/**
 * compiles sass in dev
 */
function dev_compileSass() {
    return src('WFOTool_ui/src/dev/scss/style.scss')
        .pipe(sass())
        .pipe(dest('WFOTool_ui/src/dev/css'))
}
/**
 * moves the css file from dev to dist
 */
function dev_moveSass() {
    return src('WFOTool_ui/src/dev/css/*.css')
        .pipe(dest('WFOTool_ui/src/dev_cloud/css'))
}
/**
 * moves all the lib files
 */
function dev_move_lib() {
    return src('WFOTool_ui/src/dev/lib/**/*.*')
        .pipe(dest('WFOTool_ui/src/dev_cloud/lib'))
}
/**
 * babels the files to es-15 (should be IE compatible)
 */
function dev_javascript() {
    return src('WFOTool_ui/src/dev/**/*.js')
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        //
        .pipe(replace(localurl, function () {
            return devurl
        }))
        .pipe(dest('WFOTool_ui/src/dev_cloud/'))
}
/**
 * moves the html
 */
function dev_html() {
    return src('WFOTool_ui/src/dev/**/*.html')
        .pipe(dest('WFOTool_ui/src/dev_cloud/'))
}

exports.build_dev = series(dev_clean, dev_cleanCss, dev_compileSass, dev_moveSass, dev_move_lib, dev_javascript, dev_html);




//
//
// === DIST COMPILATION
/**
 * cleans out the dist folder
 */
function dist_clean() {
    return src('WFOTool_ui/src/dist/', { read: false })
        .pipe(clean())
}
/**
 * cleans out the css frrom dev
 */
function dist_cleanCss() {
    return src('WFOTool_ui/src/dev/css/', { read: false })
        .pipe(clean())
}
/**
 * compiles sass in dev
 */
function dist_compileSass() {
    return src('WFOTool_ui/src/dev/scss/style.scss')
        .pipe(sass())
        .pipe(dest('WFOTool_ui/src/dev/css'))
}
/**
 * moves the css file from dev to dist
 */
function dist_moveSass() {
    return src('WFOTool_ui/src/dev/css/*.css')
        .pipe(dest('WFOTool_ui/src/dist/css'))
}
/**
 * moves all the lib files
 */
function dist_move_lib() {
    return src('WFOTool_ui/src/dev/lib/**/*.*')
        .pipe(dest('WFOTool_ui/src/dist/lib'))
}
/**
 * babels the files to es-15 (should be IE compatible)
 */
function dist_javascript() {
    return src('WFOTool_ui/src/dev/**/*.js')
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        //
        .pipe(replace(localurl, function () {
            return disturl
        }))
        .pipe(dest('WFOTool_ui/src/dist/'))
}
/**
 * moves the html
 */
function dist_html() {
    return src('WFOTool_ui/src/dev/**/*.html')
        .pipe(dest('WFOTool_ui/src/dist/'))
}

exports.build_dist = series(dist_clean, dist_cleanCss, dist_compileSass, dist_moveSass, dist_move_lib, dist_javascript, dist_html);






//
//
// === PROD COMPILATION
/**
 * cleans out the dist folder
 */
function prod_dist_clean() {
    return src('WFOTool_ui/src/prod/', { read: false })
        .pipe(clean())
}
/**
 * moves the css file from dev to prod
 */
function prod_dist_moveSass() {
    return src('WFOTool_ui/src/dist/css/*.css')
        .pipe(dest('WFOTool_ui/src/prod/css'))
}
/**
 * comiles the lib files, mins them, and then moves them to prod
 */
function prod_dist_compile_lib() {
    return src('WFOTool_ui/src/dist/lib/**/*.js')
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(uglify({ mangle: false }))
        .pipe(dest('WFOTool_ui/src/prod/lib/'))
}
/**
 * moves font awesome to prod
 */
function prod_dist_move_lib_fa() {
    return src('WFOTool_ui/src/dist/lib/fontawesome-free-5.10.1-web/**/*.*')
        .pipe(dest('WFOTool_ui/src/prod/lib/fontawesome-free-5.10.1-web/'))
}
/**
 * moves normalize css to prod
 */
function prod_dist_move_lib_norm() {
    return src('WFOTool_ui/src/dist/lib/normalize_8.0.1.css')
        .pipe(dest('WFOTool_ui/src/prod/lib/'))
}

/**
 * compiles the javascript to es-15 again, just to be safe, concats them, and then uglifys them into prod renaiming it to all.js
 */
let newJSname = '';
let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let charactersLength = characters.length;

for (let i = 0; i < 21; i++) {
    newJSname += characters.charAt(Math.floor(Math.random() * charactersLength));
}

function prod_dist_javascript() {
    return src(['WFOTool_ui/src/dist/**/*.js', '!WFOTool_ui/src/dist/lib/**/*.js'])
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        //
        .pipe(replace(disturl, function () {
            return produrl
        }))
        .pipe(order([
            "WFOTool_ui/src/dist/index.js",
            "WFOTool_ui/src/dist/**/*.js"
        ]))
        .pipe(concat(newJSname + '.js'))
        // .pipe(concat('all.js'))
        .pipe(uglify({ mangle: false }))
        .pipe(dest('WFOTool_ui/src/prod/'))
}

/**
 * rerplaces index.js with all.js, and removes white space into prod
 */
function prod_dist_html() {

    return src('WFOTool_ui/src/dist/**/*.html')
        .pipe(removeCode({ production: true }))
        //
        .pipe(replace('<script src="index.js"></script>', function () {
            return '<script src="' + newJSname + '.js"></script>'
        }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest('WFOTool_ui/src/prod/'))
}

exports.build_prod = series(prod_dist_clean, prod_dist_moveSass, prod_dist_compile_lib, prod_dist_move_lib_fa, prod_dist_move_lib_norm, prod_dist_javascript, prod_dist_html);




// --- BACKEND
//
//

function modifyPythonFiles() {
    return src('lambda_mgmt/dev/**/*.py')
        .pipe(replace(dynamolocal, function () {
            return dynamocloud
        }))
        // pipe the updates to longer point to the dev table
        .pipe(replace(defaultlocal, function () {
            return defaultdev
        }))
        // pipe the updates to longer point to the dev table
        .pipe(replace(inputslocal, function () {
            return inputsdev
        }))
        // pipe the updates to longer point to the dev table
        .pipe(replace(outputslocal, function () {
            return outputsdev
        }))
        // pipe the updates to longer point to the dev table
        .pipe(replace(savedlocal, function () {
            return saveddev
        }))
        .pipe(replace(importDynamo, function () {
            return importDynamo_
        }))
        .pipe(replace(importRelativePackages, function () {
            return importRelativePackages_
        }))
        .pipe(dest('lambda_mgmt/dev_/'))
}

//
//
// === DEV_CLOUD compliation of lambda
function dev_lambda_dynamo_interaction() {
    return src('lambda_mgmt/dev_/dynamo_interaction/**/*.py')
        .pipe(replaceName(/dynamoInteraction/g, 'lambda_function'))
        .pipe(zip('dynamo_interaction.zip'))
        .pipe(dest('lambda_mgmt/dev_cloud/dynamo_interaction/'))
}
//
//
// === DEV_CLOUD compliation of lambda
function dev_lambda_run_plan() {
    return src('lambda_mgmt/dev_/run_plan/**/*.py')
        .pipe(replaceName(/run_plan/g, 'lambda_function'))
        .pipe(zip('run_plan.zip'))
        .pipe(dest('lambda_mgmt/dev_cloud/run_plan/'))
}
//
//
// === DEV_CLOUD compliation of lambda
function dev_lambda_save_plan() {
    return src('lambda_mgmt/dev_/save_plan/**/*.py')
        .pipe(replaceName(/save_plan/g, 'lambda_function'))
        .pipe(zip('save_plan.zip'))
        .pipe(dest('lambda_mgmt/dev_cloud/save_plan/'))
}
//
//
// === DEV_CLOUD compliation of lambda
function dev_lambda_get_defualt_inputs() {
    return src('lambda_mgmt/dev_/get_default_inputs/**/*.py')
        .pipe(replaceName(/get_default_inputs/g, 'lambda_function'))
        .pipe(zip('get_default_inputs.zip'))
        .pipe(dest('lambda_mgmt/dev_cloud/get_default_inputs/'))
}
//
//
// === DEV_CLOUD compliation of lambda
function dev_lambda_get_inputs() {
    return src('lambda_mgmt/dev_/get_inputs/**/*.py')
        .pipe(replaceName(/get_inputs_by_id/g, 'lambda_function'))
        .pipe(zip('get_inputs.zip'))
        .pipe(dest('lambda_mgmt/dev_cloud/get_inputs/'))
}
//
//
// === DEV_CLOUD compliation of lambda
function dev_lambda_get_saved_plans() {
    return src('lambda_mgmt/dev_/get_saved_plans/**/*.py')
        .pipe(replaceName(/get_saved_plans/g, 'lambda_function'))
        .pipe(zip('get_saved_plans.zip'))
        .pipe(dest('lambda_mgmt/dev_cloud/get_saved_plans/'))
}
//
//
// === DEV_CLOUD compliation of lambda
function dev_lambda_get_outputs() {
    return src('lambda_mgmt/dev_/get_outputs/**/*.py')
        .pipe(replaceName(/get_outputs_by_input_id/g, 'lambda_function'))
        .pipe(zip('get_outputs.zip'))
        .pipe(dest('lambda_mgmt/dev_cloud/get_outputs/'))
}

exports.build_dev_lambda = series(modifyPythonFiles, dev_lambda_dynamo_interaction, dev_lambda_run_plan, dev_lambda_save_plan, dev_lambda_get_defualt_inputs, dev_lambda_get_inputs, dev_lambda_get_saved_plans, dev_lambda_get_outputs)





function modifyPythonFiles_prod() {
    return src('lambda_mgmt/dev/**/*.py')
        .pipe(replace(dynamolocal, function () {
            return dynamocloud
        }))
        // pipe the updates to longer point to the dev table
        .pipe(replace(defaultlocal, function () {
            return defaultprod
        }))
        // pipe the updates to longer point to the dev table
        .pipe(replace(inputslocal, function () {
            return inputsprod
        }))
        // pipe the updates to longer point to the dev table
        .pipe(replace(outputslocal, function () {
            return outputsprod
        }))
        // pipe the updates to longer point to the dev table
        .pipe(replace(savedlocal, function () {
            return savedprod
        }))
        .pipe(replace(importDynamo, function () {
            return importDynamo_
        }))
        .pipe(replace(importRelativePackages, function () {
            return importRelativePackages_
        }))
        .pipe(dest('lambda_mgmt/prod_/'))
}

//
//
// === DEV_CLOUD compliation of lambda
function dev_lambda_dynamo_interaction_prod() {
    return src('lambda_mgmt/prod_/dynamo_interaction/**/*.py')
        .pipe(replaceName(/dynamoInteraction/g, 'lambda_function'))
        .pipe(zip('dynamo_interaction.zip'))
        .pipe(dest('lambda_mgmt/prod/dynamo_interaction/'))
}
//
//
// === DEV_CLOUD compliation of lambda
function dev_lambda_run_plan_prod() {
    return src('lambda_mgmt/prod_/run_plan/**/*.py')
        .pipe(replaceName(/run_plan/g, 'lambda_function'))
        .pipe(zip('run_plan.zip'))
        .pipe(dest('lambda_mgmt/prod/run_plan/'))
}
//
//
// === DEV_CLOUD compliation of lambda
function dev_lambda_save_plan_prod() {
    return src('lambda_mgmt/prod_/save_plan/**/*.py')
        .pipe(replaceName(/save_plan/g, 'lambda_function'))
        .pipe(zip('save_plan.zip'))
        .pipe(dest('lambda_mgmt/prod/save_plan/'))
}
//
//
// === DEV_CLOUD compliation of lambda
function dev_lambda_get_defualt_inputs_prod() {
    return src('lambda_mgmt/prod_/get_default_inputs/**/*.py')
        .pipe(replaceName(/get_default_inputs/g, 'lambda_function'))
        .pipe(zip('get_default_inputs.zip'))
        .pipe(dest('lambda_mgmt/prod/get_default_inputs/'))
}
//
//
// === DEV_CLOUD compliation of lambda
function dev_lambda_get_inputs_prod() {
    return src('lambda_mgmt/prod_/get_inputs/**/*.py')
        .pipe(replaceName(/get_inputs_by_id/g, 'lambda_function'))
        .pipe(zip('get_inputs.zip'))
        .pipe(dest('lambda_mgmt/prod/get_inputs/'))
}
//
//
// === DEV_CLOUD compliation of lambda
function dev_lambda_get_saved_plans_prod() {
    return src('lambda_mgmt/prod_/get_saved_plans/**/*.py')
        .pipe(replaceName(/get_saved_plans/g, 'lambda_function'))
        .pipe(zip('get_saved_plans.zip'))
        .pipe(dest('lambda_mgmt/prod/get_saved_plans/'))
}
//
//
// === DEV_CLOUD compliation of lambda
function dev_lambda_get_outputs_prod() {
    return src('lambda_mgmt/prod_/get_outputs/**/*.py')
        .pipe(replaceName(/get_outputs_by_input_id/g, 'lambda_function'))
        .pipe(zip('get_outputs.zip'))
        .pipe(dest('lambda_mgmt/prod/get_outputs/'))
}

exports.build_prod_lambda = series(modifyPythonFiles_prod, dev_lambda_dynamo_interaction_prod, dev_lambda_run_plan_prod, dev_lambda_save_plan_prod, dev_lambda_get_defualt_inputs_prod, dev_lambda_get_inputs_prod, dev_lambda_get_saved_plans_prod, dev_lambda_get_outputs_prod)






function exportDevFE() {
    return src('WFOTool_ui/src/dev_cloud/**/*.{js,html,css}')
        .pipe(dest('../WFOTool_prod/dev/dev_fe/'))
}

//
//
// === DEV_CLOUD compliation of lambda
function lambda_1() {
    return src('lambda_mgmt/prod_/dynamo_interaction/**/*.py')
        .pipe(replaceName(/dynamoInteraction/g, 'lambda_function'))
        .pipe(zip('dynamo_interaction.zip'))
        .pipe(dest('../WFOTool_prod/dev/dev_be/dev_cloud/dynamo_interaction/'))
}
//
//
// === DEV_CLOUD compliation of lambda
function lambda_2() {
    return src('lambda_mgmt/prod_/run_plan/**/*.py')
        .pipe(replaceName(/run_plan/g, 'lambda_function'))
        .pipe(zip('run_plan.zip'))
        .pipe(dest('../WFOTool_prod/dev/dev_be/dev_cloud//run_plan/'))
}
//
//
// === DEV_CLOUD compliation of lambda
function lambda_3() {
    return src('lambda_mgmt/prod_/save_plan/**/*.py')
        .pipe(replaceName(/save_plan/g, 'lambda_function'))
        .pipe(zip('save_plan.zip'))
        .pipe(dest('../WFOTool_prod/dev/dev_be/dev_cloud//save_plan/'))
}
//
//
// === DEV_CLOUD compliation of lambda
function lambda_4() {
    return src('lambda_mgmt/prod_/get_default_inputs/**/*.py')
        .pipe(replaceName(/get_default_inputs/g, 'lambda_function'))
        .pipe(zip('get_default_inputs.zip'))
        .pipe(dest('../WFOTool_prod/dev/dev_be/dev_cloud//get_default_inputs/'))
}
//
//
// === DEV_CLOUD compliation of lambda
function lambda_5() {
    return src('lambda_mgmt/prod_/get_inputs/**/*.py')
        .pipe(replaceName(/get_inputs_by_id/g, 'lambda_function'))
        .pipe(zip('get_inputs.zip'))
        .pipe(dest('../WFOTool_prod/dev/dev_be/dev_cloud//get_inputs/'))
}
//
//
// === DEV_CLOUD compliation of lambda
function lambda_6() {
    return src('lambda_mgmt/prod_/get_saved_plans/**/*.py')
        .pipe(replaceName(/get_saved_plans/g, 'lambda_function'))
        .pipe(zip('get_saved_plans.zip'))
        .pipe(dest('../WFOTool_prod/dev/dev_be/dev_cloud//get_saved_plans/'))
}
//
//
// === DEV_CLOUD compliation of lambda
function lambda_7() {
    return src('lambda_mgmt/prod_/get_outputs/**/*.py')
        .pipe(replaceName(/get_outputs_by_input_id/g, 'lambda_function'))
        .pipe(zip('get_outputs.zip'))
        .pipe(dest('../WFOTool_prod/dev/dev_be/dev_cloud//get_outputs/'))
}

exports.exportDev = series(lambda_1, lambda_2, lambda_3, lambda_4, lambda_5, lambda_6, lambda_7, exportDevFE);