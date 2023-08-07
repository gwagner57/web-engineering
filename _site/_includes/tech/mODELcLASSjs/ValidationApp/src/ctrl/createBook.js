/**
 * @fileOverview  Contains various controller functions for the use case createBook
 * @author Gerd Wagner
 */
pl.ctrl.createBook = {
  initialize: function () {
    pl.ctrl.storageManager.retrieveAll( Book,
        pl.view.createBook.setupUserInterface);
  }
};