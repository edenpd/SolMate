import React, { useEffect } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Dialog from "react-native-dialog";

interface NewMatchDialogProps {
  visible: Boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<Boolean>>;
};

const DIALOG_DESC = "You both like each other!\n Perhaps you found your new SolMate.\nYou can now chat with your new match.";

const NewMatchDialog = ({ visible, setIsVisible }: NewMatchDialogProps) => {

  useEffect(() => {
    console.log("The dialog is: " + visible);
  }, [visible])

  return (
    <View>
      <View style={{ zIndex: 1 }}>

      </View>
      <View style={{ zIndex: 0 }}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={visible.valueOf()}
          onRequestClose={() => {
            setIsVisible(false)
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Oh Wow!</Text>
              <Text style={styles.modalText}>{DIALOG_DESC}</Text>
              <Image
                style={{
                  width: 270,
                  height: 90,
                  marginBottom: 20
                }}
                source={require("../assets/notes.gif")}
              />
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setIsVisible(false)}
              >
                <Text style={styles.textStyle}>Continue</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </View>
    // <Dialog.Container visible={visible}>
    //   <Dialog.Title>Oh Wow!</Dialog.Title>
    //   <Dialog.Description>
    //     {DIALOG_DESC}
    //   </Dialog.Description>
    //   <Dialog.Button onPress={() => setIsVisible(false)} label="OK" />
    // </Dialog.Container>
  );
};


const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonClose: {
    backgroundColor: "#8860D0",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalTitle: {
    fontFamily: "Poppins_300Light",
    marginBottom: 15,
    textAlign: "center",
    fontSize: 25,
  },
  modalText: {
    fontFamily: "Poppins_300Light",
    marginBottom: 15,
    textAlign: "center"
  }
});

export default NewMatchDialog;