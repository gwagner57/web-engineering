/**
 * @fileOverview  App-level controller code
 * @author Gerd Wagner
 */
/** 
 * Main namespace and subnamespace definitions
 * @namespace pl for "public library"
 */
var pl = {
    m: {}, 
    v: { books:{}, authors:{}, employees:{}},
    c: { books:{}, authors:{}, employees:{}}
};
pl.c.app = {
  initialize: function() {
  },
  generateTestData: function() {
    try {
      Book.instances["0553345842"] = new Book({isbn:"0553345842", title:"The Mind's I", year:1982});
      Book.instances["1463794762"] = new Book({isbn:"1463794762", title:"The Critique of Pure Reason", 
        year:2011});
      Book.instances["1928565379"] = new Book({isbn:"1928565379", title:"The Critique of Practical Reason", 
        year:2009, category:BookCategoryEL.TEXTBOOK, subjectArea:"Philosophy"});
      Book.instances["3498024914"] = new Book({isbn:"3498024914", title:"Kants Welt", 
        year:2003, category:BookCategoryEL.BIOGRAPHY, about:"Immanuel Kant"});
      Book.saveAll();
      Employee.instances["1001"] = new Employee({personId:1001, name:"Gerd Wagner", empNo:21035});
      Employee.instances["1002"] = new Employee({personId:1002, name:"Tom Boss", empNo:23107, 
          category:EmployeeCategoryEL.MANAGER, department:"Faculty 1"});
      Employee.saveAll();
      Author.instances["1001"] = new Author({personId:1001, name:"Gerd Wagner", biography:"Born in ..."});
      Author.instances["1077"] = new Author({personId:1077, name:"Immanuel Kant", biography:"Kant was ..."});
      Author.saveAll();
      Person.saveAll();
    } catch (e) {
      console.log( e.constructor.name + ": " + e.message);
    }
  },
  clearData: function() {
    try {
      Employee.instances = {};
      localStorage["employees"] = JSON.stringify({});
      Author.instances = {};
      localStorage["authors"] = JSON.stringify({});
      Book.instances = {};
      localStorage["books"] = JSON.stringify({});
      console.log("All data cleared.");
    } catch (e) {
      console.log( e.constructor.name + ": " + e.message);
    }
  }
};
