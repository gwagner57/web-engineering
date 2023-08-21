/**
 * @fileOverview  Contains various view functions for the use case deleteBook
 * @author Mircea Diaconescu
 * @author Gerd Wagner
 */
import Book from "../m/Book.mjs";
import { fillSelectWithOptions } from "../../lib/util.mjs";

const formEl = document.forms["Book"],
      deleteButton = formEl["commit"],
      selectBookEl = formEl["selectBook"];
// load all book records
Book.retrieveAll();
// set up the book selection list
fillSelectWithOptions( selectBookEl, Book.instances,
  {keyProp:"isbn", displayProp:"title"});
// Set an event handler for the submit/delete button
deleteButton.addEventListener("click", function () {
  const isbn = selectBookEl.value;
  if (!isbn) return;
  Book.destroy( isbn);
  // remove deleted book from select options
  selectBookEl.remove( selectBookEl.selectedIndex);
});
// Set a handler for the event when the browser window/tab is closed
window.addEventListener("beforeunload", Book.saveAll);
