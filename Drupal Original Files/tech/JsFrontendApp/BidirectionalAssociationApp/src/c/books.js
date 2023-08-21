/**
 * @fileOverview  Contains various controller functions for managing books
 * @author Gerd Wagner
 */
pl.c.books.manage = {
  initialize: function () {
    Author.retrieveAll();
    Publisher.retrieveAll();
    Book.retrieveAll();
    pl.v.books.manage.setupUserInterface();
  }
};