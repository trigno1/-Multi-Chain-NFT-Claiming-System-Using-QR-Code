'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, LogOut, CreditCard } from "lucide-react"
import { AutoConnect, ConnectButton, lightTheme, MediaRenderer, useActiveAccount, useActiveWallet, useActiveWalletConnectionStatus, useConnectionManager, useDisconnect, useReadContract } from 'thirdweb/react'
import { chain, client } from '@/app/const/client'
import { contract } from '@/app/contract'
import { getOwnedNFTs } from 'thirdweb/extensions/erc1155'
import QRScanner from './QRScanner'
import { inAppWallet } from "thirdweb/wallets"

export function DashboardComponent() {
  const account = useActiveAccount();
  const status = useActiveWalletConnectionStatus();
  const { disconnect } = useDisconnect();
  const wallet = useActiveWallet();

  const { data: ownedNFTs, isLoading: isLoadingOwnedNFTs } = useReadContract(
    getOwnedNFTs,
    {
      contract: contract,
      address: account?.address as string,
    }
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <AutoConnect client={client} />
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          {account && wallet && (
            <Button onClick={() => disconnect(wallet)} variant="ghost" className="flex items-center text-gray-800">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          )}
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {account ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* User Profile */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-2">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-start">
                      <span className="text-sm text-gray-500 mb-2">Account</span>
                      <ConnectButton 
                        client={client} 
                        theme={lightTheme()}
                        chain={chain}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Wallet Summary, Balance, and Scan Button */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-6">
                  {/* Total NFTs */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-start">
                        <div className="flex items-center mb-2">
                          <Wallet className="h-5 w-5 text-muted-foreground mr-2" />
                          <span className="text-sm text-gray-500">Total NFTs</span>
                        </div>
                        <span className="text-secondary-foreground text-3xl font-bold">
                          {ownedNFTs?.length.toString() || 0}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Balance */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-start">
                        <div className="flex items-center mb-2">
                          <CreditCard className="h-5 w-5 text-muted-foreground mr-2" />
                          <span className="text-sm text-gray-500">Balance</span>
                        </div>
                        <span className="text-secondary-foreground text-3xl font-bold">
                          0
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Scan NFT Button */}
                  <div className="col-span-2 md:col-span-1 flex items-center justify-center">
                    <QRScanner />
                  </div>
                </div>
              </div>

              {/* NFT Collection */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Your NFT Collection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {!isLoadingOwnedNFTs && ownedNFTs && (
                      ownedNFTs.length > 0 ? (
                        ownedNFTs.map((nft) => (
                          <div key={nft.id} className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
                            <MediaRenderer
                              client={client}
                              src={nft.metadata.image}
                              width='100'
                              height='100'
                            />
                            <h3 className="mt-2 text-sm font-bold text-gray-900 text-center">{nft.metadata.name}</h3>
                          </div>
                        ))
                      ) : (
                        <div className="text-left text-gray-500">No NFTs yet</div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              {status === "connecting" ? (
                <>
                  <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
                  <p className="mt-4 text-gray-600">Loading...</p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="text-gray-600 mb-4">Please connect your wallet to continue</p>
                  <ConnectButton 
                    client={client} 
                    theme={lightTheme()}
                    wallets={[
                      inAppWallet({
                        auth: {
                          options: [
                            "google",
                            "coinbase",
                            "discord",
                            "farcaster",
                            "email",
                            "passkey",
                            "guest",
                          ]
                        },
                      })
                    ]}
                  />
                </div>
              )}
              
            </div>
          )}
          
        </div>
      </main>
    </div>
  )
}