"use strict"

const fs = require('fs-extra')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()

//FILE OBJECT 선언
const fd = {
    path : '',
    isDir : false,
    init: function(path, isDir) {
      this.path = path
      this.isDir = isDir
      return this
    },
    getPath : function(){
      return this.path
    },
    getIsDir : function(){
      return this.isDir
    },
    toString : function(){
      console.log("path : " + path + ", isDir : " + isDir)
    }
};

//html의 element Id
const rootFolderPathId = "rootFolderPath"
const destFolderPathId = "destFolderPath"
const onlyFileModeId = "onlyFileMode"
const classesModeId = "classesMode"
const svnModeId = "svnCheckbox"
const saveSettingPath = "./saveSettings.json"

const msg_selectProjectFolder = "프로젝트 폴더를 지정하세요."

let srcFolder  //파일 복사할 대상 폴더
let destFolder //파일 복사될 폴더
let fromClassPaths = [] //클래스 패스 폴더들
let toClassPath         //클래스로 빠질 output 폴더

let totalFileCnt = 0 //총 복사할 파일 개수
let succFileCnt = 0  //총 성공한 파일 개수
let errFileCnt = 0   //총 실패한 파일 개수
const resultCntLogId = "resultCntLog"

//////////////////////////// exports 변수 선언부 시작 /////////////////////////////////////
exports.selectSrcFolder = function(e, id) {
  srcFolder = selectFolder(e,id)
};
exports.selectDestFolder = function(e, id) {
  destFolder = selectFolder(e,id)
};
exports.copyFiles = copyFiles
exports.setClassMode = setClassMode
exports.initClassPaths = function(){
  fromClassPaths = []
}
exports.loadInfo = loadInfo
exports.saveInfo = saveInfo
//////////////////////////// exports 변수 선언부 끝 /////////////////////////////////////

function copyFiles(filePaths,logId){
  totalFileCnt = filePaths.length
  succFileCnt = 0
  errFileCnt = 0

  document.getElementById(logId).innerHTML = "";
  for(let i=0, item; item = filePaths[i] ; i++){
    copyFile(item, logId)
  }
}

//파일 COPY
function copyFile(filePath, logId){
  if(fromClassPaths && fromClassPaths.length){
    for(let i = 0, item ; item = fromClassPaths[i] ; i++){
      let regExp = new RegExp("^\\\\" + item + "\\\\", "g")
      if(regExp.test(filePath)){
        filePath = filePath.replace(regExp, "\\" + toClassPath + "\\").replace(/.java$/,".class")
      }
    }
  }

  let srcPath = srcFolder.getPath()+filePath
  let destPath
  if(document.getElementById(onlyFileModeId).checked){
    destPath = destFolder.getPath()+filePath.substring(filePath.lastIndexOf('\\'), filePath.length)
  }
  else{
      destPath = destFolder.getPath()+filePath
  }
  fs.copy(srcPath, destPath, err => {
    logCopyFile(err, logId, filePath)
    if(succFileCnt + errFileCnt === totalFileCnt){
      logCopyFileResult()
    }
  });
}

function existFileCopy () {
  console.log("exist !")
}

//FILE COPY 결과 로그 PRINT
function logCopyFile(err, logId, filePath){
  let msg = '<mark><strong>'+filePath + "</strong></mark> : "
  if(err){
    errFileCnt++
    msg += "<label class='text-danger'>" + err + "</label><br>"
  }
  else{
    succFileCnt++
    msg += "Success!<br>"
  }
  if(logId){
      document.getElementById(logId).innerHTML += msg
  }
}

function logCopyFileResult(){
  document.getElementById(resultCntLogId).innerHTML += "<br><strong> 복사결과 ==> Total : " + totalFileCnt + ", Success : " + succFileCnt + ", Error : " + errFileCnt + "</strong>"
}

function selectFolder(e, id){
  if(fd && id){
      let obj = Object.create(fd).init(e.target.files[0].path, true)
      document.getElementById(id).innerHTML = obj.getPath()
      return obj
  }
  return null
}

function setClassMode(classesFolderPath, classPathInfo){
  if(!srcFolder){
    alert(msg_selectProjectFolder)
    document.getElementById(classesModeId).checked = false
    return false
  }

  fromClassPaths = [];
  if( srcFolder.getPath() ){
    $('#'+classesFolderPath).text(srcFolder.getPath() + '\\.classpath')
    fs.readFile(srcFolder.getPath() + '/.classpath', function(err, data) {
      parser.parseString(data, function (err, result) {
        if(result.classpath.classpathentry && result.classpath.classpathentry.length){
          for(let i=0, item; item = result.classpath.classpathentry[i] ; i++){
            if(item.$.kind === "src"){
              fromClassPaths.push(item.$.path.replace(/\//g,"\\"))
            }else if(item.$.kind === "output"){
              toClassPath = item.$.path.replace(/\//g,"\\")
            }
          }
        }
        let str = "";
        for(let i=0, item; item = fromClassPaths[i] ; i++){
          str += item + " => " + toClassPath + "<br>"
        }
        document.getElementById(classPathInfo).innerHTML = str
      });
    });
  }
  return true
}

function loadInfo(){
  fs.readFile(saveSettingPath, 'utf8',function(err, data) {
    if(err) throw err
    let saveInfoObj = JSON.parse(data)
    if(saveInfoObj.srcFolder){
      srcFolder = Object.create(fd).init(saveInfoObj.srcFolder.path, saveInfoObj.srcFolder.isDir)
      document.getElementById(rootFolderPathId).innerHTML = srcFolder.getPath()
    }
    if(saveInfoObj.destFolder){
      destFolder = Object.create(fd).init(saveInfoObj.destFolder.path, saveInfoObj.destFolder.isDir)
      document.getElementById(destFolderPathId).innerHTML = destFolder.getPath()
    }
    if(saveInfoObj.onlyFileMode){
        document.getElementById(onlyFileModeId).click()
    }
    document.getElementById(onlyFileModeId).checked = saveInfoObj.onlyFileMode
    if(saveInfoObj.classesMode){
        document.getElementById(classesModeId).click()
    }
    document.getElementById(classesModeId).checked = saveInfoObj.classesMode
    if(saveInfoObj.svnMode){
        document.getElementById(svnModeId).click()
    }
    document.getElementById(svnModeId).checked = saveInfoObj.svnMode
  });
}

function saveInfo(){
  let jsonInfo = {
    "srcFolder" : srcFolder,
    "destFolder" : destFolder,
    "onlyFileMode" : document.getElementById(onlyFileModeId).checked,
    "classesMode" : document.getElementById(classesModeId).checked,
    "svnMode" : document.getElementById(svnModeId).checked
  }

  let jsonStr = JSON.stringify(jsonInfo)
  fs.open(saveSettingPath, 'w', function(err, fd) {
  if(err) throw err
  let buf = new Buffer(jsonStr)
  fs.write(fd, buf, 0, buf.length, null, function(err, written, buffer) {
    if(err) throw err
    fs.close(fd, function() {
      alert('Saved Settings');
    });
  });
});
}
