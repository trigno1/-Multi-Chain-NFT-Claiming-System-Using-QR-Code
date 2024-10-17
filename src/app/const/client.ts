import { createThirdwebClient } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

export const client = createThirdwebClient({ clientId: clientId as string });

export const chain = baseSepolia;