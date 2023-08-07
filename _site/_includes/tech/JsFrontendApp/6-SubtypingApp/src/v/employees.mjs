/**
 * @fileOverview  View code of UI for managing Employee data
 * @author Gerd Wagner
 * @copyright Copyright 2013-2021 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is",
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Employee, { EmployeeCategoryEL } from "../m/Employee.mjs";
import Person from "../m/Person.mjs";
import { displaySegmentFields, undisplayAllSegmentFields } from "./app.mjs"
import { fillSelectWithOptions } from "../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
Employee.retrieveAll();

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
  Employee.saveAll();
});

/**********************************************
 * Use case List Employees
**********************************************/
document.getElementById("RetrieveAndListAll").addEventListener("click", function () {
  const tableBodyEl = document.querySelector("section#Employee-R>table>tbody");
  // reset view table (drop its previous contents)
  tableBodyEl.innerHTML = "";
  // populate view table
  for (const key of Object.keys( Employee.instances)) {
    const employee = Employee.instances[key];
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = employee.personId;
    row.insertCell().textContent = employee.name;
    row.insertCell().textContent = employee.empNo;
    if (employee.category === EmployeeCategoryEL.MANAGER) {
      row.insertCell().textContent = `Manager of ${employee.department} department`;
    }
  }
  document.getElementById("Employee-M").style.display = "none";
  document.getElementById("Employee-R").style.display = "block";
});

/**********************************************
 * Use case Create Employee
**********************************************/
const createFormEl = document.querySelector("section#Employee-C > form");
const crtSelCategoryEl = createFormEl.selectCategory;
//----- set up event handler for menu item "Create" -----------
document.getElementById("Create").addEventListener("click", function () {
  document.getElementById("Employee-M").style.display = "none";
  document.getElementById("Employee-C").style.display = "block";
  createFormEl.reset();
});
// set up event handlers for responsive constraint validation
createFormEl.personId.addEventListener("input", function () {
  createFormEl.personId.setCustomValidity(
    Person.checkPersonIdAsId( createFormEl.personId.value, Employee).message);
});
/* SIMPLIFIED CODE: no responsive validation of name and biography */

// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const categoryStr = createFormEl.selectCategory.value;
  const slots = {
    personId: createFormEl.personId.value,
    name: createFormEl.name.value,
    empNo: createFormEl.empNo.value
  };
  if (categoryStr) {
    // convert array index to enum index
    slots.category = parseInt( categoryStr) + 1;
    switch (slots.category) {
      case EmployeeCategoryEL.MANAGER:
        slots.department = createFormEl.department.value;
        createFormEl.department.setCustomValidity(
          Employee.checkDepartment( createFormEl.department.value, slots.category).message);
        break;
    }
  }
  // check all input fields and show error messages
  createFormEl.personId.setCustomValidity(
    Person.checkPersonIdAsId( slots.personId).message, Employee);
  /* SIMPLIFIED CODE: no before-submit validation of name */
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) Employee.add( slots);
});
// define event listener for pre-filling superclass attributes
createFormEl.personId.addEventListener("change", function () {
  const persId = createFormEl.personId.value;
  if (persId in Person.instances) {
    createFormEl.name.value = Person.instances[persId].name;
    // set focus to next field
    createFormEl.empNo.focus();
  }
});

/* Incomplete code: no responsive validation of "name" and "empNo" */
// set up the employee category selection list
fillSelectWithOptions( crtSelCategoryEl, EmployeeCategoryEL.labels);
crtSelCategoryEl.addEventListener("change", handleCategorySelectChangeEvent);

/**********************************************
 * Use case Update Employee
**********************************************/
const updateFormEl = document.querySelector("section#Employee-U > form"),
      updSelEmployeeEl = updateFormEl.selectEmployee,
      updSelCategoryEl = updateFormEl.selectCategory;
//----- set up event handler for menu item "Update" -----------
document.getElementById("Update").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  updSelEmployeeEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( updSelEmployeeEl, Employee.instances,
      "personId", {displayProp:"name"});
  document.getElementById("Employee-M").style.display = "none";
  document.getElementById("Employee-U").style.display = "block";
  updateFormEl.reset();
});
// handle change events on employee select element
updSelEmployeeEl.addEventListener("change", handleEmployeeSelectChangeEvent);
// set up the employee category selection list
fillSelectWithOptions( updSelCategoryEl, EmployeeCategoryEL.labels);

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const categoryStr = updateFormEl.selectCategory.value;
  const employeeIdRef = updSelEmployeeEl.value;
  if (!employeeIdRef) return;
  const slots = {
    personId: updateFormEl.personId.value,
    name: updateFormEl.name.value,
    empNo: updateFormEl.empNo.value
  }
  if (categoryStr) {
    // convert array index to enum index
    slots.category = parseInt( categoryStr) + 1;
    if (slots.category === EmployeeCategoryEL.MANAGER) {
      slots.department = updateFormEl.department.value;
      updateFormEl.department.setCustomValidity(
        Employee.checkDepartment( updateFormEl.department.value, slots.category).message);
    }
  }
  // check all property constraints
  /*SIMPLIFIED CODE: no before-save validation of name */
  // save the input data only if all of the form fields are valid
  if (updSelEmployeeEl.checkValidity()) {
    Employee.update( slots);
    // update the author selection list's option element
    updSelEmployeeEl.options[updSelEmployeeEl.selectedIndex].text = slots.name;
  }
  updSelCategoryEl.addEventListener("change", handleCategorySelectChangeEvent);
});
/**
 * handle employee selection events
 * on selection, populate the form with the data of the selected employee
 */
function handleEmployeeSelectChangeEvent() {
  const key = updateFormEl.selectEmployee.value;
  if (key) {
    const emp = Employee.instances[key];
    updateFormEl.personId.value = emp.personId;
    updateFormEl.name.value = emp.name;
    updateFormEl.empNo.value = emp.empNo;
    if (emp.category) {
      updateFormEl.selectCategory.selectedIndex = parseInt( emp.category);
      displaySegmentFields( updateFormEl, EmployeeCategoryEL.labels, emp.category);
      switch (emp.category) {
      case EmployeeCategoryEL.MANAGER:
        updateFormEl.department.value = emp.department;
        break;
      }
    } else {  // no emp.category
      updateFormEl.selectCategory.value = "";
      updateFormEl.department.value = "";
      undisplayAllSegmentFields( updateFormEl, EmployeeCategoryEL.labels);
    }
  } else {
    updateFormEl.reset();
  }
}

/**********************************************
 * Use case Delete Employee
**********************************************/
const deleteFormEl = document.querySelector("section#Employee-D > form");
const delSelEmployeeEl = deleteFormEl.selectEmployee;
//----- set up event handler for menu item "Delete" -----------
document.getElementById("Delete").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  delSelEmployeeEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( delSelEmployeeEl, Employee.instances,
    "personId", {displayProp:"name"});
  document.getElementById("Employee-M").style.display = "none";
  document.getElementById("Employee-D").style.display = "block";
  deleteFormEl.reset();
});
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
  const personIdRef = delSelEmployeeEl.value;
  if (!personIdRef) return;
  if (confirm("Do you really want to delete this employee?")) {
    Employee.destroy( personIdRef);
    delSelEmployeeEl.remove( delSelEmployeeEl.selectedIndex);
  }
});

/**********************************************
 * Refresh the Manage Employees Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage employee UI and hide the other UIs
  document.getElementById("Employee-M").style.display = "block";
  document.getElementById("Employee-R").style.display = "none";
  document.getElementById("Employee-C").style.display = "none";
  document.getElementById("Employee-U").style.display = "none";
  document.getElementById("Employee-D").style.display = "none";
}

/**
 * event handler for employee category selection events
 * used both in create and update
 */
function handleCategorySelectChangeEvent( e) {
  var formEl = e.currentTarget.form,
    categoryIndexStr = formEl.selectCategory.value,  // the array index of EmployeeCategoryEL.labels
    category = 0;
  if (categoryIndexStr) {
    // convert array index to enum index
    category = parseInt(categoryIndexStr) + 1;
    switch (category) {
      case EmployeeCategoryEL.MANAGER:
        formEl.department.addEventListener("input", function () {
          formEl.department.setCustomValidity(
            Employee.checkDepartment(formEl.department.value, category).message);
        });
        break;
    }
    displaySegmentFields(formEl, EmployeeCategoryEL.labels, category);
  } else {
    undisplayAllSegmentFields(formEl, EmployeeCategoryEL.labels);
  }
}

// Set up Manage Employees UI
refreshManageDataUI();
