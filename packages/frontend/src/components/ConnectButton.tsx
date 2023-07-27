import { ConnectKitButton } from "connectkit";
import { cn, shortenAddress } from "utils";
import Optimism from "./icons/Optimism";
import { Button } from "./ui/button";

const ConnectButton = () => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
        const displayName = ensName || shortenAddress(address);
        return (
          <Button
            className={cn(
              "text-[#FF0420]",
              "border-[#FF0420]",
              "inline-flex",
              "gap-2"
            )}
            variant={"outline"}
            onClick={show}
          >
            <Optimism />
            <div className={cn("text-black")}>
              {isConnected ? displayName : "Connect to Optimism"}
            </div>
          </Button>
        );
      }}
    </ConnectKitButton.Custom>
  );
};
export default ConnectButton;
