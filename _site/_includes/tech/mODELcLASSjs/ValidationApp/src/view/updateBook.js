/**
 * @fileOverview  View methods for the use case "update book"
 * @author Mircea Diaconescu
 * @author Gerd Wagner
 */
pl.view.updateBook = {
  /**
   * initialize the updateBook form
   */
  setupUserInterface: function () {
    var formEl = document.forms['Book'],
        submitButton = formEl.commit,
        selectBookEl = formEl.selectBook;
    // set up the book selection list
    dom.fillSelectWithOptionsFromObjectMap( selectBookEl,
        Book.instances, "isbn", ["title"]);
    // when a book is selected, populate the form with its data
    selectBookEl.addEventListener("change", function () {
      var book=null, bookKey = selectBookEl.value;
      if (bookKey) {
        formEl.reset();
        book = Book.instances[bookKey];
        ["isbn","title","year","edition"].forEach( function (prop) {
          formEl[prop].value = (book[prop] !== undefined) ? book[prop] : "";
          // delete custom validation error message which may have been set before
          formEl[prop].setCustomValidity("");
        });
      } else {
        formEl.reset();
      }
    });
    // add event listeners for validation on input
    ["title","year","edition"].forEach( function (prop) {
      formEl[prop].addEventListener("input", function () {
        var errMsg = Book.check( prop, formEl[prop].value).message;
        formEl[prop].setCustomValidity( errMsg);
      });
    });
    submitButton.addEventListener("click",
        pl.view.updateBook.handleSubmitButtonClickEvent);
    // neutralize the submit event
    formEl.addEventListener( 'submit', function (e) { 
        e.preventDefault();
        formEl.reset();
    });
  },
  /**
   * check data and invoke update
   */
  handleSubmitButtonClickEvent: function () {
    var slots={}, formEl = document.forms['Book'];
    // create error messages in case of constraint violations
    ["title","year","edition"].forEach( function (attr) {
        var errMsg="";
        slots[attr] = formEl[attr].value;
        errMsg = Book.check( attr, slots[attr]).message;
        formEl[attr].setCustomValidity( errMsg);
    });
    if (formEl.checkValidity()) {
      pl.ctrl.storageManager.update( Book, formEl.isbn.value, slots);
    }
  }
};