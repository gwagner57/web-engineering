/***********************************************
***  Methods for the use case "delete book"  ***
************************************************/
pl.v.deleteBook = {
  setupUserInterface: function () {
    const deleteButton = document.forms["Book"].commit,
          selectEl = document.forms["Book"].selectBook;
    // load all book objects
    Book.retrieveAll();
    // populate the selection list with books
    for (let key of Object.keys( Book.instances)) {
      const book = Book.instances[key];
      const optionEl = document.createElement("option");
      optionEl.text = book.title;
      optionEl.value = book.isbn;
      selectEl.add( optionEl, null);
    }
    // Set an event handler for the submit/delete button
    deleteButton.addEventListener("click",
        pl.v.deleteBook.handleDeleteButtonClickEvent);
    // Set a handler for the event when the browser window/tab is closed
    window.addEventListener("beforeunload", Book.saveAll);
  },
  // Event handler for deleting a book
  handleDeleteButtonClickEvent: function () {
    const selectEl = document.forms["Book"].selectBook,
          isbn = selectEl.value;
    if (isbn) {
      Book.destroy( isbn);
      // remove deleted book from select options
      selectEl.remove( selectEl.selectedIndex);
    }
  }
};