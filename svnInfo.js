"use strict"

const SvnClient = require('svn-spawn')
const svnErrMsgId = "svnErrMsg"

const msg_successLoadFileList = "파일리스트를 불러왔습니다. "
const msg_successLoadFileCnt = "파일갯수 : "

let svnClient = {}

exports.importFileList = importFileList

function importFileList(url, fromRev, toRev, viewId){
  console.log("url : " + url);
  let revision = fromRev + ":" + toRev
  svnClient = new SvnClient({
      cwd: url
  });

  svnClient.cmd([ 'diff', '--summarize', '-r', revision],function(err, data) {
    if(err){
      //let strContents = new Buffer(err.toString());
      //console.log(err);
      document.getElementById(svnErrMsgId).innerHTML = err
    }
    else{
      let dataSplitArr = data.split(/\n/);
      document.getElementById(svnErrMsgId).innerHTML = msg_successLoadFileList + msg_successLoadFileCnt + (dataSplitArr.length-1);
      document.getElementById(viewId).value = ""
      if(data && data.length){
        $.each(data.split(/\n/), function(i, line){
          if(line && line.length){
              if(line.lastIndexOf('.') !== -1){
                  document.getElementById(viewId).value = document.getElementById(viewId).value + "\\" + $.trim(line.substring(2, line.length)) + '\n'
              }
          }
        });
      }
    }
  });
}
