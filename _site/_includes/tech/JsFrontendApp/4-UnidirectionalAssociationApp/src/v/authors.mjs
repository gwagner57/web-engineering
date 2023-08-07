/**
 * @fileOverview  View code of UI for managing Author data
 * @author Gerd Wagner
 */
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Author from "../m/Author.mjs";
import Publisher from "../m/Publisher.mjs";
import Book from "../m/Book.mjs";
import { fillSelectWithOptions } from "../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
Author.retrieveAll();
Publisher.retrieveAll();
Book.retrieveAll();

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
// set up back-to-menu buttons for all use cases
for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener('click', function () {refreshManageDataUI();});
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
  // also save books because books may be deleted when an author is deleted
  Book.saveAll();
});

/**********************************************
 Use case Retrieve and List All Authors
 **********************************************/
document.getElementById("RetrieveAndListAll")
    .addEventListener("click", function () {
  const tableBodyEl = document.querySelector("section#Author-R > table > tbody");
  tableBodyEl.innerHTML = "";
  for (const key of Object.keys( Author.instances)) {
    const author = Author.instances[key];
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = author.authorId;
    row.insertCell().textContent = author.name;
  }
  document.getElementById("Author-M").style.display = "none";
  document.getElementById("Author-R").style.display = "block";
});

/**********************************************
 Use case Create Author
 **********************************************/
const createFormEl = document.querySelector("section#Author-C > form");
document.getElementById("Create").addEventListener("click", function () {
  document.getElementById("Author-M").style.display = "none";
  document.getElementById("Author-C").style.display = "block";
  createFormEl.reset();
});
// set up event handlers for responsive constraint validation
createFormEl.authorId.addEventListener("input", function () {
  createFormEl.authorId.setCustomValidity(
      Author.checkAuthorIdAsId( createFormEl.authorId.value).message);
});
/* SIMPLIFIED CODE: no responsive validation of name */

// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const slots = {
    authorId: createFormEl.authorId.value,
    name: createFormEl.name.value
  };
  // check all input fields and show error messages
  createFormEl.authorId.setCustomValidity(
      Author.checkAuthorIdAsId( slots.authorId).message);
  /* SIMPLIFIED CODE: no before-submit validation of name */
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) Author.add( slots);
});

/**********************************************
 Use case Update Author
 **********************************************/
const updateFormEl = document.querySelector("section#Author-U > form");
const updSelAuthorEl = updateFormEl.selectAuthor;
// handle click event for the menu item "Update"
document.getElementById("Update").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  updSelAuthorEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( updSelAuthorEl, Author.instances,
      "authorId", {displayProp:"name"});
  document.getElementById("Author-M").style.display = "none";
  document.getElementById("Author-U").style.display = "block";
  updateFormEl.reset();
});
updSelAuthorEl.addEventListener("change", handleAuthorSelectChangeEvent);

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const authorIdRef = updSelAuthorEl.value;
  if (!authorIdRef) return;
  const slots = {
    authorId: updateFormEl.authorId.value,
    name: updateFormEl.name.value
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
function handleAuthorSelectChangeEvent () {
  const key = updateFormEl.selectAuthor.value;
  if (key) {
    const auth = Author.instances[key];
    updateFormEl.authorId.value = auth.authorId;
    updateFormEl.name.value = auth.name;
  } else {
    updateFormEl.reset();
  }
}

/**********************************************
 Use case Delete Author
 **********************************************/
const deleteFormEl = document.querySelector("section#Author-D > form");
const delSelAuthorEl = deleteFormEl.selectAuthor;
document.getElementById("Delete").addEventListener("click", function () {
  document.getElementById("Author-M").style.display = "none";
  document.getElementById("Author-D").style.display = "block";
  // reset selection list (drop its previous contents)
  delSelAuthorEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( delSelAuthorEl, Author.instances,
      "authorId", {displayProp:"name"});
  deleteFormEl.reset();
});
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
  const authorIdRef = delSelAuthorEl.value;
  if (!authorIdRef) return;
  if (confirm("Do you really want to delete this author?")) {
    Author.destroy( authorIdRef);
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
