/**
 * @fileOverview  Contains various view functions for managing publishers
 * @author Gerd Wagner
 */
pl.v.publishers.manage = {
  setupUserInterface: function () {
    window.addEventListener("beforeunload", pl.v.publishers.manage.exit);
    pl.v.publishers.manage.refreshUI();
  },
  /** Exit the Manage Publishers UI page */
  exit: function () {
    Publisher.saveAll();
    // also save books because books may be updated/deleted when a publisher is deleted
    Book.saveAll();
  },
  /** Refresh the Manage Publishers UI */
  refreshUI: function () {
    // show the manage book UI and hide the other UIs
    document.getElementById("Publisher-M").style.display = "block";
    document.getElementById("Publisher-R").style.display = "none";
    document.getElementById("Publisher-C").style.display = "none";
    document.getElementById("Publisher-U").style.display = "none";
    document.getElementById("Publisher-D").style.display = "none";
  }
};
/**********************************************
* Use case Retrieve/List All Publishers
**********************************************/
pl.v.publishers.retrieveAndListAll = {
  setupUserInterface: function () {
    const tableBodyEl = document.querySelector("section#Publisher-R>table>tbody");
    tableBodyEl.innerHTML = "";
    for (let key of Object.keys( Publisher.instances)) {
      const publisher = Publisher.instances[key];
      const row = tableBodyEl.insertRow(-1);
      row.insertCell(-1).textContent = publisher.name;      
      row.insertCell(-1).textContent = publisher.address;
    }
    document.getElementById("Publisher-M").style.display = "none";
    document.getElementById("Publisher-R").style.display = "block";
  }
};
/**********************************************
 * Use case Create Publisher
**********************************************/
pl.v.publishers.create = {
  setupUserInterface: function () {
    const formEl = document.querySelector("section#Publisher-C>form"),
        saveButton = formEl.commit;
    // responsive validation of "name" as ID
    formEl.name.addEventListener("input", function () {
      formEl.name.setCustomValidity( 
          Publisher.checkNameAsId( formEl.name.value).message);
    });
    /*SIMPLIFIED CODE: no responsive validation of address */
    saveButton.addEventListener("click", function () {
      const slots = {
          name: formEl.name.value, 
          address: formEl.address.value
      };
      // check all input fields and show constraint violation messages
      formEl.name.setCustomValidity( Publisher.checkNameAsId( slots.name).message);
      /*SIMPLIFIED CODE: no before-submit validation of address */
      // save the input data only if all of the form fields are valid
      if (formEl.checkValidity()) Publisher.add( slots);
    });
    // neutralize the submit event
    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      formEl.reset();
    });
    document.getElementById("Publisher-M").style.display = "none";
    document.getElementById("Publisher-C").style.display = "block";
    formEl.reset();
  }
};
/**********************************************
 * Use case Update Publisher
**********************************************/
pl.v.publishers.update = {
  setupUserInterface: function () {
    const formEl = document.querySelector("section#Publisher-U > form"),
        saveButton = formEl.commit,
        selectPublisherEl = formEl.selectPublisher;
    // set up the publisher selection list
    util.fillSelectWithOptions( selectPublisherEl, Publisher.instances, "name");
    selectPublisherEl.addEventListener("change",
        pl.v.publishers.update.handlePublisherSelectChangeEvent);
    // validate constraints on new user input
    /*SIMPLIFIED CODE: no responsive validation of address */
    // ON Save, IF no constraint is violated, update the publisher record
    saveButton.addEventListener("click", function () {
      const slots = {
          name: formEl.name.value, 
          address: formEl.address.value
      };
      /*SIMPLIFIED CODE: no before-submit validation of address */
      // save the form fields input data only if all of them are valid
      if (formEl.checkValidity()) Publisher.update( slots);
    });
    // neutralize the submit event
    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      formEl.reset();
    });
    document.getElementById("Publisher-M").style.display = "none";
    document.getElementById("Publisher-U").style.display = "block";
    formEl.reset();
  },
  /**
   * handle publisher selection events
   * when a publisher is selected, populate the form with the data of the selected publisher
   */
  handlePublisherSelectChangeEvent: function () {
    var formEl = document.querySelector("section#Publisher-U > form");
    var key="", publ=null;
    key = formEl.selectPublisher.value;
    if (key !== "") {
      publ = Publisher.instances[key];
      formEl.name.value = publ.name;
      formEl.address.value = publ.address || "";
    } else {
      formEl.reset();
    }
  }
};
/**********************************************
 * Use case Delete Publisher
**********************************************/
pl.v.publishers.destroy = {
  setupUserInterface: function () {
    const formEl = document.querySelector("section#Publisher-D > form"),
        deleteButton = formEl.commit,
        selectPublisherEl = formEl.selectPublisher;
    // set up the publisher selection list
    util.fillSelectWithOptions( selectPublisherEl, Publisher.instances, "name");
    deleteButton.addEventListener("click", function () {
      const publisher_id = formEl.selectPublisher.value;
        if (!publisher_id) return;
        if (confirm("Do you really want to delete the publisher "+ publisher_id +"?")) {
          Publisher.destroy( publisher_id);
          selectPublisherEl.remove( formEl.selectPublisher.selectedIndex);
        }
    });
    // neutralize the submit event
    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      formEl.reset();
    });
    document.getElementById("Publisher-M").style.display = "none";
    document.getElementById("Publisher-D").style.display = "block";
  }
};