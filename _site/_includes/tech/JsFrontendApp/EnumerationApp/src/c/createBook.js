/**
 * @fileOverview  Contains various controller functions for the use case createBook
 * @author Gerd Wagner
 */
pl.c.createBook = {
  initialize: function () {
    pl.c.createBook.loadData();
    pl.v.createBook.setupUserInterface();
  },
  /**
   *  Load session data
   */
  loadData: function () {
    Book.retrieveAll();
  }
};