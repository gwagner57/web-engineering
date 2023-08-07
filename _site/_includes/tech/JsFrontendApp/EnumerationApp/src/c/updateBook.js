/**
 * @fileOverview  Contains various controller functions for the use case updateBook
 * @author Mircea Diaconescu
 */
pl.c.updateBook = {
  initialize: function () {
    pl.c.updateBook.loadData();
    pl.v.updateBook.setupUserInterface();
  },
  /**
   *  Load session data
   */
  loadData: function () {
    Book.retrieveAll();
  }
};