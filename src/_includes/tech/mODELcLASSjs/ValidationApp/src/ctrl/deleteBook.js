/**
 * @fileOverview  Contains various controller functions for the use case deleteBook
 * @author Mircea Diaconescu
 */
pl.ctrl.deleteBook = {
  initialize: function () {
    pl.ctrl.storageManager.retrieveAll( Book, pl.view.deleteBook.setupUserInterface);
  }
};