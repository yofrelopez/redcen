import { HeaderPublic } from "@/components/ui/header-public";
import { FooterPublic } from "@/components/ui/footer-public";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
            <HeaderPublic />
            <main className="flex-1">{children}</main>
            <FooterPublic />
        </div>
    );
}
