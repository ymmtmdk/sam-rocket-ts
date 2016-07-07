//
////////////////////////////////////////////////////////////////////////////////
// Model
//

const COUNTER_MAX = 10;

class Model {
  private __state;
  private __counter;
  private __started;
  private __launched;
  private __aborted;

  constructor() {
    this.__counter = COUNTER_MAX;
    this.__started = false;
    this.__launched = false;
    this.__aborted = false;
  }

  set state(state) { this.__state = state; }
  get state() { return this.__state; }
  get counter() { return this.__counter; }
  get started() { return this.__started; }
  get launched() { return this.__launched; }
  get aborted() { return this.__aborted; }

  public present(data) {
    if (this.state.counting(this)) {
      if (this.counter === 0) {
        this.__launched = data.launched || false;
      } else {
        this.__aborted = data.aborted || false;
        if (data.counter !== undefined) { this.__counter = data.counter; }
      }
    } else {
      if (this.state.ready(this)) {
        this.__started = data.started || false;
      }
    }
    this.state.render(this);
  }
}

////////////////////////////////////////////////////////////////////////////////
// View
//
class View {
  // Initial State
  public init(model) {
    return this.ready(model);
  }

  // State representation of the ready state
  public ready(model) {
    return (
      "<p>Counter:" + model.counter + "</p>\n\
      <form onSubmit=\"JavaScript:return actions.start({});\">\n\
      <input type=\"submit\" value=\"Start\">\n\
      </form>"
    );
  }

  // State representation of the counting state
  public counting(model) {
    return (
      "<p>Count down:" + model.counter + "</p>\n\
      <form onSubmit=\"JavaScript:return actions.abort({});\">\n\
      <input type=\"submit\" value=\"Abort\">\n\
      </form>"
    );
  }

  // State representation of the aborted state
  public aborted(model) {
    return (
      "<p>Aborted at Counter:" + model.counter + "</p>\n"
    );
  }

  // State representation of the launched state
  public launched(model) {
    return (
      "<p>Launched</p>"
    );
  }

  // display the state representation
  public display(representation) {
    if (typeof document !== "undefined") {
      const stateRepresentation = document.getElementById("representation");
      stateRepresentation.innerHTML = representation;
    }
    console.log(representation);
  }
}

////////////////////////////////////////////////////////////////////////////////
// State
//
class State {
  private __view;
  private __actioncs;
  constructor(view, actions) {
    this.__view = view;
    this.__actioncs = actions;
  }
  get view() { return this.__view; }
  get actions() { return this.__actioncs; }

  // Derive the current state of the system
  public ready(model) {
    return ((model.counter === COUNTER_MAX) && !model.started && !model.launched && !model.aborted);
  }

  public counting(model) {
    const status = ((model.counter <= COUNTER_MAX) && (model.counter >= 0)
                    && model.started && !model.launched && !model.aborted);
    return status;
  }

  public launched(model) {
    return ((model.counter === 0) && model.started && model.launched && !model.aborted);
  }

  public aborted(model) {
    return (
      (model.counter <= COUNTER_MAX) && (model.counter >= 0)
      && model.started && !model.launched && model.aborted);
  }

  public render(model) {
    this.representation(model);
    this.nextAction(model);
  }

  // Next action predicate, derives whether
  // the system is in a (control) state where
  // an action needs to be invoked
  private nextAction(model) {
    if (this.counting(model)) {
      if (model.counter > 0) {
        this.actions.decrement({ counter: model.counter }, model.present.bind(model));
      }

      if (model.counter === 0) {
        this.actions.launch({}, model.present.bind(model));
      }
    }
  }

  // Derive the state representation as a function of the systen
  // control state
  private representation(model) {
    let representation = "oops... something went wrong, the system is in an invalid state";

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
  }
}

////////////////////////////////////////////////////////////////////////////////
// Actions
//

class Actions {
  private __model;
  constructor(model) {
    this.__model = model;
  }

  get model() { return this.__model; }

  public start(data, present) {
    present = present || this.model.present.bind(this.model);
    data = data || {};
    data.started = true;
    present(data);
    return false;
  }

  public decrement(data, present) {
    present = present || this.model.present.bind(this.model);
    data = data || {};
    data.counter = data.counter || 10;
    const d = data;
    const p = present;
    setTimeout(function() {
      d.counter = d.counter - 1;
      p(d);
    }, 1000);
  }

  public launch(data, present) {
    present = present || this.model.present.bind(this.model);
    data.launched = true;
    present(data);
  }

  public abort(data, present) {
    present = present || this.model.present.bind(this.model);
    data.aborted = true;
    present(data);
    return false;
  }
}

const model = new Model();
const actions = new Actions(model);
const view = new View();
const state = new State(view, actions);
model.state = state;
view.display(view.init(model));
actions.start({}, null);
