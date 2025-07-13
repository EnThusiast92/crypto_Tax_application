import { PaymentProviders } from "@/components/landing/payment-providers";

export function Footer() {
    return (
        <footer className="w-full py-6 px-4 md:px-6 border-t">
            <div className="container flex flex-col md:flex-row justify-center items-center gap-6">
                <PaymentProviders />
            </div>
        </footer>
    )
}
