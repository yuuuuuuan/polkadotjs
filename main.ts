import {ApiPromise, WsProvider, Keyring} from "@polkadot/api";
import '@polkadot/api-augment';
import type {FrameSystemAccountInfo} from "@polkadot/types/lookup";

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

const getFreeBalance = async (api: ApiPromise, address: string) => {
    const { data:{free, }, }:FrameSystemAccountInfo = await
        api.query.system.account(address);
    return free;
}

const main = async () => {
    const api = await connect();
    const keyring = new Keyring({type: 'sr25519'});
    const alice = keyring.addFromUri('//Alice');

    const free = await getFreeBalance(api, alice.address);
    console.log("deposit is ", free.toHuman());
    console.log('main function');
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