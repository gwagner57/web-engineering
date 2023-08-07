/**
 * @fileOverview  Contains various view functions for managing authors
 * @author Gerd Wagner
 */
pl.v.authors.manage = {
  /** Set up the author management UI */
  setupUserInterface: function () {
    window.addEventListener("beforeunload", pl.v.authors.manage.exit);
    pl.v.authors.manage.refreshUI();
  },
  /** Exit the Manage Authors UI page */
  exit: function () {
    Author.saveAll();
    // also save books because books may be deleted when an author is deleted
    Book.saveAll();
  },
  /**
   * Refresh the Manage Authors UI
   */
  refreshUI: function () {
    // show the manage book UI and hide the other UIs
    document.getElementById("Author-M").style.display = "block";
    document.getElementById("Author-R").style.display = "none";
    document.getElementById("Author-C").style.display = "none";
    document.getElementById("Author-U").style.display = "none";
    document.getElementById("Author-D").style.display = "none";
  }
};
/**********************************************
 * Use case Retrieve and List All Authors
**********************************************/
pl.v.authors.retrieveAndListAll = {
  setupUserInterface: function () {
    const tableBodyEl = document.querySelector("section#Author-R>table>tbody");
    tableBodyEl.innerHTML = "";
    for (let key of Object.keys( Author.instances)) {
      const author = Author.instances[key];
      const row = tableBodyEl.insertRow(-1);
      row.insertCell(-1).textContent = author.authorId;
      row.insertCell(-1).textContent = author.name;
      // create list of books authored by this author
      listEl = util.createListFromMap( author.authoredBooks, "title");
      row.insertCell(-1).appendChild( listEl);
    }
    document.getElementById("Author-M").style.display = "none";
    document.getElementById("Author-R").style.display = "block";
  }
};
/**********************************************
 * Use case Create Author
**********************************************/
pl.v.authors.create = {
  setupUserInterface: function () {
    const formEl = document.querySelector("section#Author-C > form"),
        saveButton = formEl.commit;
    formEl.authorId.addEventListener("input", function () {
      formEl.authorId.setCustomValidity( 
          Author.checkAuthorIdAsId( formEl.authorId.value).message);
    });
    /*SIMPLIFIED CODE: no responsive validation of name */
    saveButton.addEventListener("click", function (e) {
      const slots = {
        authorId: formEl.authorId.value,
        name: formEl.name.value
      };
      // check all input fields and provide error messages in case of constraint violations
      formEl.authorId.setCustomValidity( 
          Author.checkAuthorIdAsId( slots.authorId).message);
      /*SIMPLIFIED CODE: no before-submit validation of name */
      // save the input data only if all of the form fields are valid
      if (formEl.checkValidity()) Author.add( slots);
    });
    // neutralize the submit event
    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      formEl.reset();
    });
    document.getElementById("Author-M").style.display = "none";
    document.getElementById("Author-C").style.display = "block";
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
    const formEl = document.querySelector("section#Author-U > form"),
        saveButton = formEl.commit,
        selectAuthorEl = formEl.selectAuthor;
    // set up the author selection list
    util.fillSelectWithOptions( selectAuthorEl, Author.instances,
        "authorId", {displayProp:"name"});
    selectAuthorEl.addEventListener("change",
        pl.v.authors.update.handleAuthorSelectChangeEvent);
    // validate constraints on new user input
    /*SIMPLIFIED CODE: no responsive validation of name */
    saveButton.addEventListener("click", function (e) {
      const slots = {
        authorId: formEl.authorId.value,
        name: formEl.name.value
      };
      // check all property constraints
      /*SIMPLIFIED CODE: no before-save validation of name */
      // save the input data only if all of the form fields are valid
      if (formEl.checkValidity()) {
        Author.update( slots);
        // update the author selection list's option element
        selectAuthorEl.options[selectAuthorEl.selectedIndex].text = slots.name;
      }
    });
    // neutralize the submit event
    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      formEl.reset();
    });
    document.getElementById("Author-M").style.display = "none";
    document.getElementById("Author-U").style.display = "block";
    formEl.reset();
  },
  /**
   * handle author selection events
   * when a author is selected, populate the form with the data of the selected author
   */
  handleAuthorSelectChangeEvent: function () {
    const formEl = document.querySelector("section#Author-U > form");
    var key="", auth=null;
    key = formEl.selectAuthor.value;
    if (key !== "") {
      auth = Author.instances[key];
      formEl.authorId.value = auth.authorId;
      formEl.name.value = auth.name;
    } else {
      formEl.reset();
    }
  }
};
/**********************************************
 * Use case Delete Author
**********************************************/
pl.v.authors.destroy = {
  setupUserInterface: function () {
    const formEl = document.querySelector("section#Author-D > form"),
        deleteButton = formEl.commit,
        selectAuthorEl = formEl.selectAuthor;
    // set up the author selection list
    util.fillSelectWithOptions( selectAuthorEl, Author.instances,
        "authorId", {displayProp:"name"});
    deleteButton.addEventListener("click", function () {
        var authorIdRef = formEl.selectAuthor.value;
        if (confirm("Do you really want to delete this author?")) {
          Author.destroy( authorIdRef);
          formEl.selectAuthor.remove( formEl.selectAuthor.selectedIndex);
        }
    });
    // neutralize the submit event
    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      formEl.reset();
    });
    document.getElementById("Author-M").style.display = "none";
    document.getElementById("Author-D").style.display = "block";
  }
};