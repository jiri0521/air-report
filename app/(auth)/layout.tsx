const AuthLayout = ({
    children} : 
   { children: React.ReactNode
   }) => {
    return ( 
    <div className="h-screen flex justify-center items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800 text-white">    
        {children}
    </div> 
    );
}
 
export default AuthLayout;