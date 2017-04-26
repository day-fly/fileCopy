const fs = require('fs-extra');
//const copydir = require('copy-dir');
const fd = {
    path : '',
    isDir : false,
    init: function(path, isDir) {
      this.path = path;
      this.isDir = isDir;
      return this;
    },
    getPath : function(){
      return this.path;
    },
    getIsDir : function(){
      return this.isDir;
    },
    toString : function(){
      console.log("path : " + path + ", isDir : " + isDir);
    }
};

let srcFolder = {};
let destFolder = {};

exports.testSetting = function(){
  srcFolder = Object.create(fd).init("C:\\Users\\SDS\\workspace\\hrp", true);
  document.getElementById("rootFolderPath").innerHTML = srcFolder.getPath();

  destFolder = Object.create(fd).init("C:\\Users\\SDS\\Desktop\\test\\dest", true);
  document.getElementById("destFolderPath").innerHTML = destFolder.getPath();
}

exports.selectSrcFolder = function(e, id) {
  srcFolder = selectFolder(e,id);
};

exports.selectDestFolder = function(e, id) {
  destFolder = selectFolder(e,id);
};

exports.copyFiles = function(filePaths,logId){
  console.dir(filePaths);
  document.getElementById(logId).innerHTML = "";
  for(let i=0, item; item = filePaths[i] ; i++){
    copyFile(item, logId);
  }
}

function copyFile(filePath, logId){
  let srcPath = srcFolder.getPath()+filePath;
  let destPath = destFolder.getPath()+filePath;
  let msg = '<mark><strong>'+filePath + "</strong></mark> : ";
  fs.copy(srcPath, destPath, err => {
    if(err){
      msg += "<label class='text-danger'>" + err + "</label><br>";
    }
    else{
      msg += "Success!<br>";
    }
    if(logId){
        document.getElementById(logId).innerHTML += msg;
    }
  });
}

function selectFolder(e, id){
  if(fd && id){
      let obj = Object.create(fd).init(e.target.files[0].path, true);
      document.getElementById(id).innerHTML = obj.getPath();
      return obj;
  }
  return null;
}
