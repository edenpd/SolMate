import React from "react";
import { View } from "react-native";
import Dialog from "react-native-dialog";

interface NewMatchDialogProps {
    visible: Boolean;
    setIsVisible: React.Dispatch<React.SetStateAction<Boolean>>;
};

const DIALOG_DESC = "You both like each other!\n Perhaps you found your new SolMate.\nYou can now chat with your new match.";

const NewMatchDialog = ({visible, setIsVisible}: NewMatchDialogProps) => {
    return (
        <View>
          <Dialog.Container visible={visible}>
            <Dialog.Title>Oh Wow!</Dialog.Title>
            <Dialog.Description>
              {DIALOG_DESC}
            </Dialog.Description>
            <Dialog.Button onPress={() => setIsVisible(false)} label="OK" />
          </Dialog.Container>
        </View>
      );
};

export default NewMatchDialog;