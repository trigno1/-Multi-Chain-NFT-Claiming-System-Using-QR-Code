import { getContract } from "thirdweb";
import { chain, client } from "@/app/const/client";

export const contractAddress = "0x91F6EC142D246e0b971caB3A6AfAb23D749b2640";
export const tokenContractAddress = "0x39Ed619e237eeb1d890B0a4DFc93a7984451c9C3";
export const contract = getContract({
    client: client,
    chain: chain,
    address: contractAddress
});

export const tokenContract = getContract({
    client: client,
    chain: chain,
    address: tokenContractAddress
});