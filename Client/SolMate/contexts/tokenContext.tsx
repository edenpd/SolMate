import React, { useReducer, useEffect, useState } from "react";
import axios from "axios";
import useToken from "../hooks/useToken";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "token_storage";

const persistState = async (storageKey, state) => {
  await SecureStore.setItemAsync(storageKey, JSON.stringify(state));
};

const getIntialState = async (storageKey) => {
  let value;
  const isAvaiable = await SecureStore.isAvailableAsync();
  if (isAvaiable) {
    value = await SecureStore.getItemAsync(storageKey).then((value) => {
      if (!value) {
        return undefined;
      }
      return JSON.parse(value);
    })
    .catch((err) => console.log(JSON.stringify(err)));
  }
  return value;
};

const initialState = getIntialState(STORAGE_KEY);

const providerValue = {
  token: { token: undefined },
  dispatchToken: (action) => {}, // << This will be overwritten
};

const tokenContext = React.createContext(providerValue); // Create a context object

const { Provider } = tokenContext;
const TokenStateProvider = ({ children }) => {
  const [token, dispatchToken] = useReducer((state, action) => {
    const currentState = { ...state };

    switch (action.type) {
      case "SET_TOKEN":
        currentState.token = action.payload;
        return currentState;
      case "LOGOUT":
        currentState.token = null;
        return currentState;
      default:
        throw new Error();
    }
  }, providerValue.token);

  useEffect(() => {
    async function presist() {
      await getIntialState(STORAGE_KEY).then((value) =>
        dispatchToken({ type: "SET_TOKEN", payload: value.token })
      );
    }
    presist();
  }, []);

  useEffect(() => {
    if (token.token !== providerValue.token.token) {
      async function presist() {
        await persistState(STORAGE_KEY, token);
      }
      presist();
    }
  }, [token]);

  return <Provider value={{ token, dispatchToken }}>{children}</Provider>;
};

export { tokenContext, TokenStateProvider };
