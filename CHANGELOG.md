# 1.1.0

- the `text -> number` now returns `-1` as default value instead of `0`
- add new `Refresh Application` button next to the `Save Triggers` in the trigger menu
  - this completely closes and re-open the menu and re-select the current trigger
  - it offers you to save your triggers before the refresh, otherwise, any un-saved change will be lost
- `pf2e-trigger`:
  - add new `Update Effect Duration` action node
  - add new `Get RollOption Value` logic node
    - it returns the part after the provided prefix of a roll-option
    - e.g. you provide `kinetic-gate:first-element` and the returned value will be `fire-gate` if the roll-option is `kinetic-gate:first-element:fire-gate`
    - if you need it as a numerical value, the `text -> number` convertor will take care of it for you
  - fix `Increase Condition` reducing an existing badge value down to the `Maximum` input field
  - fix `Increase Effect Badge` not working in its `Item` state

# 1.0.2

- `pf2e-trigger`:
  - the `Compare Alliance` node no longer uses the system's `isAllyOf` and `isEnemeyOf` methods, it instead directly compare their alliance ; which means that comparing an actor with itself will now return `true` for `Are Allies`
  - image paths inputs are now doubled to support paths from both the pf2e & sf2e systems

# 1.0.1

- `pf2e-trigger`:
  - add a `Roller` target output to the `Check Roll` event node, the `Target` out put which was previously the roller of the check will now be the actual target of the message

# 1.0.0

- official foundry release
