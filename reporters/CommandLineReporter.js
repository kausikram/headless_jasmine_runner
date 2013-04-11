function shell_print(data){
    java.lang.System.out.print(data);
}


CommandLineReporter = function() {
  this.started = false;
  this.finished = false;
  this.suites_ = [];
  this.results_ = {};
  this.counts = {"failure":0,"total":0,"skipped":0};
  this.print_queue = "";
};

CommandLineReporter.prototype.renderPrintMessage = function (class_name,test_name, error_title, stack) {
    topic = class_name + ' ' + test_name;
    var line = "--------------------------------------------------------";
    var linebreak = "\n";
    var data = "";
    data += line + linebreak;
    data += topic + " :: " + error_title + linebreak;
    data += line + linebreak;
    data += stack + linebreak;
    data += line + linebreak;
    this.print_queue += data;
};

CommandLineReporter.prototype.renderError = function(class_name,test_name,error_title,stack){
    this.renderPrintMessage(class_name,test_name, error_title, stack);
};

CommandLineReporter.prototype.reportRunnerStarting = function(runner) {
  print("Runner is primed and fired");      
};

CommandLineReporter.prototype.getCompleteClassName = function(spec){
    return spec.suite.getFullName();
};

CommandLineReporter.prototype.reportSpecResults = function(spec) {
    this.counts["total"]+=1;
    var results = spec.results();
    var passed = results.passed();
    var skipped = results.skipped;
    if(passed){
        shell_print (".");
    } else {
        this.counts["failure"]+=1;
        shell_print("F");
    }
    if(skipped){
        this.counts["skipped"]+=1;
        shell_print("S");
    }
    var resultItems = results.getItems();
    for (var i = 0; i < resultItems.length; i++) {
        var result = resultItems[i];
        if (result.type == 'expect' && result.passed && !result.passed()) {
            var class_name = this.getCompleteClassName(spec);
            if (result.trace.stack) {
                this.renderError(class_name,spec.description,result.message,result.trace.stack);
            } else {
                this.renderError(class_name,spec.description,result.message,"");
            }
        }
    }
};


CommandLineReporter.prototype.reportSuiteResults = function(suite) {
};

CommandLineReporter.prototype.reportRunnerResults = function(runner) {
  var results = runner.results();
  print();   
  print(this.print_queue);
  print("Finished Running Tests. Ran " + this.counts.total + " Tests. " + this.counts.failure + " tests failed.");
  this.passed = results.failedCount == 0;  
};