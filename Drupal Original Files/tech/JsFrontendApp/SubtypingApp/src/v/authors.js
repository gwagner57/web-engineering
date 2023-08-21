/**
 * @fileOverview  Contains various view functions for managing authors
 * @author Gerd Wagner
 */
pl.v.authors.manage = {
  /**
   * Set up the author management UI
   */
  setupUserInterface: function () {
    window.addEventListener("beforeunload", pl.v.authors.manage.exit);
  },
  /**
   * Exit the Manage Authors UI page
   * Save the current population of Author and generate the population of Person 
   * from Employee and Author
   */
  exit: function () {
    Author.saveAll();
    Person.saveAll();
  },
  /**
   * Refresh the Manage Authors UI
   */
  refreshUI: function () {
    // show the manage book UI and hide the other UIs
    document.getElementById("manageAuthors").style.display = "block";
    document.getElementById("listAuthors").style.display = "none";
    document.getElementById("createAuthor").style.display = "none";
    document.getElementById("updateAuthor").style.display = "none";
    document.getElementById("deleteAuthor").style.display = "none";
  }
};
/**********************************************
 * Use case List Authors
**********************************************/
pl.v.authors.list = {
  setupUserInterface: function () {
    var tableBodyEl = document.querySelector("div#listAuthors>table>tbody");
    var keys = Object.keys( Author.instances);
    var row=null, author=null, i=0;
    tableBodyEl.innerHTML = "";
    for (i=0; i < keys.length; i++) {
      author = Author.instances[keys[i]];
      row = tableBodyEl.insertRow(-1);
      row.insertCell(-1).textContent = author.personId;
      row.insertCell(-1).textContent = author.name;
      row.insertCell(-1).textContent = author.biography;
    }
    document.getElementById("manageAuthors").style.display = "none";
    document.getElementById("listAuthors").style.display = "block";
  }
};
/**********************************************
 * Use case Create Author
**********************************************/
pl.v.authors.create = {
  /**
   * initialize the createAuthorForm
   */
  setupUserInterface: function () {
    var formEl = document.forms['createAuthorForm'],
        submitButton = formEl.commit;
    formEl.personId.addEventListener("input", function () { 
      formEl.personId.setCustomValidity( 
          Person.checkPersonIdAsId( formEl.personId.value, Author).message);
    });
    formEl.name.addEventListener("input", function () { 
      formEl.name.setCustomValidity(
          Person.checkName( formEl.name.value).message);
    });
    formEl.biography.addEventListener("input", function () { 
      formEl.biography.setCustomValidity( 
          Author.checkBiography( formEl.biography.value).message);
    });
    submitButton.addEventListener("click", function (e) {
      var formEl = document.forms['createAuthorForm'];
      var slots = {
          personId: formEl.personId.value, 
          name: formEl.name.value,
          biography: formEl.biography.value
      };
      // check all input fields and provide error messages in case of constraint violations
      formEl.personId.setCustomValidity( 
          Person.checkPersonIdAsId( slots.personId, Author).message);
      formEl.name.setCustomValidity( Person.checkName( slots.name).message);
      formEl.biography.setCustomValidity( 
          Author.checkBiography( formEl.biography.value).message);
      // save the input data only if all of the form fields are valid
      if (formEl.checkValidity()) {
        Author.add( slots);
        formEl.reset();
      }
    });
    document.getElementById("manageAuthors").style.display = "none";
    document.getElementById("createAuthor").style.display = "block";
    formEl.reset();
  }
};
/**********************************************
 * Use case Update Author
**********************************************/
pl.v.authors.update = {
  /**
   * initialize the update books UI/form
   */
  setupUserInterface: function () {
    var formEl = document.forms['updateAuthorForm'],
        submitButton = formEl.commit,
        authorSelectEl = formEl.selectAuthor;
    // set up the author selection list
    util.fillAssocListWidgetSelectWithOptions( authorSelectEl, Author.instances, 
        "personId", {displayProp:"name"});
    authorSelectEl.addEventListener("change", 
        pl.v.authors.update.handleAuthorSelectChangeEvent);
    // validate constraints on new user input
    formEl.name.addEventListener("input", function () { 
      formEl.name.setCustomValidity(
          Person.checkName( formEl.name.value).message);
    });
    formEl.biography.addEventListener("input", function () { 
      formEl.biography.setCustomValidity( 
          Author.checkBiography( formEl.biography.value).message);
    });
    // neutralize the submit event
    formEl.addEventListener( 'submit', function (e) { 
        e.preventDefault();
        formEl.reset();
    });
    // when the update button is clicked and no constraint is violated, 
    // update the author record
    submitButton.addEventListener("click", function (e) {
      var formEl = document.forms['updateAuthorForm'];
      var slots = {
          personId: formEl.personId.value, 
          name: formEl.name.value,
          biography: formEl.biography.value
      };
      // check all relevant input fields and provide error messages 
      // in case of constraint violations
      formEl.name.setCustomValidity( Person.checkName( slots.name).message);
      formEl.biography.setCustomValidity( 
          Author.checkBiography( formEl.biography.value).message);
      // save the input data only if all of the form fields are valid
      if (formEl.checkValidity()) {
        Author.update( slots);
      }
    });
    document.getElementById("manageAuthors").style.display = "none";
    document.getElementById("updateAuthor").style.display = "block";
    formEl.reset();
  },
  /**
   * handle author selection events
   * when a author is selected, populate the form with the data of the selected author
   */
  handleAuthorSelectChangeEvent: function () {
    var formEl = document.forms['updateAuthorForm'];
    var key="", pers=null;
    key = formEl.selectAuthor.value;
    if (key !== "") {
      pers = Author.instances[key];
      formEl.personId.value = pers.personId;
      formEl.name.value = pers.name;
      formEl.biography.value = pers.biography;
    } else {
      formEl.reset();
    }
  }
};
/**********************************************
 * Use case Delete Author
**********************************************/
pl.v.authors.destroy = {
  /**
   * initialize the deleteAuthorForm
   */
  setupUserInterface: function () {
    var formEl = document.forms['deleteAuthorForm'],
        deleteButton = formEl.commit,
        authorSelectEl = formEl.selectAuthor;
    var msgAddendum="";
    // set up the author selection list
    util.fillAssocListWidgetSelectWithOptions( authorSelectEl, Author.instances, 
        "personId", {displayProp:"name"});
    deleteButton.addEventListener("click", function () {
        var formEl = document.forms['deleteAuthorForm'],
            personIdRef = formEl.selectAuthor.value;
        if (confirm("Do you really want to delete this author"+ msgAddendum +"?")) {
          Author.destroy( personIdRef);
          formEl.selectAuthor.remove( formEl.selectAuthor.selectedIndex);
          formEl.reset();
        };
    });
    document.getElementById("manageAuthors").style.display = "none";
    document.getElementById("deleteAuthor").style.display = "block";
  }
};