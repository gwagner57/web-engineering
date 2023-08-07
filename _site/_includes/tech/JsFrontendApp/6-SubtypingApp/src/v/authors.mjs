/**
 * @fileOverview  View code of UI for managing Author data
 * @author Gerd Wagner
 * @copyright Copyright 2013-2021 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is",
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Author from "../m/Author.mjs";
import Person from "../m/Person.mjs";
import { fillSelectWithOptions } from "../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
Author.retrieveAll();

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
// set up back-to-menu buttons for all use cases
for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener('click', refreshManageDataUI);
}
// neutralize the submit event for all use cases
for (const frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
  });
}
// save data when leaving the page
window.addEventListener("beforeunload", function () {
  Author.saveAll();
});

/**********************************************
 * Use case Retrieve/List Authors
**********************************************/
document.getElementById("RetrieveAndListAll").addEventListener("click", function () {
  const tableBodyEl = document.querySelector("section#Author-R > table > tbody");
  // reset view table (drop its previous contents)
  tableBodyEl.innerHTML = "";
  // populate view table
  for (const key of Object.keys( Author.instances)) {
    const author = Author.instances[key];
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = author.personId;
    row.insertCell().textContent = author.name;
    row.insertCell().textContent = author.biography;
  }
  document.getElementById("Author-M").style.display = "none";
  document.getElementById("Author-R").style.display = "block";
});

/**********************************************
 * Use case Create Author
**********************************************/
const createFormEl = document.querySelector("section#Author-C > form");
//----- set up event handler for menu item "Create" -----------
document.getElementById("Create").addEventListener("click", function () {
  document.getElementById("Author-M").style.display = "none";
  document.getElementById("Author-C").style.display = "block";
  createFormEl.reset();
});
// set up event handlers for responsive constraint validation
createFormEl.personId.addEventListener("input", function () {
  createFormEl.personId.setCustomValidity(
    Person.checkPersonIdAsId( createFormEl.personId.value, Author).message);
});
/* SIMPLIFIED CODE: no responsive validation of name and biography */

/**
 * handle save events
 */
createFormEl["commit"].addEventListener("click", function () {
  const slots = {
    personId: createFormEl.personId.value,
    name: createFormEl.name.value,
    biography: createFormEl.biography.value
  };
  // check all input fields and show error messages
  createFormEl.personId.setCustomValidity(
    Person.checkPersonIdAsId( slots.personId).message, Author);
  /* SIMPLIFIED CODE: no before-submit validation of name */
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) Author.add( slots);
});

/**********************************************
 * Use case Update Author
**********************************************/
const updateFormEl = document.querySelector("section#Author-U > form");
const updSelAuthorEl = updateFormEl.selectAuthor;
// handle click event for the menu item "Update"
document.getElementById("Update").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  updSelAuthorEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( updSelAuthorEl, Author.instances,
      "personId", {displayProp:"name"});
  document.getElementById("Author-M").style.display = "none";
  document.getElementById("Author-U").style.display = "block";
  updateFormEl.reset();
});
// handle change events on employee select element
updSelAuthorEl.addEventListener("change", handleAuthorSelectChangeEvent);

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const authorIdRef = updSelAuthorEl.value;
  if (!authorIdRef) return;
  const slots = {
    personId: updateFormEl.personId.value,
    name: updateFormEl.name.value,
    biography: updateFormEl.biography.value
  }
  // check all property constraints
  /* SIMPLIFIED CODE: no before-save validation of name */
  // save the input data only if all of the form fields are valid
  if (updSelAuthorEl.checkValidity()) {
    Author.update( slots);
    // update the author selection list's option element
    updSelAuthorEl.options[updSelAuthorEl.selectedIndex].text = slots.name;
  }
});
/**
 * handle author selection events
 * when a author is selected, populate the form with the data of the selected author
 */
function handleAuthorSelectChangeEvent() {
  const key = updSelAuthorEl.value;
  if (key) {
    const auth = Author.instances[key];
    updateFormEl.personId.value = auth.personId;
    updateFormEl.name.value = auth.name;
    updateFormEl.biography.value = auth.biography;
  } else {
    updateFormEl.reset();
  }
}

/**********************************************
 * Use case Delete Author
**********************************************/
const deleteFormEl = document.querySelector("section#Author-D > form");
const delSelAuthorEl = deleteFormEl.selectAuthor;
//----- set up event handler for Update button -------------------------
document.getElementById("Delete").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  delSelAuthorEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( delSelAuthorEl, Author.instances,
      "personId", {displayProp:"name"});
  document.getElementById("Author-M").style.display = "none";
  document.getElementById("Author-D").style.display = "block";
  deleteFormEl.reset();
});
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
  const personIdRef = delSelAuthorEl.value;
  if (!personIdRef) return;
  if (confirm("Do you really want to delete this author?")) {
    Author.destroy( personIdRef);
    delSelAuthorEl.remove( delSelAuthorEl.selectedIndex);
  }
});

/**********************************************
 * Refresh the Manage Authors Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage author UI and hide the other UIs
  document.getElementById("Author-M").style.display = "block";
  document.getElementById("Author-R").style.display = "none";
  document.getElementById("Author-C").style.display = "none";
  document.getElementById("Author-U").style.display = "none";
  document.getElementById("Author-D").style.display = "none";
}

// Set up Manage Authors UI
refreshManageDataUI();
