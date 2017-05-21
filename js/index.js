window.$ = window.jQuery = require('jquery')

//html의 element Id
const rootFolderPathId = "rootFolderPath"
const destFolderPathId = "destFolderPath"
const onlyFileModeId = "onlyFileMode"
const classesModeId = "classesMode"
const svnModeId = "svnCheckbox"
const resultCntLogId = "resultCntLog" //로그 div id
const copyFilePathsId = "copyFilePaths" //filepath textarea
const saveSettingPath = "./saveSettings.json"

//const iconv = require('iconv-lite')
const fd = require('./js/fd')
const svnInfo = require('./js/svnInfo')

//const euckr2utf8 = new iconv('EUC-KR', 'UTF-8');
//const utf82euckr = new iconv('UTF-8', 'EUC-KR');

$(document).ready(function() {
  $("#rootFolder").filestyle({
    buttonName: "btn-primary",
    buttonText: "Select"
  });
  $("#destFolder").filestyle({
    buttonName: "btn-primary",
    buttonText: "Select"
  });
  $("#classesFolder").filestyle({
    buttonName: "btn-primary",
    buttonText: "Select"
  });
});

//Select File Event
document.getElementById("rootFolder").addEventListener("change", _ => {
  fd.selectSrcFolder(event, rootFolderPathId)
});

document.getElementById("destFolder").addEventListener("change", _ => {
  fd.selectDestFolder(event, destFolderPathId)
});

document.getElementById("classesFolder").addEventListener("change", _ => {
  fd.selectDestFolder(event, "classesFolderPath")
});

document.getElementById(classesModeId).addEventListener("click", _ => {
  if ($("#classesPathInfo").css("display") == "none") {
    if (fd.setClassMode("classesFolderPath", "classPathInfo")) {
      $("#classesPathInfo").show()
    }
  } else {
    fd.initClassPaths()
    $("#classesPathInfo").hide()
  }
});

document.getElementById(svnModeId).addEventListener("click", _ => {
  if ($("#svnInfo").css("display") == "none") {
    $("#svnInfo").show()
  } else {
    $("#svnInfo").hide()
  }
});

document.getElementById("svnConnBtn").addEventListener("click", _ => {
  $('#'+copyFilePathsId).val('')
  let svnUrl = $('#'+rootFolderPathId).text()
  let fromRev = $('#fromRev').val()
  let toRev = $('#toRev').val()
  svnInfo.importFileList(svnUrl, fromRev, toRev, copyFilePathsId);
});

document.getElementById("saveBtn").addEventListener("click", _ => {
  fd.saveInfo()
});

document.getElementById("copyBtn").addEventListener("click", _ => {
  $('#'+resultCntLogId).html("")
  const lines = [];
  $.each($('#' + copyFilePathsId).val().split(/\n/), function(i, line) {
    if (line && line.length) {
      lines.push(line)
    }
  });
  if (lines && lines.length) {
    fd.copyFiles(lines, "resultLog")
  }
});

fd.loadInfo();
