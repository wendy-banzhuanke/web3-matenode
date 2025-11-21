import { useConnection, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

export function Account() {
  const { address, connector } = useConnection();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

  const formattedAddress = formatAddress(address);

  return (
    <>
      {ensAvatar ? (
        <img alt="ENS Avatar" className="avatar" src={ensAvatar} />
      ) : (
        // <div className="avatar" "https://github.com/evilrabbit.png"/>
        <Avatar className="w-8 h-8 rounded-full mr-2">
            <AvatarImage
              className='w-8 h-8 rounded-full'
              src={connector?.icon}
              alt="@evilrabbit"
            />
            <AvatarFallback>ER</AvatarFallback>
        </Avatar>
      )}
      {address && (
        <div className="w-30 text-overflow-ellipsis flex items-center">
          {ensName ? `${ensName} (${formattedAddress})` : formattedAddress}
        </div>
      )}
      <Button className="button" onClick={() => disconnect()} type="button">
        Disconnect
      </Button>
    </>
  );
}

function formatAddress(address?: string) {
  if (!address) return null;
  return `${address.slice(0, 6)}…${address.slice(38, 42)}`;
}
