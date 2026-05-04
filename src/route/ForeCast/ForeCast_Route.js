import ForCast_Editor from "../../pages/SubComponents/ForeCast/Forcast_Editor/ForCast_Editor";
import Forcast_Main from "../../pages/SubComponents/ForeCast/Forcast_Main";
import ForCast_Table from "../../pages/SubComponents/ForeCast/ForCast_Table/ForCast_Table";
import ForCast_View from "../../pages/SubComponents/ForeCast/ForCast_Table/ForCast_View";


export const ForeCast_Route = [
    {
        path:"forecast-viewer",
        Component:Forcast_Main,
        children:[
            {
                index:true,
                Component:ForCast_Table,
            },
            {
                path:"forecast-editor",
                Component:ForCast_Editor,
            },
            {
                path:"view",
                Component:ForCast_View,
            }
        ]
    }
]