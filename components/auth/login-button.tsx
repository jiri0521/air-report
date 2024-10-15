"use client"
import { useRouter } from "next/navigation";


interface LoginButtonProps{
    children: React.ReactNode;
    mode?: "modal" | "redirect",
    asChild?:boolean;
};

export const LoginButton = ({
    children,
    mode = "redirect",
    
} : LoginButtonProps) => {
    const  router = useRouter();

    const onClick =() => {
        router.push("/login");
    };

    if (mode === "modal"){
        return(
            <span>
                TODO: Implement Modal
            </span>
        )
    }


    return (
        <span onClick={onClick} className="cusor-pointer">
            {children}
        </span>
    );
};