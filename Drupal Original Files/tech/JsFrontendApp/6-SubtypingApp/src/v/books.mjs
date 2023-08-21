/**
 * @fileOverview  View code of UI for managing Book data
 * @author Gerd Wagner
 * @copyright Copyright 2013-2021 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is", 
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Book, { BookCategoryEL } from "../m/Book.mjs";
import { displaySegmentFields, undisplayAllSegmentFields } from "./app.mjs"
import { fillSelectWithOptions } from "../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
Book.retrieveAll();

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
/**
 * Setup User Interface
 */
// set up back-to-menu buttons for all use cases
for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener('click', refreshManageDataUI);
}
// neutralize the submit event for all use cases
for (const frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
  });
}
// save data when leaving the page
window.addEventListener("beforeunload", function () {
  Book.saveAll();
});

/**********************************************
 * Use case Retrieve/List Books
**********************************************/
document.getElementById("RetrieveAndListAll")
    .addEventListener("click", function () {
  const tableBodyEl = document.querySelector("section#Book-R > table > tbody");
  // reset view table (drop its previous contents)
  tableBodyEl.innerHTML = "";
  // populate view table
  for (const key of Object.keys( Book.instances)) {
    const book = Book.instances[key];
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = book.isbn;
    row.insertCell().textContent = book.title;
    row.insertCell().textContent = book.year;
    if (book.category) {
      switch (book.category) {
      case BookCategoryEL.TEXTBOOK:
        row.insertCell().textContent = book.subjectArea + " textbook";
        break;
      case BookCategoryEL.BIOGRAPHY:
        row.insertCell().textContent = "Biography about " + book.about;
        break;
      }
    }
  }
  document.getElementById("Book-M").style.display = "none";
  document.getElementById("Book-R").style.display = "block";
});

/**********************************************
 * Use case Create Book
**********************************************/
const createFormEl = document.querySelector("section#Book-C > form"),
      createCategorySelectEl = createFormEl.category;
//----- set up event handler for menu item "Create" -----------
document.getElementById("Create").addEventListener("click", function () {
  document.getElementById("Book-M").style.display = "none";
  document.getElementById("Book-C").style.display = "block";
  undisplayAllSegmentFields( createFormEl, BookCategoryEL.labels);
  createFormEl.reset();
});
// set up event handlers for responsive constraint validation
createFormEl.isbn.addEventListener("input", function () {
  createFormEl.isbn.setCustomValidity(
    Book.checkIsbnAsId( createFormEl.isbn.value).message);
});
createFormEl.subjectArea.addEventListener("input", function () {
  createFormEl.subjectArea.setCustomValidity(
    Book.checkSubjectArea( createFormEl.subjectArea.value,
      parseInt( createFormEl.category.value) + 1).message);
});
createFormEl.about.addEventListener("input", function () {
  createFormEl.about.setCustomValidity(
    Book.checkAbout( createFormEl.about.value,
      parseInt( createFormEl.category.value) + 1).message);
});
/* SIMPLIFIED CODE: no responsive validation of title */

// set up the book category selection list
fillSelectWithOptions( createCategorySelectEl, BookCategoryEL.labels);
createCategorySelectEl.addEventListener("change", handleCategorySelectChangeEvent);

// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const categoryStr = createFormEl.category.value;
  const slots = {
    isbn: createFormEl.isbn.value,
    title: createFormEl.title.value,
    year: createFormEl.year.value
  };
  if (categoryStr) {
    // enum literal indexes start with 1
    slots.category = parseInt( categoryStr) + 1;
    switch (slots.category) {
    case BookCategoryEL.TEXTBOOK:
      slots.subjectArea = createFormEl.subjectArea.value;
      createFormEl.subjectArea.setCustomValidity(
        Book.checkSubjectArea( createFormEl.subjectArea.value, slots.category).message);
      break;
    case BookCategoryEL.BIOGRAPHY:
      slots.about = createFormEl.about.value;
      createFormEl.about.setCustomValidity(
        Book.checkAbout( createFormEl.about.value, slots.category).message);
      break;
    }
  }
  // check all input fields and show error messages
  createFormEl.isbn.setCustomValidity(
      Book.checkIsbnAsId( slots.isbn).message);
  /* Incomplete code: no on-submit validation of "title" and "year" */
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) {
    Book.add( slots);
    // un-render all segment/category-specific fields
    undisplayAllSegmentFields( createFormEl, BookCategoryEL.labels);
  }
});

/**********************************************
 * Use case Update Book
**********************************************/
const updateFormEl = document.querySelector("section#Book-U > form"),
      updateSelectBookEl = updateFormEl["selectBook"],
      updateSelectCategoryEl = updateFormEl["category"];
undisplayAllSegmentFields( updateFormEl, BookCategoryEL.labels);
// handle click event for the menu item "Update"
document.getElementById("Update").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  updateSelectBookEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( updateSelectBookEl, Book.instances,
      "isbn", {displayProp:"title"});
  document.getElementById("Book-M").style.display = "none";
  document.getElementById("Book-U").style.display = "block";
  updateFormEl.reset();
});
updateSelectBookEl.addEventListener("change", handleBookSelectChangeEvent);
// set up the book category selection list
fillSelectWithOptions( updateSelectCategoryEl, BookCategoryEL.labels);
updateSelectCategoryEl.addEventListener("change", handleCategorySelectChangeEvent);

/* Incomplete code: no responsive validation of "title" and "year" */
// responsive validation of form fields for segment properties
updateFormEl.subjectArea.addEventListener("input", function () {
  updateFormEl.subjectArea.setCustomValidity(
      Book.checkSubjectArea( updateFormEl.subjectArea.value,
          parseInt( updateFormEl.category.value) + 1).message);
});
updateFormEl.about.addEventListener("input", function () {
  updateFormEl.about.setCustomValidity(
      Book.checkAbout( updateFormEl.about.value,
          parseInt( updateFormEl.category.value) + 1).message);
});

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const categoryStr = updateFormEl.category.value;
  const bookIdRef = updateSelectBookEl.value;
  if (!bookIdRef) return;
  var slots = {
    isbn: updateFormEl.isbn.value,
    title: updateFormEl.title.value,
    year: updateFormEl.year.value
  };
  if (categoryStr) {
    slots.category = parseInt( categoryStr) + 1;
    switch (slots.category) {
    case BookCategoryEL.TEXTBOOK:
      slots.subjectArea = updateFormEl.subjectArea.value;
      updateFormEl.subjectArea.setCustomValidity(
        Book.checkSubjectArea( slots.subjectArea, slots.category).message);
      break;
    case BookCategoryEL.BIOGRAPHY:
      slots.about = updateFormEl.about.value;
      updateFormEl.about.setCustomValidity(
          Book.checkAbout( slots.about, slots.category).message);
      break;
    }
  }
  // check all input fields and show error messages
  updateFormEl.isbn.setCustomValidity( Book.checkIsbn( slots.isbn).message);
  /* Incomplete code: no on-submit validation of "title" and "year" */
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) {
    Book.update( slots);
    // un-render all segment/category-specific fields
    undisplayAllSegmentFields( updateFormEl, BookCategoryEL.labels);
    // update the book selection list's option element
    updateSelectBookEl.options[updateSelectBookEl.selectedIndex].text = slots.title;
  }
});
/**
 * handle book selection events
 * when a book is selected, populate the form with the data of the selected book
 */
function handleBookSelectChangeEvent () {
  const isbn = updateFormEl.selectBook.value;
  if (isbn) {
    const book = Book.instances[isbn];
    updateFormEl.isbn.value = book.isbn;
    updateFormEl.title.value = book.title;
    updateFormEl.year.value = book.year;
    if (book.category) {
      updateFormEl.category.selectedIndex = book.category;
      // disable category selection (category is frozen)
      updateFormEl.category.disabled = "disabled";
      // show category-dependent fields
      displaySegmentFields( updateFormEl, BookCategoryEL.labels, book.category);
      switch (book.category) {
      case BookCategoryEL.TEXTBOOK:
        updateFormEl.subjectArea.value = book.subjectArea;
        updateFormEl.about.value = "";
        break;
      case BookCategoryEL.BIOGRAPHY:
        updateFormEl.about.value = book.about;
        updateFormEl.subjectArea.value = "";
        break;
      }
    } else {  // book has no value for category
      updateFormEl.category.value = "";
      updateFormEl.category.disabled = "";   // enable category selection
      updateFormEl.subjectArea.value = "";
      updateFormEl.about.value = "";
      undisplayAllSegmentFields( updateFormEl, BookCategoryEL.labels);
    }
  } else {
    updateFormEl.reset();
  }
}

/**********************************************
 * Use case Delete Book
**********************************************/
const deleteFormEl = document.querySelector("section#Book-D > form");
const delSelBookEl = deleteFormEl.selectBook;
// set up event handler for Update button
document.getElementById("Delete").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  delSelBookEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( delSelBookEl, Book.instances,
      "isbn", {displayProp:"title"});
  document.getElementById("Book-M").style.display = "none";
  document.getElementById("Book-D").style.display = "block";
  deleteFormEl.reset();
});
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
  const bookIdRef = delSelBookEl.value;
  if (!bookIdRef) return;
  if (confirm("Do you really want to delete this book?")) {
    Book.destroy( bookIdRef);
    delSelBookEl.remove( delSelBookEl.selectedIndex);
  }
});


/**********************************************
 * Refresh the Manage Books Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage book UI and hide the other UIs
  document.getElementById("Book-M").style.display = "block";
  document.getElementById("Book-R").style.display = "none";
  document.getElementById("Book-C").style.display = "none";
  document.getElementById("Book-U").style.display = "none";
  document.getElementById("Book-D").style.display = "none";
}

/**
 * event handler for book category selection events
 * used both in create and update
 */
function handleCategorySelectChangeEvent (e) {
  const formEl = e.currentTarget.form,
        // the array index of BookCategoryEL.labels
        categoryIndexStr = formEl.category.value;
  if (categoryIndexStr) {
    displaySegmentFields( formEl, BookCategoryEL.labels,
        parseInt( categoryIndexStr) + 1);
  } else {
    undisplayAllSegmentFields( formEl, BookCategoryEL.labels);
  }
}

// Set up Manage Books UI
refreshManageDataUI();
