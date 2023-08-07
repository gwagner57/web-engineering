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
import { fillSelectWithOptions, createListFromMap, createMultiSelectionWidget }
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
// set up back-to-menu buttons for all CRUD UIs
for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener("click", refreshManageDataUI);
}
// neutralize the submit event for all CRUD UIs
for (const frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
  });
}
// save data when leaving the page
window.addEventListener("beforeunload", Book.saveAll);

/**********************************************
 Use case Retrieve/List All Books
 **********************************************/
document.getElementById("RetrieveAndListAll")
    .addEventListener("click", function () {
  document.getElementById("Book-M").style.display = "none";
  document.getElementById("Book-R").style.display = "block";
  const tableBodyEl = document.querySelector("section#Book-R>table>tbody");
  tableBodyEl.innerHTML = "";  // drop old content
  for (const key of Object.keys( Book.instances)) {
    const book = Book.instances[key];
    // create list of authors for this book
    const authListEl = createListFromMap( book.authors, "name");
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = book.isbn;
    row.insertCell().textContent = book.title;
    row.insertCell().textContent = book.year;
    row.insertCell().appendChild( authListEl);
    // if the book has a publisher, show its name
    row.insertCell().textContent =
        book.publisher ? book.publisher.name : "";
  }
});

/**********************************************
  Use case Create Book
 **********************************************/
const createFormEl = document.querySelector("section#Book-C > form"),
      selectAuthorsEl = createFormEl["selectAuthors"],
      selectPublisherEl = createFormEl["selectPublisher"];
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
// set up event handlers for responsive constraint validation
createFormEl.isbn.addEventListener("input", function () {
  createFormEl.isbn.setCustomValidity(
      Book.checkIsbnAsId( createFormEl["isbn"].value).message);
});
/* SIMPLIFIED/MISSING CODE: add event listeners for responsive
   validation on user input with Book.checkTitle and checkYear */

// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const slots = {
    isbn: createFormEl["isbn"].value,
    title: createFormEl["title"].value,
    year: createFormEl["year"].value,
    authorIdRefs: [],
    publisher_id: createFormEl["selectPublisher"].value
  };
  // check all input fields and show error messages
  createFormEl.isbn.setCustomValidity(
      Book.checkIsbnAsId( slots.isbn).message);
  /* SIMPLIFIED CODE: no before-submit validation of name */
  // get the list of selected authors
  const selAuthOptions = createFormEl.selectAuthors.selectedOptions;
  // check the mandatory value constraint for authors
  createFormEl.selectAuthors.setCustomValidity(
      selAuthOptions.length > 0 ? "" : "No author selected!"
  );
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) {
    // construct a list of author ID references
    for (const opt of selAuthOptions) {
      slots.authorIdRefs.push( opt.value);
    }
    Book.add( slots);
  }
});

/**********************************************
 * Use case Update Book
**********************************************/
const updateFormEl = document.querySelector("section#Book-U > form"),
      updSelBookEl = updateFormEl["selectBook"];
document.getElementById("Update").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  updSelBookEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( updSelBookEl, Book.instances,
      "isbn", {displayProp: "title"});
  document.getElementById("Book-M").style.display = "none";
  document.getElementById("Book-U").style.display = "block";
  updateFormEl.reset();
});
/**
 * handle book selection events: when a book is selected,
 * populate the form with the data of the selected book
 */
updSelBookEl.addEventListener("change", function () {
  const saveButton = updateFormEl["commit"],
    selectAuthorsWidget = updateFormEl.querySelector(".MultiSelectionWidget"),
    selectPublisherEl = updateFormEl["selectPublisher"],
    isbn = updateFormEl["selectBook"].value;
  if (isbn) {
    const book = Book.instances[isbn];
    updateFormEl["isbn"].value = book.isbn;
    updateFormEl["title"].value = book.title;
    updateFormEl["year"].value = book.year;
    // set up the associated publisher selection list
    fillSelectWithOptions( selectPublisherEl, Publisher.instances, "name");
    // set up the associated authors selection widget
    createMultiSelectionWidget( selectAuthorsWidget, book.authors,
        Author.instances, "authorId", "name", 1);  // minCard=1
    // assign associated publisher as the selected option to select element
    if (book.publisher) updateFormEl["selectPublisher"].value = book.publisher.name;
    saveButton.disabled = false;
  } else {
    updateFormEl.reset();
    updateFormEl["selectPublisher"].selectedIndex = 0;
    selectAuthorsWidget.innerHTML = "";
    saveButton.disabled = true;
  }
});
// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const bookIdRef = updSelBookEl.value,
    selectAuthorsWidget = updateFormEl.querySelector(".MultiSelectionWidget"),
    selectedAuthorsListEl = selectAuthorsWidget.firstElementChild;
  if (!bookIdRef) return;
  const slots = {
    isbn: updateFormEl["isbn"].value,
    title: updateFormEl["title"].value,
    year: updateFormEl["year"].value,
    publisher_id: updateFormEl["selectPublisher"].value
  };
  // add event listeners for responsive validation
  /* MISSING CODE */
  // commit the update only if all form field values are valid
  if (updateFormEl.checkValidity()) {
    // construct authorIdRefs-ToAdd/ToRemove lists
    const authorIdRefsToAdd=[], authorIdRefsToRemove=[];
    for (const authorItemEl of selectedAuthorsListEl.children) {
      if (authorItemEl.classList.contains("removed")) {
        authorIdRefsToRemove.push( authorItemEl.getAttribute("data-value"));
      }
      if (authorItemEl.classList.contains("added")) {
        authorIdRefsToAdd.push( authorItemEl.getAttribute("data-value"));
      }
    }
    // if the add/remove list is non-empty, create a corresponding slot
    if (authorIdRefsToRemove.length > 0) {
      slots.authorIdRefsToRemove = authorIdRefsToRemove;
    }
    if (authorIdRefsToAdd.length > 0) {
      slots.authorIdRefsToAdd = authorIdRefsToAdd;
    }
    Book.update( slots);
    // update the book selection list's option element
    updSelBookEl.options[updSelBookEl.selectedIndex].text = slots.title;
    // drop widget content
    selectAuthorsWidget.innerHTML = "";
  }
});

/**********************************************
 * Use case Delete Book
**********************************************/
const deleteFormEl = document.querySelector("section#Book-D > form");
const delSelBookEl = deleteFormEl["selectBook"];
document.getElementById("Delete").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  delSelBookEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( delSelBookEl, Book.instances,
      "isbn", {displayProp: "title"});
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
