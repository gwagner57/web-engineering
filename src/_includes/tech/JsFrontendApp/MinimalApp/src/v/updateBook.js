/***********************************************
***  Methods for the use case updateBook  ******
************************************************/
pl.v.updateBook = {
  setupUserInterface: function () {
    var formEl = document.forms['Book'],
        saveButton = formEl.commit,
        selectBookEl = formEl.selectBook;
    var key="", keys=[], book=null, optionEl=null, i=0;
    // load all book objects
    Book.retrieveAll();
    // populate the selection list with books
    keys = Object.keys( Book.instances);
    for (i=0; i < keys.length; i++) {
      key = keys[i];
      book = Book.instances[key];
      optionEl = document.createElement("option");
      optionEl.text = book.title;
      optionEl.value = book.isbn;
      selectBookEl.add( optionEl, null);
    }
    // when a book is selected, fill the form with its data
    selectBookEl.addEventListener("change", 
	    pl.v.updateBook.handleBookSelectionEvent);
    // set an event handler for the submit/save button
    saveButton.addEventListener("click",
        pl.v.updateBook.handleSaveButtonClickEvent);
    // handle the event when the browser window/tab is closed
    window.addEventListener("beforeunload", Book.saveAll);
  },
  handleBookSelectionEvent: function () {
    var formEl = document.forms['Book'];
    var selectBookEl = formEl.selectBook,
        book=null, key = selectBookEl.value;
    if (key) {
      book = Book.instances[key];
      formEl.isbn.value = book.isbn;
      formEl.title.value = book.title;
      formEl.year.value = book.year;
    } else {
      formEl.reset();
    }
  },
  // save data
  handleSaveButtonClickEvent: function () {
    var formEl = document.forms['Book'],
        selectBookEl = formEl.selectBook;
    var slots = { isbn: formEl.isbn.value, 
          title: formEl.title.value, 
          year: formEl.year.value
        };
    Book.update( slots);
    // update the selection list option element
    selectBookEl.options[selectBookEl.selectedIndex].text = slots.title;
    formEl.reset();
  }
};