/**
 * @fileOverview  Contains various view functions for the use case deleteBook
 * @author Mircea Diaconescu
 * @author Gerd Wagner
 */
pl.v.deleteBook = {
  /**
   * Initialize the deleteBook form
   */
  setupUserInterface: function () {
    var formEl = document.forms['Book'],
        deleteButton = formEl.commit,
        selectBookEl = formEl.selectBook;
    // load all book records
    Book.retrieveAll();
    // set up the book selection list
    util.fillSelectWithOptions( Book.instances, selectBookEl, 
        "isbn", "title");
    // Set an event handler for the submit/delete button
    deleteButton.addEventListener("click", function () {
        var isbn = selectBookEl.value;
        if (isbn) {
          Book.destroy( isbn);
          // remove deleted book from select options
          selectBookEl.remove( selectBookEl.selectedIndex);
        }
    });
    // Set a handler for the event when the browser window/tab is closed
    window.addEventListener("beforeunload", Book.saveAll);
  }
};