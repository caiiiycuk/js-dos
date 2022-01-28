import { Props } from "../../../player-app";
interface IpxProps {
    ipxArn: string | null;
    setIpxArn: (ipxArn: string | null) => void;
    ipxIp: string | null;
    setIpxIp: (ipxIp: string | null) => void;
    awaitingIpxIp: boolean;
    setAwaitingIpxIp: (waitingIpx: boolean) => void;
}
export interface TokenProps extends Props {
    ipx: IpxProps;
    update: () => void;
}
export declare function TokenConfiguration(props: Props): import("preact").VNode<any> | import("preact").VNode<any>[];
export {};
