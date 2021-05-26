import { ServerMessage, MessageHandler } from "./protocol";
export declare class MessagesQueue {
    private messages;
    handler(name: ServerMessage, props: {
        [key: string]: any;
    }): void;
    sendTo(handler: MessageHandler): void;
}
