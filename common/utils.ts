import { AptosClient, AptosAccount, FaucetClient } from "aptos";

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

const NODE_URL = "https://fullnode.devnet.aptoslabs.com";

export const client = new AptosClient(NODE_URL);

export const config = {
	algorithms: ['HS256' as const],
	secret: 'shhhh', // TODO Put in process.env
};