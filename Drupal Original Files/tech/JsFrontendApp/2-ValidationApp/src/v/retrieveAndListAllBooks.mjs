/**
 * @fileOverview  Contains various view functions for the use case listBooks
 * @author Gerd Wagner
 */
import Book from "../m/Book.mjs";

const tableBodyEl = document.querySelector("table#books>tbody");
// retrieve all book records
Book.retrieveAll();
// list all book records
for (let key of Object.keys( Book.instances)) {
  const book = Book.instances[key];
  const row = tableBodyEl.insertRow();
  row.insertCell().textContent = book.isbn;
  row.insertCell().textContent = book.title;
  row.insertCell().textContent = book.year;
  row.insertCell().textContent = book.edition || "";
}
