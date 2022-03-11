import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import CustomRouter from "./Util/CustomRouter";
import { history } from "./Util/history";
import * as serviceWorker from './serviceWorker';

// Cấu hình redux
import { applyMiddleware, createStore } from "redux";
import { Provider } from "react-redux";
import { rootReducer } from "./redux/reducer/rootReducer";
import reduxThunk from "redux-thunk";

const store = createStore(rootReducer, applyMiddleware(reduxThunk));

ReactDOM.render(
    <React.StrictMode>
        <CustomRouter history={history}>
            <Provider store={store}>
                <App />
            </Provider>
        </CustomRouter>
    </React.StrictMode>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
