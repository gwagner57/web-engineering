/**
 * @fileOverview  Contains various view functions for the use case listBooks
 * @author Gerd Wagner
 */
 pl.v.retrieveAndListAllBooks = {
  setupUserInterface: function () {
    const tableBodyEl = document.querySelector("table#books>tbody");
    // load all book objects
    Book.retrieveAll();
    // for each book, create a table row with a cell for each attribute
    for (let key of Object.keys( Book.instances)) {
      const row = tableBodyEl.insertRow();
      row.insertCell().textContent = Book.instances[key].isbn;
      row.insertCell().textContent = Book.instances[key].title;
      row.insertCell().textContent = Book.instances[key].year;
    }
  }
};