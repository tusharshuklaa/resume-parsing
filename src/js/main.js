/**
 * All of the main plugins within ResumeParsing Object can be accessed globally like: ResumeParsing.Main.PUBLIC_FUNCTION()
 * 
 * To make a private function public, assign the function to property of first passed parameter to the plugin
 * with same name as the private function
 * 
 * NOTE: Variables, Constants or Function names that start with an _ (Underscore) are private and are not accesible globally
 * In order to use these functions globally, make them a Public Function as described above and remove the _ in the beginning from the name 
 * 
 * The way arguments have been taken into all of the plugin codes is as DESTRUCTURING in JAVASCRIPT
 * 
 */

//#region Global values

const ResumeParsing = {
  Main: {},
  Utility: {},
  FormValidator: {},
  SelectText: {},
  SmartSuggestion: {},
  ContextMenu: {},
  Form: {},
  get AllCategoryNames() {
    return this.Utility.Enum([
      "String",
      "Email",
      "Number",
      "SmallNumber",
      "Name",
      "MobileNumber",
      "List",
      "Date",
      "Description",
      "ContainsNumber",
      "Currency"
    ], true);
  },
  FieldCategories: {
    "pe": "personal",
    "pr": "professional",
    "edu": "educational"
  },
  IdPrefix: "_resume_",
  DOM: {
    resume: "#resume",
    currResumePage: ".resume-active",
    resPagination: ".resume-pagination",
    resPagePrev: ".prev.fa",
    resPageNext: ".next.fa",
    disabledResToggle: ".disabled",
    contextMenu: ".rp-context-menu",
    get cmOpen() {
      return this.contextMenu + "-open";
    },
    get cmList() {
      return this.contextMenu + "-items";
    },
    cmListItems: ".dropdown-item",
    footerFieldsCount: "#form-count",
    pageCount: "#page-count",
    reqFields: "#reqFields",
    optFields: "#optFields",
    preview: "#previewResume",
    next: "#saveResume",
    fields: ".resume-field"
  }
};

//#endregion

//#region ResumeParsing.Utility

(function ({ Utility: u }) {

  /**
   * Takes a string as a parameter and returns it with either class or ID identifier
   *
   * @param {String} name
   * @param {Boolean} isUnique
   * @returns {String} DOM Identifier
   */
  const makeDomElem = function(name, isUnique) {
    const pre = isUnique ? "#" : ".";
    return pre + name;
  };

  /**
   * A small helper function to remove either '.' or '#' from the string provided
   *
   * @param {*} elem
   * @returns
   */
  const removeDomIdentifier = function(elem) {
    return elem.substring(1, elem.length);
  }

  /**
   * Takes an array of String and converts it to an Enum(kind of Enum as JS does not support Enums at all)
   * If text to number and number to text mapping (ex: { 1: "a", "a": 1 }) is needed 
   * then pass isNum = true else leave it blank or null
   * @param {String[]} items
   * @param {Boolean} isNum
   * @returns {Enum} Enum Object
   */
  const eenum = function(items, isNum) {
    if (!items || items.length <= 0) {
      throw "No arguments passed to Enum";
    }

    // Making items unique
    items = [...new Set(items)];

    isNum = !!isNum;

    if (isNum) {
      return items.reduce((acc, cv, ci) => {
        acc[acc[cv] = ci + 1] = cv;
        return acc;
      }, {});
    } else {
      return items.reduce((acc, cv) => {
        acc[cv] = cv;
        return acc;
      }, {});
    }
    
  }

  /**
   * Checks if the given argument is a number
   * and returns boolean result
   * @param {String} value
   * @returns {Boolean}
   */
  const isNumber = function (value) {
    return /^\d*\.?\d+$/.test(value);
  }
  
  u.getId = (name) => makeDomElem(name, true);
  u.getClass = (name) => makeDomElem(name, false);
  u.Enum = eenum;
  u.isNumber = isNumber;
  u.getIdentifierName = removeDomIdentifier;

})(ResumeParsing);

//#endregion

//#region Making All Form Fields

ResumeParsing.AllFields = {
  /**
   * -> Following Object is the main structure that defines what field values to besuggested under what category
   * -> These also help in creating preview form
   * -> These help in validation as well
   * -> These also helps in keeping count of values filled till now
   * -> Main Object has two properties that describes each field in all aspects
   * 
   */
  "firstName": {
    "like": [ResumeParsing.AllCategoryNames.Name, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "First Name",
    "required": true,
    "category": ResumeParsing.FieldCategories.pe,
    "dom": {
      "type": "text"
    },
    "canSuggest": true
  },
  "lastName": {
    "like": [ResumeParsing.AllCategoryNames.Name, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Last Name",
    "required": true,
    "category": ResumeParsing.FieldCategories.pe,
    "dom": {
      "type": "text"
    },
    "canSuggest": true
  },
  "email": {
    "like": [ResumeParsing.AllCategoryNames.Email, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Email",
    "required": true,
    "category": ResumeParsing.FieldCategories.pe,
    "dom": {
      "type": "email"
    },
    "canSuggest": true
  },
  "phone": {
    "like": [ResumeParsing.AllCategoryNames.MobileNumber, ResumeParsing.AllCategoryNames.Number],
    "value": "",
    "label": "Mobile No",
    "required": true,
    "category": ResumeParsing.FieldCategories.pe,
    "dom": {
      "type": "number"
    },
    "canSuggest": true
  },
  "headline": {
    "like": [ResumeParsing.AllCategoryNames.Description, ResumeParsing.AllCategoryNames.List, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Profile Headline",
    "required": true,
    "category": ResumeParsing.FieldCategories.pe,
    "dom": {
      "type": "text"
    },
    "canSuggest": true
  },
  "gender": {
    "like": [ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Gender",
    "required": false,
    "category": ResumeParsing.FieldCategories.pe,
    "dom": {
      "type": "select",
      "options": [
        "male",
        "female",
        "other"
      ]
    },
    "canSuggest": false
  },
  "country": {
    "like": [ResumeParsing.AllCategoryNames.Name, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Country",
    "required": false,
    "category": ResumeParsing.FieldCategories.pe,
    "dom": {
      "type": "text"
    },
    "canSuggest": true
  },
  "state": {
    "like": [ResumeParsing.AllCategoryNames.Name, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "State",
    "required": false,
    "category": ResumeParsing.FieldCategories.pe,
    "dom": {
      "type": "text"
    },
    "canSuggest": true
  },
  "city": {
    "like": [ResumeParsing.AllCategoryNames.Name, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "City",
    "required": false,
    "category": ResumeParsing.FieldCategories.pe,
    "dom": {
      "type": "text"
    },
    "canSuggest": true
  },
  "lastCompanyName": {
    "like": [ResumeParsing.AllCategoryNames.Name, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Last Company Name",
    "required": true,
    "category": ResumeParsing.FieldCategories.pr,
    "dom": {
      "type": "text"
    },
    "canSuggest": true
  },
  "lastCompanyDesignation": {
    "like": [ResumeParsing.AllCategoryNames.Name, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Last Company Designation",
    "required": true,
    "category": ResumeParsing.FieldCategories.pr,
    "dom": {
      "type": "text"
    },
    "canSuggest": true
  },
  "companyDuration": {
    "like": [ResumeParsing.AllCategoryNames.Date, ResumeParsing.AllCategoryNames.Number],
    "value": "",
    "label": "Duration",
    "required": true,
    "category": ResumeParsing.FieldCategories.pr,
    "dom": {
      "type": "number"
    },
    "canSuggest": true
  },
  "details": {
    "like": [ResumeParsing.AllCategoryNames.Description, ResumeParsing.AllCategoryNames.List, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Details",
    "required": true,
    "category": ResumeParsing.FieldCategories.pr,
    "dom": {
      "type": "desc"
    },
    "canSuggest": true
  },
  "industry": {
    "like": [ResumeParsing.AllCategoryNames.Name, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Industry",
    "required": false,
    "category": ResumeParsing.FieldCategories.pr,
    "dom": {
      "type": "text"
    },
    "canSuggest": true
  },
  "location": {
    "like": [ResumeParsing.AllCategoryNames.Name, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Location",
    "required": false,
    "category": ResumeParsing.FieldCategories.pr,
    "dom": {
      "type": "text"
    },
    "canSuggest": true
  },
  "schoolName": {
    "like": [ResumeParsing.AllCategoryNames.Name, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "School Name",
    "required": true,
    "category": ResumeParsing.FieldCategories.edu,
    "dom": {
      "type": "text"
    },
    "canSuggest": true
  },
  "degree": {
    "like": [ResumeParsing.AllCategoryNames.Name, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Degree",
    "required": true,
    "category": ResumeParsing.FieldCategories.edu,
    "dom": {
      "type": "text"
    },
    "canSuggest": true
  },
  "schoolDuration": {
    "like": [ResumeParsing.AllCategoryNames.Date, ResumeParsing.AllCategoryNames.Number],
    "value": "",
    "label": "Duration",
    "required": true,
    "category": ResumeParsing.FieldCategories.edu,
    "dom": {
      "type": "number"
    },
    "canSuggest": true
  },
  "grade": {
    "like": [ResumeParsing.AllCategoryNames.ContainsNumber, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Grade",
    "required": true,
    "category": ResumeParsing.FieldCategories.edu,
    "dom": {
      "type": "text"
    },
    "canSuggest": true
  },
  "schoolDetails": {
    "like": [ResumeParsing.AllCategoryNames.Description, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Details",
    "required": true,
    "category": ResumeParsing.FieldCategories.edu,
    "dom": {
      "type": "desc"
    },
    "canSuggest": true
  },
  "fieldOfStudy": {
    "like": [ResumeParsing.AllCategoryNames.Name, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Field Of Study",
    "required": false,
    "category": ResumeParsing.FieldCategories.edu,
    "dom": {
      "type": "text"
    },
    "canSuggest": true
  }
};

/** Dynamically assigning ID for DOM traversal to each field  */
Object.keys(ResumeParsing.AllFields).forEach((f) => {
  ResumeParsing.AllFields[f].dom.id = ResumeParsing.IdPrefix + f;
});

//#endregion

//#region ResumeParsing.Main

/**
 * Main function of this plugin is to initialize other plugins and handle their function calls
 * It also handles the order in which the functions are called
 */

(function ({ 
  Main: m, 
  DOM: elem,
  SelectText: st,
  SmartSuggestion: ss,
  ContextMenu: cm,
  Form: f,
  Utility: u
}) {

  /**
   * Initial function
   *
   */
  const init = function() {
    _initHandlers();
    f.updateAllCount();
    _updatePageCount(_getPageCount());
    f.create();
  };

  /**
   * Initiates all event handlers on the page
   *
   */
  const _initHandlers = function() {
    /* 
      Clears any existing selection 
      Although clicking anywhere already removes selection,
      this function explicitly does that for better accuracy in our local functions
    */
    $("html").on("mousedown", function() {
      st.clear();
    });

    /**
     * Gets the selected text
     * and shows the context menu with 
     * smart suggestions
     *
     * @param {MouseEvent} evt
    */
    $(elem.resume).on("mouseup", function(evt) {
      const _txt = st.get();
      if(_txt) {
        cm.init(evt, ss.analyze(_txt), _txt);
      }
      // else deselection or empty/invalid text in select
    });

    /**
     * Click handler for arrow keys that change resume page
     *
     * @param {MouseEvent} e
     */
    $(elem.resPagination).on("click", elem.resPagePrev, function(e) {
      _updatePage(e, false);
    }).on("click", elem.resPageNext, function(e) {
      _updatePage(e, true);
    });

    $(elem.preview).on("click", function() {
      f.update();
    });
  };

  /**
   * Toggles the resume page
   * depending on whether next or previous arow icon is clicked
   * isNext parameter is used to tell whether next page or previous page is to be shown
   * @param {MouseEvent} e
   * @param {Boolean} isNext
   */
  const _updatePage = function(e, isNext) {
    const currResume = $(elem.currResumePage);
    let goToElem = isNext ? currResume.next() : currResume.prev();
    if (goToElem && goToElem.length > 0) {
      let altElem = null;
      const arrowIcon = e.target || e.srcElement,
            activeClass = u.getIdentifierName(elem.currResumePage),
            disabled = u.getIdentifierName(elem.disabledResToggle);
      currResume.removeClass(activeClass);
      goToElem.addClass(activeClass);
      if (isNext) {
        $(elem.resPagePrev).removeClass(disabled);
        altElem = goToElem.next();
      } else {
        $(elem.resPageNext).removeClass(disabled);
        altElem = goToElem.prev();
      }
      if (!altElem || altElem.length === 0) {
        $(arrowIcon).addClass(disabled);
      }
      _updatePageCount(_getPageCount());
    }
  };

  const _getPageCount = function() {
    const kids = $(elem.resume).children();
    let pagesCount = 0,
    currPage = 0;
    if (kids && kids.length > 0) {
      // there is at least onepage available
      pagesCount = kids.length;
      currPage = kids.index($(elem.currResumePage));
      currPage = currPage > -1 ? currPage + 1 : 0;
    } else {
      // no resume pages loaded yet
    }
    return {
      total: pagesCount,
      curr: currPage
    };
  };

  const _updatePageCount = function({total, curr}) {
    $(elem.pageCount).html(curr + "/" + total);
  };

  // Making above private functions public
  m.init = init;


})(ResumeParsing);

//#endregion

//#region ResumeParsing.SelectText

(function ({
  SelectText: st
}) {

  /**
   * Returns text selected via mouse on a web page
   *
   * @returns {string}
   */
  const getSelectedText = function() {
    let e = "";
    // Optimized way to get selected text taking IE < 9 in consideration as well
    return window.getSelection ?
      e = window.getSelection().toString() :
      document.selection && "Control" != document.selection.type &&
      (e = document.selection.createRange().text), "" !== e && e;
  };

  /**
   * Clears existing text selection on a web page 
   *
   */
  const clearSelection = function() {
    let sel;
    if ((sel = document.selection) && sel.empty) {
      sel.empty();
    } else {
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      } else {
        let activeEl = document.activeElement, tagName;
        if (activeEl, tagName = activeEl.nodeName.toLowerCase() && 
        (tagName == "textarea" || (tagName == "input" && activeEl.type == "text"))) {
          // Collapse the selection to the end
          activeEl.selectionStart = activeEl.selectionEnd;
        }
      }
    }
  }

  // Making functions public
  st.get = getSelectedText;
  st.clear = clearSelection;

})(ResumeParsing);

//#endregion

//#region ResumeParsing.ContextMenu

(function({
  ContextMenu: cm,
  DOM: elem,
  AllFields: af,
  Utility: u,
  IdPrefix: prefix,
  Form: f
}) {

  let selectedText = "";

  /**
   * Initial functions
   * Triggers Dom Creation
   * Aligns Context Menu Smartly
   * Initialize handlers on context menu
   *
   * @param {*} e
   * @param {*} suggestions
   */
  const init = function (e, suggestions, txt) {
    console.log("Suggested fields for selection text " + txt + " is: ", suggestions);
    selectedText = txt;
    _createDom(suggestions);
    _setPosition(e);
    _initHandlers();
  }

  const body = $("body");
  const cmOpen = u.getIdentifierName(elem.cmOpen);

  /**
   * Initiates all event handlers on context menu
   *
   */
  const _initHandlers = function() {
    body.on("mousedown", _closeContextMenu);
    $(elem.cmListItems).on("click", _handleCmClick);
  };

  /**
   * Destroys all event handlers placed on context menu
   *
   */
  const _destroyHandlers = function() {
    body.off("mousedown", _closeContextMenu);
  };

  const _handleCmClick = function(e) {
    const elm = e.target || e.srcElement;
    const li = $(elm).closest(elem.cmListItems);
    let field = li.data("resumeField");
    field = field.replace(prefix, "");
    af[field].value = selectedText;
    f.updateAllCount();
    _close();
  };

  const _getDomString = function (field) {
    let marking = field.required ? "<sup>*</sup>" : "";
    const listItem = u.getIdentifierName(elem.cmListItems);
    return `
      <li class="${listItem} ${ field.value ? 'visited' : '' }" data-resume-field="${field.dom.id}">
        <span>${field.label}<span>
        ${marking}
      </li>
    `;
  };

  /**
   * Takes array of strings (suggested field names)
   * and creates context menu
   * It shows all the available options
   * Segregates them between suggested and remaining
   * Highlights fields already been done
   * Sorts based on required field or optional field
   *
   * @param {string[]} suggestions
   */
  const _createDom = function(suggestions) {
    //TODO: Make DOM creation smarter
    if (suggestions && suggestions.length > 0) {
      let suggested = "",
          remianing = "";
      for (let f in af) {
        const field = af[f];
        if (suggestions.indexOf(f) >= 0) {
          suggested = suggested + _getDomString(field);
        } else {
          remianing = remianing + _getDomString(field);
        }
      }

      const pClass = u.getIdentifierName(elem.contextMenu),
            pItemClass = u.getIdentifierName(elem.cmList),
            totalReqd = f.getReq().length,
            filledReq = f.getReqDone().length,
            cm = `
              <div class="dropdown ${pClass}">
                <ul class="dropdown-menu ${pItemClass}">
                  <li class="dropdown-header">Suggested</li> ${suggested}
                  <li class="dropdown-header">Remaining</li> ${remianing}
                </ul>
                <div class="reqd-info">
                  Required<sup>*</sup> - ${filledReq}/${totalReqd}
                </div>
              </div>`;
      $(elem.resume).append(cm);
      body.addClass(cmOpen);
    }
  }

  /**
   * This function would open the context menu based on the mouse event passed to the funcion
   *
   * @param {MouseEvent} e
   */
  const _setPosition = function (e) {
    const pos = _getPosition(e);
    $(elem.contextMenu).css({
      top: pos.top,
      left: pos.left
    });
    body.addClass(cmOpen);
  };

  /**
   * Gets most suitable X & Y coordinates for context menu to be placed.
   * If any of the mouse position coordinates are at the edge of the page then this edge case is handled as well
   *
   * @param {MouseEvent} e
   * @returns { Object {left: Number, right: Number}} { left: 0, right: 0 }
   */
  const _getPosition = function(e) {
    let mouseX = e.clientX,
        mouseY = e.clientY - $("header").outerHeight();

    // 200 is the max width of context menu
    const widthDiff = (200 + mouseX) - $(document).outerWidth(),
          // 250 is the max height of context menu
          heightDiff = (250 + mouseY) - $(document).outerHeight();

    if(mouseX < 20) {
      mouseX = 50;
    }
    if (widthDiff > 0) {
      mouseX = mouseX - widthDiff;
    }
    return {
      left: mouseX,
      top: heightDiff > 0 ? mouseY - heightDiff : mouseY
    };
  };

  /**
   * This function would remove all of the open context menus from the page
   *
   */
  const _close = function() {
    body.removeClass(elem.cmOpen);
    $(elem.contextMenu).remove();
  };

  /**
   * Closes context menu completely and 
   * destroys its corresponding event handlers as well
   *
   * @param {MouseEvent} e
   */
  const _closeContextMenu = function (e) {
    const _elm = e.target || e.srcElement;
    const cmElem = $(_elm).closest(elem.contextMenu);
    // Check if the mousedown event has happened from within the context menu
    if (!cmElem || cmElem.length === 0) {
      _close();
      _destroyHandlers();
    }
  };

  // Making init function public
  cm.init = init;

})(ResumeParsing);

//#endregion

//#region ResumeParsing.SmartSuggestion

(function({
  SmartSuggestion: ss,
  AllCategoryNames: ac,
  AllFields: af
}) {
  /**
   * Suggestion Engine that tells the type of the selected text
   *
   * @param {Number} type
   * @param {String} txt
   * @returns {Boolean} Boolean
   */
  const mayBeA = function(type, txt) {
    if ((!type || type.length === 0) || (!txt || txt.length === 0)) {
      throw "Either 'type' or 'txt' value is missing";
    }

    let prediction = false;
    const words = txt.split(" ");

    switch(type) {
      case ac.Name: {
        // Assumption: Number of words in a valid name may not be bigger than 'Villupuram Chinnaih Pillai Ganesan' (Sivaji Ganesan).
        if (words.length <= 4) {
          prediction = words.every(w => {
            // Assumption: A valid name may not have more than 20 characters, ex: 'Mountbatten-Windsor'
            return w.length < 20;
          });
        }
        break;
      }
      case ac.Description: {
        // Assumption: If text has more than 50 words then it may be a description or a list
        prediction = words.length >= 30;
        break;
      }
      case ac.List: {
        // Assumption: If text has multiple new lines or non-keyboard characters pattern then it may be a list
        prediction = _checkListType(txt);
        break;
      }
      case ac.ContainsNumber: {
        // If selected text has numbers in it then it means it is some of the types that can contain numbers such as
        // salary amount with currency symbol, comma separated digits etc.
        prediction = /\d/.test(txt);
        break;
      }
      case ac.Number: {
        // Txt contains exactly numbers (0-9) including float numbers and nothing else
        prediction = /^\d*\.?\d+$/.test(txt);
        break;
      }
      case ac.SmallNumber: {
        // Txt that contains number less that 100
        prediction = /^\d*\.?\d+$/.test(txt) && parseInt(txt, 10) < 100;
        break;
      }
      case ac.MobileNumber: {
        const isIndian = /(\+)?(91)?( )?[789]\d{9}/.test(txt);
        const isBritish = /(\+|00)?(44)?([\d]{10,11})/.test(txt);
        const isAmerican = /(?:\d{1}\s)?\(?(\d{3})\)?-?\s?(\d{3})-?\s?(\d{4})/g.test(txt);
        prediction = (isIndian || isBritish || isAmerican) ? true : prediction;
        break;
      }
      case ac.Date: {
        prediction = /([\d]+)([-./])([\d]+)([-./])([\d]+)|((Jan(|uary)|Feb(|ruary)|Mar(|ch)|Apr(|il)|May|Jun(|e)|Jul(|y)|Aug(|ust)|Sept(|ember)|Oct(|ober)|(Nov|Dec)(|ember))([\s-])(|([\d]+){1,2}([\s-]|, ))([\d]+){4})/.test(txt);
        break;
      }
      case ac.Email: {
        prediction = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g.test(txt);
        break;
      }
      case ac.Currency: {
        prediction = /((?:AED|AFN|ALL|AMD|ANG|AOA|ARS|AUD|AWG|AZN|BAM|BBD|BDT|BGN|BHD|BIF|BMD|BND|BOB|BRL|BSD|BTN|BWP|BYR|BZD|CAD|CDF|CHF|CLP|CNY|COP|CRC|CUP|CVE|CZK|DJF|DKK|DOP|DZD|EGP|ERN|ETB|EUR|FJD|FKP|GBP|GEL|GHS|GIP|GMD|GNF|GTQ|GYD|HKD|HNL|HRK|HTG|HUF|IDR|ILS|INR|IQD|IRR|ISK|JMD|JOD|JPY|KES|KGS|KHR|KMF|KPW|KRW|KWD|KYD|KZT|LAK|LBP|LKR|LRD|LTL|LYD|MAD|MDL|MGA|MKD|MMK|MNT|MOP|MRO|MUR|MWK|MXN|MYR|MZN|NAD|NGN|NIO|NOK|NPR|NZD|OMR|PAB|PEN|PGK|PHP|PKR|PLN|PYG|QAR|RON|RSD|RUB|RWF|SAR|SBD|SCR|SDG|SEK|SGD|SHP|SLL|SOS|SRD|SSP|STD|SYP|SZL|THB|TJS|TMT|TND|TOP|TRY|TTD|TWD|TZS|UAH|UGX|USD|UYU|UZS|VEF|VND|VUV|WST|XAF|XCD|XOF|XPF|YER|ZAR|ZMW)|(?:원|RMB|руб|руб\.|Lt|ر\.ق\.‏|р\.|د\.ب\.‏|TSh|din\.|Rp|ر|WS\$|Rs|T\$|S\/\.|SR|Bs\.|NOK|CF|Fdj|£|¤|¥|SEK|Br|Bs|MTn|د\.أ\.‏|ден|den|RUB|أ\.م\.‏|лв\.|नेरू|DA|zł|Nfk|дин|дин\.|din|din\.|ر\.ي\.‏|US\$|Ksh|د\.ت\.‏|CFA|DT|MAD|B\/\.|NT\$|FCFA|soʻm|UM|Db|CVE|man\.|EC\$|PLN|රු\.|ر\.س\.‏|ج\.م\.‏|ر\.ع\.‏|￥|CA\$|ALL|Kč|د\.إ\.‏|դր\.|៛|د\.ك\.‏|ل\.ل\.‏|Afl\.|сом|LEI|kn|kr|kr\.|KM|Ft\.|VT|FC|ف\.ج\.ق\.‏|Fr\.|SFr\.|FCFP|m\.|ریال|FG|ج\.س\.|د\.ج\.‏|КМ|R\$|Lekë|৳|د\.ل\.‏|ل\.س\.‏|Nu\.|ман\.|₡|฿|₦|₩|ብር|₪|₫|€|₭|₮|₱|\$|S\$|₲|GEL|TRY|₴|₸|₹|₺|₽|Kz|LS|RF|MOP\$|GH₵|D|E|د\.ع\.‏|FBu|G|د\.م\.‏|Ft|K|RM|L|USh|P|Q|Le|R|S|Rs\.|NAf\.|DKK|؋|Ar|C\$|MK))[ ]?((?:[0-9]{1,3}[ \.,]?)*[ \.,]?[0-9]+)/g.test(txt);
        break;
      }
      default: {
        console.warn("No case of mayBe check matched for '" + type + "'");
      }
    }
    return prediction;
  };

  /**
   * Checks if given text is a list or not
   *
   * @param {String} s
   * @returns {Boolean} Boolean
   */
  const _checkListType = function(s) {
    // A separator to determine line breaks for strings items
    const separator = "_|--|_";
    // RegEx for non-keyboard characters
    const keyBoardKeys = new RegExp(/[^ A-Za-z0-9.,?'"!@#$%^&*()-_=+;:<>/\\|}{[\]`~]/g);
    // Regex for new line, carriage return and other forms of whitespace
    const newLineRule = new RegExp(/(\r\n|\n|\r|\f|\t|\v| (?= ))/g);
    let x = s.replace(keyBoardKeys, separator);
    x = x.replace(newLineRule, separator);
    return x && x.indexOf(separator) > -1;
  }

  /**
   * Orders analysis of sub-analysis function and gives suggestion accordingly
   *
   * @param {String} txt
   * @returns Array of unique suggestions
   */
  const analyze = function(txt) {
    txt = txt.trim();
    // Check if the selection contains a lot of words
    if (mayBeA(ac.List, txt)) {
      return _suggest(ac.List);
    } else if (mayBeA(ac.Description, txt)) {
      return _suggest(ac.Description);
    } else {
      // Definitely some lesser-words type
      if (mayBeA(ac.ContainsNumber, txt)) {
        return analyzeNumber(txt);
      } else {
        // Definitely a string type
        return analyzeShortString(txt);
      }
    }
  };

  /**
   * Analyzes all number types and suggests fields accordingly
   *
   * @param {String} txt
   * @returns {String[]} Array of unique suugestions
   */
  const analyzeNumber = function(txt) {
    if (mayBeA(ac.Number, txt)) {
      if(mayBeA(ac.SmallNumber, txt)) {
        return _suggest(ac.SmallNumber);
      } else {
        return _suggestAllNumberTypes([ac.SmallNumber, ac.Date]);
      }
    } else {
      if (mayBeA(ac.MobileNumber, txt)) {
        return _suggest(ac.MobileNumber);
      } else if (mayBeA(ac.Currency, txt)) {
        return _suggest(ac.Currency);
      } else if (mayBeA(ac.Date, txt)) {
        return _suggest(ac.Date);
      } else {
        console.info("No suggestions for '" + txt + "'");
      }
    }
  };

  /**
   * Returns a unique set of all sugestions related to numbers
   * excludeType is passed in case some number type is to be excluded from suggestions
   * @param {Number} excludeType
   * @returns {String[]} Array of unique number suggestions
   */
  const _suggestAllNumberTypes = function(excludeTypes) {
    // Created a Set of suggestions to ensure unique values
    let uniqueSuggestions = new Set();

    let numericSuggestions = excludeTypes.indexOf(ac.Number) > -1 ? [] : _suggest(ac.Number),
      smallNumberSuggestions = excludeTypes.indexOf(ac.SmallNumber) > -1 ? [] : _suggest(ac.SmallNumber),
      mobileSuggestions = excludeTypes.indexOf(ac.MobileNumber) > -1 ? [] : _suggest(ac.MobileNumber),
      dateSuggestions = excludeTypes.indexOf(ac.Date) > -1 ? [] : _suggest(ac.Date);

    if (!ifAllSuggested(numericSuggestions) && numericSuggestions.length > 0) {
      uniqueSuggestions.add(...numericSuggestions);
    }
    if (!ifAllSuggested(smallNumberSuggestions) && smallNumberSuggestions.length > 0) {
      uniqueSuggestions.add(...smallNumberSuggestions);
    }
    if (!ifAllSuggested(mobileSuggestions) && mobileSuggestions.length > 0) {
      uniqueSuggestions.add(...mobileSuggestions);
    }
    if (!ifAllSuggested(dateSuggestions) && dateSuggestions.length > 0) {
      uniqueSuggestions.add(...dateSuggestions);
    }

    let allNumericSuggestions = Array.from(uniqueSuggestions);
    return allNumericSuggestions;
  };

  /**
   * Analyzes short string types and suggests fields accordingly
   *
   * @param {String} txt
   * @returns {String[]} Array of unique suugestions
   */
  const analyzeShortString = function(txt) {
    if (mayBeA(ac.Email, txt)) {
      return _suggest(ac.Email);
    } else if (mayBeA(ac.Name, txt)) {
      return _suggest(ac.Name);
    } else {
      console.info("No suggestions for '" + txt + "'");
      // Suggest all
      return _suggest();
    }
  };

  /**
   * Suggests all fields in form
   * Useful when all field items are to be suggested
   * @returns {String[]} Array of unique suggestions
   */
  const getAllFieldsForSuggestion = function() {
    return Object.keys(af).reduce((acc, cv) => {
      acc.push(cv);
      return acc;
    }, []);
  };

  /**
   * Check if all of the items have been suggested
   *
   * @param {String[]} arr
   * @returns {Boolean} Boolean
   */
  const ifAllSuggested = function (arr) {
    return arr.length === (getAllFieldsForSuggestion().length);
  }

  /**
   * Suggests fields based on type provided
   * If no type is provided then all fields are suggested
   * @param {Number} type
   * @returns {String[]} Array of unique suggestions
   */
  const _suggest = function(type) {
    let sug = [];
    if(type) {
      console.log("Suggestions for type '"+ ac[type] + "'");
      for (let f in af) {
        const o = af[f];
        if (o.like.indexOf(type) > -1 && sug.indexOf(f) === -1 && o.canSuggest) {
          sug.push(f);
        }
      }
    }
    if(!sug || sug.length === 0) {
      sug = getAllFieldsForSuggestion();
    }
    return sug;
  };

  // Making funcions public
  ss.analyze = analyze;
  ss.suggestAll = getAllFieldsForSuggestion;

})(ResumeParsing);

//#endregion

//#region ResumeParsing.Form 

(function({ 
  Form: f,
  AllFields: af,
  DOM: elem,
  Utility: u
}) {

  const _allKeys = Object.keys(af);

  /**
   * Get all required fields count
   *
   * @returns {Array<string>} keys
   */
  const getTotalRequiredFields = function() {
    return _allKeys.filter(k => af[k].required);
  };

  /**
   * Get all optional fields count
   *
   * @returns {Array<string>} keys
   */
  const getTotalOptionalFields = function() {
    return _allKeys.filter(k => !af[k].required);
  };

  /**
   * Get count of all required fields with values filled
   *
   * @returns {Array<string>} keys
   */
  const getFilledRequiredFields = function() {
    return _allKeys.filter(k => af[k].required && !!af[k].value);
  };

  /**
   * Get count of all required fields with empty/null values
   *
   * @returns {Array<string>} keys
   */
  const getRemainingRequiredFields = function () {
    return _allKeys.filter(k => af[k].required && !af[k].value);
  };

  /**
   * Get count of all optional fields with values filled
   *
   * @returns {Array<string>} keys
   */
  const getFilledOptionalFields = function() {
    return _allKeys.filter(k => !af[k].required && !!af[k].value);
  };

  /**
   * Get count of all optional fields with empty / null values
   *
   * @returns {Array<string>} keys
   */
  const getRemainingOptionalFields = function () {
    return _allKeys.filter(k => !af[k].required && !af[k].value);
  };

  /**
   * Get count of all filled fields
   *
   * @returns {Array<string>} keys
   */
  const getAllFilled = function() {
    return _allKeys.filter(k => !!af[k].value);
  };

  /**
   * Get count of all empty / null fields
   *
   * @returns {Number} length
   */
  const getAllEmpty = function () {
    return _allKeys.filter(k => !af[k].value);
  };

  const tf = _allKeys.length;

  /**
   * Updates ALL FIELDS VS FILLED FIELDS
   *
   */
  const updateFilledFields = function () {
    $(elem.footerFieldsCount).html(
      getAllFilled().length + "/" + tf
    );
  }

  const _getFilteredObj = function(keys) {
    keys.reduce((acc, key) => {
      acc[key] = af[key];
      return acc;
    }, {});
  };

  const createForm = function() {
    $(elem.reqFields).html(_createFormGroup(getTotalRequiredFields()));
    $(elem.optFields).html(_createFormGroup(getTotalOptionalFields()));
  };

  const _createFormGroup = function(keys) {
    const fieldClass = u.getIdentifierName(elem.fields);
    let form = "";
    keys.forEach((k) => {
      const o = af[k],
            isRequired = o.required ? "required" : "";
      let inputField = "",
          isHalfWidth = "half-width";
      if (o.dom.type === "select") {
        let options = "";
        o.dom.options.forEach(z => {
          options = options + `<option value="${z}">${z}</option>`;
        });
        inputField = `<select class="form-control ${fieldClass}" id="${o.dom.id}" value="${o.value}" ${isRequired}>${options}</select>`;
      } else if (o.dom.type === "desc") {
        isHalfWidth = "";
        inputField = `<textarea class="form-control ${fieldClass}" rows="3" id="${o.dom.id}" value="${o.value}" ${isRequired}></textarea>`;
      } else {
        inputField = `<input type="${o.dom.type}" class="form-control ${fieldClass}" id="${o.dom.id}" value="${o.value}" ${isRequired} />`;
      }
      form = form + `
        <div class="form-group ${isHalfWidth}">
          <label for="${o.dom.id}">${o.label}: </label>
          ${inputField}
        </div>
      `;
    });
    return form;
  };

  const updateFormValues = function() {
    _allKeys.forEach((k) => {
      const o = af[k];
      $("#" + o.dom.id).val(o.value);
    });
  };

  // Making functions Public
  f.allFieldsCount = tf;
  f.getReq = getTotalRequiredFields;
  f.getOptional = getTotalOptionalFields;
  f.getReqDone = getFilledRequiredFields;
  f.getReqLeft = getRemainingRequiredFields;
  f.getOptionalDone = getFilledOptionalFields;
  f.getOptionalLeft = getRemainingOptionalFields;
  f.getAllDone = getAllFilled;
  f.getAllLeft = getAllEmpty;
  f.updateAllCount = updateFilledFields;
  f.create = createForm;
  f.update = updateFormValues;
  
})(ResumeParsing);

//#endregion

//#region Document Ready

$(() => {
  // Initialize UserForm on Document Ready
  ResumeParsing.Main.init(); 
});

//#endregion

/** 
 * TODOs:
 * On preivew modal page, save btn updates the new values in main object
 * Cancel on preview modal brings back the original values and removes the edited ones
 * Next btn validates if all required fields have been filled
*/