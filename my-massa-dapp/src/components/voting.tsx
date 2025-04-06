import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { Badge } from "./ui/badge"
import { ThumbsUp, ThumbsDown, AlertCircle, CheckCircle2 } from "lucide-react"
import { useAccountStore } from "@massalabs/react-ui-kit"
import { useToast } from "./ui/use-toast"

interface VotingProps {
  projectId: string
  proposalId?: string
  title: string
  description: string
  deadline?: string
  options?: string[]
}

interface VoteOption {
  id: string
  label: string
  votes: number
  percentage: number
}

export function Voting({
  projectId,
  proposalId = "proposal-1",
  title = "Continue Funding?",
  description = "Should this project continue to receive funding based on their progress?",
  deadline,
  options = ["Yes, continue funding", "No, stop funding"],
}: VotingProps) {
  const { toast } = useToast()
  const { connectedAccount } = useAccountStore()
  const [hasVoted, setHasVoted] = useState(false)
  const [userVote, setUserVote] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [voteOptions, setVoteOptions] = useState<VoteOption[]>([])
  const [userNFTs, setUserNFTs] = useState<string[]>([])
  const [votingPower, setVotingPower] = useState(0)

  // Initialize vote options
  useEffect(() => {
    // In a real app, we would fetch this data from the blockchain
    const mockVoteOptions = options.map((option, index) => ({
      id: `option-${index + 1}`,
      label: option,
      votes: Math.floor(Math.random() * 100),
      percentage: 0,
    }))

    // Calculate percentages
    const totalVotes = mockVoteOptions.reduce((sum, option) => sum + option.votes, 0)
    const optionsWithPercentages = mockVoteOptions.map((option) => ({
      ...option,
      percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0,
    }))

    setVoteOptions(optionsWithPercentages)
  }, [options])

  // Check if user has NFTs for this project
  useEffect(() => {
    const checkUserNFTs = async () => {
      if (!connectedAccount) return

      try {
        // In a real app, we would fetch the user's NFTs from the blockchain
        // For now, we'll simulate having 1-3 NFTs
        const mockNFTs = Array.from(
          { length: Math.floor(Math.random() * 3) + 1 },
          (_, i) => `MF-${projectId}-${Date.now().toString(36)}-${i}`,
        )

        setUserNFTs(mockNFTs)

        // Calculate voting power based on NFTs (in a real app, this would be based on donation amounts)
        const mockVotingPower = mockNFTs.length * 10
        setVotingPower(mockVotingPower)
      } catch (error) {
        console.error("Failed to fetch user NFTs:", error)
      }
    }

    checkUserNFTs()
  }, [connectedAccount, projectId])

  const handleVote = async (optionId: string) => {
    if (!connectedAccount) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to vote",
        variant: "destructive",
      })
      return
    }

    if (userNFTs.length === 0) {
      toast({
        title: "No voting power",
        description: "You need to own NFTs from this project to vote",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // In a real app, we would submit the vote to the blockchain
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update local state to reflect the vote
      setVoteOptions((prevOptions) =>
        prevOptions.map((option) =>
          option.id === optionId ? { ...option, votes: option.votes + votingPower } : option,
        ),
      )

      // Recalculate percentages
      const updatedOptions = [...voteOptions]
      const optionToUpdate = updatedOptions.find((o) => o.id === optionId)
      if (optionToUpdate) {
        optionToUpdate.votes += votingPower
      }

      const totalVotes = updatedOptions.reduce((sum, option) => sum + option.votes, 0)
      const optionsWithPercentages = updatedOptions.map((option) => ({
        ...option,
        percentage: totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0,
      }))

      setVoteOptions(optionsWithPercentages)
      setHasVoted(true)
      setUserVote(optionId)

      toast({
        title: "Vote submitted!",
        description: `You voted with ${votingPower} voting power`,
        variant: "default",
      })
    } catch (error) {
      console.error("Failed to submit vote:", error)
      toast({
        title: "Failed to submit vote",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getDeadlineText = () => {
    if (!deadline) return "Voting is open"

    const deadlineDate = new Date(deadline)
    const now = new Date()

    if (deadlineDate < now) {
      return "Voting has ended"
    }

    // Calculate time remaining
    const timeRemaining = deadlineDate.getTime() - now.getTime()
    const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
    const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (daysRemaining > 0) {
      return `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining`
    } else {
      return `${hoursRemaining} hour${hoursRemaining !== 1 ? "s" : ""} remaining`
    }
  }

  return (
    <Card className="bg-slate-700 border-slate-600 text-white">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="text-slate-300 mt-1">{description}</CardDescription>
          </div>
          <Badge variant="outline" className="bg-slate-600">
            {getDeadlineText()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connectedAccount ? (
          <div className="bg-slate-800 p-4 rounded-md text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p>Connect your wallet to vote on this proposal</p>
          </div>
        ) : userNFTs.length === 0 ? (
          <div className="bg-slate-800 p-4 rounded-md text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p>You need to own NFTs from this project to vote</p>
            <p className="text-sm text-slate-400 mt-1">Donate to this project to receive voting rights</p>
          </div>
        ) : hasVoted ? (
          <div className="space-y-4">
            <div className="bg-slate-800 p-4 rounded-md text-center">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p>Thank you for voting!</p>
              <p className="text-sm text-slate-400 mt-1">You voted with {votingPower} voting power</p>
            </div>

            {voteOptions.map((option) => (
              <div key={option.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className={option.id === userVote ? "font-bold" : ""}>{option.label}</span>
                  <span>{option.percentage}%</span>
                </div>
                <Progress
                  value={option.percentage}
                  className={`h-2 ${option.id === userVote ? "bg-green-900" : "bg-slate-600"}`}
                />
                <p className="text-xs text-right text-slate-400">{option.votes} votes</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-800 p-4 rounded-md">
              <p>
                Your voting power: <span className="font-bold">{votingPower}</span>
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Based on {userNFTs.length} NFT{userNFTs.length !== 1 ? "s" : ""} you own
              </p>
            </div>

            {voteOptions.map((option) => (
              <div key={option.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>{option.label}</span>
                  <span>{option.percentage}%</span>
                </div>
                <Progress value={option.percentage} className="h-2" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">{option.votes} votes</span>
                  <Button
                    onClick={() => handleVote(option.id)}
                    disabled={isLoading}
                    className="bg-slate-600 hover:bg-slate-500"
                    size="sm"
                  >
                    {option.id === "option-1" ? (
                      <ThumbsUp className="h-4 w-4 mr-2" />
                    ) : (
                      <ThumbsDown className="h-4 w-4 mr-2" />
                    )}
                    Vote
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-slate-400">
        <p>Voting power is determined by the amount of your contribution to this project.</p>
      </CardFooter>
    </Card>
  )
}

