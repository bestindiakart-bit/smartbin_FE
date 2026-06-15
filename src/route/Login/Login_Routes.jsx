import FirstTime_Login from "../../pages/Login/FirstTime_Login";
import Forgot_Password from "../../pages/Login/Forgot_Password";
import Forgot_PasswordSet from "../../pages/Login/Forgot_PasswordSet";
import Login from "../../pages/Login/Login";
import Login_Main from "../../pages/Login/Login_Main";
import Otp from "../../pages/Login/Otp";
import Otp_Main from "../../pages/Login/Otp_Main";

export const Login_Routes = [
    {
        path:"login",
        Component:Login_Main,
        children:[
            {
                index:true,
                Component:Login,
            },
            {
                path:"otp",
                Component:Otp_Main,
                children:[
                    {
                        index:true,
                        Component:Otp,
                    },
                ]
            },
            {
                path:"first-time-login",
                Component:FirstTime_Login,
            },
            
            {
                path:"forgot-password",
                Component:Forgot_Password,
            },
            {
                path:"forgot-change-password",
                Component:Forgot_PasswordSet,
            }
        ]
    },
]