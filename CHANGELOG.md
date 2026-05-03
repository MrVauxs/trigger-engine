# 1.7.0

- add a new module hook to register extra nodes for an existing application
- add `boolean -> number` auto-convertor (true=1; false=0)
- all condition nodes now have two states
  - `Split` which is the same as before
  - `Boolean` which only has a single `Out` bridge connection and an extra `Boolean` output representing the result
- fix drag selection sticking on the canvas when using `[Right-Click]` while dragging
  - the selection will now disappear whenever you click again on the canvas
- `pf2e-trigger`:
  - add new `Everything` state to `Damage Taken` event node
    - it triggers for everything and allows you to check yourself what type of event it was later in the trigger
  - add `Update Initiative` action node with convenient `Before/After Combatant` states
  - add `Value` output to `Has Condition` representing the highest existing value of the found conditions
  - **BREAKING CHANGE:** the `Has Item` condition node has been split into two distinct nodes (due to condition nodes now always having two states)
    - `Has Item with Source UUID` which is the same as before
    - `Has Item with Slug` which is now its own node instead of being a state for `Has Item`
    - all `Has Item` nodes that were using `Source UUID` will work as is, no change required
    - all `Has Item` nodes that were using `Slug` will have to be replaced sadly (your triggers will reach a blank node otherwise)
  - fix `Distance Between Tokens` output label localization

# 1.6.0

- this is a foundry version `14.360` release
- update to be compatible with the various v14 changes

# 1.5.1

- the `Scene Targets`, `Filter Targets` and `Execute Script` nodes will now log any error caused by the user provided function instead of catching it silently
  - the try/catch is for the entire node context, so any error will still break the entire node's process
- `pf2e-trigger`:
  - fix `Extra Note` localization typo in the `Roll Data` section of the `Roll Damage` and `Roll Save` nodes

# 1.5.0

- `pf2e-trigger`:
  - add `Action Sent to Chat` event node:
    - it will trigger whenever an action message is created regardless of how (there is no way to identify otherwise)
    - if the `Action Slug` remains empty, the event will trigger for any action
    - the `Targets` output is only ever related to the `PF2e Toolbelt` module as action messages normally don't have a target
  - add `Remove Condition` action node:
    - it will remove every non-locked instances of the condition from the actor

# 1.4.2

- `Extract from Actor/Item`:
  - fix `path` field for the custom outputs not being localized
- `pf2e-trigger`:
  - `Decrease Condition`:
    - fix the condition value being raised to the `min` input if the actor already had the condition at a lower value

# 1.4.1

- `pf2e-trigger`:
  - `Roll Damage`:
    - fix dc value not always being forwarded to the message flags

# 1.4.0

- fix the `Create/Edit Trigger` dialog width
- `pf2e-trigger`:
  - `Increase Condition`:
    - fix mishandling of increment value
  - `Move Time`:
    - add new `Threshold` state allowing you to move time up to a defined system threshold (dusk, down, etc.)
    - fix node missing icon

# 1.3.0

- `pf2e-trigger`:
  - add `Is Reroll` boolean output to the `Attack Rolled` and `Check Rolled` event nodes
  - add `Has Special Resource` condition node
    - the resource must also have a `max` value greater than `0`
      - this is useful for mythic characters as `hero-points` always exists in the data
    - it returns the current value as an output (default `-1`)
  - add `Move Time` action node to update the system world clock
  - rename `Update Resource` into `Update Special Resource`

# 1.2.0

- move the `Filter Targets` node to the `Extrator` category
- fix not being able to enable third-party triggers if no copy exist in your world
- `pf2e-trigger`:
  - add new `Extract Item Formula` node
    - you can extract formula from a compendium/world item as well
  - move the `Get ChoiceSet Selection` node to the `Extractor` category
  - move the `Get RollOption Value` node to the `Extractor` category

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
