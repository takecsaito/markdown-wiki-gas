var ERROR_CODE = '__ERROR__';
// [Underscore]
var _ = Underscore.load();
// [base folder path]
var basefolder = "memo/content/";
// [URL]
//var url = "https://script.google.com/a/systena.co.jp/macros/s/AKfycbwUJlR4-3uCHnza-rPDXzBJYmjsFJo5uLa3Bk1Si7gDaxpKUmM9/exec"
var url = "https://script.google.com/a/systena.co.jp/macros/s/AKfycbzltnMN7caGU51xhXpyKJ0iM3tUHsrXmau93DwyV4hw/dev"
function doGet( e ) {
  Logger.log( e );
  // template
  var t = HtmlService.createTemplateFromFile( 'index' );
  // url
  t.url = url;
  // set data
  var data = [];
  t.data = JSON.stringify( data );
  
  // Read markdown contents.
  if( e.parameters.md )
    var f = getFile( e.parameters.md );
  else
    var f = getFile( 'index.md' );

  t.md        = f.content;
  t.updatedAt = f.updatedAt;
  t.owner     = f.owner;
  
  // Read nav.md
  var nav = getFile( 'nav.md' ).content;
  t.nav = nav == ERROR_CODE ? '' : nav; 
  
  // Return content.
  return t.evaluate().setTitle( "markdown-wiki - TOP" );
}

function getContent( path ) {
  return JSON.stringify( getFile( path ) );
}

// Include file
function include( filename ) {
  return HtmlService.createHtmlOutputFromFile( filename ).getContent();
}

// Google Drive1内のファイルを再帰的に検索
function _getObject( level, patharr, base ){
  if( !base ) base = DriveApp.getRootFolder();
  if( level < ( patharr.length - 1 ) )
    return _getObject( level+1, patharr, base.getFoldersByName( patharr[level] ).next() );
  else
    return base.getFilesByName( patharr[level] ).next();
}

// Google Drive内のファイルを取得しテキストで返す
function getFile( path ){
  var p = basefolder + path;
  try {
    var file = _getObject( 0, p.toString().split( "/" ) );
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