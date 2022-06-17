import * as ss58 from "@subsquid/ss58";
import {
  EventHandlerContext,
  SubstrateProcessor,
} from "@subsquid/substrate-processor";
import { TypeormDatabase, EntityClass, Store } from "@subsquid/typeorm-store";
import { Account, HistoricalBalance } from "./model";
import { BalancesTransferEvent } from "./types/events";
import { EventContext } from "./types/support";

const processor = new SubstrateProcessor(
  new TypeormDatabase("kusama_balances")
);

processor.setBatchSize(500);
processor.setDataSource({
  archive: "https://kusama.archive.subsquid.io/graphql",
  chain: "wss://kusama-rpc.polkadot.io",
});

processor.addEventHandler("Balances.Transfer", processTransfers);

async function processTransfers(
  ctx: EventHandlerContext<Store, { event: { args: true } }>
) {
  const transfer = getTransferEvent(ctx);
  const timestamp = BigInt(new Date(ctx.block.timestamp).valueOf());

  // ss58.codec("kusama").encode(transfer.from)
  const fromAcc = await getOrCreate(
    ctx.store,
    Account,
    ss58.codec("kusama").encode(transfer.from)
  );
  fromAcc.wallet = fromAcc.id;
  fromAcc.balance = fromAcc.balance || 0n;
  fromAcc.balance -= transfer.amount;
  await ctx.store.save(fromAcc);

  const toAcc = await getOrCreate(
    ctx.store,
    Account,
    ss58.codec("kusama").encode(transfer.to)
  );
  toAcc.wallet = toAcc.id;
  toAcc.balance = toAcc.balance || 0n;
  toAcc.balance += transfer.amount;
  await ctx.store.save(toAcc);

  await ctx.store.insert(
    new HistoricalBalance({
      id: `${ctx.event.id}-to`,
      account: fromAcc,
      balance: fromAcc.balance,
      timestamp,
    })
  );

  await ctx.store.insert(
    new HistoricalBalance({
      id: `${ctx.event.id}-from`,
      account: toAcc,
      balance: toAcc.balance,
      timestamp,
    })
  );
}

processor.run();

interface TransferEvent {
  from: Uint8Array;
  to: Uint8Array;
  amount: bigint;
}

export function getTransferEvent(ctx: EventContext): TransferEvent {
  const event = new BalancesTransferEvent(ctx);
  if (event.isV1020) {
    const [from, to, amount] = event.asV1020;
    return { from, to, amount };
  }
  if (event.isV1050) {
    const [from, to, amount] = event.asV1050;
    return { from, to, amount };
  }
  return event.asV9130;
}

export async function getOrCreate<T extends { id: string }>(
  store: Store,
  EntityClassConstructor: EntityClass<T>,
  id: string
): Promise<T> {
  let entity = await store.findOne<T>(EntityClassConstructor, id);

  if (entity == null) {
    entity = new EntityClassConstructor();
    entity.id = id;
  }

  return entity;
}
