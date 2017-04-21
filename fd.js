var folder = {
    getPath : function(){
      return this.path;
    }
};
var selectedFolder;

exports.selectFolder = function(e, id) {
  let sel = e.target.files[0];
  if(folder){
      selectedFolder = Object.create(folder);
      selectedFolder.path = sel.path;
  }
  if(id){
    document.getElementById("filePath").innerHTML = selectedFolder.getPath();
  }
};
