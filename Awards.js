/* #region Objects that will be created from our Lists */
function Boards(ID, Name, SCDue, FinalDue, BoardDate, Categories, Attachments) {
    this.ID = ID;
    this.Name = Name; 
  
    var SCDueDate = '';
    if(SCDue != null) SCDueDate =SCDue.split('T')[0];//Categories is a string, we want to separate by new line and store as array
    
    this.SCDue = SCDueDate; 

    var FinalDueDate = ''

    if(FinalDue != null) FinalDueDate = FinalDue.split('T')[0];//Categories is a string, we want to separate by new line and store as array

    this.FinalDue = FinalDueDate; 

    var BoardDateCheck='';
    if(BoardDate!=null) BoardDateCheck =BoardDate.split('T')[0]; //Categories is a string, we want to separate by new line and store as array

    this.BoardDate = BoardDateCheck;
    this.Attachments=Attachments;
    var allCats = Categories; 
    
    if(Categories!=null) allCats = allCats.split(/\r?\n/); //We provide a catch here in case Categories is null (IE no string was typed)
    this.Categories = allCats;
  }
  
  function Judges(ID, Cat, TargetBoard, Name, Status, Year, Judge, Org) {
    this.ID = ID;
    this.Cat = Cat;
    this.TargetBoard = TargetBoard;
    this.Name = Name;
    this.Status = Status;
    this.Year = Year;
    this.Info = Judge;
    this.Org = Org;
  }
  
  function Packages(ID, Title, TargetBoard, Cat, Nominee, Org, Status, Attachments, Top, Year, Author, NomineeName, TBoard, MaskedID) {
    this.ID = ID;
    this.Title = Title;
    this.TargetBoard = TargetBoard;
    this.Cat = Cat;
    this.Nominee = Nominee;
    this.Org = Org;
    this.Status = Status;
    this.Attachments=Attachments;
    this.Top = Top;
    this.Year = Year;
    this.Author = Author;
    this.NomineeName = NomineeName;
    this.TargetBoardTitle = TBoard;
    this.MaskedID = MaskedID;
  }
  
  function Rankings(ID, Judge, TargetPackage, Ranking, JudgeTitle, Score, Notes, TargetBoard, Year) {
    this.ID = ID;
    this.Judge = Judge;
    this.TargetPackage = TargetPackage;
    this.Ranking = Ranking;
    this.JudgeTitle = JudgeTitle;
    this.Score = Score;
    this.Notes = Notes;
    this.TargetBoard = TargetBoard,
    this.Year = Year;
  }
/* #endregion */

/* #region Global variables */
var allPromises = []; //will store all the AJAX promises for my Lists calls. Can be queried to see when ALL AJAX calls are done

var allBoards = []; //holds all Boards Objects created from the Boards List.
var allJudges = []; //holds all Judges Objects created from the Judges List.
var allRankings = []; //holds all Rankings Objects created from the Rankings List.
var allPackages = []; //holds all Packages Objects created from the Packages List.

//This assumes that the Lists exist on same site. If on a different site, then this will need to change to reflect
var baseURL;

//var boardUserJudges =[];
//var judgeListItemsForUser = [];

var userID = ""; //Stores the SharepointID of the logged in user
/* #endregion */

// set entry point
//window.onload = pageInit();
 
//Entry point
function pageInit() {
    // Responsible for all AJAX calls to our Lists and storing the results
    // into the gloabl array of objects (defined above)
    // all promises are stored into a local var array (allPromises) so externally
    // it can be checked to see when all data has been gathered (and therefore other code is safe to execute) 
    console.log('Awards.js:pageInit(). FUNCTION start. This should be the main entry point to the program and holds our global lists items.');
    
    baseURL=_spPageContextInfo.webAbsoluteUrl;
    
    allPromises = []; //will hold all of our AJAX promises
    
    /* #region Boards -  load Boards AJAX */ //,AttachmentFiles&$expand=AttachmentFiles
    var ajaxBoards = SPHGetListItems('Boards', '?$select=ID,Title,DueToSC,FinalDueDate,BoardDate,Categories,Attachments,AttachmentFiles&$expand=AttachmentFiles', baseURL);
    ajaxBoards.done(function (data) { //run when the board list item is done retrieval
      //add all items to our list
      console.log('Awards.js:pageInit(). Boards info from the list ', data);
      $.each(data, function (i, v) {
        allBoards.push(new Boards(v.ID, v.Title, v.DueToSC, v.FinalDueDate, v.BoardDate, v.Categories, v.AttachmentFiles.results));
      });
      //grab the current user SPID and save it to the global variable in Awards.js
      userID = _spPageContextInfo.userId;
      console.log('Awards.js:pageInit(). allBoards[] (this is the global array that holds all Boards items)= ', allBoards);
    }).fail(function (e) {
      console.error('Awards.js:pageInit(). Failed Getting Board List Items! ' + e.responseText);
      alert('Failed Getting Board List Items! ' + e.responseText);
    }); //add the promise to our array
  
    allPromises.push(ajaxBoards); //Add this promise to our array of promises
    /* #endregion */

    /* #region Judges - load Judges AJAX */
    var ajaxJudges = SPHGetListItems('Judges', '?$select=ID,Org,CategoriesToJudge,TargetBoardId,Name,Status,Year,Name/Title,Name/Id,Name/EMail,Name/UserName&$expand=Name', baseURL);
    ajaxJudges.done(function (data) {
      console.log('Awards.js:pageInit(). Judges info from the list ', data);
      //add all items to our list
      $.each(data, function (i, v) {
        allJudges.push(new Judges(v.ID, v.CategoriesToJudge, v.TargetBoardId, v.Name.Id, v.Status, v.Year, v.Name, v.Org));
      });
      console.log('Awards.js:pageInit(). allJudges[] (this is the global array that holds all Judge items)= ', allJudges);
    }).fail(function (e) {
      console.error('Awards.js:pageInit(). Failed Getting Judges List Items! ' + e.responseText);
      alert('Failed Getting Judges List Items! ' + e.responseText);
    }); 
    allPromises.push(ajaxJudges); //add the promise to our array
    /* #endregion */

    /* #region Packages - load Packages AJAX */ //&$expand=AttachmentFiles
    var ajaxPackages = SPHGetListItems('Packages', '?$select=ID,AuthorId, TargetBoard/Id, TargetBoard/Title, Category, MaskedID, Title,Top,Nominee/Id,Nominee/Title,Org,Year,Status,Attachments,AttachmentFiles&$expand=AttachmentFiles,Nominee,TargetBoard', baseURL);
    ajaxPackages.done(function (data) {
      console.log('Awards.js:pageInit(). Packages info from the list ', data);
      //add all items to our list
      $.each(data, function (i, v) {
        allPackages.push(new Packages(v.Id, v.Title, v.TargetBoard.Id, v.Category, v.Nominee.Id, v.Org, v.Status, v.AttachmentFiles.results, v.Top, v.Year, v.AuthorId, v.Nominee.Title, v.TargetBoard.Title, v.MaskedID));
      });
      console.log('Awards.js:pageInit(). allPackages[] (this is the global array that holds all Package items)= ', allPackages);
    }).fail(function (e) {
      console.error('Awards.js:pageInit(). Failed Getting Package List Items! ' + e.responseText);
      alert('Failed Getting Packages List Items! ' + e.responseText);
    });
    allPromises.push(ajaxPackages); //End Packages
    /* #endregion */
  
    /* #region Rankings - load Rankings AJAX */
    var ajaxRankings = SPHGetListItems('Rankings', '?$select=Id,Ranking,Score,Notes,TargetBoardId, Year,TargetPackageId,Judge/Title,Judge/Id&$expand=Judge', baseURL);
    ajaxRankings.done(function (data) {
      console.log('Awards.js:pageInit(). Rankings info from the list ', data);
      //add all items to our list
      $.each(data, function (i, v) {
        allRankings.push(new Rankings(v.ID, v.Judge, v.TargetPackageId, v.Ranking, v.Judge.Title, v.Score, v.Notes, v.TargetBoardId, v.Year));
      });
      console.log('Awards.js:pageInit(). allRankings[] (this is the global array that holds all Ranking items)= ', allRankings);
    }).fail(function (e) {
      console.error('Awards.js:pageInit(). Failed Getting Rankings List Items! ' + e.responseText);
      alert('Failed Getting Rankings List Items! ' + e.responseText);
    }); //add the promise to our array
  
    allPromises.push(ajaxRankings); //End Rankings
    /* #endregion */


    $.when.apply($,allPromises).done(function(d){
      loaded2();
    });
  } 

 // Opens a modal (usually to EditForm.aspx or similar) 
function openModal(URL, modalTitle, modalWidth, modalHeight) {
    var options = {
      url: URL,
      allowMaximize: false,
      showClose: true,
      width: modalWidth,
      height: modalHeight,
      title: modalTitle,
      dialogReturnValueCallback: function dialogReturnValueCallback(dialogResult) {
        if (dialogResult != SP.UI.DialogResult.cancel) {
          //When you click OK this will happen  
          SP.UI.ModalDialog.RefreshPage(dialogResult);
        }
      }
    };
    SP.UI.ModalDialog.showModalDialog(options);
  }

  // Helper function to turn the return month digit from a SP date to a friendly 3 letter Month
  function monthFriendlyName(m){
    //console.log('m = ', m);
    var month="?";
    switch(m){
      case '01':
        month="Jan";
        break;
      case '02':
      month="Feb";
        break;
      case '03':
      month="Mar";
        break;
      case '04':
        month="Apr";
        break;
      case '05':
        month="May";
        break;
      case '06':
        month="Jun";
        break;
      case '07':
        month="Jul"
        break;
      case '08':
      month="Aug";
        break;
      case '09':
      month="Sep";
        break;
      case '10':
      month="Oct";
        break;
      case '11':
      month="Nov";
        break;
      case '12':
      month="Dec";
        break;
    }
  
    return month;
  }
  
  function getAttachments(e, itemsArray){
    
    console.log('Awards.js:getAttachments(). FUNCTION get all attachments. Item (true/false - indicates if targeting a Package item or Board item (true=Package item)) array =', itemsArray);
    var pID = $(e).closest('tr').attr('id').split('_')[1];

    var targetArray;

    if(itemsArray) targetArray=allPackages;
    else targetArray=allBoards;

    //get package based on its id from our allPackages/allBoards list
    var target = targetArray.filter(function(v){
        return v.ID == pID;
    });

    //did we get a package/board back?
    if(target.length>0){
        var t= target[0];
        //console.log('Awards.js:getAttachments. https://' + baseURL.split('/')[2] + t.Attachments[0].ServerRelativeUrl);
        downloadAll(t.Attachments.map(function(item){ return  'https://' + baseURL.split('/')[2] + item.ServerRelativeUrl;}));
    }else{console.error('No Attachment found!!!');}

}

function downloadAll(urls) {
    console.log('Awards.js:downloadAll(). Download attempt for urls ', urls);
    for (var i = 0; i < urls.length; i++) {
        forceDownload(urls[i], urls[i].substring(urls[i].lastIndexOf('/')+1,urls[i].length))
    }
}

function forceDownload(url, fileName){
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "blob";
  xhr.onload = function(){
      var urlCreator = window.URL || window.webkitURL;
      var imageUrl = urlCreator.createObjectURL(this.response);
      var tag = document.createElement('a');
      tag.href = imageUrl;
      tag.download = fileName;
      document.body.appendChild(tag);
      tag.click();
      document.body.removeChild(tag);
  }
  xhr.send();
}


function hasDuplicates(arr) {
    return arr.some( function(item) {
        return arr.indexOf(item) !== arr.lastIndexOf(item);
    });
}
  