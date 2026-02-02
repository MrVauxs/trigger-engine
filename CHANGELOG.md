# 1.0.2

- `pf2e-trigger`:
  - the `Compare Alliance` node no longer uses the system's `isAllyOf` and `isEnemeyOf` methods, it instead directly compare their alliance ; which means that comparing an actor with itself will now return `true` for `Are Allies`
  - image paths inputs are now doubled to support paths from both the pf2e & sf2e systems

# 1.0.1

- `pf2e-trigger`:
  - add a `Roller` target output to the `Check Roll` event node, the `Target` out put which was previously the roller of the check will now be the actual target of the message

# 1.0.0

- official foundry release
