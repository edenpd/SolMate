import { useState } from "react";
import { Alert } from "react-native";

export const LOCALE = "he-IL";
export default () => {
  var currentDateMoreThan18 = new Date();
  currentDateMoreThan18.setFullYear(new Date().getFullYear() - 18);
  const [date, setDate] = useState(currentDateMoreThan18);
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    try {
      setDate(currentDate);
    } catch (error) {
      Alert.alert(error);
    }
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const showTimepicker = () => {
    showMode("time");
  };

  return {
    date,
    mode,
    show,
    setShow,
    showDatepicker,
    showTimepicker,
    onChangeDate: onChange,
  };
};
