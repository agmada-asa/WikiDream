import { AppLayout } from "@/components/app-layout";

export default function WikiLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AppLayout>{children}</AppLayout>;
}
