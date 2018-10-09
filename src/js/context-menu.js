
function getSelectedText() {
  let e = "";
  return window.getSelection ? 
         e = window.getSelection().toString() : 
         document.selection && "Control" != document.selection.type && 
         (e = document.selection.createRange().text), "" !== e && e;
}
class SmartContextMenu {
  constructor() {
    this._createDom();
  }

  _createDom() {
    this._dom = {},
      this._el = document.createElement("div"),
      //add class function below
      // s["default"].add(this._el, "tooltip-share"),

      // adding inner Html
      // this._el.innerHTML = (0, u["default"])(),
      document.getElementById("app").appendChild(this._el),
      this._dom.content = this._el.querySelector(".tooltip-share__content"),
      this._setPosition(),
      this._isReady()
  }

  _setPosition() {
    var e = this._getPosition(),
      t = document.getElementById("app").scrollTop;
    this._el.style.top = e.y + t - this._el.offsetHeight - document.querySelector("header").offsetHeight - 30 + "px",
      this._el.style.left = e.x + "px"
  }

  _getPosition() {
    var e = document.selection,
      t = void 0,
      n = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };
    if (e && "Control" !== e.type) {
      var i = e.createRange();
      i.collapse(!0),
        n = {
          x: i.boundingLeft,
          y: i.boundingTop,
          width: i.boundingRight - i.boundingLeft,
          height: i.boundingBottom - i.boundingTop
        }
    } else if (window.getSelection && (e = window.getSelection(),
        e.rangeCount)) {
      var r = e.getRangeAt(0).cloneRange();
      if (r.getClientRects && (t = r.getClientRects(),
          t.length > 0 && (t = r.getClientRects()[0]),
          n = {
            x: t.left,
            y: t.top,
            width: t.right - t.left,
            height: t.bottom - t.top
          }),
        0 == n.x && 0 == n.y) {
        var a = document.createElement("span");
        if (a.getClientRects) {
          a.appendChild(document.createTextNode("​")),
            r.insertNode(a),
            t = a.getClientRects()[0],
            n = {
              x: t.left,
              y: t.top,
              width: t.right - t.left,
              height: t.bottom - t.top
            };
          var o = a.parentNode();
          o.removeChild(a),
            o.normalize()
        }
      }
    }
    return n
  }

  _isReady() {
    this._createBound();
    //Tween max stuff for animation
      // d["default"].fromTo(this._dom.content, .2, {
      //   opacity: 0,
      //   rotationX: -90,
      //   transformOrigin: "center bottom",
      //   transformPerspective: 400
      // }, {
      //   opacity: 1,
      //   rotationX: 0
      // });
      setTimeout(this._addListeners, 1);
  }

  _createBound() {
    var e = this;
    ["_onClick", "_addListeners", "_dispose", "_onResize"].forEach(function (t) {
      return e[t] = e[t].bind(e)
    })
  }

  _addListeners() {
    window.addEventListener("resize", this._onResize);
    document.body.addEventListener("mousedown", this._onClick)
  }

  _onResize() {
    this._setPosition();
  }

  _onClick(e) {
    if (this._hasParent(e, this._el)) {
      if (this._hasClass(e, "btn") !== document) {
        var t = void 0,
          n = this._hasClass(e, "btn"),
          i = document.URL;
        switch (n.getAttribute("data-share-type")) {
          case "linkedin":
            t = this._datas.text;
            var r = this.urlLk + "&source=LinkedIn&title=Publicis%20Groupe&summary=" + encodeURIComponent(t) + "&url=" + encodeURIComponent(i);
            this._open(r);
            break;
          case "twitter":
            t = this._datas.text.replace(/[\n]/gi, " ").substring(0, 140 - i.length - 2),
              this._open(this.urlTw + "?text=" + encodeURIComponent(t) + "&url" + encodeURIComponent(i))
        }
      }
    } else
      d["default"].to(this._dom.content, .2, {
        opacity: 0,
        rotationX: 90,
        transformOrigin: "center bottom",
        transformPerspective: 400,
        onComplete: this._dispose
      })
  }
}