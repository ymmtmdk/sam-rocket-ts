//
////////////////////////////////////////////////////////////////////////////////
// Model
//
var COUNTER_MAX = 10;
var Model = (function () {
    function Model() {
        this.__counter = COUNTER_MAX;
        this.__started = false;
        this.__launched = false;
        this.__aborted = false;
    }
    Object.defineProperty(Model.prototype, "state", {
        get: function () { return this.__state; },
        set: function (state) { this.__state = state; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "counter", {
        get: function () { return this.__counter; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "started", {
        get: function () { return this.__started; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "launched", {
        get: function () { return this.__launched; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "aborted", {
        get: function () { return this.__aborted; },
        enumerable: true,
        configurable: true
    });
    Model.prototype.present = function (data) {
        if (this.state.counting(this)) {
            if (this.counter === 0) {
                this.__launched = data.launched || false;
            }
            else {
                this.__aborted = data.aborted || false;
                if (data.counter !== undefined) {
                    this.__counter = data.counter;
                }
            }
        }
        else {
            if (this.state.ready(this)) {
                this.__started = data.started || false;
            }
        }
        this.state.render(this);
    };
    return Model;
}());
////////////////////////////////////////////////////////////////////////////////
// View
//
var View = (function () {
    function View() {
    }
    // Initial State
    View.prototype.init = function (model) {
        return this.ready(model);
    };
    // State representation of the ready state
    View.prototype.ready = function (model) {
        return ("<p>Counter:" + model.counter + "</p>\n\
      <form onSubmit=\"JavaScript:return actions.start({});\">\n\
      <input type=\"submit\" value=\"Start\">\n\
      </form>");
    };
    // State representation of the counting state
    View.prototype.counting = function (model) {
        return ("<p>Count down:" + model.counter + "</p>\n\
      <form onSubmit=\"JavaScript:return actions.abort({});\">\n\
      <input type=\"submit\" value=\"Abort\">\n\
      </form>");
    };
    // State representation of the aborted state
    View.prototype.aborted = function (model) {
        return ("<p>Aborted at Counter:" + model.counter + "</p>\n");
    };
    // State representation of the launched state
    View.prototype.launched = function (model) {
        return ("<p>Launched</p>");
    };
    // display the state representation
    View.prototype.display = function (representation) {
        if (typeof document !== "undefined") {
            var stateRepresentation = document.getElementById("representation");
            stateRepresentation.innerHTML = representation;
        }
        console.log(representation);
    };
    return View;
}());
////////////////////////////////////////////////////////////////////////////////
// State
//
var State = (function () {
    function State(view, actions) {
        this.__view = view;
        this.__actioncs = actions;
    }
    Object.defineProperty(State.prototype, "view", {
        get: function () { return this.__view; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(State.prototype, "actions", {
        get: function () { return this.__actioncs; },
        enumerable: true,
        configurable: true
    });
    // Derive the current state of the system
    State.prototype.ready = function (model) {
        return ((model.counter === COUNTER_MAX) && !model.started && !model.launched && !model.aborted);
    };
    State.prototype.counting = function (model) {
        var status = ((model.counter <= COUNTER_MAX) && (model.counter >= 0)
            && model.started && !model.launched && !model.aborted);
        return status;
    };
    State.prototype.launched = function (model) {
        return ((model.counter === 0) && model.started && model.launched && !model.aborted);
    };
    State.prototype.aborted = function (model) {
        return ((model.counter <= COUNTER_MAX) && (model.counter >= 0)
            && model.started && !model.launched && model.aborted);
    };
    State.prototype.render = function (model) {
        this.representation(model);
        this.nextAction(model);
    };
    // Next action predicate, derives whether
    // the system is in a (control) state where
    // an action needs to be invoked
    State.prototype.nextAction = function (model) {
        if (this.counting(model)) {
            if (model.counter > 0) {
                this.actions.decrement({ counter: model.counter }, model.present.bind(model));
            }
            if (model.counter === 0) {
                this.actions.launch({}, model.present.bind(model));
            }
        }
    };
    // Derive the state representation as a function of the systen
    // control state
    State.prototype.representation = function (model) {
        var representation = "oops... something went wrong, the system is in an invalid state";
        if (this.ready(model)) {
            representation = this.view.ready(model);
        }
        if (this.counting(model)) {
            representation = this.view.counting(model);
        }
        if (this.launched(model)) {
            representation = this.view.launched(model);
        }
        if (this.aborted(model)) {
            representation = this.view.aborted(model);
        }
        this.view.display(representation);
    };
    return State;
}());
////////////////////////////////////////////////////////////////////////////////
// Actions
//
var Actions = (function () {
    function Actions(model) {
        this.__model = model;
    }
    Object.defineProperty(Actions.prototype, "model", {
        get: function () { return this.__model; },
        enumerable: true,
        configurable: true
    });
    Actions.prototype.start = function (data, present) {
        present = present || this.model.present.bind(this.model);
        data = data || {};
        data.started = true;
        present(data);
        return false;
    };
    Actions.prototype.decrement = function (data, present) {
        present = present || this.model.present.bind(this.model);
        data = data || {};
        data.counter = data.counter || 10;
        var d = data;
        var p = present;
        setTimeout(function () {
            d.counter = d.counter - 1;
            p(d);
        }, 1000);
    };
    Actions.prototype.launch = function (data, present) {
        present = present || this.model.present.bind(this.model);
        data.launched = true;
        present(data);
    };
    Actions.prototype.abort = function (data, present) {
        present = present || this.model.present.bind(this.model);
        data.aborted = true;
        present(data);
        return false;
    };
    return Actions;
}());
var model = new Model();
var actions = new Actions(model);
var view = new View();
var state = new State(view, actions);
model.state = state;
view.display(view.init(model));
actions.start({}, null);
//# sourceMappingURL=rocket.js.map