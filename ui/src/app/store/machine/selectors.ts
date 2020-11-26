import type { Selector } from "@reduxjs/toolkit";
import { createSelector } from "@reduxjs/toolkit";

import filterNodes from "app/machines/filter-nodes";
import { ACTIONS } from "app/store/machine/slice";
import type {
  Machine,
  MachineState,
  MachineStatus,
  MachineStatuses,
} from "app/store/machine/types";
import type { RootState } from "app/store/root/types";
import { generateBaseSelectors } from "app/store/utils";

const defaultSelectors = generateBaseSelectors<
  MachineState,
  Machine,
  "system_id"
>("machine", "system_id");

/**
 * Returns currently active machine's system_id.
 * @param {RootState} state - The redux state.
 * @returns {Machine["system_id"]} Active machine system_id.
 */
const activeID = (state: RootState): Machine["system_id"] | null =>
  state.machine.active;

/**
 * Returns selected machine system_ids.
 * @param {RootState} state - The redux state.
 * @returns {Machine["system_id"][]} Selected machine system_ids.
 */
const selectedIDs = (state: RootState): Machine["system_id"][] =>
  state.machine.selected;

/**
 * Returns all machine statuses.
 * @param {RootState} state - The redux state.
 * @returns {MachineStatuses} A list of all statuses.
 */
const statuses = (state: RootState): MachineStatuses => state.machine.statuses;

const statusKeys = <T>(statuses: T): (keyof T)[] =>
  Object.keys(statuses) as (keyof T)[];

/**
 * Returns IDs of machines that are currently being processed.
 * @param {RootState} state - The redux state.
 * @returns {Machine["system_id"][]} List of machines being processed.
 */
const processing = (state: RootState): Machine["system_id"][] =>
  Object.keys(state.machine.statuses).filter((machineID) =>
    statusKeys(state.machine.statuses[machineID]).some(
      (status) => state.machine.statuses[machineID][status] === true
    )
  );

/**
 * Returns IDs of machines that are both selected and currently being processed.
 * @param {RootState} state - The redux state.
 * @returns {Machine["system_id"][]} List of selected machines being processed.
 */
const selectedProcessing = createSelector(
  [selectedIDs, processing],
  (selectedIDs: Machine["system_id"][], processing: Machine["system_id"][]) =>
    processing.filter((id) => selectedIDs.includes(id))
);

const statusSelectors: { [x: string]: Selector<RootState, Machine[]> } = {};

// Create a selector for each machine status.
ACTIONS.forEach(({ status }) => {
  statusSelectors[status] = createSelector(
    [defaultSelectors.all, statuses],
    (machines: Machine[], statuses: MachineStatuses) =>
      machines.filter(
        ({ system_id }) => statuses[system_id][status as keyof MachineStatus]
      )
  );
});

// Create a selector for selected machines in each machine status.
ACTIONS.forEach(({ status }) => {
  statusSelectors[`${status}Selected`] = createSelector(
    [statusSelectors[status], selectedIDs],
    (machines: Machine[], selectedIDs) =>
      machines.filter(({ system_id }) => selectedIDs.includes(system_id))
  );
});

/**
 * Get the statuses for a machine.
 * @param state - The redux state.
 * @param id - A machine's system id.
 * @returns The machine's statuses
 */
const getStatuses = createSelector(
  [statuses, (_state: RootState, id: Machine["system_id"]) => id],
  (allStatuses, id) => allStatuses[id]
);

/**
 * Get machines that match terms.
 * @param {RootState} state - The redux state.
 * @param {String} terms - The terms to match against.
 * @returns {Machine[]} A filtered list of machines.
 */
const search = createSelector(
  [
    defaultSelectors.all,
    (_state: RootState, terms: string, selectedIDs: Machine["system_id"]) => ({
      terms,
      selectedIDs,
    }),
  ],
  (items: Machine[], { terms, selectedIDs }) => {
    if (!terms) {
      return items;
    }
    return filterNodes(items, terms, selectedIDs);
  }
);

/**
 * Returns currently active machine.
 * @param {RootState} state - The redux state.
 * @returns {Machine} Active machine.
 */
const active = createSelector(
  [defaultSelectors.all, activeID],
  (machines: Machine[], activeID: Machine["system_id"] | null) =>
    machines.find((machine) => activeID === machine.system_id)
);

/**
 * Returns selected machines.
 * @param {RootState} state - The redux state.
 * @returns {Machine[]} Selected machines.
 */
const selected = createSelector(
  [defaultSelectors.all, selectedIDs],
  (machines: Machine[], selectedIDs: Machine["system_id"][]) =>
    selectedIDs.map((id) =>
      machines.find((machine) => id === machine.system_id)
    )
);

/**
 * Select the event errors for all machines.
 * @param state - The redux state.
 * @returns The event errors.
 */
const eventErrors = (state: RootState): MachineState["eventErrors"] =>
  state.machine.eventErrors;

/**
 * Select the event errors for a machine or machines.
 * @param ids - A machine's system ID or array of IDs.
 * @param event - A machine action event.
 * @returns The event errors for the machine.
 */
const eventErrorsForIds = createSelector(
  [
    eventErrors,
    (
      _state: RootState,
      ids: Machine["system_id"] | Machine["system_id"][],
      event?: string | null
    ) => ({
      ids,
      event,
    }),
  ],
  (errors: MachineState["eventErrors"][0][], { ids, event }) => {
    if (!errors || !ids) {
      return [];
    }
    // If a single id has been provided then turn into an array to operate over.
    const idArray = Array.isArray(ids) ? ids : [ids];
    return errors.reduce<MachineState["eventErrors"][0][]>((matches, error) => {
      let match = false;
      const matchesId = !!error.id && idArray.includes(error.id);
      // If an event has been provided as `null` then filter for errors with
      // a null event.
      if (event || event === null) {
        match = matchesId && error.event === event;
      } else {
        match = matchesId;
      }
      if (match) {
        matches.push(error);
      }
      return matches;
    }, []);
  }
);

const selectors = {
  ...defaultSelectors,
  aborting: statusSelectors["aborting"],
  abortingSelected: statusSelectors["abortingSelected"],
  acquiring: statusSelectors["acquiring"],
  acquiringSelected: statusSelectors["acquiringSelected"],
  active,
  activeID,
  checkingPower: statusSelectors["checkingPower"],
  checkingPowerSelected: statusSelectors["checkingPowerSelected"],
  commissioning: statusSelectors["commissioning"],
  commissioningSelected: statusSelectors["commissioningSelected"],
  deleting: statusSelectors["deleting"],
  deletingSelected: statusSelectors["deletingSelected"],
  deploying: statusSelectors["deploying"],
  deployingSelected: statusSelectors["deployingSelected"],
  enteringRescueMode: statusSelectors["enteringRescueMode"],
  enteringRescueModeSelected: statusSelectors["enteringRescueModeSelected"],
  eventErrors,
  eventErrorsForIds,
  exitingRescueMode: statusSelectors["exitingRescueMode"],
  exitingRescueModeSelected: statusSelectors["exitingRescueModeSelected"],
  getStatuses,
  locking: statusSelectors["locking"],
  lockingSelected: statusSelectors["lockingSelected"],
  markingBroken: statusSelectors["markingBroken"],
  markingBrokenSelected: statusSelectors["markingBrokenSelected"],
  markingFixed: statusSelectors["markingFixed"],
  markingFixedSelected: statusSelectors["markingFixedSelected"],
  overridingFailedTesting: statusSelectors["overridingFailedTesting"],
  overridingFailedTestingSelected:
    statusSelectors["overridingFailedTestingSelected"],
  processing,
  releasing: statusSelectors["releasing"],
  releasingSelected: statusSelectors["releasingSelected"],
  search,
  selected,
  selectedIDs,
  selectedProcessing,
  settingPool: statusSelectors["settingPool"],
  settingPoolSelected: statusSelectors["settingPoolSelected"],
  settingZone: statusSelectors["settingZone"],
  settingZoneSelected: statusSelectors["settingZoneSelected"],
  statuses,
  tagging: statusSelectors["tagging"],
  taggingSelected: statusSelectors["taggingSelected"],
  testing: statusSelectors["testing"],
  testingSelected: statusSelectors["testingSelected"],
  turningOff: statusSelectors["turningOff"],
  turningOffSelected: statusSelectors["turningOffSelected"],
  turningOn: statusSelectors["turningOn"],
  turningOnSelected: statusSelectors["turningOnSelected"],
  unlocking: statusSelectors["unlocking"],
  unlockingSelected: statusSelectors["unlockingSelected"],
};

export default selectors;
