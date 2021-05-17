import React, { useReducer, useEffect, useState } from "react";
import axios from "axios";
import useToken from "../hooks/useToken";
import * as SecureStore from "expo-secure-store";
import { UserContextState } from "../util/Types";
import { SERVER_ADDRESS, SERVER_PORT } from "@env";
import { string } from "prop-types";
import { DevSettings } from "react-native";

const STORAGE_KEY = "userIfo";
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
      return value;
    });
  }
  return JSON.parse(value);
};
const initialState = getIntialState(STORAGE_KEY);

const providerValue = {
  state: {
    user: { _id: undefined, email: undefined },
  },
  dispatch: (action) => { }, // << This will be overwritten
  fetch: (action) => { },
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
        if (action.payload) {
          currentState.user = {
            email: action.payload.email,
            _id: action.payload._id,
          };
        }

        return currentState;
      case "LOGOUT":
        console.log("Logging out");
        currentState.user = {
          _id: "",
          email: ""
        };
        return currentState;
      default:
        throw new Error();
    }
  }, providerValue.state);

  useEffect(() => {
    async function presist() {
      await getIntialState(STORAGE_KEY).then((value) =>
        dispatch({ type: "SET_USER", payload: value.user })
      );
    }
    presist();
  }, []);

  useEffect(() => {
    if (
      state.user._id !== undefined ||
      state.user.email !== undefined
    ) {
      async function presist() {
        await persistState(STORAGE_KEY, state);
      }
      presist();
    }
  }, [state]);

  return (
    <Provider value={{ state, dispatch, fetch, data }}>{children}</Provider>
  );
};

export { userContext, StateProvider };
