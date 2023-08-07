/**
 * @fileOverview  Contains various view functions for the use case listBooks
 * @author Gerd Wagner
 */
import Book, { BookCategoryEL, LanguageEL, PublicationFormEL } from "../m/Book.mjs";

const tableBodyEl = document.querySelector("table#books > tbody");
// retrieve all book records
Book.retrieveAll();
for (const key of Object.keys( Book.instances)) {
  const book = Book.instances[key];
  const row = tableBodyEl.insertRow();
  row.insertCell().textContent = book.isbn;
  row.insertCell().textContent = book.title;
  row.insertCell().textContent = LanguageEL.labels[book.originalLanguage];
  row.insertCell().textContent = LanguageEL.stringify(
     book.otherAvailableLanguages);
  row.insertCell().textContent = BookCategoryEL.labels[book.category];
  row.insertCell().textContent = PublicationFormEL.stringify(
     book.publicationForms);
}
