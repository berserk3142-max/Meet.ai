import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex items-center justify-center">
            <SignIn
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        cardBox: "shadow-none border-none",
                        card: "shadow-none border-none bg-transparent",
                    },
                }}
            />
        </div>
    );
}
