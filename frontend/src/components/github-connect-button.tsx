"use client"

import { GitHubAuthFlow } from "./GitHubAuthFlow"

interface GitHubConnectButtonProps {
  onConnect?: () => void
}

export function GitHubConnectButton({ onConnect }: GitHubConnectButtonProps) {
  return <GitHubAuthFlow onComplete={onConnect} />;
}
