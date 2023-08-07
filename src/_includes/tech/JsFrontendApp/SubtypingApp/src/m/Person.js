/**
 * @fileOverview  The model class Person with property definitions, (class-level) check methods, 
 *                setter methods, and the special methods saveAll and retrieveAll
 * @author Gerd Wagner
 */

/**
 * Enumeration type
 * @global
 */
PersonTypeEL = new Enumeration(["Employee","Author"]);
// ***********************************************
// *** Constructor with property definitions ****
// ***********************************************
function Person( slots) {
  this.personId = 0;        // Number (Integer)
  this.name = "";           // String

  // constructor invocation with arguments
  if (arguments.length > 0) {
    this.setPersonId( slots.personId);
    this.setName( slots.name);
  }
};
// ***********************************************
// *** Checks and Setters ************************
// ***********************************************
Person.checkPersonId = function (id) {
  if (id === undefined) {  // this is okay, as we just check the syntax
    return new NoConstraintViolation();
  } else {
    // convert to integer in case of string
    id = parseInt( id);
    if (isNaN( id) || !Number.isInteger( id) || id < 1) {
      return new RangeConstraintViolation("The author ID must be a positive integer!");
    } else {
      return new NoConstraintViolation();
    }
  }
};
Person.checkPersonIdAsId = function (id, personOrSubclass) {
  var constraintViolation=null;
  id = parseInt( id);  // convert to integer in case of a string
  if (isNaN( id)) {
	  constraintViolation = new MandatoryValueConstraintViolation(
        "A value for the person ID is required!");
  } else {
    constraintViolation = Person.checkPersonId( id);
    if ((constraintViolation instanceof NoConstraintViolation)) {
      if (personOrSubclass.instances[String(id)]) {  // convert id to string if number
        constraintViolation = new UniquenessConstraintViolation(
            'There is already a '+ personOrSubclass.name +' record with this person ID!');
      }     	      	  
    }
  }
  return constraintViolation;
};
Person.prototype.setPersonId = function (id) {
  var constraintViolation = null;
  // this.constructor may be Person or any category of it
  constraintViolation = Person.checkPersonIdAsId( id, this.constructor);
  if (constraintViolation instanceof NoConstraintViolation) {
    this.personId = parseInt( id);
  } else {
    throw constraintViolation;
  }
};
Person.checkName = function (n) {
  if (!n) {
    return new MandatoryValueConstraintViolation("A name must be provided!");
  } else if (typeof(n) !== "string" || n.trim() === "") {
    return new RangeConstraintViolation("The name must be a non-empty string!");
  } else {
    return new NoConstraintViolation();
  }
};
Person.prototype.setName = function (n) {
  var constraintViolation = Person.checkName( n);
  if (constraintViolation instanceof NoConstraintViolation) {
    this.name = n;
  } else {
    throw constraintViolation;
  }
};

/**
 *  Save all person objects in an entity table (a map of entity records)
 *  by extracting their data from the Person subclasses Employee and Author
 */
Person.saveAll = function () {
  var key="", keys=[], people={}, i=0, n=0;
  keys = Object.keys( Employee.instances);
  for (i=0; i < keys.length; i++) {
    key = keys[i];
    emp = Employee.instances[key];
    people[key] = {personId: emp.personId, name:emp.name};
  }
  keys = Object.keys( Author.instances);
  for (i=0; i < keys.length; i++) {
    key = keys[i];
    if (!people[key]) {
      author = Author.instances[key];
      people[key] = {personId: author.personId, name: author.name};    	
    }
  }
  try {
    localStorage["people"] = JSON.stringify( people);
    n = Object.keys( people).length;
    console.log( n +" people saved.");
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
  }
};
