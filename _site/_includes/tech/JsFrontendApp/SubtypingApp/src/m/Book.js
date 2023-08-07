/**
 * @fileOverview  The model class Book with attribute definitions, (class-level) check methods, 
 *                setter methods, and the special methods saveAll and retrieveAll
 * @author Gerd Wagner
 * @copyright Copyright � 2013-2014 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany. 
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is", 
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */

/**
 * Enumeration type
 * @global
 */
BookCategoryEL = new Enumeration(["Textbook","Biography"]);
/**
 * Constructor function for the class Book 
 * including the incomplete disjoint segmentation {TextBook, Biography}
 * based on the Single Table Inheritance pattern.
 * @constructor
 * @param {{isbn: string, title: string, year: number, category: ?number, subjectArea: ?string, about: ?string}} [slots] - A record of parameters.
 */
function Book( slots) {
  // set the default values for the parameter-free default constructor
  this.isbn = "";         // String
  this.title = "";        // String
  this.year = 0;          // Number (PositiveInteger)
  /* optional properties
  this.category           // Number? {from BookCategoryEL}
  this.subjectArea        // String?
  this.about              // String?
  */
  if (arguments.length > 0) {
    this.setIsbn( slots.isbn); 
    this.setTitle( slots.title); 
    this.setYear( slots.year);
    if (slots.category) this.setCategory( slots.category);
    if (slots.subjectArea) this.setSubjectArea( slots.subjectArea); 
    if (slots.about) this.setAbout( slots.about); 
  }
}
// ***********************************************
// *** Class-level ("static") properties *********
// ***********************************************
Book.instances = {};

// ***********************************************
// *** Checks and Setters ************************
// ***********************************************
/**
 * @method 
 * @static
 * @param {string} isbn - The ISBN of a book.
 * @returns {ConstraintViolation|NoConstraintViolation} 
 */
Book.checkIsbn = function (isbn) {
  if (!isbn) {
    return new NoConstraintViolation();
  } else if (typeof(isbn) !== "string" || isbn.trim() === "") {
    return new RangeConstraintViolation(
        "The ISBN must be a non-empty string!");
  } else if (!/\b\d{9}(\d|X)\b/.test( isbn)) {
    return new PatternConstraintViolation("The ISBN must be a 10-digit string " +
        "or a 9-digit string followed by 'X'!");
  } else {
    return new NoConstraintViolation();
  }
};
/**
 * @method 
 * @static
 * @param {string} isbn - The ISBN of a book.
 * @returns {ConstraintViolation|NoConstraintViolation} 
 */
Book.checkIsbnAsId = function (isbn) {
  var constraintViolation = Book.checkIsbn( isbn);
  if ((constraintViolation instanceof NoConstraintViolation)) {
    if (!isbn) {
      constraintViolation = new MandatoryValueConstraintViolation(
          "A value for the ISBN must be provided!");
    } else if (Book.instances[isbn]) {  
      constraintViolation = new UniquenessConstraintViolation(
          'There is already a book record with this ISBN!');
    } else {
      constraintViolation = new NoConstraintViolation();
    } 
  }
  return constraintViolation;
};
/**
 * @method 
 * @param {string} isbn - The ISBN of a book.
 */
Book.prototype.setIsbn = function (isbn) {
  var constraintViolation = Book.checkIsbnAsId( isbn);
  if (constraintViolation instanceof NoConstraintViolation) {
    this.isbn = isbn;
  } else {
    throw constraintViolation;
  }
};
/**
 * @method 
 * @static
 * @param {string} t - The title of a book.
 * @returns {ConstraintViolation|NoConstraintViolation} 
 */
Book.checkTitle = function (t) {
  if (!t) {
    return new MandatoryValueConstraintViolation(
        "A title must be provided!");
  } else if (typeof(t) !== "string" || t.trim() === "") {
    return new RangeConstraintViolation(
         "The title must be a non-empty string!");
  } else {
    return new NoConstraintViolation();
  }
};
/**
 * @method 
 * @param {string} t - The title of a book.
 */
Book.prototype.setTitle = function (t) {
  var constraintViolation = Book.checkTitle( t);
  if (constraintViolation instanceof NoConstraintViolation) {
    this.title = t;
  } else {
    throw constraintViolation;
  }
};
/**
 * @method 
 * @static
 * @param {string} y - The publication year of a book.
 * @returns {ConstraintViolation|NoConstraintViolation} 
 */
Book.checkYear = function (y) {
  if (!y) {
    return new MandatoryValueConstraintViolation(
        "A publication year must be provided!");
  } else {
    y = parseInt( y);
    if (isNaN( y)) {
      return new RangeConstraintViolation(
          "The value of year must be an integer!");
    } else if (y < 1459 || y > util.nextYear()) {
      return new IntervalConstraintViolation(
          "The value of year must be between 1459 and next year!");
    } else {
      return new NoConstraintViolation();
    }
  }
};
/**
 * @method 
 * @param {string} y - The publication year of a book.
 */
Book.prototype.setYear = function (y) {
  var constraintViolation = Book.checkYear( y);
  if (constraintViolation instanceof NoConstraintViolation) {
    this.year = parseInt( y);
  } else {
    throw constraintViolation;
  }
};
/**
 * Check if the given value represents a book category as defined by BookCategoryEL
 * @method 
 * @static
 * @param {number} c - The category of a book.
 * @returns {ConstraintViolation|NoConstraintViolation} 
 */
Book.checkCategory = function (c) {
  if (!c) {
    return new NoConstraintViolation();
  } else {
    if (!Number.isInteger( c) || c < 1 || c > BookCategoryEL.MAX) {
      return new RangeConstraintViolation(
          "The value of category must represent a book category!");
    } else {
      return new NoConstraintViolation();
    }
  }
};
/**
 * @method 
 * @param {number} c - The category of a book.
 */
Book.prototype.setCategory = function (c) {
  var constraintViolation = null;
  if (this.category) {  // already set/assigned
    constraintViolation = new FrozenValueConstraintViolation(
        "The category cannot be changed!");
  } else {
    c = parseInt( c);
    constraintViolation = Book.checkCategory( c);
  }
  if (constraintViolation instanceof NoConstraintViolation) {
    this.category = c;
  } else {
    throw constraintViolation;
  }
};
/**
 * Check if the attribute "subject area" applies to the given category of book
 * and if the value for it is admissible
 * @method 
 * @static
 * @param {string} sa - The subject area of a book.
 * @param {number} t - The category of a book.
 * @returns {ConstraintViolation|NoConstraintViolation} 
 */
Book.checkSubjectArea = function (sa,t) {
  if (t === undefined) t = BookCategoryEL.TEXTBOOK;
  if (t === BookCategoryEL.TEXTBOOK && !sa) {
    return new MandatoryValueConstraintViolation(
        "A subject area must be provided for a textbook!");
  } else if (t !== BookCategoryEL.TEXTBOOK && sa) {
    return new ConstraintViolation("A subject area must not " +
        "be provided if the book is not a textbook!");
  } else if (sa && (typeof(sa) !== "string" || sa.trim() === "")) {
    return new RangeConstraintViolation(
        "The subject area must be a non-empty string!");
  } else {
    return new NoConstraintViolation();
  }
};
/**
 * @method 
 * @param {string} sa - The subject area of a book.
 */
Book.prototype.setSubjectArea = function (sa) {
  var constraintViolation = Book.checkSubjectArea( sa, this.category);
  if (constraintViolation instanceof NoConstraintViolation) {
    this.subjectArea = sa;
  } else {
    throw constraintViolation;
  }
};
/**
 * @method 
 * @static
 * @param {string} a - The 'about' of a book.
 * @param {number} t - The category of a book.
 * @returns {ConstraintViolation|NoConstraintViolation} 
 */
Book.checkAbout = function (a,t) {
  if (t === undefined) t = BookCategoryEL.BIOGRAPHY;
  if (t === BookCategoryEL.BIOGRAPHY && !a) {
    return new MandatoryValueConstraintViolation(
        "A biography subject must be provided for a biography!");
  } else if (t !== BookCategoryEL.BIOGRAPHY && a) {
    return new ConstraintViolation(
        "A biography subject must not be provided if the book is not a biography!");
  } else if (a && (typeof(a) !== "string" || a.trim() === "")) {
    return new RangeConstraintViolation(
        "The biography subject's name must be a non-empty string!");
  } else {
    return new NoConstraintViolation();
  }
};
/**
 * @method 
 * @param {string} a - The 'about' of a book.
 */
Book.prototype.setAbout = function (a) {
  var constraintViolation = Book.checkAbout( a, this.category);
  if (constraintViolation instanceof NoConstraintViolation) {
    this.about = a;
  } else {
    throw constraintViolation;
  }
};
// ***********************************************
// *** Other Instance-Level Methods **************
// ***********************************************
/**
 * Serialize book object
 * @method 
 * @returns {string} 
 */
Book.prototype.toString = function () {
  var bookStr = "Book{ ISBN:"+ this.isbn +", title:"+ this.title +
      ", year:"+ this.year;
  switch (this.category) {
  case BookCategoryEL.TEXTBOOK: 
    bookStr += ", textbook subject area:"+ this.subjectArea;
    break;
  case BookCategoryEL.BIOGRAPHY: 
    bookStr += ", biography about: "+ this.about;
    break;
  }
  return bookStr +" }";
};
/**
 * Convert object to row
 * @method 
 * @returns {{isbn: string, title: string, year: number, category: ?number, subjectArea: ?string, about: ?string}} 
 */
Book.prototype.toRow = function () {
  var bookRow = util.cloneObject(this);
  return bookRow;
};
// *****************************************************
// *** Class-level ("static") methods ***
// *****************************************************
/**
 * Create a new Book row
 * @method 
 * @static
 * @param {{isbn: string, title: string, year: number, category: ?number, subjectArea: ?string, about: ?string}} slots - A record of parameters.
 */
Book.add = function (slots) {
  var book = null;
  try {
    book = new Book( slots);
  } catch (e) {
    console.log( e.constructor.name +": "+ e.message);
    book = null;
  }
  if (book) {
    Book.instances[book.isbn] = book;
    console.log( book.toString() + " created!");
  }
};
/**
 * Update an existing Book row
 * where the slots argument contains the slots to be updated and performing 
 * the updates with setters makes sure that the new values are validated
 * @method 
 * @static
 * @param {{isbn: string, title: string, year: number, category: ?number, subjectArea: ?string, about: ?string}} slots - A record of parameters.
 */
Book.update = function (slots) {
  var book = Book.instances[slots.isbn],
      noConstraintViolated = true,
      ending = "",
      updatedProperties = [],
      objectBeforeUpdate = util.cloneObject( book);  // save the current state of book
  try {
    if ("title" in slots && book.title !== slots.title) {
      book.setTitle( slots.title);
      updatedProperties.push("title");
    }
    if ("year" in slots && book.year !== slots.year) {
      book.setYear( slots.year);
      updatedProperties.push("year");
    }
    if ("category" in slots && book.category === undefined) {
      book.setCategory( slots.category);
      updatedProperties.push("category");
      switch (slots.category) {
      case BookCategoryEL.TEXTBOOK: 
        book.setSubjectArea( slots.subjectArea);
        updatedProperties.push("subjectArea");
        break;
      case BookCategoryEL.BIOGRAPHY: 
        book.setBiography( slots.biography);
        updatedProperties.push("biography");
        break;
      }
    }
    if ("subjectArea" in slots && "subjectArea" in book && 
            book.subjectArea !== slots.subjectArea) {
      book.setSubjectArea( slots.subjectArea);
      updatedProperties.push("subjectArea");
    }
    if ("about" in slots && "about" in book && 
            book.about !== slots.about) {
      book.setAbout( slots.about);
      updatedProperties.push("about");
    }
  } catch (e) {
    console.log( e.constructor.name +": "+ e.message);
    noConstraintViolated = false;
    // restore object to its previous state (before updating)
    Book.instances[slots.isbn] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log("Propert"+ending+" " + updatedProperties.toString() + 
          " modified for book " + book.isbn);
    } else {
      console.log("No property value changed for book " + book.isbn + " !");
    }
  }
};
/**
 * Delete an existing Book row
 * @method 
 * @static
 * @param {string} isbn - The ISBN of a book.
 */
Book.destroy = function (isbn) {
  if (Book.instances[isbn]) {
    console.log( Book.instances[isbn].toString() + " deleted!");
    delete Book.instances[isbn];
  } else {
    console.log("There is no book with ISBN " + isbn + " in the database!");
  }
};
/**
 * Load all book table rows and convert them to objects 
 * Precondition: publishers and people must be loaded first
 * @method 
 * @static
 */
Book.retrieveAll = function () {
  var bookKey="", bookKeys=[], books={}, book=null, i=0;
  try {
    if (!localStorage["books"]) {
      localStorage.setItem("books", JSON.stringify({}));
    } else {
      books = JSON.parse( localStorage["books"]);
      console.log( Object.keys( books).length +" books loaded.");
    }
  } catch (e) {
    alert("Error when reading from Local Storage\n" + e);        
  }
  bookKeys = Object.keys( books);
  for (i=0; i < bookKeys.length; i++) {
    bookKey = bookKeys[i];  // ISBN
    book = Book.convertRec2Obj( books[bookKey]);
    Book.instances[bookKey] = book;
  }
};
/**
 * Convert book row to book object
 * @method 
 * @static
 * @param {{isbn: string, title: string, year: number, category: ?number, subjectArea: ?string, about: ?string}} slots - A record of parameters.
 * @returns {object}
 */
Book.convertRec2Obj = function (bookRow) {
  var book=null;
  try {
    book = new Book( bookRow);
  } catch (e) {
    console.log( e.constructor.name + 
        " while deserializing a book row: " + e.message);
  }
  return book;
};
/**
 * Save all Book objects as rows
 * @method 
 * @static
 */
Book.saveAll = function () {
  var key="", books={}, book=null, i=0;  
  var keys = Object.keys( Book.instances);
  // convert the map of book objects (Book.instances)
  // to the map of corresponding rows (books)
  for (i=0; i < keys.length; i++) {
    key = keys[i];
    book = Book.instances[key];
    books[key] = book.toRow();
  }
  try {
    localStorage["books"] = JSON.stringify( books);
    console.log( keys.length +" books saved.");
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
  }
};
