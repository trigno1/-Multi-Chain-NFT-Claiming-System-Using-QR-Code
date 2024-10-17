import { ClaimNft } from "@/components/claim-nft";
import prisma from "../../../scripts/prisma.mjs";

async function getData(id: string) {
    const nft = await prisma.nFT.findUnique({
        where: {
            id: id
        }
    })

    if (!nft) {
        throw new Error('NFT not found')
    }

    return { nft: JSON.stringify(nft) };
}

export default async function ClaimPage({
    searchParams,
} : {
    searchParams: { id: string }
}) {
    const nft = JSON.parse((await getData(searchParams.id)).nft)

    return (
        <ClaimNft nft={nft}/>
    )
}