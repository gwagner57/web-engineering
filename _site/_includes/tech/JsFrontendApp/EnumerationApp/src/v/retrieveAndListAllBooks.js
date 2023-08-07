/**
 * @fileOverview  Contains various view functions for the use case listBooks
 * @author Gerd Wagner
 */
 pl.v.retrieveAndListAllBooks = {
  setupUserInterface: function () {
    var i=0, book=null, row={}, key="", 
        keys = Object.keys( Book.instances),
        tableBodyEl = document.querySelector("table#books>tbody");
    for (let i=0; i < keys.length; i++) {
      key = keys[i];
      book = Book.instances[key];
      row = tableBodyEl.insertRow(-1);
      row.insertCell(-1).textContent = book.isbn;
      row.insertCell(-1).textContent = book.title;
      row.insertCell(-1).textContent = LanguageEL.labels[book.originalLanguage-1];
      row.insertCell(-1).textContent = LanguageEL.convertEnumIndexes2Names( 
          book.otherAvailableLanguages);
      row.insertCell(-1).textContent = BookCategoryEL.labels[book.category-1];
      row.insertCell(-1).textContent = PublicationFormEL.convertEnumIndexes2Names( 
          book.publicationForms);
    }
  }
};