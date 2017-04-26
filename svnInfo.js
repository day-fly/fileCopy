const SvnClient = require('svn-spawn');

let svnClient = {};

exports.importFileList = function(url, fromRev, toRev, viewId){
  let revision = fromRev + ":" + toRev;
  svnClient = new SvnClient({
      cwd: url
  });

  svnClient.cmd([ 'diff', '--summarize', '-r', revision],function(err, data) {
    if(err){
      //let strContents = new Buffer(err.toString());
      //console.log(err.toString());
      $('#svnErrMsg').text(err);
      return;
    }
    else{
      $('#svnErrMsg').text("Success!");
      $('#'+viewId).val("");
      if(data && data.length){
        $.each(data.split(/\n/), function(i, line){
          if(line && line.length){
              if(line.lastIndexOf('.') !== -1){
                  $('#'+viewId).val($('#'+viewId).val() + "\\" + $.trim(line.substring(2, line.length)) + '\n');
              }
          }
        });
      }
    }
  });

}
