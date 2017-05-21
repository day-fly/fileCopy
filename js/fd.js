"use strict"

const fs = require('fs-extra')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()

//define file object
const fd = {
  init: function(path, isDir) {
    this.path = path
    this.isDir = isDir
    return this
  },
  getPath: function() {
    return this.path
  },
  getIsDir: function() {
    return this.isDir
  },
  toString: function() {
    console.log("path : " + path + ", isDir : " + isDir)
  }
};

//define classPath object
const classPath = {
  init: function(fromClassPath, toClassPath) {
    this.fromClassPath = fromClassPath
    this.toClassPath = toClassPath
    return this
  },
  getFromClassPath: function() {
    return this.fromClassPath
  },
  getToClassPath: function() {
    return this.toClassPath
  },
  setToClassPath: function(toClassPath) {
    this.toClassPath = toClassPath
  }
};

const msg_selectProjectFolder = "프로젝트 폴더를 지정하세요."
const msg_existClassPath = ".classPath 파일이 존재하지 않습니다. 프로젝트 폴더를 확인하세요."

let srcFolder //파일 복사할 대상 폴더
let destFolder //파일 복사될 폴더
let classPathInfos = [] //클래스 패스 정보. classPath 객체 배열
let toClassPath //클래스로 빠질 default output 폴더

let totalFileCnt = 0 //총 복사할 파일 개수
let succFileCnt = 0 //총 성공한 파일 개수
let errFileCnt = 0 //총 실패한 파일 개수

//////////////////////////// exports 변수 선언부 시작 /////////////////////////////////////
exports.selectSrcFolder = function(e, id) {
  srcFolder = selectFolder(e, id)
};
exports.selectDestFolder = function(e, id) {
  destFolder = selectFolder(e, id)
};
exports.copyFiles = copyFiles
exports.setClassMode = setClassMode
exports.initClassPaths = function() {
  classPathInfos = []
}
exports.loadInfo = loadInfo
exports.saveInfo = saveInfo
//////////////////////////// exports 변수 선언부 끝 /////////////////////////////////////

function copyFiles(filePaths, logId) {
  totalFileCnt = filePaths.length
  succFileCnt = 0
  errFileCnt = 0

  document.getElementById(logId).innerHTML = "";
  for (let i = 0, item; item = filePaths[i]; i++) {
    copyFile(item, logId)
  }
}

//파일 COPY
function copyFile(filePath, logId) {
  if (classPathInfos && classPathInfos.length) {
    for (let i = 0, item; item = classPathInfos[i]; i++) {
      let regExp = new RegExp("^\\\\" + item + "\\\\", "g")
      if (regExp.test(filePath)) {
        filePath = filePath.replace(regExp, "\\" + item.getToClassPath() + "\\").replace(/.java$/, ".class")
      }
    }
  }

  let srcPath = srcFolder.getPath() + filePath
  let destPath
  if (document.getElementById(onlyFileModeId).checked) {
    destPath = destFolder.getPath() + filePath.substring(filePath.lastIndexOf('\\'), filePath.length)
  } else {
    destPath = destFolder.getPath() + filePath
  }

  let err = false;
  // try {
  //   fs.copySync(srcPath, destPath)
  //   succFileCnt++
  // } catch (e) {
  //   err = e
  //   errFileCnt++
  // } finally {
  //   logCopyFile(err, logId, filePath)
  // }
  //   if(succFileCnt + errFileCnt === totalFileCnt){
  //     logCopyFileResult()
  //   }

  fs.copy(srcPath, destPath, err => {
    if (err) {
      errFileCnt++;
    } else {
      succFileCnt++;
    }
    logCopyFile(err, logId, filePath)
    if (succFileCnt + errFileCnt === totalFileCnt) {
      logCopyFileResult()
    }
  });
}

function existFileCopy() {
  console.log("exist !")
}

//FILE COPY 결과 로그 PRINT
function logCopyFile(err, logId, filePath) {
  let msg = '<mark><strong>' + filePath + "</strong></mark> : "
  if (err) {
    console.log(err);
    msg += "<label class='text-danger'>" + err + "</label><br>"
  } else {
    msg += "Success!<br>"
  }
  if (logId) {
    document.getElementById(logId).innerHTML += msg
  }
}

function logCopyFileResult() {
  document.getElementById(resultCntLogId).innerHTML += "<br><strong> 복사결과 ==> Total : " + totalFileCnt + ", Success : " + succFileCnt + ", Error : " + errFileCnt + "</strong>"
}

function selectFolder(e, id) {
  if (fd && id) {
    let obj = Object.create(fd).init(e.target.files[0].path, true)
    document.getElementById(id).innerHTML = obj.getPath()
    return obj
  }
  return null
}

function setClassMode(classesFolderPath, classPathInfo) {
  if (!srcFolder) {
    alert(msg_selectProjectFolder)
    document.getElementById(classesModeId).checked = false
    return false
  }

  classPathInfos = []
  if (srcFolder.getPath()) {
    $('#' + classesFolderPath).text(srcFolder.getPath() + '\\.classpath')

    //선택한 프로젝트 폴더에 .classpath가 없을 시 예외처리
    if (!(fs.existsSync(srcFolder.getPath() + '/.classpath'))) {
      alert(msg_existClassPath);
      document.getElementById(classesModeId).checked = false;
      return;
    }

    //.classpath 파싱 부분. classpathentry의 src와 output 정보 참조.
    fs.readFile(srcFolder.getPath() + '/.classpath', function(err, data) {
      parser.parseString(data, function(err, result) {
        if (result.classpath.classpathentry && result.classpath.classpathentry.length) {
          for (let i = 0, item; item = result.classpath.classpathentry[i]; i++) {
            if (item.$.kind === "src") {
              classPathInfos.push(Object.create(classPath).init(item.$.path.replace(/\//g, "\\"), item.$.output.replace(/\//g, "\\") || ''))
            } else if (item.$.kind === "output") {
              toClassPath = item.$.path.replace(/\//g, "\\")
            }
          }
        }
        let str = ""; // classpath 정보 html
        str += '<table class="table table-bordered">'
        str += '<th>src</th>'
        str += '<th>output</th>'
        for (let i = 0, item; item = classPathInfos[i]; i++) {
          if (item.getToClassPath() === '') {
            item.setToClassPath(toClassPath)
          }
          str += '<tr><td>' + item.getFromClassPath() + '</td><td>' + item.getToClassPath() + '</td></tr>'
        } //end for
        str += '</table>'
        document.getElementById(classPathInfo).innerHTML = str
      });
    });
  }
  return true
}

function loadInfo() {
  fs.readFile(saveSettingPath, 'utf8', function(err, data) {
    if (err) throw err
    let saveInfoObj = JSON.parse(data)
    if (saveInfoObj.srcFolder) {
      srcFolder = Object.create(fd).init(saveInfoObj.srcFolder.path, saveInfoObj.srcFolder.isDir)
      document.getElementById(rootFolderPathId).innerHTML = srcFolder.getPath()
    }
    if (saveInfoObj.destFolder) {
      destFolder = Object.create(fd).init(saveInfoObj.destFolder.path, saveInfoObj.destFolder.isDir)
      document.getElementById(destFolderPathId).innerHTML = destFolder.getPath()
    }
    if (saveInfoObj.onlyFileMode) {
      document.getElementById(onlyFileModeId).click()
    }
    document.getElementById(onlyFileModeId).checked = saveInfoObj.onlyFileMode
    if (saveInfoObj.classesMode) {
      document.getElementById(classesModeId).click()
    }
    document.getElementById(classesModeId).checked = saveInfoObj.classesMode
    if (saveInfoObj.svnMode) {
      document.getElementById(svnModeId).click()
    }
    document.getElementById(svnModeId).checked = saveInfoObj.svnMode
  });
}

function saveInfo() {
  let jsonInfo = {
    "srcFolder": srcFolder,
    "destFolder": destFolder,
    "onlyFileMode": document.getElementById(onlyFileModeId).checked,
    "classesMode": document.getElementById(classesModeId).checked,
    "svnMode": document.getElementById(svnModeId).checked
  }

  let jsonStr = JSON.stringify(jsonInfo)
  fs.open(saveSettingPath, 'w', function(err, fd) {
    if (err) throw err
    let buf = new Buffer(jsonStr)
    fs.write(fd, buf, 0, buf.length, null, function(err, written, buffer) {
      if (err) throw err
      fs.close(fd, function() {
        alert('Saved Settings');
      });
    });
  });
}
