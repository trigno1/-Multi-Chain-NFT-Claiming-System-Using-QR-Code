'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Check } from "lucide-react"
import { ConnectButton, lightTheme, MediaRenderer, useActiveAccount } from 'thirdweb/react'
import { chain, client } from '@/app/const/client'
import ReactConfetti from 'react-confetti'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Attribute = {
  [key: string]: string | number;
};

type ClaimNft = {
  name: string;
  description: string;
  image: string;
  attributes: Attribute;
  minted: boolean;
  owner: string;
  id: string;
};

interface ClaimNftProps {
  nft: ClaimNft;
}

export function ClaimNft({ nft }: ClaimNftProps) {
  const router = useRouter()
  const account = useActiveAccount();
  const [isClaiming, setIsClaiming] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleClaim = async () => {
    setIsClaiming(true)
    try {
      const response = await fetch('/api/claimNFT', {
        method: 'POST',
        body: JSON.stringify({ 
          id: nft.id, 
          address: account?.address 
        }),
      })
      const data = await response.json()
      if (data.success) {
        setShowModal(true)
        setShowConfetti(true)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsClaiming(false)
      
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {showConfetti && <ReactConfetti />}
      <div className="max-w-md mx-auto">
        <div className="flex flex-row items-center justify-between h-24 mb-6">
          <Button
            variant="ghost"
            className="text-gray-800 hover:bg-gray-200 transition-colors duration-200"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4 text-gray-800" /> Back to Dashboard
          </Button>

          <ConnectButton
            client={client}
            theme={lightTheme()}
            chain={chain}
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Claim NFT</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <MediaRenderer
              client={client}
              src={nft.image}
              width='300'
              height='300'
              style={{
                borderRadius: '1rem',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                marginBottom: '1rem'
              }}
            />
            <h2 className="text-xl font-semibold mb-2">{nft.name}</h2>
            <p className="text-gray-600 text-center mb-4">{nft.description}</p>
            <div className="grid grid-cols-2 gap-4 w-full text-sm">
              {Object.keys(nft.attributes).map((key) => (
                <div key={key} className="flex flex-col bg-gray-100 rounded-lg p-2">
                  <p className="text-sm font-semibold text-gray-700">{key}</p>
                  <p className="text-sm text-gray-600">
                    {nft.attributes[key]}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            {nft.minted ? (
              <Button disabled className="w-full bg-green-500 hover:bg-green-600">
                <Check className="mr-2 h-4 w-4" /> NFT Claimed
              </Button>
            ) : (
              account ? (
                <Button
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="w-full"
                >
                  {isClaiming ? 'Claiming...' : 'Claim NFT'}
                </Button>
              ) : (
                <Button disabled className="w-full bg-gray-500 hover:bg-gray-600">
                  Loading...
                </Button>
              )
            )}
          </CardFooter>
        </Card>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-gray-100 max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Congratulations!</DialogTitle>
            <DialogDescription className="text-gray-700">
              You have successfully claimed your NFT.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}