import { Props } from "../../../player-app";
interface IpxProps {
    arn: string | null;
    setArn: (ipxArn: string | null) => void;
    address: string | null;
    setAddress: (ipxAddress: string | null) => void;
    awaitingAddress: boolean;
    setAwaitingAddress: (waitingIpx: boolean) => void;
    awaitingConnection: boolean;
    setAwaitingConnection: (waitingIpx: boolean) => void;
}
export interface TokenProps extends Props {
    ipx: IpxProps;
    update: () => void;
}
export declare function TokenConfiguration(props: Props): import("preact").VNode<any> | import("preact").VNode<any>[];
export {};
