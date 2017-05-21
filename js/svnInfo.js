"use strict"

const SvnClient = require('svn-spawn')
const svnErrMsgId = "svnErrMsg"

const msg_successLoadFileList = "파일리스트를 불러왔습니다. "
const msg_successLoadFileCnt = "파일갯수 : "

//svn revision 객체
const rev = {
  init: function(revision, author, date, msg, paths) {
    this.revision = revision
    this.author = author
    this.date = date
    this.msg = msg
    this.paths = paths
    return this
  },
  getAuthor: function() {
    return this.author
  },
  getDate: function() {
    return this.date
  },
  getRevision: function() {
    return this.revision
  },
  getMsg: function() {
    return this.msg
  }
};

const path = {
  init: function(action, kind, filePath) {
    this.action = action
    this.kind = kind
    this.filePath = filePath
    return this
  },
  getAction: function() {
    return this.action
  },
  getKind: function() {
    return this.kind
  },
  getFilePath: function() {
    return this.filePath
  }
};

let svnClient = {}
let svnInfos = []

exports.importFileList = importFileList

function importFileList(url, fromRev, toRev, viewId) {
  let revision = fromRev + ":" + toRev
  svnClient = new SvnClient({
    cwd: url
  });
  let logJson
  svnClient.getLog(['-r', fromRev + ":" + toRev, '-v'], function(err, log) {
    if (err) document.getElementById(svnErrMsgId).innerHTML = err
    log.forEach(function(l) {
      l.forEach(function(v) {
        if (v.$) {
          let paths = []
          if (v.paths.path.length) {
            v.paths.path.forEach(function(f) {
              paths.push(Object.create(path).init(f.$.action, f.$.kind, f._));
            });
          } else {
            paths.push(Object.create(path).init(v.paths.path.$.action, v.paths.path.$.kind, v.paths.path._));
          }
          if (paths.length) {
            paths.forEach(function(p) {
              if (p.getKind() === "file") { //디렉토리는 복사하지 않는다.
                let _path = p.getFilePath().substring(p.getFilePath().indexOf("/", 2), p.getFilePath().length)
                document.getElementById(viewId).value = document.getElementById(viewId).value + _path + '\n'
              }
            });
          }
          svnInfos.push(Object.create(rev).init(v.$.revision, v.author, v.date, v.msg, paths))
        } //end if
      }); //end forEach
    }); //end forEach
    //console.log(JSON.stringify(svnInfos))
  }); //end getLog
}
