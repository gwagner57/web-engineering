/**
 * @fileOverview  Contains various view functions for managing books
 * @author Gerd Wagner
 */
pl.v.books.manage = {
  /**
   * Set up the book data management UI
   */
  setupUserInterface: function () {
    window.addEventListener("beforeunload", pl.v.books.manage.exit);
    pl.v.books.manage.refreshUI();
  },
  /**
   * exit the Manage Books UI page
   */
  exit: function () {
    Book.saveAll(); 
  },
  /**
   * refresh the Manage Books UI
   */
  refreshUI: function () {
    // show the manage book UI and hide the other UIs
    document.getElementById("Book-M").style.display = "block";
    document.getElementById("Book-R").style.display = "none";
    document.getElementById("Book-C").style.display = "none";
    document.getElementById("Book-U").style.display = "none";
    document.getElementById("Book-D").style.display = "none";
  }
};
/**********************************************
 * Use case List Books
**********************************************/
pl.v.books.retrieveAndListAll = {
  setupUserInterface: function () {
    const tableBodyEl = document.querySelector(
        "section#Book-R > table > tbody");
    tableBodyEl.innerHTML = "";  // drop old contents
    for (let key of Object.keys( Book.instances)) {
      const book = Book.instances[key];
      // create list of authors for this book
      const listEl = util.createListFromMap( book.authors, "name");
      const row = tableBodyEl.insertRow(-1);
      row.insertCell(-1).textContent = book.isbn;
      row.insertCell(-1).textContent = book.title;
      row.insertCell(-1).textContent = book.year;
      row.insertCell(-1).appendChild( listEl);
      // if the book has a publisher, show its name
      row.insertCell(-1).textContent =
          book.publisher ? book.publisher.name : "";
    }
    document.getElementById("Book-M").style.display = "none";
    document.getElementById("Book-R").style.display = "block";
  }
};
/**********************************************
 * Use case Create Book
**********************************************/
pl.v.books.create = {
  setupUserInterface: function () {
    const formEl = document.querySelector("section#Book-C > form"),
        selectAuthorsEl = formEl.selectAuthors,
        selectPublisherEl = formEl.selectPublisher,
        saveButton = formEl.commit;
    // add event listeners for responsive validation
    formEl.isbn.addEventListener("input", function () {
      formEl.isbn.setCustomValidity(
          Book.checkIsbnAsId( formEl.isbn.value).message);
    });
    /* SIMPLIFIED/MISSING CODE: add event listeners for responsive
	   validation on user input with Book.checkTitle and checkYear
    */
    // set up a multiple selection list for selecting authors
    util.fillSelectWithOptions( selectAuthorsEl, Author.instances,
        "authorId", {displayProp:"name"});
    // set up a single selection list for selecting a publisher
    util.fillSelectWithOptions( selectPublisherEl,
        Publisher.instances, "name");
    // define event handler for submitButton click events
    saveButton.addEventListener("click", this.handleSaveButtonClickEvent);
    // define event handler for neutralizing the submit event
    formEl.addEventListener( 'submit', function (e) { 
      e.preventDefault();
      formEl.reset();
    });
    // replace the manageBooks form with the createBook form
    document.getElementById("Book-M").style.display = "none";
    document.getElementById("Book-C").style.display = "block";
    formEl.reset();
  },
  handleSaveButtonClickEvent: function () {
    const formEl = document.querySelector("section#Book-C>form"),
        selAuthOptions = formEl.selectAuthors.selectedOptions;
    const slots = {
      isbn: formEl.isbn.value,
      title: formEl.title.value,
      year: formEl.year.value,
      authorIdRefs: [],
      publisher_id: formEl.selectPublisher.value
    };
    // validate all form controls and show error messages
    formEl.isbn.setCustomValidity(
        Book.checkIsbnAsId( slots.isbn).message);
    /*SIMPLIFIED/MISSING CODE: validate title and year */
    // check the mandatory value constraint for authors
    formEl.selectAuthors.setCustomValidity(
        (selAuthOptions.length > 0) ? "" : "No author selected!"
    );
    // save the input data only if all form fields are valid
    if (formEl.checkValidity()) {
      // construct a list of author ID references
      for (let opt of selAuthOptions) {
        slots.authorIdRefs.push( opt.value);
      }
      Book.add( slots);
    }
  }
};
/**********************************************
 * Use case Update Book
**********************************************/
pl.v.books.update = {
  /**
   * Notice that the Association List Widget for associated authors is left empty initially.
   * It is only set up on book selection
   */
  setupUserInterface: function () {
    const formEl = document.querySelector("section#Book-U > form"),
        selectBookEl = formEl.selectBook,
        saveButton = formEl.commit;
    // set up the book selection list
    util.fillSelectWithOptions( selectBookEl, Book.instances,
        "isbn", {displayProp:"title"});
    selectBookEl.addEventListener("change", this.handleBookSelectChangeEvent);
    /* MISSING CODE: add event listeners for responsive validation
	   on new user input with Book.checkTitle and Book.checkYear
    */
    // define event handler for submitButton click events
    saveButton.addEventListener("click", this.handleSaveButtonClickEvent);
    // define event handler for neutralizing the submit event and reseting the form
    formEl.addEventListener( 'submit', function (e) {
      const selectAuthorsWidget = document.querySelector(
          "section#Book-U > form .MultiChoiceWidget");
      e.preventDefault();
      selectAuthorsWidget.innerHTML = "";
      formEl.reset();
    });
    document.getElementById("Book-M").style.display = "none";
    document.getElementById("Book-U").style.display = "block";
    formEl.reset();
  },
  /**
   * handle book selection events
   * when a book is selected, populate the form with the data of the selected book
   */
  handleBookSelectChangeEvent: function () {
    const formEl = document.querySelector("section#Book-U > form"),
        saveButton = formEl.commit,
        selectAuthorsWidget = formEl.querySelector(".MultiChoiceWidget"),
        selectPublisherEl = formEl.selectPublisher,
        isbn = formEl.selectBook.value;
    if (isbn !== "") {
      let book = Book.instances[isbn];
      formEl.isbn.value = book.isbn;
      formEl.title.value = book.title;
      formEl.year.value = book.year;
      // set up the associated authors selection widget
      util.createMultipleChoiceWidget( selectAuthorsWidget, book.authors,
          Author.instances, "authorId", "name", 1);  // minCard=1
      // set up the associated publisher selection list
      util.fillSelectWithOptions( selectPublisherEl, Publisher.instances, "name");
      // assign associated publisher as the selected option to select element
      if (book.publisher) formEl.selectPublisher.value = book.publisher.name;
      saveButton.disabled = false;
    } else {
      formEl.reset();
      formEl.selectPublisher.selectedIndex = 0;
      selectAuthorsWidget.innerHTML = "";
      saveButton.disabled = true;
    }
  },
  /**
   * handle form submission events
   */
  handleSaveButtonClickEvent: function () {
    const formEl = document.querySelector("section#Book-U > form"),
        selectBookEl = formEl.selectBook,
        selectAuthorsWidget = formEl.querySelector(".MultiChoiceWidget"),
        multiChoiceListEl = selectAuthorsWidget.firstElementChild;
    var slots = { isbn: formEl.isbn.value,
      title: formEl.title.value,
      year: formEl.year.value,
      publisher_id: formEl.selectPublisher.value
    };
    // check all input fields and show error messages
    /*MISSING CODE:  Book.checkIsbn, Book.checkTitle and Book.checkYear
     *               have not been defined
    formEl.isbn.setCustomValidity( Book.checkIsbn( slots.isbn).message);
    formEl.title.setCustomValidity( Book.checkTitle( slots.title).message);
    formEl.year.setCustomValidity( Book.checkYear( slots.year).message);
    */
    // commit the update only if all form field values are valid
    if (formEl.checkValidity()) {
      // construct authorIdRefs-ToAdd/ToRemove lists from the association list
      let authorIdRefsToAdd=[], authorIdRefsToRemove=[];
      for (let mcListItemEl of multiChoiceListEl.children) {
        if (mcListItemEl.classList.contains("removed")) {
          authorIdRefsToRemove.push( mcListItemEl.getAttribute("data-value"));
        }
        if (mcListItemEl.classList.contains("added")) {
          authorIdRefsToAdd.push( mcListItemEl.getAttribute("data-value"));
        }
      }
      // if the add/remove list is non-empty create a corresponding slot
      if (authorIdRefsToRemove.length > 0) {
        slots.authorIdRefsToRemove = authorIdRefsToRemove;
      }
      if (authorIdRefsToAdd.length > 0) {
        slots.authorIdRefsToAdd = authorIdRefsToAdd;
      }
      Book.update( slots);
      // update the book selection list's option element
      selectBookEl.options[selectBookEl.selectedIndex].text = slots.title;
    }
  }
};
/**********************************************
 * Use case Delete Book
**********************************************/
pl.v.books.destroy = {
  setupUserInterface: function () {
    const formEl = document.querySelector("section#Book-D > form"),
        selectBookEl = formEl.selectBook,
        deleteButton = formEl.commit;
    // set up the book selection list
    util.fillSelectWithOptions( selectBookEl, Book.instances, "isbn", {displayProp:"title"});
    deleteButton.addEventListener("click", function () {
      Book.destroy( formEl.selectBook.value);
      // remove deleted book from select options
      formEl.selectBook.remove( formEl.selectBook.selectedIndex);
      formEl.reset();
    });
    // define event handler for neutralizing the submit event
    formEl.addEventListener( 'submit', function (e) {
      e.preventDefault();
      formEl.reset();
    });
    document.getElementById("Book-M").style.display = "none";
    document.getElementById("Book-D").style.display = "block";
    formEl.reset();
  }
};