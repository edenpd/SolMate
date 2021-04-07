import React, { useReducer, useEffect, useState } from "react";
import axios from "axios";
import useToken from "../hooks/useToken";
import * as SecureStore from "expo-secure-store";
import { UserContextState } from "../util/Types";
import { SERVER_ADDRESS, SERVER_PORT } from "@env";

const STORAGE_KEY = "userInfo";

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
        return undefined;
      }
      return JSON.parse(value);
    });
  }
  return value;
};
const initialState = getIntialState(STORAGE_KEY);

const providerValue = {
  state: { _id: undefined, email: undefined },
  dispatch: (action) => {}, // << This will be overwritten
  fetch: (action) => {},
  data: {},
};

const userContext = React.createContext(providerValue); // Create a context object

const { Provider } = userContext;
const StateProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const { token } = useToken();

  const fetch = (id) => {
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
    axios
      .get(`${SERVER_ADDRESS}:${SERVER_PORT}/user?UserEmail=${id}`)
      .then((response) => {
        if (response.data === null || response.data === undefined) return;

        setData(response.data[0]);
      });
  };

  const [state, dispatch] = useReducer((state, action) => {
    const currentState = { ...state };

    switch (action.type) {
      case "SET_USER":
        currentState.user = {
          email: action.payload.email,
          _id: action.payload._id,
        };

        return currentState;
      case "LOGOUT":
        currentState.user = null;
        return currentState;
      default:
        throw new Error();
    }
  }, providerValue.state);

  useEffect(() => {
    async function presist() {
      await getIntialState(STORAGE_KEY).then((value) =>
        dispatch({ type: "SET_USER", payload: value })
      );
    }
    presist();
  }, []);

  useEffect(() => {
    if (
      state._id !== providerValue.state._id ||
      state.email !== providerValue.state.email
    ) {
      async function presist() {
        await persistState(STORAGE_KEY, state);
      }
      presist();
    }
  }, [state, data]);

  return (
    <Provider value={{ state, dispatch, fetch, data }}>{children}</Provider>
  );
};

export { userContext, StateProvider };
