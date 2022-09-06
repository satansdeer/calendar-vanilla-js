/**
 *
 * Date utils
 *
 */

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
// TESTS
// console.assert(getDaysInMonth(2022, 0) === 31, "January has 31 days");
// console.assert(getDaysInMonth(2022, 1) === 28, "February has 28 days");
// console.assert(getDaysInMonth(2022, 11) === 31, "December has 31 days");

function getFirstWeekDayForMonth(year, month) {
  return new Date(year, month, 1).getDay();
}
// TESTS
// console.assert(
//   getFirstWeekDayForMonth(2022, 8) === 4,
//   "First day of september 2022 is Thursday(4)"
// );
// console.assert(
//   getFirstWeekDayForMonth(2022, 5) === 3,
//   "First day of june 2022 is Wednesday(3)"
// );

/**
 *
 * State management
 *
 */

function createStore(reducer, initialState) {
  const store = {};
  store.state = initialState;
  store.listeners = [];
  store.subscribe = (listener) => store.listeners.push(listener);
  store.dispatch = (action) => {
    store.state = reducer(store.state, action);
    store.listeners.forEach((listener) => listener(action));
  };
  store.getState = () => store.state;

  return store;
}

// TESTS
// const testStore = createStore((state) => !state, true);
// console.assert(testStore.getState() === true, "Store has initial state");

// let actionsDispatched = [];
// testStore.subscribe((action) => actionsDispatched.push(action));
// testStore.dispatch({ type: "TEST_ACTION" });
// console.assert(testStore.getState() === false, "Store has updated state");
// console.assert(
//   actionsDispatched.length === 1 && actionsDispatched[0].type === "TEST_ACTION",
//   "Store subscribers receive actions"
// );

const NEXT_MONTH = "calendar/next_month";
const PREV_MONTH = "calendar/prev_month";

const nextMonth = () => ({ type: NEXT_MONTH });
const prevMonth = () => ({ type: PREV_MONTH });

function reducer(state, action) {
  switch (action.type) {
    case NEXT_MONTH: {
      const oldDate = state.date;
      const newDate = new Date(
        oldDate.getFullYear(),
        oldDate.getMonth() + 1,
        1
      );

      const offset = getFirstWeekDayForMonth(
        newDate.getFullYear(),
        newDate.getMonth()
      );
      const days = getDaysInMonth(newDate.getFullYear(), newDate.getMonth());

      return { date: newDate, offset, days };
    }
    case PREV_MONTH: {
      const oldDate = state.date;
      const newDate = new Date(
        oldDate.getFullYear(),
        oldDate.getMonth() - 1,
        1
      );

      const offset = getFirstWeekDayForMonth(
        newDate.getFullYear(),
        newDate.getMonth()
      );
      const days = getDaysInMonth(newDate.getFullYear(), newDate.getMonth());

      return { date: newDate, offset, days };
    }
    default: {
      return state;
    }
  }
}

// TESTS
// const testDate = new Date(2018, 2, 1);

// const testState = {
//   date: testDate,
//   days: getDaysInMonth(testDate.getFullYear(), testDate.getMonth()),
//   offset: getFirstWeekDayForMonth(testDate.getFullYear(), testDate.getMonth()),
// };

// console.assert(
//   reducer(testState, nextMonth()).date.getFullYear() === 2018,
//   "The year did not change"
// );
// console.assert(
//   reducer(testState, nextMonth()).date.getMonth() === 3,
//   "Month set to april"
// );
// console.assert(
//   reducer(testState, nextMonth()).offset === 0,
//   "First day of april is Sunday"
// );
// console.assert(
//   reducer(testState, nextMonth()).days === 30,
//   "April has 30 days"
// );

// console.assert(
//   reducer(testState, prevMonth()).date.getFullYear() === 2018,
//   "The year did not change"
// );
// console.assert(
//   reducer(testState, prevMonth()).date.getMonth() === 1,
//   "Month set to february"
// );
// console.assert(
//   reducer(testState, prevMonth()).offset === 4,
//   "First day of april is Thursday"
// );
// console.assert(
//   reducer(testState, prevMonth()).days === 28,
//   "February has 28 days"
// );

/**
 *
 * Rendering
 *
 */

function render(template, node) {
  if (!node) return;
  node.innerHTML = template;
}

const renderHeader = () => {
  const state = store.getState();
  const { date } = state;

  const markup = date.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  render(markup, document.querySelector("#calendar-header"));
};

const renderCalendar = () => {
  const state = store.getState();
  const { days, offset } = state;

  const markup = `
    <div class="calendar__day calendar__day-name">S</div>
    <div class="calendar__day calendar__day-name">M</div>
    <div class="calendar__day calendar__day-name">T</div>
    <div class="calendar__day calendar__day-name">W</div>
    <div class="calendar__day calendar__day-name">T</div>
    <div class="calendar__day calendar__day-name">F</div>
    <div class="calendar__day calendar__day-name">S</div>

    ${[...new Array(days + offset)]
      .map((_, index) => {
        const day = index + 1 - offset;
        const isCurrentMonth = day > 0;
        return `<div class="calendar__day">${isCurrentMonth ? day : ""}</div>`;
      })
      .join("")}
  `;

  render(markup, document.querySelector("#calendar"));
};

/**
 *
 * App initialization
 *
 */

const initialDate = new Date(2018, 2, 1);

const initialState = {
  date: initialDate,
  days: getDaysInMonth(initialDate.getFullYear(), initialDate.getMonth()),
  offset: getFirstWeekDayForMonth(
    initialDate.getFullYear(),
    initialDate.getMonth()
  ),
};

const store = createStore(reducer, initialState);
store.subscribe(renderCalendar);
store.subscribe(renderHeader);

renderHeader();
renderCalendar();

document
  .querySelector("[data-role='prev-month']")
  .addEventListener("click", () => store.dispatch(prevMonth()));

document
  .querySelector("[data-role='next-month']")
  .addEventListener("click", () => store.dispatch(nextMonth()));
