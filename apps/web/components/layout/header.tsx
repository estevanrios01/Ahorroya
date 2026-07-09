import Link from "next/link";

export default function Header() {
    return (
        <header className="border-b">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
                <Link href="/">
                    AhorroYa
                </Link>
            </div>
        </header>
    );
}
