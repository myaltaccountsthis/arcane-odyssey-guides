interface Props {
    children?: React.ReactNode;
}

export default function VerticalList({ children }: Props) {
    return (
        <div className="flex flex-col gap-y-3">
            {children}
        </div>
    )
}