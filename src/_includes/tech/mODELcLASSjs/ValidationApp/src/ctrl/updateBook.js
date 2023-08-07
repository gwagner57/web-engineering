/**
 * @fileOverview  Contains various controller functions for the use case updateBook
 * @author Mircea Diaconescu
 */
pl.ctrl.updateBook = {
  initialize: function () {
    pl.ctrl.storageManager.retrieveAll( Book,
        pl.view.updateBook.setupUserInterface);
  }
};