/**
 * @fileOverview  Contains various controller functions for the use case listBooks
 * @author Gerd Wagner
 */
pl.ctrl.listBooks = {
  initialize: function () {
    pl.ctrl.storageManager.retrieveAll( Book, pl.view.listBooks.setupUserInterface);
  }
};