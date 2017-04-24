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

const srcFolder = {};
const destFolder = {};

exports.selectSrcFolder = function(e, id) {
  selectFolder(e,id,srcFolder);
};

exports.selectDestFolder = function(e, id) {
  selectFolder(e,id,destFolder);
};

function selectFolder(e, id, obj){
  if(fd && id){
      obj = Object.create(fd).init(e.target.files[0].path, true);
      document.getElementById(id).innerHTML = obj.getPath();
  }
}
