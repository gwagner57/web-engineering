/**
 * @fileOverview  View methods for the use case "create book"
 * @author Gerd Wagner
 */
import Book from "../m/Book.mjs";

const formEl = document.forms["Book"],
      saveButton = formEl["commit"];
// load all book records
Book.retrieveAll();
// add event listeners for responsive validation
formEl.isbn.addEventListener("input", function () {formEl.isbn.setCustomValidity(
      Book.checkIsbnAsId( formEl.isbn.value).message);
});
formEl.title.addEventListener("input", function () {formEl.title.setCustomValidity(
      Book.checkTitle( formEl.title.value).message);
});
formEl.year.addEventListener("input", function () {formEl.year.setCustomValidity(
      Book.checkYear( formEl.year.value).message);
});
formEl.edition.addEventListener("input", function () {formEl.edition.setCustomValidity(
      Book.checkEdition( formEl.edition.value).message);
});
// Set an event handler for the submit/save button
saveButton.addEventListener("click", function () {
  const slots = { isbn: formEl.isbn.value,
          title: formEl.title.value,
          year: formEl.year.value };
  // set error messages in case of constraint violations
  formEl.isbn.setCustomValidity( Book.checkIsbnAsId( slots.isbn).message);
  formEl.title.setCustomValidity( Book.checkTitle( slots.title).message);
  formEl.year.setCustomValidity( Book.checkYear( slots.year).message);
  if (formEl.edition.value) {
    slots.edition = formEl.edition.value;
    formEl.edition.setCustomValidity( Book.checkEdition( slots.edition).message);
  }
  // save the input data only if all of the form fields are valid
  if (formEl.checkValidity()) Book.add( slots);
});

// neutralize the submit event
formEl.addEventListener("submit", function (e) {
  e.preventDefault();
  formEl.reset();
});

// Set a handler for the event when the browser window/tab is closed
window.addEventListener("beforeunload", Book.saveAll);
