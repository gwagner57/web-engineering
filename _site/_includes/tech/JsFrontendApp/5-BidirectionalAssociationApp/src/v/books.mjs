/**
 * @fileOverview  View code of UI for managing Book data
 * @author Gerd Wagner
 */
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Author from "../m/Author.mjs";
import Publisher from "../m/Publisher.mjs";
import Book from "../m/Book.mjs";
import { fillSelectWithOptions, createListFromMap, createMultipleChoiceWidget }
    from "../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
Author.retrieveAll();
Publisher.retrieveAll();
Book.retrieveAll();

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
// set up back-to-menu buttons for all use cases
for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener('click', function() {refreshManageDataUI();});
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
document.getElementById("booksRetrieveAndListAll")
    .addEventListener("click", function () {
  const tableBodyEl = document.querySelector("section#Book-R > table > tbody");
  tableBodyEl.innerHTML = "";  // drop old contents
  for (const key of Object.keys( Book.instances)) {
    const book = Book.instances[key];
    // create list of authors for this book
    const listEl = createListFromMap( book.authors, "name");
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = book.isbn;
    row.insertCell().textContent = book.title;
    row.insertCell().textContent = book.year;
    row.insertCell().appendChild(listEl);
    // if the book has a publisher, show its name
    row.insertCell().textContent =
        book.publisher ? book.publisher.name : "";
  }
  document.getElementById("Book-M").style.display = "none";
  document.getElementById("Book-R").style.display = "block";
});

/**********************************************
 * Use case Create Book
**********************************************/
const createFormEl = document.querySelector("section#Book-C > form"),
      selectAuthorsEl = createFormEl.selectAuthors,
      selectPublisherEl = createFormEl.selectPublisher;
// set up event handler for Create button
document.getElementById("Create").addEventListener("click", function () {
  // set up a single selection list for selecting a publisher
  fillSelectWithOptions( selectPublisherEl, Publisher.instances, "name");
  // set up a multiple selection list for selecting authors
  fillSelectWithOptions( selectAuthorsEl, Author.instances,
      "authorId", {displayProp: "name"});
  document.getElementById("Book-M").style.display = "none";
  document.getElementById("Book-C").style.display = "block";
  createFormEl.reset();
});

//----- set up event handlers for responsive constraint validation ----------
createFormEl.isbn.addEventListener("input", function () {
  createFormEl.isbn.setCustomValidity(
    Book.checkIsbnAsId( createFormEl.isbn.value).message);
});
/* SIMPLIFIED/MISSING CODE: add event listeners for responsive
validation on user input with Book.checkTitle and checkYear */

// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const slots = {
    isbn: createFormEl.isbn.value,
    title: createFormEl.title.value,
    year: createFormEl.year.value,
    authorIdRefs: [],
    publisher_id: createFormEl.selectPublisher.value
  };
  // check all input fields and show error messages
  createFormEl.isbn.setCustomValidity(
    Book.checkIsbnAsId( slots.isbn).message);
  /* SIMPLIFIED CODE: no before-submit validation of name */
  // save the input data only if all form fields are valid
  const selAuthOptions = createFormEl.selectAuthors.selectedOptions;
  // check the mandatory value constraint for authors
  createFormEl.selectAuthors.setCustomValidity(
    (selAuthOptions.length > 0) ? "" : "No author selected!"
  );
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) {
    // construct a list of author ID references
    for (const opt of selAuthOptions) {
      slots.authorIdRefs.push(opt.value);
    }
    Book.add(slots);
  }
});

/**********************************************
 * Use case Update Book
**********************************************/
/**
 * Initialize the update books UI/form. Notice that the Association List Widget for
 * associated authors is left empty initially. It is only set up on book selection
 */
const updateFormEl = document.querySelector("section#Book-U > form");
const updateSelectBookEl = updateFormEl.selectBook;
//----- set up event handler for Update button -------------------------
document.getElementById("Update").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  updateSelectBookEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( updateSelectBookEl, Book.instances,
      "isbn", {displayProp: "title"});
  document.getElementById("Book-M").style.display = "none";
  document.getElementById("Book-U").style.display = "block";
  updateFormEl.reset();
});
updateSelectBookEl.addEventListener("change", handleBookSelectChangeEvent);

/**
 * handle book selection events: when a book is selected,
 * populate the form with the data of the selected book
 */
function handleBookSelectChangeEvent() {
  const saveButton = updateFormEl.commit,
    selectAuthorsWidget = updateFormEl.querySelector(".MultiChoiceWidget"),
    selectPublisherEl = updateFormEl.selectPublisher,
    isbn = updateFormEl.selectBook.value;
  if (isbn !== "") {
    const book = Book.instances[isbn];
    updateFormEl.isbn.value = book.isbn;
    updateFormEl.title.value = book.title;
    updateFormEl.year.value = book.year;
    // set up the associated publisher selection list
    fillSelectWithOptions( selectPublisherEl, Publisher.instances, "name");
    // set up the associated authors selection widget
    createMultipleChoiceWidget( selectAuthorsWidget, book.authors,
        Author.instances, "authorId", "name", 1);  // minCard=1
    // assign associated publisher as the selected option to select element
    if (book.publisher) updateFormEl.selectPublisher.value = book.publisher.name;
    saveButton.disabled = false;
  } else {
    updateFormEl.reset();
    updateFormEl.selectPublisher.selectedIndex = 0;
    selectAuthorsWidget.innerHTML = "";
    saveButton.disabled = true;
  }
}

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const bookIdRef = updateSelectBookEl.value,
    selectAuthorsWidget = updateFormEl.querySelector(".MultiChoiceWidget"),
    multiChoiceListEl = selectAuthorsWidget.firstElementChild;
  if (!bookIdRef) return;
  const slots = {
    isbn: updateFormEl.isbn.value,
    title: updateFormEl.title.value,
    year: updateFormEl.year.value,
    publisher_id: updateFormEl.selectPublisher.value
  }
  // add event listeners for responsive validation
  /* MISSING CODE */
  // commit the update only if all form field values are valid
  if (updateFormEl.checkValidity()) {
    // construct authorIdRefs-ToAdd/ToRemove lists from the association list
    let authorIdRefsToAdd = [], authorIdRefsToRemove = [];
    for (const mcListItemEl of multiChoiceListEl.children) {
      if (mcListItemEl.classList.contains("removed")) {
        authorIdRefsToRemove.push(mcListItemEl.getAttribute("data-value"));
      }
      if (mcListItemEl.classList.contains("added")) {
        authorIdRefsToAdd.push(mcListItemEl.getAttribute("data-value"));
      }
    }
    // if the add/remove list is non-empty create a corresponding slot
    if (authorIdRefsToRemove.length > 0) {
      slots.authorIdRefsToRemove = authorIdRefsToRemove;
    }
    if (authorIdRefsToAdd.length > 0) {
      slots.authorIdRefsToAdd = authorIdRefsToAdd;
    }
  }
  Book.update( slots);
  // update the book selection list's option element
  updateSelectBookEl.options[updateSelectBookEl.selectedIndex].text = slots.title;
  selectAuthorsWidget.innerHTML = "";
});

/**********************************************
 * Use case Delete Book
**********************************************/
const deleteFormEl = document.querySelector("section#Book-D > form");
const delSelBookEl = deleteFormEl.selectBook;
//----- set up event handler for Update button -------------------------
document.getElementById("Delete").addEventListener("click", function () {
  document.getElementById("Book-M").style.display = "none";
  document.getElementById("Book-D").style.display = "block";
  // reset selection list (drop its previous contents)
  delSelBookEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( delSelBookEl, Book.instances,
    "isbn", {displayProp: "title"});
  deleteFormEl.reset();
});

// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
  const bookIdRef = delSelBookEl.value;
  if (!bookIdRef) return;
  if (confirm("Do you really want to delete this book?")) {
    Book.destroy( bookIdRef);
    // remove deleted book from select options
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

// Set up Manage Book UI
refreshManageDataUI();
