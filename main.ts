import {ApiPromise, WsProvider, Keyring} from "@polkadot/api";
import '@polkadot/api-augment';
import type {FrameSystemAccountInfo} from "@polkadot/types/lookup";
import {KeyringPair} from "@polkadot/keyring/types";
import { metadata } from "@polkadot/types/interfaces/essentials";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const WEB_SOCKET = 'ws://127.0.0.1:9944';
const connect = async () => {
    const wsProvider = new WsProvider(WEB_SOCKET);
    const api = await ApiPromise.create({provider: wsProvider, types: {}});
    await api.isReady;
    return api;
}

const getConst = async (api: ApiPromise) => {
    const existentialDeposit = await api.consts.balances.existentialDeposit.toHuman();
    return existentialDeposit;
}

const getMetadata = async (api: ApiPromise) => {
    const metadota = await api.rpc.state.getMetadata();
    return metadata
}

const getFreeBalance = async (api: ApiPromise, address: string) => {
    const { data:{free, }, }:FrameSystemAccountInfo = await
        api.query.system.account(address);
    return free;
}

const transfer = async (api: ApiPromise, alice: KeyringPair, bob: string, amount: number) => {
    await api.tx.balances.transfer(bob, amount)
    .signAndSend(alice, res => {
        console.log('Tx status: ${res.status}');
    });
}

const subscribeAlicebalance = async (api: ApiPromise, address: string) => {
    await api.query.system.account(address, aliceInfo => {
        const free = aliceInfo.data.free;
        console.log('free balance is: ', free.toHuman());
    })
}

const subscribeSomethingStoredEvent = async (api: ApiPromise) => {
    await api.query.system.events((events) => {
        events.forEach((record) => {
            const {event} = record;
            console.log('Value of SomethingStored: ', event.data[0].toHuman());
        });
    });
}

const main = async () => {
    const api = await connect();
    const keyring = new Keyring({type: 'sr25519'});
    const alice = keyring.addFromUri('//Alice');
    const bob = keyring.addFromUri('//bob');
    await subscribeSomethingStoredEvent(api);
    await sleep(50000)
}

main()
.then(() => {
    console.log('exits with success');
    process.exit(0);
})
.catch(err => {
    console.log('error is ', err);
    process.exit(1);
})