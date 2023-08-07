/**
 * @fileOverview  Contains various controller functions for managing employees
 * @author Gerd Wagner
 */
pl.c.employees.manage = {
  initialize: function () {
    Employee.retrieveAll();
    pl.v.employees.manage.setupUserInterface();
  }
};