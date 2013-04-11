function sanitize(str){
    return str.replace(/[^a-zA-Z 0-9.]+/g,'').replace(/\s+/g,"_");
}

XUnitReporter = function(report_file_path) {
    this.started = false;
    this.finished = false;
    this.suites_ = [];
    this.results_ = {};
    this.report_file_path = report_file_path || "jasminetests.xml";
    this.counts = {"failure":0,"total":0,"skipped":0};
    this.xml_queue = "";
};

XUnitReporter.prototype.outputXml = function(total,failures,skipped){
    result = '<?xml version="1.0"?>'+
            '<testsuite name="jasminetests" tests="' + total + '" '+
            'failures="' + failures + '" '+
            'skip="' + skipped + '">';
    result+=this.xml_queue;
    result+= '</testsuite>';
    return result;
};

XUnitReporter.prototype.renderXmlMessage = function(class_name,test_name,error_title,stack){
    var data = '<testcase classname="'+sanitize(class_name)+'" name="'+sanitize(test_name)+'">' +
            '<error type="'+error_title+'">' + stack + '</error>' +
            '</testcase>';
    this.xml_queue+= data;
};


XUnitReporter.prototype.renderPass = function(class_name,test_name){
    this.xml_queue+= '<testcase classname="' + sanitize(class_name)+'" name="' + sanitize(test_name) + '" />';
};


XUnitReporter.prototype.renderError = function(class_name,test_name,error_title,stack){
    this.renderXmlMessage(class_name,test_name, error_title, stack);
};

XUnitReporter.prototype.reportRunnerStarting = function(runner) {
  print("XUnit Reporter Activated");
};

XUnitReporter.prototype.getCompleteClassName = function(spec){
  var fullName = spec.suite.description;
  for (var parentSuite = spec.suite.parentSuite; parentSuite; parentSuite = parentSuite.parentSuite) {
    fullName = parentSuite.description + '.' + fullName;
  }
  return fullName;
};

XUnitReporter.prototype.reportSpecResults = function(spec) {
    var class_name = this.getCompleteClassName(spec);
    this.counts["total"]+=1;
    var results = spec.results();
    var passed = results.passed();
    var skipped = results.skipped;
    if(passed){
        this.renderPass(class_name,spec.description);        
    } else {
        this.counts["failure"]+=1;
    }
    if(skipped){
        this.counts["skipped"]+=1;        
    }
    var resultItems = results.getItems();
    for (var i = 0; i < resultItems.length; i++) {
        var result = resultItems[i];
        if (result.type == 'expect' && result.passed && !result.passed()) {
            if (result.trace.stack) {
                this.renderError(class_name,spec.description,result.message,result.trace.stack);
            } else {
                this.renderError(class_name,spec.description,result.message,"");
            }
        }
    }
};

XUnitReporter.prototype.writeReport = function(content){
    var f = new java.io.File(this.report_file_path);
    var output = new java.io.BufferedWriter(new java.io.FileWriter(f));
    output.write(content);
    output.close();
};

XUnitReporter.prototype.reportRunnerResults = function(runner) {
  this.writeReport(this.outputXml(this.counts.total,this.counts.failure, this.counts.skipped));
};