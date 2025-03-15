import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
     createBrowserRouter,
     RouterProvider,
 } from "react-router-dom";
import {Provider} from "react-redux";
import D3 from "./d3";
import Home from "./homepage";
import Login from "./login";
import Signup from "./signup";
import Viz from "./viz";
import store from "./store/store";
import { AuthProvider } from "./AuthContext";
import Pricing from "./pricing";
import Settings from "./settings";
import Bar from ".//components/BarChart";
import Dual from "./dual";



const router = createBrowserRouter([
    {
         path: '/',
         element: <App/>
    },
    {
         path: '/d3',
         element: <D3/>
    },
    {
         path: '/homepage',
         element: <Home/>
    },
    {
         path: '/dual',
         element: <Dual/>
    },
    {
        path: '/login',
        element: <Login/>
    },
    {
        path: '/signup',
        element: <Signup/>
    },
    {
        path: '/viz',
        element: <Viz/>
    },
    {
        path: '/price',
        element: <Pricing/>
    },
    {
        path: '/setting',
        element: <Settings/>
    },
    {
        path: '/bar',
        element: <Bar/>
    }
    ]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  //     <RouterProvider router = {router} />
  // </React.StrictMode>

    <AuthProvider>
        <Provider store={store}>
             <RouterProvider router = {router} />
        </Provider>
    </AuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
