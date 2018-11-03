let ResumeParsing = {};
let _allKeys = [];

(function({
  Form: f,
  AllFields: af,
  DOM: elem,
  Utility: u,
  IdPrefix: pFix,
  FieldCategories: cat
}) {

  const _initHandlers = function() {
    // Add all form elem evt handlers here
  };

  const create = function() {
    // Append dynamically created form in side bar
    $(elem.form).html(_getHtml());

    // Attach event handlers on dynamically added elements in side bar
    _initHandlers();
  };

  const _getHtml = function() {
    const _personal = _makeHtml(cat.pe),
      _proff = _makeHtml(cat.pr),
      _edu = _makeHtml(cat.edu);

      return _personal + _proff + _edu;
  };

  const _makeHtml = function(type) {
    let className = type + "-info",
    keys;
    const obj = _filterData(cat.pe);
    if (obj && (keys = Object.keys(obj), keys.length > 0)) {
      let _content = "";
      keys.forEach((k) => {
        const o = obj[k];
        if (o.type !== "desc") {
          _content = _content +
            `<input class="${o.dom.classList.join(" ")}" type="${ o.dom.type }" placeholder="${ o.dom.placeholder }">`;
        } else {
          _content = _content +
          `<section class="descriptionList">
            <span>${o.label}</span>
            <input type="text" placeholder="${ o.dom.placeholder }" />
          </section>`;
        }
      });
      return `<section class="${ className } personal-info">${ _content }</section>`;
    } else {
      return "";
    }
  };

  const _filterData = function(type) {
    return _allKeys.reduce((acc, cv, ci) => {
      const o = af[cv];
      if(o.category === type && o.required) {
        acc[cv] = o;
      }
      return acc;
    }, {});
  };


})(ResumeParsing);