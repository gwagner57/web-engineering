/**
 * @fileOverview  The model class Publisher with property definitions, (class-level) check methods, 
 *                setter methods, and the special methods saveAll and retrieveAll
 * @author Gerd Wagner
 */

// ***********************************************
// *** Constructor with property definitions *****
// ***********************************************
class Publisher {
  constructor ({name, address}) {
    // assign properties by invoking implicit setters
    this.name = name;
    this.address = address;
    // derived inverse reference property (inverse of Book::publisher)
    this._publishedBooks = {};  // initialize as an empty map of Book objects
  }
  get name() {
    return this._name;
  }
  static checkName( n) {
    if (n === undefined) {
      return new NoConstraintViolation();  // not mandatory
    } else {
      if (typeof n !== "string" || n.trim() === "") {
        return new RangeConstraintViolation(
            "The name must be a non-empty string!");
      } else {
        return new NoConstraintViolation();
      }
    }
  }
  static checkNameAsId( n) {
    var constraintViolation = Publisher.checkName(n);
    if ((constraintViolation instanceof NoConstraintViolation)) {
      if (n === undefined) {
        return new MandatoryValueConstraintViolation(
            "A publisher name is required!");
      } else if (Publisher.instances[n]) {
        constraintViolation = new UniquenessConstraintViolation(
            "There is already a publisher record with this name!");
      } else {
        constraintViolation = new NoConstraintViolation();
      }
    }
    return constraintViolation;
  }
  static checkNameAsIdRef( n) {
    var constraintViolation = Publisher.checkName( n);
    if ((constraintViolation instanceof NoConstraintViolation) &&
        n !== undefined) {
      if (!Publisher.instances[n]) {
        constraintViolation = new ReferentialIntegrityConstraintViolation(
            "There is no publisher record with this name!");
      }
    }
    return constraintViolation;
  }
  set name( n) {
    var constraintViolation = Publisher.checkName( n);
    if (constraintViolation instanceof NoConstraintViolation) {
      this._name = n;
    } else {
      throw constraintViolation;
    }
  }
  get address() {
    return this._address;
  }
  //SIMPLIFIED CODE:  Publisher.checkAddress has not been defined
  set address( a) {
    //SIMPLIFIED/MISSING CODE:  invoke Publisher.checkAddress
    this._address = a;
  }
  get publishedBooks() {
    return this._publishedBooks;
  }
  toString() {
    return "Publisher{ name:" + this.name + ", address:" +
        this.address +"}";
  }
  /**
   *  Convert publisher object to row/record
   */
  toRecord() {
    var rec = {};
    // loop over all Publisher properties
    for (let p of Object.keys( this)) {
      // keep underscore-prefixed properties except "_publishedBooks"
      if (p.charAt(0) === "_" && p !== "_publishedBooks") {
        // remove underscore prefix
        rec[p.substr(1)] = this[p];
      }
    };
    return rec;
  }
}
// ***********************************************
// *** Class-level ("static") properties *********
// ***********************************************
Publisher.instances = {};

// *****************************************************
// *** Class-level ("static") methods ***
// *****************************************************
/**
 *  Create a new publisher row
 */
Publisher.add = function (slots) {
  var publisher = null;
  try {
    publisher = new Publisher( slots);
  } catch (e) {
    console.error( e.constructor.name + ": " + e.message);
    publisher = null;
  }
  if (publisher) {
    Publisher.instances[publisher.name] = publisher;
    console.log( publisher.toString() + " created!");
  }
};
/**
 *  Update an existing Publisher row
 */
Publisher.update = function (slots) {
  const publisher = Publisher.instances[slots.name],
      objectBeforeUpdate = util.cloneObject( publisher);
  var noConstraintViolated = true,
      ending="", updatedProperties=[];
  try {
    if ("address" in slots && publisher.address !== slots.address) {
      publisher.address = slots.address;
      updatedProperties.push("address");
    }
  } catch (e) {
    console.log( e.constructor.name + ": " + e.message);
    noConstraintViolated = false;
    // restore object to its state before updating
    Publisher.instances[slots.name] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log("Propert"+ending+" " + updatedProperties.toString() +
          " modified for publisher " + publisher.name);
    } else {
      console.log("No property value changed for publisher " + publisher.name + " !");
    }
  }
};
/**
 *  Delete an existing Publisher row
 */
Publisher.destroy = function (name) {
  const keys = Object.keys( Book.instances);
  var publisher = Publisher.instances[name];
  // delete all references to this publisher in book objects
  for (let i=0; i < keys.length; i++) {
    let book = Book.instances[keys[i]];
    if (book.publisher === publisher) delete book.publisher;
  }
  // delete the publisher record
  delete Publisher.instances[name];
  console.log("Publisher " + name + " deleted.");

};
/**
 *  Load all publisher rows and convert them to objects
 */
Publisher.retrieveAll = function () {
  var publishers={};
  if (!localStorage["publishers"]) localStorage["publishers"] = "{}";
  try {
    publishers = JSON.parse( localStorage["publishers"]);
  } catch (e) {
    console.error("Error when reading from Local Storage\n" + e);
    return;
  }
  for (let publName of Object.keys( publishers)) {
    try {
      Publisher.instances[publName] = new Publisher( publishers[publName]);
    } catch (e) {
      console.error(`${e.constructor.name} while deserializing publisher ${publName}: ${e.message}`);
    }
  }
  console.log( Object.keys( publishers).length +" publishers loaded.");
};
/**
 *  Save all publisher objects as rows
 */
Publisher.saveAll = function () {
  const keys = Object.keys( Publisher.instances);
  var publishers={};
  for (let key of keys) {
    let publisher = Publisher.instances[key];
    publishers[key] = publisher.toRecord();
  }
  try {
    localStorage["publishers"] = JSON.stringify( publishers);
    console.log( keys.length +" publisher records saved.");
  } catch (e) {
    console.error("Error when writing to Local Storage\n" + e);
  }
};
