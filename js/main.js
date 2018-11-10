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
  FormUtilities: {},
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
    resPagination: ".left-tools",
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
    progress: "#progressStatus",
    pageCount: "#page-count",
    reqFields: "#reqFields",
    optFields: "#optFields",
    preview: "#previewResume",
    next: "#saveResume",
    fields: ".resume-field",
    saveForm: "#saveNCloseForm",
    closeForm: "#closeForm",
    progressBar: ".resume-progress",
    form: "#side-bar-form",
    formItem: "form-item"
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
  },

  /**
   * A small helper function to remove either '.' or '#' from the string provided
   *
   * @param {String} elem
   * @returns {String} Element Identifier name
   */
  removeDomIdentifier = function(elem) {
    return elem.substring(1, elem.length);
  },

  /**
   * Takes an array of String and converts it to an Enum(kind of Enum as JS does not support Enums at all)
   * If text to number and number to text mapping (ex: { 1: "a", "a": 1 }) is needed 
   * then pass isNum = true else leave it blank or null
   * @param {String[]} items
   * @param {Boolean} isNum
   * @returns {Enum} Enum Object
   */
  eenum = function(items, isNum) {
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
    
  },

  /**
   * Checks if the given argument is a number
   * and returns boolean result
   * @param {String} value
   * @returns {Boolean}
   */
  isNumber = function (value) {
    return /^\d*\.?\d+$/.test(value);
  },

  /**
   * Function that gets the mouse position coordinates
   * This also keeps page scroll in account
   * @param {MouseEvent} mouseEvent
   * @param {HTMLElement} container
   * @returns { x: Number, y: Number} Mouse Position Object { x: 0, y: 0}
   */
  getMousePosition = function (mouseEvent) {
    mouseEvent = mouseEvent || window.event;
    let pageX = mouseEvent.pageX,
      pageY = mouseEvent.pageY;

    // IE 8 fallback
    if (pageX === undefined) {
      pageX = mouseEvent.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      pageY = mouseEvent.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    return {
      x: pageX,
      y: pageY
    };
  },

  /**
   * The function accepts javascript element as parameter and adjusts its height as per content
   * This functionality is mainly elements like textarea which do not have ability for height:auto in CSS
   * @param {Element} _elem
   */
  adjustHeight = function (_elem){
    $(_elem).height(0).height(_elem.scrollHeight);
  };
  
  u.getId = (name) => makeDomElem(name, true);
  u.getClass = (name) => makeDomElem(name, false);
  u.Enum = eenum;
  u.isNumber = isNumber;
  u.getIdentifierName = removeDomIdentifier;
  u.getMousePosition = getMousePosition;
  u.adjustHeight = adjustHeight;

})(ResumeParsing);

//#endregion

//#region Making All Form Fields

ResumeParsing.AllFields = {
  /**
   * -> Following Object is the main structure that defines what field values to be suggested under what category
   * -> These also help in creating preview form
   * -> These help in validation as well
   * -> These also helps in keeping count of values filled till now
   * -> Main Object has 'like' property that puts it under possible categories
   * -> 'canSuggest' property enables to mute a property from being suggested
   * -> Obj = {
   *      like: "array of strings - matching categories",
   *      value: "value of field",
   *      label: "display label of field",
   *      required: "boolean to tell if this is a required field",
   *      category: "category of the field",
   *      id: "dom id of element",
   *      canSuggest: "boolean to mute suggestions"
   * }
   */
  "firstName": {
    "like": [ResumeParsing.AllCategoryNames.Name, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "First Name",
    "required": true,
    "category": ResumeParsing.FieldCategories.pe,
    "canSuggest": true
  },
  "lastName": {
    "like": [ResumeParsing.AllCategoryNames.Name, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Last Name",
    "required": true,
    "category": ResumeParsing.FieldCategories.pe,
    "canSuggest": true
  },
  "phone": {
    "like": [ResumeParsing.AllCategoryNames.MobileNumber, ResumeParsing.AllCategoryNames.Number],
    "value": "",
    "label": "Mobile No",
    "required": true,
    "category": ResumeParsing.FieldCategories.pe,
    "canSuggest": true
  },
  "email": {
    "like": [ResumeParsing.AllCategoryNames.Email, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Email",
    "required": true,
    "category": ResumeParsing.FieldCategories.pe,
    "canSuggest": true
  },
  "headline": {
    "like": [ResumeParsing.AllCategoryNames.Description, ResumeParsing.AllCategoryNames.List, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Profile Headline",
    "required": true,
    "category": ResumeParsing.FieldCategories.pe,
    "canSuggest": true
  },
  "lastCompanyName": {
    "like": [ResumeParsing.AllCategoryNames.Name, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Last Company Name",
    "required": true,
    "category": ResumeParsing.FieldCategories.pr,
    "canSuggest": true
  },
  "lastCompanyDesignation": {
    "like": [ResumeParsing.AllCategoryNames.Name, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Last Company Designation",
    "required": true,
    "category": ResumeParsing.FieldCategories.pr,
    "canSuggest": true
  },
  "companyDuration": {
    "like": [ResumeParsing.AllCategoryNames.Date, ResumeParsing.AllCategoryNames.Number],
    "value": "",
    "label": "Company Duration",
    "required": true,
    "category": ResumeParsing.FieldCategories.pr,
    "canSuggest": true
  },
  "companyDetails": {
    "like": [ResumeParsing.AllCategoryNames.Description, ResumeParsing.AllCategoryNames.List, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Company Details",
    "required": true,
    "category": ResumeParsing.FieldCategories.pr,
    "canSuggest": true
  },
  "collegeName": {
    "like": [ResumeParsing.AllCategoryNames.Name, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "College Name",
    "required": true,
    "category": ResumeParsing.FieldCategories.edu,
    "canSuggest": true
  },
  "course": {
    "like": [ResumeParsing.AllCategoryNames.Name, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "Degree",
    "required": true,
    "category": ResumeParsing.FieldCategories.edu,
    "canSuggest": true
  },
  "collegeDuration": {
    "like": [ResumeParsing.AllCategoryNames.Date, ResumeParsing.AllCategoryNames.Number],
    "value": "",
    "label": "College Duration",
    "required": true,
    "category": ResumeParsing.FieldCategories.edu,
    "canSuggest": true
  },
  "collegeDetails": {
    "like": [ResumeParsing.AllCategoryNames.Description, ResumeParsing.AllCategoryNames.String],
    "value": "",
    "label": "College Details",
    "required": true,
    "category": ResumeParsing.FieldCategories.edu,
    "canSuggest": true
  }
};

/** Dynamically assigning ID for DOM traversal to each field  */
Object.keys(ResumeParsing.AllFields).forEach((f) => {
  ResumeParsing.AllFields[f].id = ResumeParsing.IdPrefix + f;
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
    f.init();
    // Updating current resume page number vs all resume pages
    _updatePageCount(_getPageCount());
  },

  /**
   * Initiates all event handlers on the page
   *
   */
  _initHandlers = function() {
    /** 
     * Few variables required to hold click counters to support 3-click
     */

    let clickTimer,
    mdCoords;
    const clickDelay = 300;

    /**
     * Gets the selected text
     * and shows the context menu with 
     * smart suggestions
     *
     * @param {MouseEvent} evt
     */
    $(elem.resume).on("mousedown", function(e) {
      mdCoords = u.getMousePosition(e);
    }).on("mouseup", function(e) {
      clearInterval(clickTimer);
      clickTimer = setTimeout(function () {
        let _txt = st.get();
        if (_txt) {
          cm.init({
            mouseDown: mdCoords,
            evt: e,
            suggestion: ss.analyze(_txt),
            searchText: _txt
          });
        } // else deselection or empty/invalid text in select
      }, clickDelay);
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

    /**
     * Initializing FORM on click of preview button
     */
    $(elem.preview).on("click", function() {
      f.init();
    });
  },

  /**
   * Toggles the resume page
   * depending on whether next or previous arow icon is clicked
   * isNext parameter is used to tell whether next page or previous page is to be shown
   * @param {MouseEvent} e
   * @param {Boolean} isNext
   */
  _updatePage = function(e, isNext) {
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
  },

  /**
   * Returns an object with 2 properties namely
   * total: total number of resume pages
   * curr: current visible page of resume on screen
   *
   * @returns {Object}
   */
  _getPageCount = function() {
    const kids = $(elem.resume).children();
    let pagesCount = 0,
    currPage = 0;
    if (kids && kids.length > 0) {
      // there is at least onepage available
      pagesCount = kids.length;
      currPage = kids.index($(elem.currResumePage));
      currPage = currPage > -1 ? currPage + 1 : 0;
    } 
    return {
      total: pagesCount,
      curr: currPage
    };
  },

  /**
   * Takes in object with 2 properties namely
   * total: total number of resume pages
   * curr: current visible page of resume on screen
   * and updates the DOM with corresponding page count
   *
   * @param {*} {total, curr}
   */
  _updatePageCount = function({total, curr}) {
    $(elem.pageCount).html(curr + " / " + total);
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
      e = window.getSelection().toString().trim() :
      document.selection && "Control" != document.selection.type &&
      (e = (document.selection.createRange().text).trim()), "" !== e && e;
  },

  /**
   * Clears existing text selection on a web page 
   *
   */
  clearSelection = function() {
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
  };

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
  Form: f,
  FormUtilities: fu
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
  const init = function ({
    mouseDown: md, 
    evt: e, 
    suggestion: sug, 
    searchText: txt}) {
    selectedText = txt;
    _createDom(sug);
    _setPosition(e, md);
    _initHandlers();
  },

  body = $("body"),
  cmOpen = u.getIdentifierName(elem.cmOpen),

  /**
   * Initiates all event handlers on context menu
   *
   */
  _initHandlers = function() {
    body.on("mousedown", _closeContextMenu);
    $(elem.cmListItems).on("click", _handleCmClick);
  },

  /**
   * Destroys all event handlers placed on context menu
   *
   */
  _destroyHandlers = function() {
    body.off("mousedown", _closeContextMenu);
  },

  _handleCmClick = function(e) {
    const elm = e.target || e.srcElement;
    const li = $(elm).closest(elem.cmListItems);
    let field = li.data("resumeField");
    field = field.replace(prefix, "");
    f.updateToForm(field, selectedText);
    _close();
  },

  _getDomString = function (field) {
    const listItem = u.getIdentifierName(elem.cmListItems);
    return `
      <li class="${listItem} ${ field.value ? 'visited' : '' }" data-resume-field="${field.id}">
        <span>${field.label}<span>
      </li>
    `;
  },

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
  _createDom = function(suggestions) {
    const obj = {
      class: u.getIdentifierName(elem.contextMenu),
      itemClass: u.getIdentifierName(elem.cmList),
      suggestedReqdDone: "",
      suggestedReqdLeft: "",
      suggestedOptionalDone: "",
      suggestedOptionalLeft: "",
      requiredDone: "",
      requiredLeft: "",
      optionalDone: "",
      optionalLeft: "",
      reqDone: fu.getReqDone().length,
      reqTotal: fu.getReq().length
    };

    for (let f in af) {
      const field = af[f];
      if (field.canSuggest) {
        if (suggestions.indexOf(f) >= 0) {
          _updateSuggested(obj, field);
        } else {
          _updateRemaining(obj, field);
        }
      }
    }

    $(elem.resume).append(_getCm(obj));
    body.addClass(cmOpen);
  },

  _updateSuggested = function(obj, f) {
    const domString = _getDomString(f);
    if(f.value) {
      if(f.isRequired) {
        obj.suggestedReqdDone = obj.suggestedReqdDone + domString;
      } else {
        obj.suggestedOptionalDone = obj.suggestedOptionalDone + domString;
      }
    } else {
      if (f.isRequired) {
        obj.suggestedReqdLeft = obj.suggestedReqdLeft + domString;
      } else {
        obj.suggestedOptionalLeft = obj.suggestedOptionalLeft + domString;
      }
    }
  },

  _updateRemaining = function (obj, f) {
    const domString = _getDomString(f);
    if (f.value) {
      if (f.isRequired) {
        obj.requiredDone = obj.requiredDone + domString;
      } else {
        obj.optionalDone = obj.optionalDone + domString;
      }
    } else {
      if (f.isRequired) {
        obj.requiredLeft = obj.requiredLeft + domString;
      } else {
        obj.optionalLeft = obj.optionalLeft + domString;
      }
    }
  },

  _getCm = function({
    class:c,
    itemClass: ic,
    suggestedReqdDone: srd,
    suggestedReqdLeft: srl,
    suggestedOptionalDone: sod,
    suggestedOptionalLeft: sol,
    requiredDone: rd,
    requiredLeft: rl,
    optionalDone: od,
    optionalLeft: ol,
    reqDone,
    reqTotal
  }) {
      /**
       * Suggested items are always given top priority
       * Order in which context menu items are shows is as below:
       * Sugested + Required + Unfilled
       * Suggested + Optional + Unfilled
       * Suggested + Required + Filled
       * Suggested + Optional + Filled
       * Required + Unfilled
       * Optional + Unfilled
       * Required + Filled
       * Optional + Filled
       */
    return `
      <div class="dropdown ${c}">
        <ul class="dropdown-menu ${ic}">
          ${srl}
          ${sol}
          ${srd}
          ${sod}
          ${rl}
          ${ol}
          ${rd}
          ${od}
        </ul>
        <div class="reqd-info">
          Required<sup>*</sup> - ${reqDone}/${reqTotal}
        </div>
      </div>`;
  },

  /**
   * This function would open the context menu based on the mouse event passed to the funcion
   *
   * @param {MouseEvent} e
   */
  _setPosition = function (e, md) {
    const pos = _getPosition(e, md);
    $(elem.contextMenu).css({
      top: pos.top,
      left: pos.left
    });
    body.addClass(cmOpen);
  },

  /**
   * Gets most suitable X & Y coordinates for context menu to be placed.
   * If any of the mouse position coordinates are at the edge of the page then this edge case is handled as well
   *
   * @param {MouseEvent} e
   * @returns { Object {left: Number, right: Number}} { left: 0, right: 0 }
   */
  _getPosition = function(e, md) {
    const mu = u.getMousePosition(e),
    hh = $("header").outerHeight();
    // To open CM always on right side of selection
    // in case selection is done from right to left
    // Expected is from left to right
    let actual = {
      x: Math.max(md.x, mu.x),
      y: Math.max(md.y, mu.y) - hh
    };

    // 200 is the max width of context menu
    const widthDiff = (200 + actual.x) - $(document).outerWidth(),
          // 250 is the max height of context menu
      heightDiff = (250 + actual.y) - $(document).outerHeight();

    if (actual.x < 20) {
      actual.x = 50;
    }
    if (widthDiff > 0) {
      actual.x = actual.x - widthDiff;
    }
    return {
      left: actual.x,
      top: heightDiff > 0 ? actual.y - 250 - hh - 20 : actual.y
    };
  },

  /**
   * This function would remove all of the open context menus from the page
   *
   */
  _close = function() {
    body.removeClass(elem.cmOpen);
    $(elem.contextMenu).remove();
  },

  /**
   * Closes context menu completely and 
   * destroys its corresponding event handlers as well
   *
   * @param {MouseEvent} e
   */
  _closeContextMenu = function (e) {
    const _elm = e.target || e.srcElement,
          cmElem = $(_elm).closest(elem.contextMenu);
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
  },

  /**
   * Checks if given text is a list or not
   *
   * @param {String} s
   * @returns {Boolean} Boolean
   */
  _checkListType = function(s) {
    // A separator to determine line breaks for strings items
    const separator = "_|--|_";
    // RegEx for non-keyboard characters
    const keyBoardKeys = new RegExp(/[^ A-Za-z0-9.,?'"!@#$%^&*()-_=+;:<>/\\|}{[\]`~]/g);
    // Regex for new line, carriage return and other forms of whitespace
    const newLineRule = new RegExp(/(\r\n|\n|\r|\f|\t|\v| (?= ))/g);
    let x = s.replace(keyBoardKeys, separator);
    x = x.replace(newLineRule, separator);
    return x && x.indexOf(separator) > -1;
  },

  /**
   * Orders analysis of sub-analysis function and gives suggestion accordingly
   *
   * @param {String} txt
   * @returns Array of unique suggestions
   */
  analyze = function(txt) {
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
  },

  /**
   * Analyzes all number types and suggests fields accordingly
   *
   * @param {String} txt
   * @returns {String[]} Array of unique suugestions
   */
  analyzeNumber = function(txt) {
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
        // Suggest all
        return _suggest();
      }
    }
  },

  /**
   * Returns a unique set of all sugestions related to numbers
   * excludeType is passed in case some number type is to be excluded from suggestions
   * @param {Number} excludeType
   * @returns {String[]} Array of unique number suggestions
   */
  _suggestAllNumberTypes = function(excludeTypes) {
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
  },

  /**
   * Analyzes short string types and suggests fields accordingly
   *
   * @param {String} txt
   * @returns {String[]} Array of unique suugestions
   */
  analyzeShortString = function(txt) {
    if (mayBeA(ac.Email, txt)) {
      return _suggest(ac.Email);
    } else if (mayBeA(ac.Name, txt)) {
      return _suggest(ac.Name);
    } else {
      console.info("No suggestions for '" + txt + "'");
      // Suggest all
      return _suggest();
    }
  },

  /**
   * Suggests all fields in form
   * Useful when all field items are to be suggested
   * @returns {String[]} Array of unique suggestions
   */
  getAllFieldsForSuggestion = function() {
    return Object.keys(af).reduce((acc, cv) => {
      if(af[cv].canSuggest) {
        acc.push(cv);
      }
      return acc;
    }, []);
  },

  /**
   * Check if all of the items have been suggested
   *
   * @param {String[]} arr
   * @returns {Boolean} Boolean
   */
  ifAllSuggested = function (arr) {
    return arr.length === (getAllFieldsForSuggestion().length);
  },

  /**
   * Suggests fields based on type provided
   * If no type is provided then all fields are suggested
   * @param {Number} type
   * @returns {String[]} Array of unique suggestions
   */
  _suggest = function(type) {
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

//#region ResumeParsing.FormUtilities

(function ({
  AllFields: af,
  FormUtilities: fu
}) {

  const _allKeys = Object.keys(af),

  /**
   * Get all required fields count
   *
   * @returns {Array<string>} keys
   */
  getTotalRequiredFields = function () {
    return _allKeys.filter(k => af[k].required);
  },

  /**
   * Get all optional fields count
   *
   * @returns {Array<string>} keys
   */
  getTotalOptionalFields = function () {
    return _allKeys.filter(k => !af[k].required);
  },

  /**
   * Get count of all required fields with values filled
   *
   * @returns {Array<string>} keys
   */
  getFilledRequiredFields = function () {
    return _allKeys.filter(k => af[k].required && !!af[k].value);
  },

  /**
   * Get count of all required fields with empty/null values
   *
   * @returns {Array<string>} keys
   */
  getRemainingRequiredFields = function () {
    return _allKeys.filter(k => af[k].required && !af[k].value);
  },

  /**
   * Get count of all optional fields with values filled
   *
   * @returns {Array<string>} keys
   */
  getFilledOptionalFields = function () {
    return _allKeys.filter(k => !af[k].required && !!af[k].value);
  },

  /**
   * Get count of all optional fields with empty / null values
   *
   * @returns {Array<string>} keys
   */
  getRemainingOptionalFields = function () {
    return _allKeys.filter(k => !af[k].required && !af[k].value);
  },

  /**
   * Get count of all filled fields
   *
   * @returns {Array<string>} keys
   */
  getAllFilled = function () {
    return _allKeys.filter(k => !!af[k].value);
  },

  /**
   * Get count of all empty / null fields
   *
   * @returns {Number} length
   */
  getAllEmpty = function () {
    return _allKeys.filter(k => !af[k].value);
  };

  fu.getReq = getTotalRequiredFields;
  fu.getOptional = getTotalOptionalFields;
  fu.getReqDone = getFilledRequiredFields;
  fu.getReqLeft = getRemainingRequiredFields;
  fu.getOptionalDone = getFilledOptionalFields;
  fu.getOptionalLeft = getRemainingOptionalFields;
  fu.getAllDone = getAllFilled;
  fu.getAllLeft = getAllEmpty;

})(ResumeParsing);

//#endregion

//#region ResumeParsing.Form 

(function({ 
  Form: f,
  AllFields: af,
  DOM: elem,
  Utility: u,
  FormUtilities: fu,
  IdPrefix: pFix
}) {


  const _allKeys = Object.keys(af),
  tf = _allKeys.length,

  /**
   * The function reads all filled values and updates the progress bar accordingly
   * Accepts a boolean param that tells wether to include only required fields in calculation or not
   * @param {Boolean} onlyReq
   */
  updateFilledFields = function (onlyReq) {
    const len = onlyReq ? fu.getReq().length : _allKeys.length,
    pBar = $(elem.progressBar),
    percnt = parseInt((fu.getAllDone().length / len) * 100) + "%",
    iconW = pBar.prev().outerWidth(),
    actualW = `calc(${percnt} - ${iconW}px)`;
    pBar.width(actualW);
    // Adding final text to the progress bar
    $(elem.progress).html(percnt + " Complete");
  },

  init = function() {
    _initHandlers();
    // Updating count of filled fields vs all fields
    updateFilledFields(true);
  },

  _initHandlers = function () {
    // Add all form elem evt handlers here
    $(elem.form).on("change keyup paste cut", "." + elem.formItem, function(ev) {
      const key = ev.which || ev.key,
      self = this;
      let updateTimer;
      // Update field if enter key is pressed isndie the input box
      if(key && key === 13) {
        // blur the input box and update values here
        $(this).trigger("blur");
        updateFilledFields(true);
      } else {
        // Since value updateion is done on every keyup, 
        // performance hit is saved via setTimeout by not checking it everytime and only after half a second
        clearTimeout(updateTimer);
        updateTimer = setTimeout(() => {
          // update main object here
          _updateFromSidebar($(self));
        }, 500)
      }
    }).on("change keyup paste cut", "textarea", function () {
      u.adjustHeight(this);
    });

    // Event handler for click on NEXT button in header
    $(elem.next).on("click", function(ev) {
      ev.preventDefault();
      validateForm();
      // If form has some problem, the above method would stop it already otherwise do the following
      // Save data via some ajax call and move to next page/layout
      alert("Success, all of the items are properly filled");
    });
  },

  /**
   * This function updates value to sidebar when user selects value from context menu
   * These changes will reflect in sidebar instantly and would update the progress bar 
   * @param {String} field - This would be the name of the filed whose value is getting updated
   * @param {String} txt - This is the text that is being updated in the field
   */
  updateToForm = function (field, txt) {
    // Field reference from main object
    const item = af[field],
      _el = $("#" + item.id);
    // Updating the corresponding form DOM element
    if (_el && _el.length > 0) {
      // If text is date then convert it to a proper date with supported yyyy-mm-dd format
      txt = item.like.indexOf(ResumeParsing.AllCategoryNames.Date) > -1 ? _getValidatedDate(txt) : txt;
      // Updating the original object
      item.value = txt;
      _el.val(txt);
      // Since textarea do not support auto height as per content, doing this via script in timeout
      setTimeout(function() {
        if(_el.is("textarea")) {
          u.adjustHeight(_el[0]);
        }
      }, 10);
    }
    // This function updates the progress bar
    updateFilledFields(true);
  },

  /**
   * The function takes a possible date string which is probably an invalid format
   * Converts invalid format to a valid one i.e. yyyy-mm-dd and returns it
   * @param {String} txt
   * @returns {String} Date
   */
  _getValidatedDate = function(txt) {
    // Making a Date object out of Date string
    const _temp = new Date(txt);
    if (_temp != 'Invalid Date') {
      const mnth = ("0" + (_temp.getMonth() + 1)).slice(-2),
        day = ("0" + _temp.getDate()).slice(-2);
      return [_temp.getFullYear(), mnth, day].join("-");
    } else {
      // Date can either be separated via a . (Dot), - (dash) or a forward slash (/)
      const separator = txt.indexOf(".") > -1 ? "." : (txt.indexOf("/") > -1 ? "/" : "-"),
        dateParts = txt.split(separator);

      if (dateParts.length > 1) {
        let dd, mm, yyyy;
        dateParts.forEach((p) => {
          const item = parseInt(p, 10);
          if (item <= 12 && !mm) {
            mm = item;
          } else if (item <= 31 && !dd) {
            dd = item;
          } else if (item >= 1970 && !yyyy) {
            yyyy = item;
          } else {
            dateError();
          }
        });
        return [yyyy, mm, dd].join("-");
      } else {
        dateError();
      }
    }

    function dateError() {
      // Show error of invalid date format
      console.warn("Invalid date", txt);
      return;
    }
  },

  /**
   * Function updates the actual object with all field values as well as progress bar when some changes are made
   * directly into the sidebar
   *
   * @param {jQueryElement} el
   */
  _updateFromSidebar = function(el) {
    const field = el.attr("id").replace(pFix, "");
    af[field].value = el.val();
    updateFilledFields(true);
  },

  /**
   * The function validates if all fields are filled properly and there is no required field which is left empty
   * The function also validates specefic types of fields if required
   */
  validateForm = function() {
    _allKeys.forEach((key) => {
      const item = af[key];
      if(item.required && !item.value) {
        // Check if any of the required items are left blank
        showError(item.label);
      }
    });

    function showError(field, msg) {
      msg = msg ? " " + msg : " cannot be blank";
      alert(field + msg);
      return;
    }
  };

  // Making functions Public
  f.allFieldsCount = tf;
  f.updateAllCount = updateFilledFields;
  f.init = init;
  f.isValid = validateForm;
  f.updateToForm = updateToForm;
  
})(ResumeParsing);

//#endregion

//#region Document Ready

$(() => {
  // Initialize UserForm on Document Ready
  ResumeParsing.Main.init();
});

//#endregion
