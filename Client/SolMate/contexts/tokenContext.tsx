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
      console.log(value);
      if (!value) {
        console.log("1");
        return undefined;
      }
      return value;
    });
  }
  return value;
};

const providerValue = {
  token: { token: "", spotifyToken: "" },
  dispatchToken: (action) => {}, // << This will be overwritten
};

const tokenContext = React.createContext(providerValue); // Create a context object

const { Provider } = tokenContext;
const TokenStateProvider = ({ children }) => {
  const [token, dispatchToken] = useReducer(
    (state, action) => {
      const currentState = { ...state };

      switch (action.type) {
        case "SET_TOKEN":
          currentState.token = action.payload;
          return currentState;
        case "SET_SPOTIFY_TOKEN":
          currentState.spotifyToken = action.payload;
          return currentState;
        case "LOGOUT":
          currentState.token = null;
          currentState.spotifyToken = null;
          return currentState;
        default:
          throw new Error();
      }
    },
    async function presist() {
      const initialState = await getIntialState(STORAGE_KEY);
      console.log(console.log(initialState));

      dispatchToken({ type: "SET_TOKEN", payload: initialState });
    }
  );

  useEffect(() => {
    async function presist() {
      const initialState = await getIntialState(STORAGE_KEY);

      dispatchToken({ type: "SET_TOKEN", payload: initialState });
      console.log(console.log(initialState));
    }
    presist();
  }, []);

  useEffect(() => {
    async function presist() {
      await persistState(STORAGE_KEY, token);
    }
    presist();
  }, [token]);

  return <Provider value={{ token, dispatchToken }}>{children}</Provider>;
};

export { tokenContext, TokenStateProvider };
