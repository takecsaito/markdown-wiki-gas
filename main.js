var ERROR_CODE = '__ERROR__';
// [Underscore]
//var _ = Underscore.load();
// [base folder path]
var basefolder = 'memo/content/';
// [URL]
//var url = "https://script.google.com/a/systena.co.jp/macros/s/AKfycbwUJlR4-3uCHnza-rPDXzBJYmjsFJo5uLa3Bk1Si7gDaxpKUmM9/exec"
var url = 'https://script.google.com/a/systena.co.jp/macros/s/AKfycbzltnMN7caGU51xhXpyKJ0iM3tUHsrXmau93DwyV4hw/dev';

/**
 * Root
 * @param {object} e 
 */
// eslint-disable-next-line no-unused-vars
function doGet( e ) {
  Logger.log( e );
  if( e.parameters.md )
    return markdown( e.parameters.md );
  else
    return markdown( 'index.md' );
}

/**
 * Markdownファイルを取得し返却する
 * @param {string} filename 
 */
function markdown( filename ){
  // template
  var template = HtmlService.createTemplateFromFile( 'index' );
  // url
  template.url = url;
  // Read markdown contents.
  var file = getTextFile( filename );
  // 画像ファイルのURLを変換
  var dir = filename.toString().substring( 0, filename.toString().lastIndexOf('/') );
  Logger.log('filename : ' + filename + ', dir : ' + dir);
  var content = file.content;
  var res;
  while( (res = /!\[.+\]\(([\w_]+\.[a-zA-Z]+)\)/gm.exec( content )) != null ){
    var id = getFile( (dir ? dir + '/' : '') + res[1] ).getId();
    content = content.replace( res[1], 'http://drive.google.com/uc?export=view&id=' + id );
    Logger.log(res[1] + ' : ' + id);
  }
  // 画像URLを置換
  template.md        = content;
  template.updatedAt = file.updatedAt;
  template.owner     = file.owner;
  
  // Read nav.md
  var nav = getTextFile( 'nav.md' ).content;
  template.nav = nav == ERROR_CODE ? '' : nav; 
  
  // Return content.
  return template.evaluate().setTitle( 'markdown-wiki - TOP' );
}

/**
 * [unused]
 * @param {string} path 
function getContent( path ) {
  return JSON.stringify( getFile( path ) );
}
*/

/**
 * Including file
 * @param {string} filename 
 */
// eslint-disable-next-line no-unused-vars
function include( filename ) {
  return HtmlService.createHtmlOutputFromFile( filename ).getContent();
}

/**
 * Google Drive1内のファイルを再帰的に検索
 * @param {Integer} level 
 * @param {Array} patharr 
 * @param {FolderIterator} base 
 */
function _getObject( level, patharr, base ){
  if( !base ) base = DriveApp.getRootFolder();
  if( level < ( patharr.length - 1 ) )
    return _getObject( level+1, patharr, base.getFoldersByName( patharr[level] ).next() );
  else
    return base.getFilesByName( patharr[level] ).next();
}

/**
 * Google Drive内のファイルを取得しテキストで返す
 * @param {string} path 
 */
function getFile( path ){
  var p = basefolder + path;
  try {
    return _getObject( 0, p.toString().split( '/' ) );
  } catch(e) {
    Logger.log( e );
    return ERROR_CODE;
  }
}

/**
 * Google Drive内のファイルを取得しテキストで返す
 * @param {string} path 
 */
function getTextFile( path ){
  var p = basefolder + path;
  try {
    var file = _getObject( 0, p.toString().split( '/' ) );
    Logger.log( file.getEditors().length ? file.getEditors() : file.getOwner() );
    return {
      content   : file.getBlob().getDataAsString(),
      updatedAt : file.getLastUpdated(),
      owner     : file.getOwner().getName()
    };
  } catch(e) {
    Logger.log( e );
    return ERROR_CODE;
  }
}