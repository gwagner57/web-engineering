/**
 * @fileOverview  Contains various controller functions for the use case listBooks
 * @author Gerd Wagner
 */
pl.c.retrieveAndListAllBooks = {
  initialize: function () {
    pl.c.retrieveAndListAllBooks.loadData();
    pl.v.retrieveAndListAllBooks.setupUserInterface();   
  },
  /**
   * Load session data
   */
  loadData: function () {
    Book.retrieveAll();
  }
};