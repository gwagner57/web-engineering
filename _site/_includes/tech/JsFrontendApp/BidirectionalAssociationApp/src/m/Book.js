/**
 * @fileOverview  The model class Book with attribute definitions, (class-level) check methods, 
 *                setter methods, and the special methods saveAll and retrieveAll
 * @author Gerd Wagner
 */

// ***********************************************
// *** Constructor with property definitions ****
// ***********************************************
class Book {
  // using a single record parameter with ES6 function parameter destructuring
  constructor ({isbn, title, year, authors, authorIdRefs, publisher, publisher_id}) {
    this.isbn = isbn;
    this.title = title;
    this.year = year;
    // assign object reference or ID reference (to be converted in setter)
    this.authors = authors || authorIdRefs;
    if (publisher || publisher_id) this.publisher = publisher || publisher_id;
  }
  get isbn() {
    return this._isbn;
  }
  static checkIsbn( isbn) {
    if (isbn === undefined || isbn === "") return new NoConstraintViolation();
    else if (typeof isbn !== "string" || isbn.trim() === "") {
      return new RangeConstraintViolation(
          "The ISBN must be a non-empty string!");
    } else if (!/\b\d{9}(\d|X)\b/.test( isbn)) {
      return new PatternConstraintViolation("The ISBN must be "+
          "a 10-digit string or a 9-digit string followed by 'X'!");
    } else {
      return new NoConstraintViolation();
    }
  }
  static checkIsbnAsId( isbn) {
    var validationResult = Book.checkIsbn( isbn);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (isbn === undefined) {
        validationResult = new MandatoryValueConstraintViolation(
            "A value for the ISBN must be provided!");
      } else if (Book.instances[isbn]) {
        validationResult = new UniquenessConstraintViolation(
            "There is already a book record with ISBN "+ isbn);
      } else {
        validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  }
  set isbn( n) {
    var validationResult = Book.checkIsbnAsId( n);
    if (validationResult instanceof NoConstraintViolation) {
      this._isbn = n;
    } else {
      throw validationResult;
    }
  }
  get title() {
    return this._title;
  }
  set title( t) {
    //SIMPLIFIED CODE: no validation with Book.checkTitle
    this._title = t;
  }
  get year() {
    return this._year;
  }
  set year( y) {
    //SIMPLIFIED CODE: no validation with Book.checkYear
    this._year = parseInt( y);
  }
  get publisher() {
    return this._publisher;
  }
  static checkPublisher( publisher_id) {
    var constraintViolation = null;
    if (publisher_id === undefined || publisher_id === "") {
      constraintViolation = new NoConstraintViolation();  // optional
    } else {
      // invoke foreign key constraint check
      constraintViolation = Publisher.checkNameAsIdRef( publisher_id);
    }
    return constraintViolation;
  }
  set publisher( p) {
    if (!p) {  // the publisher reference is to be deleted
      // delete the corresponding inverse reference from Publisher::publishedBooks
      delete this._publisher.publishedBooks[ this._isbn];
      // unset the publisher property
      delete this._publisher;
    } else {
      // p can be an ID reference or an object reference
      const publisher_id = (typeof p !== "object") ? p : p.name;
      const constraintViolation = Book.checkPublisher( publisher_id);
      if (constraintViolation instanceof NoConstraintViolation) {
        if (this._publisher) {
          // delete the obsolete inverse reference in Publisher::publishedBooks
          delete this._publisher.publishedBooks[ this._isbn];
        }
        // create the new publisher reference
        this._publisher = Publisher.instances[ publisher_id];
        // add the new inverse reference to Publisher::publishedBooks
        this._publisher.publishedBooks[ this._isbn] = this;
      } else {
        throw constraintViolation;
      }
    }
  }
  get authors() {
    return this._authors;
  }
  static checkAuthor( author_id) {
    var constraintViolation = null;
    if (!author_id) {
      // author(s) are optional
      constraintViolation = new NoConstraintViolation();
    } else {
      // invoke foreign key constraint check
      constraintViolation =
          Author.checkAuthorIdAsIdRef( author_id);
    }
    return constraintViolation;
  }
  addAuthor(a) {
    // a can be an ID reference or an object reference
    const author_id = (typeof a !== "object") ? parseInt( a) : a.authorId;
    const validationResult = Book.checkAuthor( author_id);
    if (author_id && validationResult instanceof NoConstraintViolation) {
      // add the new author reference
      this._authors[author_id] = Author.instances[author_id];
      // automatically add the derived inverse reference
      this._authors[author_id].authoredBooks[this._isbn] = this;
    } else {
      throw validationResult;
    }
  }
  removeAuthor(a) {
    // a can be an ID reference or an object reference
    const author_id = (typeof a !== "object") ? parseInt( a) : a.authorId;
    const validationResult = Book.checkAuthor( author_id);
    if (validationResult instanceof NoConstraintViolation) {
      // automatically delete the derived inverse reference
      delete this._authors[author_id].authoredBooks[this._isbn];
      // delete the author reference
      delete this._authors[author_id];
    } else {
      throw validationResult;
    }
  }
  set authors(a) {
    this._authors = {};
    if (Array.isArray(a)) {  // array of IdRefs
      for (let idRef of a) {
        this.addAuthor( idRef);
      }
    } else {  // map of IdRefs to object references
      for (let idRef of Object.keys( a)) {
        this.addAuthor( a[idRef]);
      }
    }
  }
  // Serialize book object
  toString() {
    var bookStr = `Book{ ISBN: ${this.isbn}, title: ${this.title},` +
        `year: ${this.year}`;
    if (this.publisher) bookStr += `, publisher: ${this.publisher.name}`;
    return bookStr +", authors:" +
        Object.keys( this.authors).join(",") +"}";
  }
  // Convert object to record/row
  toRecord() {
    var rec = {};
    // loop over all Book properties
    for (let p of Object.keys( this)) {
      // copy only property slots with underscore prefix
      if (p.charAt(0) === "_") {
        switch (p) {
          case "_publisher":
            // convert object reference to ID reference
            if (this._publisher) rec.publisher_id = this._publisher.name;
            break;
          case "_authors":
            // convert the map of object references to a list of ID references
            rec.authorIdRefs = [];
            Object.keys( this.authors).forEach( authorIdStr => {
              rec.authorIdRefs.push( parseInt( authorIdStr));
            });
            break;
          default:
            // remove underscore prefix
            rec[p.substr(1)] = this[p];
        }
      }
    };
    return rec;
  }
}
// ***********************************************
// *** Class-level ("static") properties *********
// ***********************************************
Book.instances = {};

// *********************************************************
// *** Class-level ("static") storage management methods ***
// *********************************************************
/**
 *  Create a new book row
 */
Book.add = function (slots) {
  var book = null;
  try {
    book = new Book( slots);
  } catch (e) {
    console.error( e.constructor.name +": "+ e.message);
    book = null;
  }
  if (book) {
    Book.instances[book.isbn] = book;
    console.log( book.toString() + " created!");
  }
};
/**
 *  Update an existing Book row
 *  where slots contain the slots to be updated and performing the updates
 *  with setters makes sure that the new values are validated
 */
Book.update = function ({isbn, title, year,
    authorIdRefsToAdd, authorIdRefsToRemove, publisher_id}) {
  const book = Book.instances[isbn],
      objectBeforeUpdate = util.cloneObject( book);  // save the current state of book
  var noConstraintViolated=true, updatedProperties=[];
  try {
    if (title && book.title !== title) {
      book.title = title;
      updatedProperties.push("title");
    }
    if (year && book.year !== parseInt( year)) {
      book.year = year;
      updatedProperties.push("year");
    }
    if (authorIdRefsToAdd) {
      updatedProperties.push("authors(added)");
      for (let authorIdRef of authorIdRefsToAdd) {
        book.addAuthor( authorIdRef);
      }
    }
    if (authorIdRefsToRemove) {
      updatedProperties.push("authors(removed)");
      for (let author_id of authorIdRefsToRemove) {
        book.removeAuthor( author_id);
      }
    }
    // publisher_id may be the empty string for unsetting the optional property
    if (publisher_id !== undefined && (!book.publisher && publisher_id ||
        book.publisher && book.publisher.name !== publisher_id)) {
      book.publisher = publisher_id;
      updatedProperties.push("publisher");
    }
  } catch (e) {
    console.log( e.constructor.name +": "+ e.message);
    noConstraintViolated = false;
    // restore object to its state before updating
    Book.instances[isbn] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      let ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for book ${isbn}`);
    } else {
      console.log("No property value changed for book " + book.isbn + " !");
    }
  }
};
/**
 *  Delete an existing Book row
 */
Book.destroy = function (isbn) {
  const book = Book.instances[isbn];
  if (book) {
    console.log( book.toString() + " deleted!");
    if (book.publisher) {
      // remove inverse reference from book.publisher
      delete book.publisher.publishedBooks[isbn];
    }
    // remove inverse references from all book.authors
    for (let authorID of Object.keys( book.authors)) {
      delete book.authors[authorID].authoredBooks[isbn];
    }
    // finally, delete book from Book.instances
    delete Book.instances[isbn];
  } else {
    console.error("There is no book with ISBN " + isbn + " in the database!");
  }
};
/**
 *  Load all book table rows and convert them to objects 
 *  Precondition: publishers and people must be loaded first
 */
Book.retrieveAll = function () {
  var books={};
  try {
    if (!localStorage["books"]) {
      localStorage.setItem("books", JSON.stringify({}));
    } else {
      books = JSON.parse( localStorage["books"]);
      console.log( Object.keys( books).length +" books loaded.");
    }
  } catch (e) {
    console.error("Error when reading from Local Storage\n" + e);
  }
  for (let isbn of Object.keys( books)) {
    try {
      Book.instances[isbn] = new Book( books[isbn]);
    } catch (e) {
      console.error(`${e.constructor.name} while deserializing book ${isbn}: ${e.message}`);
    }
  }
};
/**
 *  Save all book objects
 */
Book.saveAll = function () {
  var books={};
  // convert the map of objects (Book.instances)
  // to the map of corresponding rows (books)
  for (let isbn of Object.keys( Book.instances)) {
    let book = Book.instances[isbn];
    books[isbn] = book.toRecord();
  }
  try {
    localStorage["books"] = JSON.stringify( books);
    console.log( Object.keys( Book.instances).length +" books saved.");
  } catch (e) {
    console.error("Error when writing to Local Storage\n" + e);
  }
};
