export function Loading(props: {
    head: string,
    message: string,
}) {
    const { head, message } = props;

    return <div class="flex flex-col items-center justify-center frame-color px-8">
        <div class="text-2xl text-center">{head}</div>
        <div class="mt-2 text-center">{message}</div>
    </div>;
}

export function formatSize(size: number) {
    if (size < 1024) {
        return size + "b";
    }

    size /= 1024;

    if (size < 1024) {
        return Math.round(size) + "kb";
    }

    size /= 1024;
    return Math.round(size * 10) / 10 + "mb";
}
