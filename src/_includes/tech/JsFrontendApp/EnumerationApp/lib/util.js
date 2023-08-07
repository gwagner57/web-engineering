/**
 * @fileOverview  Defines utility procedures/functions   
 * @author Gerd Wagner
 *
 * converted to ES2015+
 * - fillSelectWithOptions
 * - createChoiceWidget
 */
var util = {
 /**
  * Verifies if a value represents an integer
  * @param {number} x
  * @return {boolean}
  */
  isNonEmptyString: function (x) {
    return typeof(x) === "string" && x.trim() !== "";
  },
 /**
  * Return the next year value (e.g. if now is 2013 the function will return 2014)
  * @return {number}  the integer representing the next year value
  */
  nextYear: function () {
    var date = new Date();
    return (date.getFullYear() + 1);
  }, 
  /**
   * Verifies if a value represents an integer
   * @param {number} x
   * @return {boolean}
   */
  isInteger: function (x) {
    return typeof(x) === "number" && x.toString().search(/^-?[0-9]+$/) == 0;
  },
 /**
  * Verifies if a value represents an integer or integer string
  * @param {string} x
  * @return {boolean}
  */
  isIntegerOrIntegerString: function (x) {
    return typeof(x) === "number" && x.toString().search(/^-?[0-9]+$/) == 0 ||
        typeof(x) === "string" && x.search(/^-?[0-9]+$/) == 0;
  },
  /**
   * Creates a "clone" of an object that is an instance of a model class
   *
   * @param {object} obj
   */
  cloneObject: function (obj) {
    var p="", val, 
        clone = Object.create( Object.getPrototypeOf(obj));
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        val = obj[p];
        if (typeof val === "number" ||
            typeof val === "string" ||
            typeof val === "boolean" ||
            val instanceof Date ||
            // typed object reference
            typeof val === "object" && !!val.constructor ||
            // list of data values
            Array.isArray( val) &&
              !val.some( function (el) {
                return typeof el === "object";
              }) ||
            // list of typed object references
            Array.isArray( val) &&
              val.every( function (el) {
                return (typeof el === "object" && !!el.constructor);
              })
            ) {
          if (Array.isArray( val)) clone[p] = val.slice(0);
          else clone[p] = val;
        }
        // else clone[p] = cloneObject(val);
      }
    }
    return clone;
  },
  /**
   * Create a DOM option element
   * 
   * @param {string} val
   * @param {string} txt 
   * @param {string} classValues [optional]
   * 
   * @return {object}
   */
  createOption: function( val, txt, classValues) {
    var el = document.createElement("option");
    el.value = val;
    el.text = txt || val;
    if (classValues) el.className = classValues;
    return el;
  },
  /**
   * Fill a select element with option elements created from a 
   * map of objects 
   *
   * @param {object} selectEl  A select(ion list) element
   * @param {object|array} selectionRange  A map of objects or an array list
   * @param {object} optPar [optional]  An optional parameter record including
   *     optPar.displayProp and optPar.selection
   */
  fillSelectWithOptions: function (selectEl, selectionRange, optPar) {
    // create option elements from object property values
    const options = Array.isArray( selectionRange) ? selectionRange :
        Object.keys( selectionRange);
    // delete old contents
    selectEl.innerHTML = "";
    for (let i=0; i < options.length; i++) {
      let optionEl=null;
      if (Array.isArray( selectionRange)) {
        optionEl = util.createOption( i+1, options[i]);
        if (selectEl.multiple && optPar && optPar.selection && 
            optPar.selection.includes(i+1)) {
          // flag the option element with this value as selected
          optionEl.selected = true;
        }      
      } else {
        const key = options[i];
        const obj = selectionRange[key];
        if (optPar && optPar.displayProp) {
          optionEl = util.createOption( key, obj[optPar.displayProp]);
        } else optionEl = util.createOption( key);
        // if invoked with a selection argument, flag the selected options
        if (selectEl.multiple && optPar && optPar.selection && 
            optPar.selection[key]) {
          // flag the option element with this value as selected
          optionEl.selected = true;
        }      
      }
      selectEl.add( optionEl);
    }
  },
   /**
    * Create a choice control (radio button or checkbox) element
    * 
    * @param {string} t  The type of choice control ("radio" or "checkbox")
    * @param {string} n  The name of the choice control input element
    * @param {string} v  The value of the choice control input element
    * @param {string} lbl  The label text of the choice control
    * @return {object}
    */
    createLabeledChoiceControl: function (t,n,v,lbl) {
      var ccEl = document.createElement("input"),
          lblEl = document.createElement("label");
      ccEl.type = t;
      ccEl.name = n;
      ccEl.value = v;
      lblEl.appendChild( ccEl);
      lblEl.appendChild( document.createTextNode( lbl));
      return lblEl;
    },
  /**
   * Create a choice widget in a given fieldset element.
   * A choice element is either an HTML radio button or an HTML checkbox.
   * @method 
   */
  createChoiceWidget: function (containerEl, fld, values, 
      choiceWidgetType, choiceItems, isMandatory) {
        choiceControls = containerEl.querySelectorAll("label");
    // remove old content
    for (let j=0; j < choiceControls.length; j++) {
      containerEl.removeChild( choiceControls[j]);
    }
    if (!containerEl.hasAttribute("data-bind")) {
      containerEl.setAttribute("data-bind", fld);
    }
	// for a mandatory radio button group initialze to first value
    if (choiceWidgetType === "radio" && isMandatory && values.length === 0) {
	  values[0] = 1;
    }
    if (values.length >= 1) {
      if (choiceWidgetType === "radio") {
        containerEl.setAttribute("data-value", values[0]);      
      } else {  // checkboxes
        containerEl.setAttribute("data-value", "["+ values.join() +"]");            
      }
    }
    for (let j=0; j < choiceItems.length; j++) {
      // button values = 1..n
      const el = util.createLabeledChoiceControl( choiceWidgetType, fld,
          j+1, choiceItems[j]);
      // mark the radio button or checkbox as selected/checked
      if (values.includes(j+1)) el.firstElementChild.checked = true;
      containerEl.appendChild( el);
      el.firstElementChild.addEventListener("click", function (e) {
        const btnEl = e.target;
        if (choiceWidgetType === "radio") {
          if (containerEl.getAttribute("data-value") !== btnEl.value) {
            containerEl.setAttribute("data-value", btnEl.value);
          } else if (!isMandatory) {
            // turn off radio button
            btnEl.checked = false;
            containerEl.setAttribute("data-value", "");
          }
        } else {  // checkbox
          let values = JSON.parse( containerEl.getAttribute("data-value")) || [];
          let i = values.indexOf( parseInt( btnEl.value));
          if (i > -1) {   
            values.splice(i, 1);  // delete from value list
          } else {  // add to value list 
            values.push( btnEl.value);
          }
          containerEl.setAttribute("data-value", "["+ values.join() +"]");            
        }
      });
    }
    return containerEl;
  }
};
