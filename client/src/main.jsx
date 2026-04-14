
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider} from 'react-router-dom'
import Home from "./pages/home/Home.jsx";
import Login from './pages/authentication/Login.jsx';
import Signup from './pages/authentication/Signup.jsx';
import {store} from "./store/store.js";
// store creacted by react-redux toolkit
import {Provider} from "react-redux";
// binding the stores by react-redux
const router = createBrowserRouter(
[
{
   path:"/",
   element:<Home/>
}, 
{
   path:"/login",
   element:<Login/>
}, 
{
   path:'/signup',
   element:<Signup/>
}, 
])
createRoot(document.getElementById('root')).render(
  // application rapping
  <Provider store={store}>
    <App />
  <RouterProvider router ={router}/>
    
  </Provider>,
) 
