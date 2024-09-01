interface GroupProps {
    title: string;
    children: React.ReactNode;
}

export default function Group({ title, children }: GroupProps) {
    return (
        <div className="grow-0 shrink basis-[420px]">
            <div className="text-lg m-auto">{title}</div>
            <div>
                {children}
            </div>
        </div>
    )
}