/**
 * @fileOverview  The model class Author with attribute definitions, (class-level) check methods, 
 *                setter methods, and the special methods saveAll and retrieveAll
 * @author Gerd Wagner
 * @copyright Copyright � 2013-2014 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany. 
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is", 
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */

// ***********************************************
// *** Constructor with property definitions ****
// ***********************************************
function Author( slots) {
  // set the default values for the parameter-free default constructor
  Person.call( this);  // invoke the default constructor of the supertype
  this.biography = "";     // string

  // constructor invocation with arguments
  if (arguments.length > 0) {
    Person.call( this, slots);  // invoke the constructor of the supertype
    this.setBiography( slots.biography);
  }
};
Author.prototype = Object.create( Person.prototype);  // inherit from Person
Author.prototype.constructor = Author;  // adjust the constructor property

// *****************************************************
// *** Class-level ("static") properties ***
// *****************************************************
Author.instances = {};

// ***********************************************
// *** Checks and Setters ************************
// ***********************************************
Author.checkBiography = function (b) {
  if (!b) {
    return new MandatoryValueConstraintViolation("A biography must be provided!");
  } else if (typeof(b) !== "string" || b.trim() === "") {
    return new RangeConstraintViolation("The biography must be a non-empty string!");
  } else {
    return new NoConstraintViolation();
  }
};
Author.prototype.setBiography = function (b) {
  var constraintViolation = Author.checkBiography( b);
  if (constraintViolation instanceof NoConstraintViolation) {
    this.biography = b;
  } else {
    throw constraintViolation;
  }
};
// ***********************************************
// *** Methods ***********************************
// ***********************************************
/**
 *  Convert author object to row/record
 *  without supertype slots
 */
Author.prototype.toRow = function () {
  var authorRow = util.cloneObject( this);
  return authorRow;
};
// *****************************************************
// *** Class-level ("static") methods ***
// *****************************************************
/**
 *  Create a new author row
 */
Author.add = function (slots) {
  var author = null;
  try {
    author = new Author( slots);
  } catch (e) {
    console.log( e.constructor.name + ": " + e.message);
    author = null;
  }
  if (author) {
    Author.instances[String(author.personId)] = author;
    console.log("Saved: " + author.name);
  }
};
/**
 *  Update an existing author row
 */
Author.update = function (slots) {
  var author = Author.instances[String(slots.personId)],
      noConstraintViolated = true,
      ending = "",
      updatedProperties = [],
      objectBeforeUpdate = util.cloneObject( author);
  try {
    if ("name" in slots && author.name !== slots.name) {
      author.setName( slots.name);
      updatedProperties.push("name");
    }
    if ("biography" in slots && author.biography !== slots.biography) {
      author.setBiography( slots.biography);
      updatedProperties.push("biography");
    }
  } catch (e) {
    console.log( e.constructor.name + ": " + e.message);
    noConstraintViolated = false;
    // restore object to its state before updating
    Author.instances[String(slots.personId)] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log("Propert"+ending+" " + updatedProperties.toString() + " modified for author " + author.name);
    } else {
      console.log("No property value changed for author " + author.name + " !");
    }
  }
};
/**
 *  Delete an existing author row
 */
Author.destroy = function (id) {
  var authorKey = String(id),
      author = Author.instances[authorKey];
  delete Author.instances[authorKey];
  console.log("Author " + author.name + " deleted.");
};
/**
 *  Load all author rows and convert them to objects
 */
Author.retrieveAll = function () {
  var key="", keys=[], authors={}, people={}, authorRow={}, i=0;
  if (!localStorage["authors"]) {
	    localStorage.setItem("authors", JSON.stringify({}));
  }  
  try {
    people = JSON.parse( localStorage["people"]);
    authors = JSON.parse( localStorage["authors"]);
  } catch (e) {
    console.log("Error when reading from Local Storage\n" + e);        
  }
  keys = Object.keys( authors);
  console.log( keys.length +" authors loaded.");
  for (i=0; i < keys.length; i++) {
    key = keys[i];
    authorRow = authors[key];
    // complete author record by adding name from supertable
    authorRow.name = people[key].name;
    Author.instances[key] = Author.convertRec2Obj( authorRow);
  }
};
/**
 *  Convert author row to author object
 */
Author.convertRec2Obj = function (authorRow) {
  var author={};
  try {
    author = new Author( authorRow);
  } catch (e) {
    console.log( e.constructor.name + " while deserializing an author row: " + e.message);
    author = null;
  }
  return author;
};
/**
 *  Save all author objects as rows
 */
Author.saveAll = function () {
  var key="", authors={}, author={}, authorRow={}, i=0;
  var keys = Object.keys( Author.instances);
  for (i=0; i < keys.length; i++) {
    key = keys[i];
    author = Author.instances[key];
    authorRow = author.toRow();
    // remove "name" slot as a supertype slot
    delete authorRow.name;
    authors[key] = authorRow;
  }
  try {
    localStorage["authors"] = JSON.stringify( authors);
    console.log( keys.length +" authors saved.");
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
  }
};
