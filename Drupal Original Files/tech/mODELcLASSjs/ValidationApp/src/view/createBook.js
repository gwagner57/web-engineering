/**
 * @fileOverview  View methods for the use case "create book"
 * @author Gerd Wagner
 */
pl.view.createBook = {
  /**
   * initialize the createBook form
   */
  setupUserInterface: function () {
    var formEl = document.forms['Book'],
        saveButton = formEl.commit;
    saveButton.addEventListener("click",
        pl.view.createBook.handleSaveButtonClickEvent);
    // add event listeners for validation on input
    Object.keys( Book.properties).forEach( function (prop) {
      formEl[prop].addEventListener("input", function () {
        var errMsg = Book.check( prop, formEl[prop].value).message;
        formEl[prop].setCustomValidity( errMsg);
      });
    });
    // neutralize the submit event
    formEl.addEventListener( 'submit', function (e) {
      e.preventDefault();;
      formEl.reset();
    });
    /*
    window.addEventListener("beforeunload", function () {
        Book.saveAll(); 
    });
    */
  },
  /**
   * save session data
   */
  handleSaveButtonClickEvent: function () {
    var formEl = document.forms['Book'], slots = {};
    // create error messages in case of constraint violations
    Object.keys( Book.properties).forEach( function (prop) {
      var errMsg="";
      slots[prop] = formEl[prop].value;
      errMsg = Book.check( prop, slots[prop]).message;
      formEl[prop].setCustomValidity( errMsg);
    });
    // save the input data only if all of the form fields are valid
    if (formEl.checkValidity()) {
      pl.ctrl.storageManager.add( Book, slots);
    }
  }
};