/**
 * @fileOverview  The model class Author with property definitions, (class-level) check methods, 
 *                setter methods, and the special methods saveAll and retrieveAll
 * @author Gerd Wagner
 */

/**
 * The class Book
 * @class
 * @param {object} slots - Object creation slots.
 *
 * ES6 use
 * + function parameter destructuring in class constructor
 * + arrow function in toRecord()
 * + const in Author.update, Author.destroy, Author.saveAll
 * + let in Author.destroy, Author.retrieveAll and Author.saveAll
 */
class Author {
  // using a single record parameter with ES6 function parameter destructuring
  constructor ({authorId, name}) {
    // assign properties by invoking implicit setters
    this.authorId = authorId;  // number (integer)
    this.name = name;  // string
    // derived inverse reference property (inverse of Book::authors)
    this._authoredBooks = {};  // initialize as an empty map of Book objects
  }
  get authorId() {
    return this._authorId;
  }
  static checkAuthorId( id) {
    if (id === undefined) {
      return new NoConstraintViolation();  // may be optional as an IdRef
    } else {
      // convert to integer
      id = parseInt( id);
      if (isNaN( id) || !Number.isInteger( id) || id < 1) {
        return new RangeConstraintViolation("The author ID must be a positive integer!");
      } else {
        return new NoConstraintViolation();
      }
    }
  }
  static checkAuthorIdAsId( id) {
    var constraintViolation = Author.checkAuthorId(id);
    if ((constraintViolation instanceof NoConstraintViolation)) {
      // convert to integer
      id = parseInt(id);
      if (isNaN(id)) {
        return new MandatoryValueConstraintViolation(
            "A positive integer value for the author ID is required!");
      } else if (Author.instances[String(id)]) {  // convert to string if number
        constraintViolation = new UniquenessConstraintViolation(
            'There is already a author record with this author ID!');
      } else {
        constraintViolation = new NoConstraintViolation();
      }
    }
    return constraintViolation;
  }
  static checkAuthorIdAsIdRef( id) {
    var constraintViolation = Author.checkAuthorId( id);
    if ((constraintViolation instanceof NoConstraintViolation) &&
        id !== undefined) {
      if (!Author.instances[String(id)]) {
        constraintViolation = new ReferentialIntegrityConstraintViolation(
            'There is no author record with this author ID!');
      }
    }
    return constraintViolation;
  }
  set authorId( id) {
    var constraintViolation = Author.checkAuthorIdAsId( id);
    if (constraintViolation instanceof NoConstraintViolation) {
      this._authorId = parseInt( id);
    } else {
      throw constraintViolation;
    }
  }
  get name() {
    return this._name;
  }
  set name( n) {
    /*SIMPLIFIED CODE: no validation with Author.checkName */
    this._name = n;
  }
  get authoredBooks() {
    return this._authoredBooks;
  }
  /**
   *  Convert author object to row/record
   */
  toRecord() {
    var rec = {};
    // loop over all Author properties
    for (let p of Object.keys( this)) {
      // keep underscore-prefixed properties except "_authoredBooks"
      if (p.charAt(0) === "_" && p !== "_authoredBooks") {
        // remove underscore prefix
        rec[p.substr(1)] = this[p];
      }
    };
    return rec;
  }
}
// *****************************************************
// *** Class-level ("static") properties ***************
// *****************************************************
Author.instances = {};

// *****************************************************
// *** Class-level ("static") methods ******************
// *****************************************************
/**
 *  Create a new author record
 */
Author.add = function (slots) {
  var author = null;
  try {
    author = new Author( slots);
  } catch (e) {
    console.error( e.constructor.name + ": " + e.message);
    author = null;
  }
  if (author) {
    Author.instances[String(author.authorId)] = author;
    console.log("Saved: " + author.name);
  }
};
/**
 *  Update an existing author record
 */
Author.update = function ({authorId, name}) {
  const author = Author.instances[String( authorId)],
      objectBeforeUpdate = util.cloneObject( author);
  var noConstraintViolated=true, ending="", updatedProperties=[];
  try {
    if (name && author.name !== name) {
      author.name = name;
      updatedProperties.push("name");
    }
  } catch (e) {
    console.error( e.constructor.name + ": " + e.message);
    noConstraintViolated = false;
    // restore object to its state before updating
    Author.instances[String(authorId)] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log("Propert"+ending+" " + updatedProperties.toString() +
          " modified for author " + name);
    } else {
      console.log("No property value changed for author " +
          name + " !");
    }
  }
};
/**
 *  Delete an existing author record
 *  Since the book-author association is bidirectional, an author can be directly
 *  deleted from the books' authors, instead of doing a linear search on all books
 *  as required for the case of a unidirectional association.
 */
Author.destroy = function (authorId) {
  const author = Author.instances[authorId];
  // delete all dependent book records
  for (let isbn of Object.keys( author.authoredBooks)) {
    let book = author.authoredBooks[isbn];
    if (book.authors[authorId]) delete book.authors[authorId];
  }
  // delete the author object
  delete Author.instances[authorId];
  console.log("Author " + author.name + " deleted.");
};
/**
 *  Load all author records and convert them to objects
 */
Author.retrieveAll = function () {
  var authors={};
  if (!localStorage["authors"]) localStorage["authors"] = "{}";
  try {
    authors = JSON.parse( localStorage["authors"]);
  } catch (e) {
    console.error("Error when reading from Local Storage\n" + e);
    authors = {};
  }
  for (let key of Object.keys( authors)) {
    try {
      Author.instances[key] = new Author( authors[key]);
    } catch (e) {
      console.error(`${e.constructor.name} while deserializing` +
          `author ${key}: ${e.message}`);
    }
  }
  console.log( Object.keys( authors).length +" author records loaded.");
};
/**
 *  Convert author record to author object
 */
/**
 *  Save all author objects as records
 */
Author.saveAll = function () {
  const keys = Object.keys( Author.instances);
  var authors={};
  for (let key of keys) {
    let author = Author.instances[key];
    authors[key] = author.toRecord();
  }
  try {
    localStorage["authors"] = JSON.stringify( authors);
    console.log( keys.length +" authors saved.");
  } catch (e) {
    console.error("Error when writing to Local Storage\n" + e);
  }
};
