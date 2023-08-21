/**
 * @fileOverview  Defining the main namespace ("public library") and its MVC subnamespaces
 * @author Gerd Wagner
 */
// main namespace pl = "public library"
var pl = {model: {}, view: {}, ctrl: {}};
// define a localStorage manager
pl.ctrl.storageManager = new sTORAGEmANAGER();
/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 *  Create and save test data
 */
pl.ctrl.createTestData = function () {
    pl.ctrl.storageManager.add( Book, {isbn: "006251587X",
        title: "Weaving the Web", year: 2000, edition: 2});
    pl.ctrl.storageManager.add( Book, {isbn: "0465026567",
        title: "Gödel, Escher, Bach", year: 1999});
    pl.ctrl.storageManager.add( Book, {isbn: "0465030793",
        title: "I Am A Strange Loop", year: 2008});
};
