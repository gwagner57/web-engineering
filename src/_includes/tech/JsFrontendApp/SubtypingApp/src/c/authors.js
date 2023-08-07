/**
 * @fileOverview  Contains various controller functions for managing books
 * @author Gerd Wagner
 */
pl.c.authors.manage = {
  initialize: function () {
    Author.retrieveAll();
    pl.v.authors.manage.setupUserInterface();
  }
};