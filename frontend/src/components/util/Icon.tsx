export default function Icon({ data, width, height }: { data: string, width?: number, height?: number }) {
    if (!width) {
        width = 16;
    }

    if (!height) {
        height = 16;
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 16 16"
            fill="currentColor"
        >
            <path d={data}/>
        </svg>
    );
}
