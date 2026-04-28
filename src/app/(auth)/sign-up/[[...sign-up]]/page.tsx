import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="flex items-center justify-center">
            <SignUp
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
