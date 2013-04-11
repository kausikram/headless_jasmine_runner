importPackage(java.io);

/* Helper Functions */
function spanDir(dir,fileHandler) {
    var file = new File(dir);
    if(!file.isDirectory()) {
        fileHandler(file);
        return;
    }
    var lst= file.listFiles();
    var i;
    for(i=0;i<lst.length;i++) {
        if(lst[i].isDirectory()) {
            spanDir(lst[i].getAbsolutePath(),fileHandler);
        } else {
            fileHandler(lst[i]);
        }
    }
}

files_loaded = [];

function load_file(file_path){
    var i = files_loaded.length;
    while (i--) {
        if (files_loaded[i] == file_path) {
          return;
        }
    }
    load(file_path);
    files_loaded.push(file_path);
}


/* arguments digestor */

function ArgsParser(arguments, defaults){
    this.args = {};
    this.extend_args(defaults);
    this.extend_args(this.digest_args(arguments));
}

ArgsParser.prototype = {};

ArgsParser.prototype.extend_args = function(obj) {
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            this.args[p] = obj[p];
        }
    }
};

ArgsParser.prototype.digest_args = function(argument_list){
    var map = {};
    var key, value;
    for(var i=0;i<argument_list.length;i++){
        key = argument_list[i].split("=")[0].split("--")[1];
        value = argument_list[i].split("=")[1];
        map[key] = value;
    }
    return map;
};

ArgsParser.prototype.get = function(key){
    return this.args[key];
};

defaults = {
    "jasmine_path":".",
    "with_xunit":false,
    "test_suite_path":"./spec",
    "xunit_report_path": "jasminereport.xml"
};

function run(arguments){
    var args = new ArgsParser(arguments, defaults);
    var should_return_xunit_output = args.get("with_xunit");
    var jasmine_path = args.get("jasmine_path");
    var test_directory = args.get("test_suite_path");
    var xunit_report_path = args.get("xunit_report_path");

    load_file(jasmine_path + "/lib/env.rhino.js");
    load_file(jasmine_path + "/lib/jasmine.js");
    load_file(jasmine_path + "/reporters/CommandLineReporter.js");
    load_file(jasmine_path + "/reporters/XUnitReporter.js");

    // The actual test spooling
    spanDir(test_directory,function(file){
        if(file.getName().toLowerCase().endsWith("spec.js")) load_file(file);
    });

    var cl_reporter = new CommandLineReporter();

    var multi_reporter = new jasmine.MultiReporter();
    multi_reporter.addReporter(cl_reporter);

    if(should_return_xunit_output){
        var xunit_reporter = new XUnitReporter(xunit_report_path);
        multi_reporter.addReporter(xunit_reporter);
    }

    jasmine.getEnv().addReporter(multi_reporter);
    jasmine.getEnv().execute();
    Envjs.wait();
    if(!cl_reporter.passed) { java.lang.System.exit(1) };
}

run(arguments);