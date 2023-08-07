/**
 * @fileOverview  The model class Book with attribute definitions and storage management methods
 * @author Gerd Wagner
 * @copyright Copyright � 2014-2015 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is",
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
/**
 * Enumerations
 */
var LanguageEL = new Enumeration({"en":"English", "de":"German",
    "fr":"French","es":"Spanish"});
var BookCategoryEL = new Enumeration(["novel","biography",
    "textbook","other"]);
var PublicationFormEL = new Enumeration(["hardcover","paperback",
    "ePub","PDF"]);
/**
 * The class Book
 * @class
 * @param {object} slots - Object creation slots.
 */
class Book {
  constructor (slots) {
    // assign default values to mandatory properties
    this._isbn = "";   // string
    this._title = "";  // string
    this._originalLanguage = 0;  // enum value (from LanguageEL)
    this._otherAvailableLanguages = [];  // list of enum values
    this._category = 0;  // number (from BookCategoryEL)
    this._publicationForms = [];  // list of enum values
    // is constructor invoked with a non-empty slots argument?
    if (typeof slots === "object" && Object.keys( slots).length > 0) {
      // assign properties by invoking implicit setters
      this.isbn = slots.isbn;
      this.title = slots.title;
      this.originalLanguage = slots.originalLanguage;
      this.otherAvailableLanguages = slots.otherAvailableLanguages;
      this.category = slots.category;
      this.publicationForms = slots.publicationForms;
    }
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
            "There is already a book record with this ISBN!");
      } else {
        validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  }
  set isbn( n) {
    const validationResult = Book.checkIsbnAsId( n);
    if (validationResult instanceof NoConstraintViolation) {
      this._isbn = n;
    } else {
      throw validationResult;
    }
  }
  get title() {
    return this._title;
  }
  static checkTitle( t) {
    if (t === undefined || t === "") {
      return new MandatoryValueConstraintViolation(
          "A title must be provided!");
    } else if (!util.isNonEmptyString(t)) {
      return new RangeConstraintViolation(
          "The title must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }
  set title( t) {
    const validationResult = Book.checkTitle( t);
    if (validationResult instanceof NoConstraintViolation) {
      this._title = t;
    } else {
      throw validationResult;
    }
  }
  get originalLanguage() {
    return this._originalLanguage;
  }
  static checkOriginalLanguage( ol) {
    if (ol === undefined || ol === "") {
      return new MandatoryValueConstraintViolation(
          "An original language must be provided!");
    } else if (!util.isIntegerOrIntegerString(ol) ||
        parseInt(ol) < 1 || parseInt(ol) > LanguageEL.MAX) {
      return new RangeConstraintViolation(
          "Invalid value for original language: "+ ol);
    } else {
      return new NoConstraintViolation();
    }
  }
  set originalLanguage( ol) {
    const validationResult = Book.checkOriginalLanguage( ol);
    if (validationResult instanceof NoConstraintViolation) {
      this._originalLanguage = parseInt( ol);
    } else {
      throw validationResult;
    }
  }
  get otherAvailableLanguages() {
    return this._otherAvailableLanguages;
  }
  static checkOtherAvailableLanguage( oLang) {
    if (!Number.isInteger( oLang) || oLang < 1 ||
        oLang > LanguageEL.MAX) {
      return new RangeConstraintViolation(
          "Invalid value for other available language: "+ oLang);
    } else {
      return new NoConstraintViolation();
    }
  }
  static checkOtherAvailableLanguages( oLangs) {
    if (oLangs == undefined || (Array.isArray( oLangs) &&
        oLangs.length === 0)) {
      return new NoConstraintViolation();  // optional
    } else if (!Array.isArray( oLangs)) {
      return new RangeConstraintViolation(
          "The value of otherAvailableLanguages must be a list/array!");
    } else {
      for (let i=0; i < oLangs.length; i++) {
        const constraintViolation = Book.checkOtherAvailableLanguage( oLangs[i]);
        if (!(constraintViolation instanceof NoConstraintViolation)) {
          return constraintViolation;
        }
      }
      return new NoConstraintViolation();
    }
  }
  set otherAvailableLanguages( oLangs) {
    const constraintViolation = Book.checkOtherAvailableLanguages( oLangs);
    if (constraintViolation instanceof NoConstraintViolation) {
      this._otherAvailableLanguages = oLangs;
    } else {
      throw constraintViolation;
    }
  }
  get category() {
    return this._category;
  }
  static checkCategory( c) {
    if (c === undefined || c === "") {
      return new MandatoryValueConstraintViolation(
          "A category must be provided!");
    } else if (!util.isIntegerOrIntegerString(c) || parseInt(c) < 1 ||
        parseInt(c) > BookCategoryEL.MAX) {
      return new RangeConstraintViolation(
          "Invalid value for category: "+ c);
    } else {
      return new NoConstraintViolation();
    }
  }
  set category( c) {
    const validationResult = Book.checkCategory( c);
    if (validationResult instanceof NoConstraintViolation) {
      this._category = parseInt( c);
    } else {
      throw validationResult;
    }
  }
  get publicationForms() {
    return this._publicationForms;
  }
  static checkPublicationForm( p) {
    if (p === undefined) {
      return new MandatoryValueConstraintViolation(
          "No publication form provided!");
    } else if (!Number.isInteger( p) || p < 1 ||
        p > PublicationFormEL.MAX) {
      return new RangeConstraintViolation(
          "Invalid value for publication form: "+ p);
    } else {
      return new NoConstraintViolation();
    }
  }
  static checkPublicationForms( pubForms) {
    if (pubForms === undefined || (Array.isArray( pubForms) &&
        pubForms.length === 0)) {
      return new MandatoryValueConstraintViolation(
          "No publication form provided!");
    } else if (!Array.isArray( pubForms)) {
      return new RangeConstraintViolation(
          "The value of publicationForms must be an array!");
    } else {
      for (let i=0; i < pubForms.length; i++) {
        const validationResult = Book.checkPublicationForm( pubForms[i]);
        if (!(validationResult instanceof NoConstraintViolation)) {
          return validationResult;
        }
      }
      return new NoConstraintViolation();
    }
  }
  set publicationForms( pubForms) {
    const constraintViolation = Book.checkPublicationForms( pubForms);
    if (constraintViolation instanceof NoConstraintViolation) {
      this._publicationForms = pubForms;
    } else {
      throw constraintViolation;
    }
  }
  /*********************************************************
   ***  Other Instance-Level Methods  ***********************
   **********************************************************/
  toString() {
    return "Book{ ISBN:"+ this.isbn +", title:"+ this.title +
        ", originalLanguage:"+ this.originalLanguage +
        ", otherAvailableLanguages:"+
        this.otherAvailableLanguages.toString() +
        ", category:"+ this.category +
        ", publicationForms:"+
        this.publicationForms.toString() +"}";
  }
}
/*********************************************************
***  Class-level ("static") properties  ******************
**********************************************************/
Book.instances = {};  // an entity table (a map of entity records)

/*********************************************************
***  Class-level ("static") storage management methods ***
**********************************************************/
/**
 *  Create a new book row
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
 *  Update an existing book row
 */
Book.update = function (slots) {
  var book = Book.instances[slots.isbn],
      noConstraintViolated = true,
      updatedProperties = [],
      objectBeforeUpdate = util.cloneObject( book);
  try {
    if (book.title !== slots.title) {
      book.title = slots.title;
      updatedProperties.push("title");
    }
    if (book.originalLanguage !== slots.originalLanguage) {
      book.originalLanguage = slots.originalLanguage;
      updatedProperties.push("originalLanguage");
    }
    if (!book.otherAvailableLanguages.isEqualTo( 
        slots.otherAvailableLanguages)) {
      book.otherAvailableLanguages = slots.otherAvailableLanguages;
      updatedProperties.push("otherAvailableLanguages");
    }
    if (book.category !== slots.category) {
      book.category = slots.category;
      updatedProperties.push("category");
    }
    if (!book.publicationForms.isEqualTo( slots.publicationForms)) {
      book.publicationForms = slots.publicationForms;
      updatedProperties.push("publicationForms");
    }
  } catch (e) {
    console.log( e.constructor.name +": "+ e.message);
    noConstraintViolated = false;
    // restore object to its state before updating
    Book.instances[slots.isbn] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      console.log("Properties " + updatedProperties.toString() + 
          " modified for book " + slots.isbn);
    } else {
      console.log("No property value changed for book "+ 
          slots.isbn + " !");      
    }
  }
};
/**
 *  Delete a book
 */
Book.destroy = function (isbn) {
  if (Book.instances[isbn]) {
    console.log( Book.instances[isbn].toString() + " deleted!");
    delete Book.instances[isbn];
  } else {
    console.log("There is no book with ISBN " + isbn + 
        " in the database!");
  }
};
/**
 *  Convert row to object
 */
Book.convertRec2Obj = function (bookRow) {
  var book={};
  try {
    book = new Book( bookRow);
  } catch (e) {
    console.log( e.constructor.name + 
        " while deserializing a book row: " + e.message);
  }
  return book;
};
/**
 *  Load all book table rows and convert them to objects
 */
Book.retrieveAll = function () {
  var booksString="";
  try {
    if (localStorage["books"]) {
      booksString = localStorage["books"];
    }
  } catch (e) {
    alert("Error when reading from Local Storage\n" + e);
  }
  if (booksString) {
    const books = JSON.parse( booksString);
    const keys = Object.keys( books);
    const nmrOfBooks = keys.length;
    console.log( nmrOfBooks +" books loaded.");
    for (let i=0; i < nmrOfBooks; i++) {
      const key = keys[i];
      Book.instances[key] = Book.convertRec2Obj( books[key]);
    }
  }
};
/**
 *  Save all book objects
 */
Book.saveAll = function () {
  var error = false,
      nmrOfBooks = Object.keys( Book.instances).length;  
  try {
    let booksString = JSON.stringify( Book.instances);
    // convert internal to external property names by deleting the _
    booksString = booksString.replace(/"_/g,'"');
    localStorage["books"] = booksString;
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
    error = true;
  }
  if (!error) console.log( nmrOfBooks + " book records saved.");
};
/*******************************************
*** Auxiliary methods for testing **********
********************************************/
/**
 *  Create and save test data
 */
Book.generateTestData = function () {
  try {
    Book.instances["006251587X"] = new Book({isbn:"006251587X", 
        title:"Weaving the Web", originalLanguage:LanguageEL.EN, 
        otherAvailableLanguages:[LanguageEL.DE,LanguageEL.FR], 
        category:BookCategoryEL.NOVEL, 
        publicationForms: 
            [PublicationFormEL.EPUB,PublicationFormEL.PDF]});
    Book.instances["0465026567"] = new Book({isbn:"0465026567", 
        title:"Gödel, Escher, Bach", originalLanguage:LanguageEL.DE, 
        otherAvailableLanguages:[LanguageEL.FR], 
        category:BookCategoryEL.OTHER, 
        publicationForms:[PublicationFormEL.PDF]});
    Book.instances["0465030793"] = new Book({isbn:"0465030793", 
        title:"I Am A Strange Loop", originalLanguage:LanguageEL.EN, 
        otherAvailableLanguages:[], category:BookCategoryEL.TEXTBOOK, 
        publicationForms:[PublicationFormEL.EPUB]});
    Book.saveAll();
  } catch (e) {
    console.log( e.constructor.name + ": " + e.message);
  }
};
/* 
 * Clear data
 */
Book.clearData = function () {
  if (confirm("Do you really want to delete all book data?")) {
    Book.instances = {};
    localStorage["books"] = "{}";
  }
};
