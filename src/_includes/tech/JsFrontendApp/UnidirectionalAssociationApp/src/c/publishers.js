/**
 * @fileOverview  Contains various controller functions for managing books
 * @author Gerd Wagner
 */
pl.c.publishers.manage = {
  initialize: function () {
    Author.retrieveAll();
    Publisher.retrieveAll();
    Book.retrieveAll();
    pl.v.publishers.manage.setupUserInterface();
  }
};