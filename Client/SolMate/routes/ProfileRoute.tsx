import React ,{ useState, useEffect, useContext } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import Profile from "../components/Profile";
import axios from "axios";
import { Container } from "../styles/ChatStyles";
import { SERVER_ADDRESS, SERVER_PORT } from '@env';
import { userContext } from "../contexts/userContext";
import { IUser } from "../util/Types";

const ProfileRoute = () => {
  const [user, setUser] = useState<IUser>(null);
  const [isLoading, setLoading] = useState(true);
  const {state} = useContext(userContext);
  
const getUser = async() =>{
 await axios
  .get(`${SERVER_ADDRESS}:${SERVER_PORT}/user/getuser?userId=${state.user._id}`,
 { headers: { "Content-Type": "application/json" },
})
  .then((res) => {
      setUser(res.data);
      setLoading(false);
      console.log(user);
  })
  .catch((err) => {
      console.log("Error");
      console.log(err);
  });
  };
 useEffect(()=> {
   getUser();
  }, []);

  return (
    <Container>

  {isLoading ? <ActivityIndicator /> : (
    <View>{< Profile user={user[0]} />}</View>
    )}
  
  </Container>
  )};
export default ProfileRoute;
