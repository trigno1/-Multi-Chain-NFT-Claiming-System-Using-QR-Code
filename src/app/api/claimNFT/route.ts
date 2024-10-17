import prisma from "../../../../scripts/prisma.mjs";
import { contractAddress } from "@/app/contract";
import { NextResponse } from "next/server";

const {
  BACKEND_WALLET_ADDRESS,
  ENGINE_URL,
  THIRDWEB_ACCESS_TOKEN,
} = process.env;

async function checkTransactionStatus(queueId: string): Promise<boolean> {
  const statusResponse = await fetch(`${ENGINE_URL}/transaction/status/${queueId}`, {
    headers: {
      Authorization: `Bearer ${THIRDWEB_ACCESS_TOKEN}`,
    },
  });

  if (statusResponse.ok) {
    const statusData = await statusResponse.json();
    return statusData.result.status === 'mined';
  }
  return false;
}

async function pollTransactionStatus(queueId: string, maxAttempts = 15, interval = 3000): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const isMined = await checkTransactionStatus(queueId);
    if (isMined) return true;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  return false;
}

export async function POST(request: Request) {
  const { id, address } = await request.json();

  if (
    !BACKEND_WALLET_ADDRESS ||
    !ENGINE_URL ||
    !THIRDWEB_ACCESS_TOKEN
  ) {
    throw 'Server misconfigured. Did you forget to add a ".env.local" file?';
  }

  try {
    const nft = await prisma.nFT.findUnique({
        where: {
            id,
        },
    });

    if (!nft) {
        return NextResponse.json({ error: "NFT not found" }, { status: 404 });
    }

    if (nft.minted) {
        return NextResponse.json(
            { error: "NFT already minted" },
            { status: 400 }
        );
    }

    const resp = await fetch(
        `${ENGINE_URL}/contract/84532/${contractAddress}/erc1155/mint-to`,
        {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${THIRDWEB_ACCESS_TOKEN}`,
            "x-backend-wallet-address": BACKEND_WALLET_ADDRESS,
            },
            body: JSON.stringify({
                "receiver": address,
                "metadataWithSupply": {
                    "metadata": {
                        "name": nft.name,
                        "description": nft.description,
                        "image": nft.image,
                        "attributes": nft.attributes,
                    },
                    "supply": "1",
                },
            }),
        }
    );

    if (resp.ok) {
        const data = await resp.json();
        const queueId = data.result.queueId;

        const isMined = await pollTransactionStatus(queueId);

        if (isMined) {
            await prisma.nFT.update({
                where: {
                    id,
                },
                data: {
                    owner: address,
                    minted: true,
                },
            });
            return NextResponse.json({ message: "Transaction mined successfully!", queueId, success: true });
        } else {
            return NextResponse.json({ message: "Transaction not mined within the timeout period.", queueId }, { status: 408 });
        }
    } else {
        const errorText = await resp.text();
        console.error("[DEBUG] not ok", errorText);
        return NextResponse.json({ message: "Failed to initiate transaction", error: errorText }, { status: 500 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to initiate transaction", error: error }, { status: 500 });
  }

  

  

  

  

  
}