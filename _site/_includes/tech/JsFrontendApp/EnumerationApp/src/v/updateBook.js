/**
 * @fileOverview  View methods for the use case "update book"
 * @author Gerd Wagner
 */
pl.v.updateBook = {
  /**
   * initialize the updateBook form
   */
  setupUserInterface: function () {
    var formEl = document.forms['Book'],
        selectBookEl = formEl.selectBook,
        origLangSelEl = formEl.originalLanguage,
        otherAvailLangSelEl = formEl.otherAvailableLanguages,
        categoryFieldsetEl = formEl.querySelector(
            "fieldset[data-bind='category']"),
        pubFormsFieldsetEl = formEl.querySelector(
            "fieldset[data-bind='publicationForms']"),
        submitButton = formEl.commit;
    // set up the book selection list
    util.fillSelectWithOptions( selectBookEl, Book.instances,
        {displayProp:"title"});
    // when a book is selected, populate the form with its data
    selectBookEl.addEventListener("change", function () {
      var book=null, bookKey = selectBookEl.value;
      if (bookKey) {
        book = Book.instances[bookKey];
        formEl.isbn.value = book.isbn;
        formEl.title.value = book.title;
        formEl.originalLanguage.value = book.originalLanguage;
        // set up the publication forms selection list
        util.fillSelectWithOptions( otherAvailLangSelEl, 
            LanguageEL.labels, {selection: book.otherAvailableLanguages});
        // set up the category radio button group
        util.createChoiceWidget( categoryFieldsetEl, "category", 
            [book.category], "radio", BookCategoryEL.labels);
        // set up the publicationForms checkbox group
        util.createChoiceWidget( pubFormsFieldsetEl, "publicationForms", 
            book.publicationForms, "checkbox", PublicationFormEL.labels);
      } else {
        formEl.reset();
      }
    });
    // set up the book language selection list
    util.fillSelectWithOptions( origLangSelEl, LanguageEL.labels);
    // add event listeners for responsive validation
    formEl.title.addEventListener("input", function () { 
        formEl.title.setCustomValidity( 
            Book.checkTitle( formEl.title.value).message);
    });
    // simplified validation: check only mandatory value
    origLangSelEl.addEventListener("change", function () {
      origLangSelEl.setCustomValidity( 
          (!origLangSelEl.value) ? "A value must be selected!":"" );
    });
    // mandatory value check
    categoryFieldsetEl.addEventListener("click", function () {
      formEl.category[0].setCustomValidity( 
          (!categoryFieldsetEl.getAttribute("data-value")) ? 
              "A category must be selected!":"" );
    });
    // mandatory value check
    pubFormsFieldsetEl.addEventListener("click", function () {
      var val = pubFormsFieldsetEl.getAttribute("data-value");
      formEl.publicationForms[0].setCustomValidity( 
          (!val || Array.isArray(val) && val.length === 0) ? 
              "At least one publication form must be selected!":"" );
    });
    // Set an event handler for the submit/save button
    submitButton.addEventListener("click", this.handleSubmitButtonClickEvent);
    // neutralize the submit event
    formEl.addEventListener( 'submit', function (e) { 
        e.preventDefault();
        formEl.reset();
    });
    // Set a handler for the event when the browser window/tab is closed
    window.addEventListener("beforeunload", Book.saveAll);
  },
  /**
   * check data and invoke update
   */
  handleSubmitButtonClickEvent: function () {
    var formEl = document.forms['Book'],
        selectBookEl = formEl.selectBook,
        selectedOtherAvLangOptions = formEl.otherAvailableLanguages.selectedOptions,
        categoryFieldsetEl = formEl.querySelector("fieldset[data-bind='category']"),
        pubFormsFieldsetEl = formEl.querySelector("fieldset[data-bind='publicationForms']");
    var slots = { isbn: formEl.isbn.value, 
          title: formEl.title.value,
          originalLanguage: formEl.originalLanguage.value,
          otherAvailableLanguages: [],
          category: categoryFieldsetEl.getAttribute("data-value"),
          publicationForms: JSON.parse( pubFormsFieldsetEl.getAttribute("data-value"))
    };
    // construct the list of selected otherAvailableLanguages 
    for (let i=0; i < selectedOtherAvLangOptions.length; i++) {
      slots.otherAvailableLanguages.push( 
          parseInt( selectedOtherAvLangOptions[i].value));
    }
    // set error messages in case of constraint violations
    formEl.title.setCustomValidity( Book.checkTitle( slots.title).message);
    formEl.originalLanguage.setCustomValidity( Book.checkOriginalLanguage( 
        slots.originalLanguage).message);
    formEl.otherAvailableLanguages.setCustomValidity( 
        Book.checkOtherAvailableLanguages( slots.otherAvailableLanguages).message);
    // set the error message for category constraint violations on the first radio button
    formEl.category[0].setCustomValidity(
        Book.checkCategory( slots.category).message);
    // set the error message for publicationForms constraint violations on the first checkbox
    formEl.publicationForms[0].setCustomValidity(
        Book.checkPublicationForms( slots.publicationForms).message);
    if (formEl.checkValidity()) {
      Book.update( slots);
      // update the selection list option
      selectBookEl.options[selectBookEl.selectedIndex].text = slots.title;
    }
  }
};