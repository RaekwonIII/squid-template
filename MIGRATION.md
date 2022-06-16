# Migration to :fire: :squid:

## Update packages

Run this command to update new packages:

```bash
npm update
```

If it does not work, please remove the `node_modules` folder and the `packages-lock.json` file.

## Install new dependencies

Next, install a new package:

```bash
npm i @subsquid/typeorm-store
```

## Update `typegen.json` config file and launch typegen

With the newest release, pallet names capitalization is preserved, so `balances.Transfer`, should become `Balances.Transfer`. We need to reflect this everywhere in our code, starting with the typegen configuration:

```json
{
  "outDir": "src/types",
  "chainVersions": "kusamaVersions.json",
  "typesBundle": "kusama",
  "events": [
    "Balances.Transfer"
  ],
  "calls": []
}
```

Next, we should be launching the `typegen` command, to make sure that type-safe wrappers are generated according to the new specs. Simply run:

```bash
make typegen # it is advised to change Makefile with the right configuration and launch the shortcut
```

## Codegen

Nothing has changed in the way models are generated from the `schema.graphql`.

## Processor logic

This is where the biggest changes have arisen. 
