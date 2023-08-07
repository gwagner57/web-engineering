/**
 * @fileOverview  View methods for the use case "update book"
 * @author Gerd Wagner
 */
import Book from "../m/Book.mjs";
import { fillSelectWithOptions } from "../../lib/util.mjs";

const formEl = document.forms["Book"],
      saveButton = formEl["commit"],
      selectBookEl = formEl["selectBook"];
// load all book records
Book.retrieveAll();
// set up the book selection list
fillSelectWithOptions( Book.instances, selectBookEl, "isbn", "title");
// when a book is selected, populate the form with its data
selectBookEl.addEventListener("change", function () {
  const bookKey = selectBookEl.value;
  if (bookKey) {  // set form fields
    const book = Book.instances[bookKey];
    ["isbn","title","year","edition"].forEach( function (p) {
      formEl[p].value = book[p] ? book[p] : "";
      // delete custom validation error message which may have been set before
      formEl[p].setCustomValidity("");
    });
  } else {
    formEl.reset();
  }
});
// add event listeners for responsive validation
formEl.title.addEventListener("input", function () {
  formEl.title.setCustomValidity(
      Book.checkTitle( formEl.title.value).message);
});
formEl.year.addEventListener("input", function () {
  formEl.year.setCustomValidity(
      Book.checkYear( formEl.year.value).message);
});
formEl.edition.addEventListener("input", function () {
  var ed = formEl.edition.value;
  formEl.edition.setCustomValidity( Book.checkEdition( ed).message);
});
// set an event handler for the submit/save button
saveButton.addEventListener("click", handleSaveButtonClickEvent);
// neutralize the submit event
formEl.addEventListener("submit", function (e) {
  e.preventDefault();
  formEl.reset();
});
// Set a handler for the event when the browser window/tab is closed
window.addEventListener("beforeunload", Book.saveAll);

// event handler for the submit/save button
function handleSaveButtonClickEvent () {
  const formEl = document.forms['Book'],
        selectBookEl = formEl.selectBook;
  const slots = { isbn: formEl.isbn.value,
    title: formEl.title.value,
    year: formEl.year.value,
    edition: formEl.edition.value
  };
  // set error messages in case of constraint violations
  formEl.title.setCustomValidity( Book.checkTitle( slots.title).message);
  formEl.year.setCustomValidity( Book.checkYear( slots.year).message);
  formEl.edition.setCustomValidity( Book.checkEdition( slots.edition).message);
  if (formEl.checkValidity()) {
    Book.update( slots);
    // update the selection list option
    selectBookEl.options[selectBookEl.selectedIndex].text = slots.title;
  }
}
